import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers, Contract } from 'ethers';
import {
  UniswapV2PoolInfoResponseDto,
  UniswapV2TokenInfoDto,
} from 'src/dtos/response/uniswap-v2-pool-info-response.dto copy';
import {
  UniswapV3PoolInfoResponseDto,
  UniswapV3TokenInfoDto,
} from 'src/dtos/response/uniswap-v3-pool-info-response.dto';
// import { UniswapV4PoolInfoResponseDto } from 'src/dtos/response/uniswap-v4-pool-info-response.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { SupportedNetworksService } from 'src/services/supported-networks.service';

@Injectable()
export class UniswapService {
  constructor(
    private readonly ethersHelperService: EthersHelperService,
    private readonly supportedNetworksService: SupportedNetworksService,
  ) {}

  private readonly poolManagerAbi: string[] = [
    'function getPool(address token0, address token1, uint24 fee) view returns (address)',
    'function getPoolData(address pool) view returns (tuple(address token0, address token1, uint24 fee, uint160 sqrtPriceX96, uint128 liquidity, address[] hooks))',
  ];

  private readonly poolAbi: string[] = [
    'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() view returns (address)',
    'function token1() view returns (address)',
  ];

  private readonly v3PoolAbi: string[] = [
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function fee() view returns (uint24)',
    'function liquidity() view returns (uint128)',
    'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  ];

  private readonly tokenAbi: string[] = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
  ];

  private async safeCall<T>(
    contract: Contract,
    method: string,
    ...args: any[]
  ): Promise<T | null> {
    try {
      return await contract[method](...args);
    } catch (error) {
      console.error(`Error calling ${method}:`, error);
      return null;
    }
  }

  async getPoolInfoV2(options: {
    networkName: string;
    provider: ethers.JsonRpcProvider;
    chainId: number;
    poolAddress: string;
  }): Promise<UniswapV2PoolInfoResponseDto> {
    const { networkName, poolAddress, chainId, provider } = options;

    const poolContract: Contract = new ethers.Contract(
      poolAddress,
      this.poolAbi,
      provider,
    );
    if (!poolContract) {
      throw new NotFoundException('Pool not found or invalid contract.');
    }

    try {
      const [reserves, token0Address, token1Address]: [
        { reserve0: bigint; reserve1: bigint },
        string,
        string,
      ] = await Promise.all([
        this.safeCall(poolContract, 'getReserves') as Promise<{
          reserve0: bigint;
          reserve1: bigint;
        }>,
        this.safeCall(poolContract, 'token0') as Promise<string>,
        this.safeCall(poolContract, 'token1') as Promise<string>,
      ]);

      if (!reserves || !token0Address || !token1Address) {
        throw new NotFoundException('Failed to fetch pool information.');
      }

      const rate: string = (
        Number(reserves.reserve1) / Number(reserves.reserve0)
      ).toFixed(6);

      const token0Contract: Contract = new ethers.Contract(
        token0Address,
        this.tokenAbi,
        provider,
      );
      const token1Contract: Contract = new ethers.Contract(
        token1Address,
        this.tokenAbi,
        provider,
      );

      const [
        token0Name,
        token0Symbol,
        token0Decimals,
        token1Name,
        token1Symbol,
        token1Decimals,
      ]: [
        string | null,
        string | null,
        number | null,
        string | null,
        string | null,
        number | null,
      ] = await Promise.all([
        this.safeCall<string>(token0Contract, 'name'),
        this.safeCall<string>(token0Contract, 'symbol'),
        this.safeCall<number>(token0Contract, 'decimals'),
        this.safeCall<string>(token1Contract, 'name'),
        this.safeCall<string>(token1Contract, 'symbol'),
        this.safeCall<number>(token1Contract, 'decimals'),
      ]);

      const token0Info: UniswapV2TokenInfoDto = {
        address: token0Address,
        name: token0Name || 'Unknown',
        symbol: token0Symbol || 'Unknown',
        decimals: token0Decimals?.toString() || 'Unknown',
        reserve: reserves.reserve0.toString(),
        reserve_eth: ethers.formatEther(reserves.reserve0),
      };

      const token1Info: UniswapV2TokenInfoDto = {
        address: token1Address,
        name: token1Name || 'Unknown',
        symbol: token1Symbol || 'Unknown',
        decimals: token1Decimals?.toString() || 'Unknown',
        reserve: reserves.reserve1.toString(),
        reserve_eth: ethers.formatEther(reserves.reserve1),
      };

      return {
        network_name: networkName,
        chain_id: chainId,
        pool_address: poolAddress,
        pair_addresses: `${token0Address}/${token1Address}`,
        pair_symbols: `${token0Symbol || 'Unknown'}/${token1Symbol || 'Unknown'}`,
        rate,
        token0: token0Info,
        token1: token1Info,
      };
    } catch (error) {
      console.error('Error fetching pool info:', error);
      throw new NotFoundException('Pool not found or invalid contract.');
    }
  }

  async getPoolInfoV3(options: {
    networkName: string;
    provider: ethers.JsonRpcProvider;
    chainId: number;
    poolAddress: string;
  }): Promise<UniswapV3PoolInfoResponseDto> {
    const { networkName, provider, chainId, poolAddress } = options;

    // Create a contract instance for the Uniswap V3 pool
    const poolContract: Contract = new ethers.Contract(
      poolAddress,
      this.v3PoolAbi,
      provider,
    );

    if (!poolContract) {
      throw new NotFoundException('Pool not found or invalid contract.');
    }

    try {
      // Fetch pool-specific data: liquidity, fee tier, tokens, and slot0
      const [liquidity, token0Address, token1Address, fee, slot0] =
        await Promise.all([
          this.safeCall(poolContract, 'liquidity') as Promise<bigint>,
          this.safeCall(poolContract, 'token0') as Promise<string>,
          this.safeCall(poolContract, 'token1') as Promise<string>,
          this.safeCall(poolContract, 'fee') as Promise<number>,
          this.safeCall(poolContract, 'slot0') as Promise<{
            sqrtPriceX96: bigint;
          }>,
        ]);

      if (!liquidity || !token0Address || !token1Address || !slot0) {
        throw new NotFoundException('Failed to fetch pool information.');
      }

      // Calculate price using sqrtPriceX96 (Uniswap V3 uses square root price scaling)
      //TODO: using the pricing service get the rate
      // const sqrtPriceX96 = Number(slot0.sqrtPriceX96);
      // const rate = (sqrtPriceX96 ** 2 / 2 ** (96 * 2)).toFixed(6);

      // Fetch token details for token0 and token1
      const token0Contract = new ethers.Contract(
        token0Address,
        this.tokenAbi,
        provider,
      );
      const token1Contract = new ethers.Contract(
        token1Address,
        this.tokenAbi,
        provider,
      );

      const [
        token0Name,
        token0Symbol,
        token0Decimals,
        token1Name,
        token1Symbol,
        token1Decimals,
      ] = await Promise.all([
        this.safeCall<string>(token0Contract, 'name'),
        this.safeCall<string>(token0Contract, 'symbol'),
        this.safeCall<number>(token0Contract, 'decimals'),
        this.safeCall<string>(token1Contract, 'name'),
        this.safeCall<string>(token1Contract, 'symbol'),
        this.safeCall<number>(token1Contract, 'decimals'),
      ]);

      // Assemble token info for token0 and token1
      const token0Info: UniswapV3TokenInfoDto = {
        address: token0Address,
        name: token0Name || 'Unknown',
        symbol: token0Symbol || 'Unknown',
        decimals: token0Decimals?.toString() || 'Unknown',
      };

      const token1Info: UniswapV3TokenInfoDto = {
        address: token1Address,
        name: token1Name || 'Unknown',
        symbol: token1Symbol || 'Unknown',
        decimals: token1Decimals?.toString() || 'Unknown',
      };

      // Return pool information
      return {
        network_name: networkName,
        chain_id: chainId,
        pool_address: poolAddress,
        pair_addresses: `${token0Address}/${token1Address}`,
        pair_symbols: `${token0Symbol || 'Unknown'}/${token1Symbol || 'Unknown'}`,
        // rate,
        token0: token0Info,
        token1: token1Info,
        fee: fee.toString(),
        fee_percentage: `${(Number(fee) / 10000).toFixed(1)}%`,
        liquidity: liquidity.toString(),
        liquidity_eth: ethers.formatEther(liquidity),
      };
    } catch (error) {
      console.error('Error fetching pool info:', error);
      throw new NotFoundException('Pool not found or invalid contract.');
    }
  }

  readonly poolManagerAddresses: Record<string, string> = {
    'unichain-sepolia': '0x00b036b58a818b1bc34d502d3fe730db729e62ac', // Replace with actual Mainnet address
    'eth-sepolia': '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543', // Replace with actual Polygon address
    'base-sepolia': '0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408', // Replace with actual Arbitrum address
    'arbitrum-sepolia': '0xFB3e0C6F74eB1a21CC1Da29aeC80D2Dfe6C9a317',
    // Add more networks as needed
  };

  async getPoolManagerAddress(networkName: string): Promise<string> {
    const poolManagerAddress = this.poolManagerAddresses[networkName];
    if (!poolManagerAddress) {
      throw new NotFoundException(
        `PoolManager address not found for network: ${networkName}`,
      );
    }
    return poolManagerAddress;
  }

  //TODO: use uniswap-v4 SDK instead to get the pool info
  // async getPoolInfoV4(options: {
  //   networkName: string;
  //   provider: ethers.JsonRpcProvider;
  //   chainId: number;
  //   token0: string;
  //   token1: string;
  //   fee: number;
  // }): Promise<UniswapV4PoolInfoResponseDto> {
  //   const { networkName, provider, chainId, token0, token1, fee } = options;

  //   // Assume PoolManager is deployed at a known address
  //   const poolManagerAddress = await this.getPoolManagerAddress(networkName);
  //   const poolManagerContract = new ethers.Contract(
  //     poolManagerAddress,
  //     this.poolManagerAbi,
  //     provider,
  //   );

  //   try {
  //     // Retrieve pool address for the given tokens and fee
  //     const poolAddress: string = await this.safeCall<string>(
  //       poolManagerContract,
  //       'getPool',
  //       token0,
  //       token1,
  //       fee,
  //     );

  //     if (!poolAddress || poolAddress === ethers.ZeroAddress) {
  //       throw new NotFoundException('Pool not found.');
  //     }

  //     // Retrieve detailed pool data
  //     const poolData = await this.safeCall(
  //       poolManagerContract,
  //       'getPoolData',
  //       poolAddress,
  //     );

  //     if (!poolData) {
  //       throw new NotFoundException('Failed to fetch pool data.');
  //     }

  //     const {
  //       token0: poolToken0,
  //       token1: poolToken1,
  //       fee: poolFee,
  //       sqrtPriceX96,
  //       liquidity,
  //       hooks,
  //     } = poolData;

  //     // Fetch token details for token0 and token1
  //     const token0Contract = new ethers.Contract(
  //       poolToken0,
  //       this.tokenAbi,
  //       provider,
  //     );
  //     const token1Contract = new ethers.Contract(
  //       poolToken1,
  //       this.tokenAbi,
  //       provider,
  //     );

  //     const [
  //       token0Name,
  //       token0Symbol,
  //       token0Decimals,
  //       token1Name,
  //       token1Symbol,
  //       token1Decimals,
  //     ] = await Promise.all([
  //       this.safeCall<string>(token0Contract, 'name'),
  //       this.safeCall<string>(token0Contract, 'symbol'),
  //       this.safeCall<number>(token0Contract, 'decimals'),
  //       this.safeCall<string>(token1Contract, 'name'),
  //       this.safeCall<string>(token1Contract, 'symbol'),
  //       this.safeCall<number>(token1Contract, 'decimals'),
  //     ]);

  //     // Calculate price using sqrtPriceX96
  //     const sqrtPrice = Number(sqrtPriceX96);
  //     const price = (sqrtPrice ** 2 / 2 ** 192).toFixed(6);

  //     // Assemble token info for token0 and token1
  //     const token0Info = {
  //       address: poolToken0,
  //       name: token0Name || 'Unknown',
  //       symbol: token0Symbol || 'Unknown',
  //       decimals: token0Decimals?.toString() || 'Unknown',
  //     };

  //     const token1Info = {
  //       address: poolToken1,
  //       name: token1Name || 'Unknown',
  //       symbol: token1Symbol || 'Unknown',
  //       decimals: token1Decimals?.toString() || 'Unknown',
  //     };

  //     // Return pool information
  //     return {
  //       network_name: networkName,
  //       chain_id: chainId,
  //       pool_address: poolAddress,
  //       pair_addresses: `${poolToken0}/${poolToken1}`,
  //       pair_symbols: `${token0Symbol || 'Unknown'}/${token1Symbol || 'Unknown'}`,
  //       price,
  //       token0: token0Info,
  //       token1: token1Info,
  //       fee: poolFee.toString(),
  //       fee_percentage: `${(Number(poolFee) / 10000).toFixed(1)}%`,
  //       liquidity: liquidity.toString(),
  //       liquidity_eth: ethers.formatEther(liquidity),
  //       hooks,
  //     };
  //   } catch (error) {
  //     console.error('Error fetching Uniswap V4 pool info:', error.message);
  //     throw new NotFoundException('Pool not found or invalid contract.');
  //   }
  // }
}
