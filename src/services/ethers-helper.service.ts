import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EnsResolver, ethers } from 'ethers';
import { EnsService } from './ens.service';
import { AllowanceDto } from 'src/dtos/allowance.dto';
import { TokenDto } from 'src/dtos/token.dto';
import { TokenSupplyDto } from 'src/dtos/token-supply.dto';
import { SupportedNetworksService } from './supported-networks.service';
// import networks from 'networks.json';

@Injectable()
export class EthersHelperService {
  private readonly logger = new Logger(EthersHelperService.name);

  constructor(
    private readonly ensService: EnsService,
    private readonly supportedNetworksService: SupportedNetworksService,
  ) {}

  // Helper method to resolve ENS name to wallet address
  public async resolveWalletAddress(
    networkName: string,
    name: string,
  ): Promise<string> {
    try {
      this.ensService.setNetwork(networkName);
      return await this.ensService.resolveEnsName(name);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      // If ENS resolution fails, return the original wallet address
      // return walletAddress;
      throw new BadRequestException('Failed to resolve wallet address');
    }
  }

  // Helper method to resolve avatar by ENS name or wallet address
  public async resolveAvatar(
    networkName: string,
    handle: string,
  ): Promise<string> {
    let walletAddress = handle;
    try {
      this.ensService.setNetwork(networkName);
      walletAddress = await this.ensService.resolveEnsName(handle);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      this.logger.debug(`Failed to resolve ENS name: ${error.message}`);
    }
    this.logger.debug(`Resolved wallet address: ${walletAddress}`);
    const provider = await this.getProvider(networkName);
    const resolver: EnsResolver = await provider.getResolver(handle);
    const avatar = await resolver.getAvatar();
    this.logger.debug(`Resolved avatar: ${avatar}`);
    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }
    return avatar;
  }

  public async getProvider(
    networkName: string,
    options?: {
      all?: boolean;
      random?: boolean;
      fallback?: boolean;
    },
  ): Promise<ethers.JsonRpcProvider> {
    const chainId = this.supportedNetworksService.getChainId(networkName);
    // console.log(`Chain ID for network ${networkName} is ${chainId}`);
    if (!chainId) {
      throw new Error(`Chain ID not found for network: ${networkName}`);
    }

    let url = `https://node.histori.xyz/${networkName}/si5kud34l4o9wtawzh8ry9f6t9`;
    if (options) {
      if (options.all) {
        url = `${url}?all=true`;
      }
      if (options.random) {
        url = `${url}?random=true`;
      }
      if (options.fallback) {
        url = `${url}?fallback=true`;
      }
    }

    return new ethers.JsonRpcProvider(url);
  }

  // public async sendRPCRequest({
  //   network,
  //   all,
  //   any,
  //   params,
  // }: {
  //   network: string;
  //   all?: boolean;
  //   any?: boolean;
  //   params: any;
  // }) {
  //   const provider = await this.getProvider(network);
  //   return await provider.send(all ? 'all' : any ? 'any' : 'eth_call', params);
  // }
  // Convert a timestamp or block number to a block number
  public async convertToBlockNumber(
    dateString: string,
    provider: ethers.JsonRpcProvider,
  ): Promise<number> {
    const latestBlockNumber = await provider.getBlockNumber();
    const timestamp = Math.floor(new Date(dateString).getTime() / 1000);
    return await this.findBlockNumberByTimestamp(
      timestamp,
      latestBlockNumber,
      provider,
    );
  }

  public async getBlockNumbersBetweenDates(
    startDate: string,
    endDate: string,
    provider: ethers.JsonRpcProvider,
  ): Promise<number[]> {
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    const latestBlockNumber = await provider.getBlockNumber();

    const startBlockNumber = await this.findBlockNumberByTimestamp(
      startTimestamp,
      latestBlockNumber,
      provider,
    );
    const endBlockNumber = await this.findBlockNumberByTimestamp(
      endTimestamp,
      latestBlockNumber,
      provider,
    );

    const blockNumbers: number[] = [];
    for (let i = startBlockNumber; i <= endBlockNumber; i++) {
      blockNumbers.push(i);
    }

    return blockNumbers;
  }

  public async findBlockNumberByTimestamp(
    targetTimestamp: number,
    latestBlockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<number> {
    // Step 1: Get the first block and the latest block
    const firstBlock = await provider.getBlock(0);
    const latestBlock = await provider.getBlock(latestBlockNumber);

    const firstTimestamp = firstBlock.timestamp;
    const latestTimestamp = latestBlock.timestamp;

    // Step 2: Calculate the average block time (block slot period)
    const totalTime = latestTimestamp - firstTimestamp;
    const totalBlocks = latestBlockNumber;
    const averageBlockTime = totalTime / totalBlocks; // seconds per block

    // Step 3: Estimate the block number based on the target timestamp
    const estimatedBlockNumber = Math.floor(
      (targetTimestamp - firstTimestamp) / averageBlockTime,
    );

    // Step 4: Clamp the estimated block number within the valid range
    let lowerBlock = Math.max(0, estimatedBlockNumber - 1000); // Adjust to start around estimated block
    let upperBlock = Math.min(latestBlockNumber, estimatedBlockNumber + 1000);

    // Step 5: Refine the search using binary search
    while (lowerBlock <= upperBlock) {
      const midBlock = Math.floor((lowerBlock + upperBlock) / 2);
      const midBlockData = await provider.getBlock(midBlock);

      if (midBlockData.timestamp < targetTimestamp) {
        lowerBlock = midBlock + 1;
      } else if (midBlockData.timestamp > targetTimestamp) {
        upperBlock = midBlock - 1;
      } else {
        return midBlock; // Exact match found
      }
    }

    // Return the closest block number if exact match not found
    return lowerBlock;
  }

  public async convertBlockNumberToTimestamp(
    blockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<number> {
    // Validate that blockNumber is a positive integer
    if (!Number.isInteger(blockNumber) || blockNumber < 0) {
      throw new Error(
        'Invalid block number. It must be a non-negative integer.',
      );
    }

    try {
      // Fetch the block details using the provider
      const block = await provider.getBlock(blockNumber);
      if (!block) {
        throw new Error(
          'Block not found. Please provide a valid block number.',
        );
      }

      return block.timestamp;
    } catch (error) {
      console.error(
        `Failed to convert block number to timestamp: ${error.message}`,
      );
      throw new Error(
        'Unable to retrieve the timestamp for the given block number.',
      );
    }
  }

  public async convertBlockNumberToDateString(
    blockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<string> {
    // Validate that blockNumber is a positive integer
    if (!Number.isInteger(blockNumber) || blockNumber < 0) {
      throw new Error(
        'Invalid block number. It must be a non-negative integer.',
      );
    }

    try {
      // Fetch the block details using the provider
      const block = await provider.getBlock(blockNumber);
      if (!block) {
        throw new Error(
          'Block not found. Please provide a valid block number.',
        );
      }

      // Convert the block timestamp to a readable date string
      return new Date(block.timestamp * 1000).toISOString();
    } catch (error) {
      console.error(
        `Failed to convert block number to date string: ${error.message}`,
      );
      throw new Error(
        'Unable to retrieve the date string for the given block number.',
      );
    }
  }

  /**
   * Determines the final block number based on optional date or block height.
   * @param date The date string to convert (optional).
   * @param blockHeight The block height to use (optional).
   * @param provider An ethers.js provider instance.
   * @returns The final block number.
   */
  async getFinalBlockNumber(
    date?: string,
    blockHeight?: number,
    provider?: ethers.JsonRpcProvider,
  ): Promise<number> {
    if (date) {
      try {
        return await this.convertToBlockNumber(date, provider);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: any) {
        throw new BadRequestException(
          'Timestamp is in the future or before the creation of the chain.',
        );
      }
    }

    if (blockHeight !== undefined) {
      return blockHeight;
    }

    return await provider.getBlockNumber(); // Default to the latest block
  }

  // Function to query balance using ethers.js for a specific block
  public async queryBalanceWithEthers(
    walletAddress: string,
    tokenAddress: string,
    blockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<any> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ],
        provider,
      );

      // Query balance for the holder at the given block number
      const balance = await contract.balanceOf(walletAddress, {
        blockTag: blockNumber,
      });
      // const decimals = await contract.decimals();

      // Format the balance with the decimals
      // const balance = ethers.formatUnits(balanceRaw, decimals);

      // Return the BalanceDto
      return {
        holder: walletAddress,
        contractAddress: tokenAddress,
        balance: balance.toString(),
        blockNumber,
      };
    } catch (error) {
      console.error('Error querying balance with ethers:', error);
      throw new Error('Failed to query balance');
    }
  }

  // Method to query allowance with ethers.js
  public async queryAllowanceWithEthers(
    owner: string,
    spender: string,
    tokenAddress: string,
    blockNumber: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<AllowanceDto> {
    const contract = new ethers.Contract(
      tokenAddress,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
      ],
      provider,
    );

    const allowance = await contract.allowance(owner, spender, {
      blockTag: blockNumber,
    });
    return {
      tokenType: 'erc20',
      owner,
      spender,
      contractAddress: tokenAddress,
      allowance: allowance,
      blockNumber,
    };
  }

  public async queryTokenData(
    tokenAddress: string,
    provider: ethers.JsonRpcProvider,
  ): Promise<TokenDto> {
    try {
      // Create a contract instance with basic ERC20/ERC777 methods
      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function granularity() view returns (uint256)', // ERC777 specific
        ],
        provider,
      );

      let name;
      let symbol;
      let decimals;
      let granularity;
      let tokenType = 'erc20'; // Default to erc20
      let dto: any = {
        token_address: tokenAddress,
      };
      try {
        name = await contract.name();
        dto = { ...dto, name };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //silently ignore
      }
      try {
        symbol = await contract.symbol();
        dto = { ...dto, symbol };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //silently ignore
      }
      try {
        decimals = await contract.decimals();
        dto = { ...dto, decimals };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //silently ignore
      }

      try {
        granularity = await contract.granularity();
        dto = { ...dto, granularity };
        tokenType = 'erc777';
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //silently ignore
      }
      try {
        const blockNumber = await this.getContractDeploymentBlock({
          contractAddress: tokenAddress,
          provider,
        });
        dto = { ...dto, block_height: blockNumber };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        //silently ignore
      }

      if (!name && !symbol) {
        throw new NotFoundException('Token name and symbol not found');
      }

      dto = { ...dto, token_type: tokenType };

      // Return the TokenDto with the fetched details
      return dto;
    } catch (error) {
      console.error('Error querying token data with ethers:', error);
      throw new Error('Failed to query token data from blockchain');
    }
  }

  public async getContractDeploymentBlock(options: {
    contractAddress: string;
    provider: ethers.JsonRpcProvider;
  }): Promise<number | null> {
    const { provider, contractAddress } = options;
    try {
      const transaction = await provider.getTransaction(contractAddress);
      if (!transaction) {
        this.logger.debug(
          `No transaction found for contract address: ${contractAddress}`,
        );
        return null;
      }

      const receipt = await provider.getTransactionReceipt(transaction.hash);
      if (!receipt) {
        this.logger.debug(
          `No receipt found for contract address: ${contractAddress}`,
        );
        return null;
      }
      return receipt.blockNumber;
    } catch (error: any) {
      this.logger.debug(
        `Error fetching deployment block for ${contractAddress}: ${error.message}`,
      );
      return null;
    }
  }

  // Query the blockchain for token supply at a given block number
  public async queryTokenSupplyFromBlockchain(
    contractAddress: string,
    block_height: number,
    provider: ethers.JsonRpcProvider,
  ): Promise<TokenSupplyDto> {
    // Interact with the smart contract to fetch the token supply
    try {
      const tokenContract = new ethers.Contract(
        contractAddress,
        // Token ABI: This should include at least the 'totalSupply' method
        ['function totalSupply() view returns (uint256)'],
        provider,
      );

      // Query total supply at the specific block
      const totalSupply = await tokenContract.totalSupply({
        blockTag: block_height,
      });

      // Return the TokenSupplyDto
      return {
        contractAddress,
        blockNumber: block_height,
        totalSupply: totalSupply.toString(),
      };
    } catch (error) {
      console.error(`Failed to get : ${error.message}`);
      return null;
    }
  }
}
