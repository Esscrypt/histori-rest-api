import { ethers } from "ethers";
import axios from "axios";
import * as dotenv from "dotenv";
import { connectToDatabase } from "./db";

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  totalSupply: string;
  blockNumber: number;
  tokenURI?: string;
  additionalMetadata?: Record<string, any>;
}

async function fetchTokenMetadata(contractAddress: string, blockNumber: number): Promise<TokenMetadata> {
  const contract = new ethers.Contract(contractAddress, erc20ABI, provider);

  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.totalSupply({ blockTag: blockNumber }),
  ]);

  let metadata: TokenMetadata = {
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toString(),
    contractAddress,
    blockNumber,
  };

  try {
    const tokenURI = await contract.tokenURI();
    if (tokenURI) {
      metadata.tokenURI = tokenURI;
      const response = await axios.get(tokenURI);
      metadata.additionalMetadata = response.data;
    }
  } catch (error) {
    console.log(`No tokenURI found for contract: ${contractAddress}`);
  }

  return metadata;
}

async function scanForERC20Tokens(startBlock: number, endBlock: number): Promise<void> {
  const db = await connectToDatabase();
  const tokenCollection = db.collection("tokenMetadata");

  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber += 1000) {
    try {
      const events = await provider.getLogs({
        fromBlock: blockNumber,
        toBlock: Math.min(blockNumber + 999, endBlock),
        topics: [ethers.utils.id("Transfer(address,address,uint256)")],
      });

      for (const event of events) {
        const contractAddress = event.address;
        const existingToken = await tokenCollection.findOne({ contractAddress });
        if (!existingToken) {
          const metadata = await fetchTokenMetadata(contractAddress, blockNumber);
          await tokenCollection.insertOne(metadata);
          console.log(`Inserted metadata for token: ${metadata.name} at block ${blockNumber}`);
        }
      }

      console.log(`Scanned blocks ${blockNumber} to ${Math.min(blockNumber + 999, endBlock)}`);
    } catch (error) {
      console.error(`Error fetching logs from block ${blockNumber} to ${Math.min(blockNumber + 999, endBlock)}:`, error);
    }
  }
}

async function startScraping() {
  const startBlock = 0;  // Start from genesis block
  const endBlock = await provider.getBlockNumber();  // Latest block

  await scanForERC20Tokens(startBlock, endBlock);
}

startScraping().catch(console.error);
