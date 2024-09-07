import { JsonRpcProvider, Contract, id, ZeroAddress, LogDescription } from "ethers";
import * as dotenv from "dotenv";
import { sequelize, Token, Balance, Allowance } from "../models";  // Adjust the path to your models
import { saveLatestBlockToFile, getLatestBlockFromFile } from "./blockState";  // Utility functions for block state

dotenv.config();

const provider = new JsonRpcProvider(process.env.RPC_URL);

const erc20ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Fetch logs for multiple blocks and process them in bulk
async function secondPassFetchLogsInBulk(startBlock: number, endBlock: number, blockBatchSize: number) {
    const tokens = await Token.findAll();  // Fetch tokens from the database

    for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber += blockBatchSize) {
        const currentEndBlock = Math.min(blockNumber + blockBatchSize - 1, endBlock);
        console.log(`Processing blocks ${blockNumber} to ${currentEndBlock}`);

        try {
            // Step 1: Fetch Transfer events for balance updates
            const transferLogs = await provider.getLogs({
                fromBlock: blockNumber,
                toBlock: currentEndBlock,
                topics: [id("Transfer(address,address,uint256)")],
            });

            console.log(`Found ${transferLogs.length} Transfer events in blocks ${blockNumber} to ${currentEndBlock}`);

            for (const log of transferLogs) {
                const contractAddress = log.address;

                // Only process tokens that were previously detected
                const token = tokens.find((t) => t.contractAddress === contractAddress);
                if (!token) continue; // Skip if not a tracked ERC-20 token

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

            // Step 2: Fetch Approval events for allowance updates
            const approvalLogs = await provider.getLogs({
                fromBlock: blockNumber,
                toBlock: currentEndBlock,
                topics: [id("Approval(address,address,uint256)")],
            });

            console.log(`Found ${approvalLogs.length} Approval events in blocks ${blockNumber} to ${currentEndBlock}`);

            for (const log of approvalLogs) {
                const contractAddress = log.address;

                // Only process tokens that were previously detected
                const token = tokens.find((t) => t.contractAddress === contractAddress);
                if (!token) continue; // Skip if not a tracked ERC-20 token

                const contract = new Contract(contractAddress, erc20ABI, provider);
                const parsedEvent: LogDescription | null = contract.interface.parseLog(log);
                if(!parsedEvent) {
                    console.log("no event");
                    continue;
                }
                const { owner, spender, value } = parsedEvent.args;
                const valueBigInt = BigInt(value.toString());

                // Update allowances
                await updateAllowance(token.id, owner, spender, valueBigInt.toString(), log.blockNumber);
            }

            // Save the latest processed block number to a file
            saveLatestBlockToFile(currentEndBlock);

        } catch (error) {
            console.error(`Error processing blocks ${blockNumber} to ${currentEndBlock}: ${error.message}`);
        }
    }

    console.log("Second pass complete: All balances and allowances processed.");
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


// Run second pass to process token events in bulk
async function startSecondPass() {
    try {
        await sequelize.authenticate();  // Ensure the database connection is established
        const latestBlock = await provider.getBlockNumber();
        const startBlock = getLatestBlockFromFile(); // Start from the last saved block
        const blockBatchSize = 2000;  // Adjust this based on your provider's limits

        console.log(`Starting second pass from block ${startBlock} to ${latestBlock}`);

        await secondPassFetchLogsInBulk(startBlock, latestBlock, blockBatchSize);
        await sequelize.close();  // Close the database connection when done
        console.log("Database connection closed after second pass.");
    } catch (error) {
        console.error(`Error during second pass: ${error.message}`);
    }
}

startSecondPass();
