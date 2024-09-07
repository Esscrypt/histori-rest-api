import { JsonRpcProvider, Contract, TransactionReceipt } from "ethers";
import * as dotenv from "dotenv";
import { sequelize, Token } from "../models";  // Adjust the path to your models
import * as fs from "fs";

// Define the file to store the latest block number
const BLOCK_STATE_FILE = "blockState.json";

// Helper function to save the latest scraped block to a file
export function saveLatestBlockToFile(blockNumber: number) {
  const data = { latestScrapedBlock: blockNumber };
  fs.writeFileSync(BLOCK_STATE_FILE, JSON.stringify(data));
  console.log(`Saved latest block number: ${blockNumber}`);
}

// Helper function to read the latest scraped block from a file
export function getLatestBlockFromFile(): number {
  try {
    const fileContent = fs.readFileSync(BLOCK_STATE_FILE, "utf8");
    const data = JSON.parse(fileContent);
    return data.latestScrapedBlock || 0;
  } catch (error) {
    console.log("No block state file found, starting from block 0.");
    return 0;  // Default to block 0 if no file is found
  }
}

dotenv.config();

const provider = new JsonRpcProvider(process.env.RPC_URL);
const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
];

// First pass: Loop through every block and detect ERC-20 token contracts
async function firstPassCollectTokens(startBlock: number, endBlock: number) {
  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
    try {
      const block = await provider.getBlock(blockNumber, true);

      if (!block) {
        console.log(`Block ${blockNumber} does not exist`);
        continue;
      }

      console.log(`Scanning block ${blockNumber}, containing ${block.transactions.length} transactions.`);

      if (block.transactions.length === 0) {
        console.log(`Block ${blockNumber} contains no transactions`);
        continue;
      }

      console.log(block.transactions)
      for (const txHash of block.transactions) {
        const receipt: TransactionReceipt | null = await provider.getTransactionReceipt(txHash);
        // console.log(receipt)
        if (!receipt) {
          // console.log(`Transaction ${txHash} has no receipt`);
          continue;
        }

        const contractAddress = receipt.contractAddress;
        if (contractAddress) {
          // Check if this contract is an ERC-20 token
          const contract = new Contract(contractAddress, erc20ABI, provider);
          try {
            const name = await contract.name();
            const symbol = await contract.symbol();
            const decimals = await contract.decimals();
            const totalSupply = await contract.totalSupply();

            // Store the ERC-20 token in the database
            await Token.create({
              name,
              symbol,
              decimals,
              contractAddress,
              totalSupply: totalSupply.toString(),
              blockNumber: blockNumber,
            });

            console.log(`New ERC-20 token detected: ${symbol} (${name}) at block ${blockNumber}, contract address: ${contractAddress}`);
          } catch (error: any) {
            console.log(`Contract at ${contractAddress} is not a valid ERC-20 token. Error: ${error.message}`);
          }
        }
      }

      // Save the latest processed block number to a file
      saveLatestBlockToFile(blockNumber);

    } catch (error: any) {
      console.error(`Error processing block ${blockNumber}: ${error.message}`);
    }
  }
  console.log("First pass complete: All token contracts collected.");
}

// Run the first pass to collect all tokens from the genesis block to the latest block
async function startFirstPass() {
  try {
    await sequelize.authenticate();  // Ensure the database connection is established
    const latestBlock = await provider.getBlockNumber();
    const startBlock = getLatestBlockFromFile(); // Start from the last saved block

    console.log(`Starting first pass from block ${startBlock} to ${latestBlock}.`);
    
    await firstPassCollectTokens(startBlock, latestBlock);
    await sequelize.close();  // Close the database connection when done
    console.log("Database connection closed after first pass.");
  } catch (error: any) {
    console.error(`Error during first pass: ${error.message}`);
  }
}

startFirstPass();
