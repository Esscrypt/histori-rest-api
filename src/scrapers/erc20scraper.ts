import { ethers } from 'ethers';
import { Token, Allowance, Balance, sequelize } from '../models';
import logger from '../middleware/logger';
import axios from 'axios';

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

async function scrapeERC20Tokens(startBlock: number, endBlock: number, holderAddresses: string[]) {
  try {
    for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber += 1000) {
      const logs = await provider.getLogs({
        fromBlock: blockNumber,
        toBlock: blockNumber + 999,
        topics: [ethers.utils.id("Transfer(address,address,uint256)")],
      });

      for (const log of logs) {
        const contractAddress = log.address;
        const existingToken = await Token.findOne({ where: { contractAddress } });

        if (!existingToken) {
          const tokenContract = new ethers.Contract(contractAddress, erc20ABI, provider);

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            tokenContract.name(),
            tokenContract.symbol(),
            tokenContract.decimals(),
            tokenContract.totalSupply(),
          ]);

          const token = await Token.create({
            name,
            symbol,
            decimals,
            contractAddress,
            totalSupply: totalSupply.toString(),
            blockNumber,
          });

          logger.info(`Stored new token: ${name} (${symbol}) at block ${blockNumber}`);
        }

        // Scrape balances and allowances for the token
        await scrapeTokenBalancesAndAllowances(contractAddress, blockNumber, holderAddresses);
      }

      logger.info(`Completed scraping blocks ${blockNumber} to ${blockNumber + 999}`);
    }
  } catch (error) {
    logger.error('Error in scraping ERC-20 tokens: ' + (error as Error).message);
  }
}

async function scrapeTokenBalancesAndAllowances(contractAddress: string, blockNumber: number, holderAddresses: string[]) {
  try {
    const token = await Token.findOne({ where: { contractAddress } });
    if (!token) return;

    const tokenContract = new ethers.Contract(contractAddress, erc20ABI, provider);

    for (const holder of holderAddresses) {
      const balance = await tokenContract.balanceOf(holder, { blockTag: blockNumber });
      await Balance.create({
        tokenId: token.id,
        holder,
        balance: balance.toString(),
        blockNumber,
      });

      for (const spender of holderAddresses) {
        const allowance = await tokenContract.allowance(holder, spender, { blockTag: blockNumber });
        await Allowance.create({
          tokenId: token.id,
          owner: holder,
          spender,
          allowance: allowance.toString(),
          blockNumber,
        });
      }
    }

    logger.info(`Scraped balances and allowances for token at address ${contractAddress}`);
  } catch (error) {
    logger.error('Error in scraping balances and allowances: ' + (error as Error).message);
  }
}

// Example usage
(async () => {
  await sequelize.sync();
  const startBlock = 0; // Genesis block
  const endBlock = await provider.getBlockNumber(); // Latest block
  const holderAddresses = ['0xAddress1', '0xAddress2']; // Replace with actual holder addresses

  await scrapeERC20Tokens(startBlock, endBlock, holderAddresses);
})();
