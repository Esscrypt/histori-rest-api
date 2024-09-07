import { JsonRpcProvider, Contract, id, ZeroAddress, Block, TransactionReceipt } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { sequelize, Token, Balance, Allowance } from "../models";  // Adjust the path to your models if needed

dotenv.config();

const provider = new JsonRpcProvider(process.env.RPC_URL);
const BLOCK_STATE_FILE = "blockState.json";  // File to store the latest block number

const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Serialize (write) the latest block number to a file
function saveLatestBlockToFile(blockNumber: number) {
  const data = { latestScrapedBlock: blockNumber };
  fs.writeFileSync(BLOCK_STATE_FILE, JSON.stringify(data));
  console.log(`Saved latest block number: ${blockNumber}`);
}

// Deserialize (read) the latest block number from a file
function getLatestBlockFromFile(): number {
  try {
    const fileContent = fs.readFileSync(BLOCK_STATE_FILE, "utf8");
    const data = JSON.parse(fileContent);
    return data.latestScrapedBlock || 0;
  } catch (error) {
    console.log("No block state file found, starting from block 0.");
    return 0;  // Default to block 0 if no file is found
  }
}
// Detect new token deployments in a block
async function detectNewTokenDeployment(blockNumber: number) {
    // Fetch the block to get its transactions (only transaction hashes)
    const block = await provider.getBlock(blockNumber);
  
    if (!block) {
      console.log(`Block ${blockNumber} does not exist`);
      return;
    }
  
    // Process each transaction in the block
    for (const txHash of block.transactions) {
      // Fetch the transaction receipt to get contract creation info
      const receipt: TransactionReceipt | null = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        console.log(`Receipt missing at ${blockNumber}`);
        continue;
      }
  
      // Check if the transaction is a contract creation (i.e., has a contractAddress)
      const contractAddress = receipt.contractAddress;
      if (contractAddress) {
        console.log(`Contract created at address ${contractAddress}`);
  
        // Now we verify if it's an ERC-20 token by checking common ERC-20 functions
        const contract = new Contract(contractAddress, erc20ABI, provider);
        try {
          // Query common ERC-20 properties to validate the contract
          const name = await contract.name();
          const symbol = await contract.symbol();
          const decimals = await contract.decimals();
          const totalSupply = await contract.totalSupply();
  
          // If successful, we assume it's a valid ERC-20 token
          console.log(`New ERC-20 token detected: ${symbol} (${name})`);
  
          // Insert the new token into the database
          await Token.create({
            name,
            symbol,
            decimals,
            contractAddress,
            totalSupply: totalSupply.toString(),
            blockNumber: blockNumber,
          });
  
        } catch (error) {
          // If any of the ERC-20 queries fail, it's likely not a valid ERC-20 contract
          console.log(`Contract at ${contractAddress} is not a valid ERC-20 token.`);
        }
      }
    }
  }  

// Fetch and store events from the blockchain (balances and allowances) for a specific block
async function fetchAndStoreEventsForBlock(blockNumber: number) {
  // Step 1: Detect new token deployments
  await detectNewTokenDeployment(blockNumber);

  // Step 2: Fetch Transfer events for balance calculation
  const transferLogs = await provider.getLogs({
    fromBlock: blockNumber,
    toBlock: blockNumber,  // Only query this single block
    topics: [id("Transfer(address,address,uint256)")],
  });

  for (const log of transferLogs) {
    const contractAddress = log.address;

    // Ensure the contract is already in the database
    const token = await Token.findOne({ where: { contractAddress } });
    if (!token) {
      continue;  // Skip tokens not tracked
    }

    const contract = new Contract(contractAddress, erc20ABI, provider);
    const parsedEvent = contract.interface.parseLog(log);
    const { from, to, value } = parsedEvent.args;
    const valueBigInt = BigInt(value.toString());

    // Update balances for the sender and recipient
    if (from !== ZeroAddress) {
      await updateBalance(token.id, from, (-valueBigInt).toString(), log.blockNumber);
    }
    await updateBalance(token.id, to, valueBigInt.toString(), log.blockNumber);
  }

  // Step 3: Fetch Approval events for allowance calculation
  const approvalLogs = await provider.getLogs({
    fromBlock: blockNumber,
    toBlock: blockNumber,  // Only query this single block
    topics: [id("Approval(address,address,uint256)")],
  });

  for (const log of approvalLogs) {
    const contractAddress = log.address;

    // Ensure the contract is already in the database
    const token = await Token.findOne({ where: { contractAddress } });
    if (!token) {
      continue;  // Skip tokens not tracked
    }

    const contract = new Contract(contractAddress, erc20ABI, provider);
    const parsedEvent = contract.interface.parseLog(log);
    const { owner, spender, value } = parsedEvent.args;
    const valueBigInt = BigInt(value.toString());

    // Update allowances for the owner and spender
    await updateAllowance(token.id, owner, spender, valueBigInt.toString(), log.blockNumber);
  }

  console.log(`Processed block ${blockNumber}`);
}

// Update the balance of an account for a token
async function updateBalance(tokenId: number, holder: string, balanceDelta: string, blockNumber: number) {
  const existingBalance = await Balance.findOne({ where: { tokenId, holder } });

  if (existingBalance) {
    const newBalanceBigInt = BigInt(existingBalance.balance) + BigInt(balanceDelta);  // Add BigInt balances
    await Balance.update(
      { balance: newBalanceBigInt.toString(), blockNumber },
      { where: { tokenId, holder } }
    );
  } else {
    await Balance.create({
      tokenId,
      holder,
      balance: balanceDelta,
      blockNumber,
    });
  }

  console.log(`Updated balance for holder ${holder} at block ${blockNumber}`);
}

// Update the allowance of a spender for a token
async function updateAllowance(tokenId: number, owner: string, spender: string, allowance: string, blockNumber: number) {
  const existingAllowance = await Allowance.findOne({ where: { tokenId, owner, spender } });

  if (existingAllowance) {
    await Allowance.update(
      { allowance, blockNumber },
      { where: { tokenId, owner, spender } }
    );
  } else {
    await Allowance.create({
      tokenId,
      owner,
      spender,
      allowance,
      blockNumber,
    });
  }

  console.log(`Updated allowance for spender ${spender} from owner ${owner} at block ${blockNumber}`);
}

// Main loop to scan blocks one at a time
async function scanForERC20Tokens(startBlock: number, endBlock: number) {
  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
    try {
      // Fetch and process logs and events for the current block
      await fetchAndStoreEventsForBlock(blockNumber);

      // Save the latest processed block
      saveLatestBlockToFile(blockNumber);
    } catch (error) {
      console.error(`Error processing block ${blockNumber}:`, error);
    }
  }
}

async function startScraping() {
  try {
    await sequelize.authenticate();

    const latestScrapedBlock = getLatestBlockFromFile(); // Get the last scraped block number from file
    const endBlock = await provider.getBlockNumber();  // Fetch the latest block number

    console.log(`Starting from block ${latestScrapedBlock} to ${endBlock}`);
    await scanForERC20Tokens(latestScrapedBlock, endBlock);

    await sequelize.close();
  } catch (error) {
    console.error("Error starting the scraper:", error);
  }
}

startScraping().catch(console.error);
