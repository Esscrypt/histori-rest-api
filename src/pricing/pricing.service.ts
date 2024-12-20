import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { ethers } from 'ethers';
import bn from 'bignumber.js'; // Importing bignumber.js for precision control
import { UniswapPriceInfoResponseDto } from 'src/dtos/response/uniswap-eth-usd-price-info-response.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import networks from 'networks.json'; // Assuming networks.json is in src/config directory
import { BlockHeightOrDateDto } from 'src/dtos/block-height-or-date.dto';

// Extend BigNumber's precision
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
  ) {
    bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });
  }

  private async getUniswapV3PriceFromPool(
    poolContract: ethers.Contract,
    poolAddress: string,
    blockNumber?: number,
  ): Promise<bn> {
    try {
      const slot0 = await poolContract.slot0({ blockTag: blockNumber });
      const price = new bn(slot0[0]);
      return this.calculatePriceFromSqrtPrice(price);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // in case of error, try fetching the latest block
    }
    try {
      const slot0 = await poolContract.slot0();
      const price = new bn(slot0[0]);
      return this.calculatePriceFromSqrtPrice(price);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch price for pool: ${poolAddress}`,
        error,
      );
    }
  }

  private async getPriceFromUniswapV2Pool(
    poolContract: ethers.Contract,
    poolAddress: string,
    blockNumber?: number,
  ): Promise<bn> {
    try {
      const reserves = await poolContract.getReserves({
        blockTag: blockNumber,
      });
      const reserves0 = new bn(reserves[0]).dividedBy(new bn(10).pow(18)); // divided by 10**6 to account for the 6 decimal places of USDT
      const reserves1 = new bn(reserves[1]).dividedBy(new bn(10).pow(18)); // divided by 10**6 to account for the 6 decimal places of USDT
      return reserves0.div(reserves1);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // in case of error, try fetching the latest block
    }
    try {
      const reserves = await poolContract.getReserves();
      const reserves0 = new bn(reserves[0]).div(new bn(10).pow(18)); // divided by 10**6 to account for the 6 decimal places of USDT
      const reserves1 = new bn(reserves[1]).div(new bn(10).pow(18)); // divided by 10**6 to account for the 6 decimal places of USDT
      return reserves0.div(reserves1);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch price for pool: ${poolAddress}`,
        error,
      );
    }
  }

  private async getQuickswapV3PriceFromPool(
    poolContract: ethers.Contract,
    poolAddress: string,
    blockNumber?: number,
  ): Promise<bn> {
    try {
      const globalState = await poolContract.globalState({
        blockTag: blockNumber,
      });
      const price = new bn(globalState[0]);
      return this.calculatePriceFromSqrtPrice(price);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // in case of error, try fetching the latest block
    }
    try {
      const globalState = await poolContract.globalState();
      const price = new bn(globalState[0]);
      return this.calculatePriceFromSqrtPrice(price);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch price for pool: ${poolAddress}`,
        error,
      );
    }
  }

  private async getPriceFromPool(
    provider: ethers.JsonRpcProvider,
    poolAddress: string,
    network: any,
    blockNumber?: number,
  ): Promise<bn> {
    const poolContract = new ethers.Contract(
      poolAddress,
      [
        'function slot0() public view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
        'function globalState() public view returns (uint160 sqrtPriceX96, int24 tick, uint16 timepointIndex, uint8 fee1, uint8 fee2, bool unlocked)',
        'function getReserves() public view returns (uint128 _reserve0, uint128 _reserve1, uint32 _blockTimestampLast)',
      ],
      provider,
    );
    let price: bn;
    this.logger.log(`Pool type: ${network.poolType}`);
    switch (network.poolType) {
      case 'uniswap-v3':
        price = await this.getUniswapV3PriceFromPool(
          poolContract,
          poolAddress,
          blockNumber,
        );
        break;
      case 'uniswap-v2':
        price = await this.getPriceFromUniswapV2Pool(
          poolContract,
          poolAddress,
          blockNumber,
        );
        break;
      case 'pancakeswap-v2':
        price = await this.getPriceFromUniswapV2Pool(
          poolContract,
          poolAddress,
          blockNumber,
        );
        break;

      case 'quickswap-v3':
        price = await this.getQuickswapV3PriceFromPool(
          poolContract,
          poolAddress,
          blockNumber,
        );
        break;

      default:
        this.logger.log(
          `No pool type supplied, defaulting to uniswap v3 for pool : ${poolAddress}`,
        );
        price = await this.getUniswapV3PriceFromPool(
          poolContract,
          poolAddress,
          blockNumber,
        );
    }
    this.logger.log(`Price: ${price.toString()}`);
    if (network.poolInversed) {
      price = new bn(1).div(price);
      this.logger.log(`Inversed Price: ${price.toString()}`);
    }

    if (network.poolScale) {
      price = price.dividedBy(new bn(10).pow(network.poolScale));
      this.logger.log(`Scaled Price: ${price.toString()}`);
    }
    return price;
  }

  private calculatePriceFromSqrtPrice(sqrtPriceX96: bn): bn {
    return sqrtPriceX96.dividedBy(new bn(2).pow(96)).pow(2);
  }

  // Mapping of network names to Uniswap V3 pool addresses
  private networkToPoolAddress = {
    'eth-mainnet': '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640', // ETH/USDT pool on Ethereum mainnet
    'eth-mainnet-hst': 'TODO', // HST/WETH pool on Ethereum mainnet
    'eth-sepolia': '0xfeed501c2b21d315f04946f85fc6416b640240b5', //USDC/WETH pool on Ethereum sepolia
    'eth-sepolia-hst': '0x4791a3E6d5013ceb48017969D494001C76E9385c', // HST/WETH pool on Ethereum sepolia
  };

  async getNativeToUSDPriceQuote(
    networkName: string,
    dto: BlockHeightOrDateDto,
  ): Promise<UniswapPriceInfoResponseDto> {
    try {
      const chainId = this.supportedNetworksService.getChainId(networkName);
      const provider = await this.ethersHelperService.getProvider(networkName);

      const { date, block_height } = dto;

      const finalBlockNumber =
        await this.ethersHelperService.getFinalBlockNumber(
          date,
          block_height,
          provider,
        );

      const ethToUSD: bn = await this.getNativeToUSDPrice(
        networkName,
        finalBlockNumber,
      );

      return {
        chain_id: chainId,
        network_name: networkName,
        block_height: finalBlockNumber,
        price: `$${ethToUSD.toFixed(6)}`,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        throw new BadRequestException(
          `Failed to fetch Native token to USD price: ${error.message}`,
        );
      } else {
        throw new NotFoundException(`Native token to USD price not found`);
      }
    }
  }

  // get the ethereum mainnet wei to usd price (should be a very small number)
  private async getEthWeiToUSD(blockNumber?: number): Promise<bn> {
    const network = networks.find((n) => n.networkId === 'eth-mainnet');
    const provider = await this.ethersHelperService.getProvider('eth-mainnet');
    const poolAddress = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
    const price = await this.getPriceFromPool(
      provider,
      poolAddress,
      network,
      blockNumber,
    );
    //price = price.dividedBy(new bn(10).pow(6)); // divided by 10**6 to account for the 6 decimal places of USDT

    return price;
  }

  // get the native token (in Wei) to USD price. Should be a very small number
  public async getWeiToUSD(
    networkName: string,
    blockNumber?: number,
  ): Promise<bn> {
    const network: any = networks.find((n) => n.networkId === networkName);
    this.logger.log(network);
    if (network.nativeCurrencyToETHPool && network.nativeCurrencyToUSDPool) {
      throw new BadRequestException(
        'Network has both nativeCurrencyToETHPool and nativeCurrencyToUSDPool',
      );
    }

    const targetNetwork = network.poolNetworkId || networkName;
    this.logger.log(`Working with network: ${targetNetwork}`);
    const provider = await this.ethersHelperService.getProvider(targetNetwork);

    let poolAddress: string;
    let price: bn;

    if (network.nativeCurrencyToETHPool) {
      poolAddress = network.nativeCurrencyToETHPool;
      this.logger.log(
        `Fetching on ${targetNetwork} Native token for network ${networkName} to ETH price`,
      );
      price = await this.getPriceFromPool(
        provider,
        poolAddress,
        network,
        blockNumber,
      );
      // at this point we have the price in terms of native token per ETH
      const ethWeiToUSDPrice = await this.getEthWeiToUSD(blockNumber);
      this.logger.log(
        `ETHEREUM WEI to USD Price: ${ethWeiToUSDPrice.toString()}`,
      );
      price = price.multipliedBy(ethWeiToUSDPrice);
      this.logger.log(`NATIVE TOKEN WEI Price in USD: ${price.toString()}`);
    } else if (network.nativeCurrencyToUSDPool) {
      poolAddress = network.nativeCurrencyToUSDPool;
      this.logger.log(`Fetching ${networkName} Native token to USD price`);
      price = await this.getPriceFromPool(
        provider,
        poolAddress,
        network,
        blockNumber,
      );
      this.logger.log(`Price in USD: ${price.toString()}`);
    } else {
      throw new BadRequestException(`Could not convert native token to USD`);
    }

    return price;
  }

  // get the native token (in ETHER - scaled to 10**18) to USD price.
  public async getNativeToUSDPrice(
    networkName: string,
    blockNumber: number,
  ): Promise<bn> {
    try {
      const weiToUSD = await this.getWeiToUSD(networkName, blockNumber);
      this.logger.log(`Native Token WEI to USD Price: ${weiToUSD.toString()}`);
      const nativeToUsd = weiToUSD.multipliedBy(new bn(10).pow(18)); // multiplied by 10**18 to convert to ETH
      this.logger.log(
        `Native Token ETHER to USD Price: ${nativeToUsd.toString()}`,
      );
      return nativeToUsd;
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch Native token to USD price: ${error.message}`,
      );
    }
  }

  async getHistoriPriceQuote(
    networkName: string,
    dto: BlockHeightOrDateDto,
  ): Promise<UniswapPriceInfoResponseDto> {
    try {
      if (networkName !== 'zksync-mainnet') {
        throw new BadRequestException(
          `Unsupported network for HST: ${networkName}`,
        );
      }
      const chainId = this.supportedNetworksService.getChainId(networkName);
      const provider = await this.ethersHelperService.getProvider(networkName);

      const { date, block_height } = dto;

      const finalBlockNumber =
        await this.ethersHelperService.getFinalBlockNumber(
          date,
          block_height,
          provider,
        );
      let historiPriceInUSD: bn;
      if (process.env.NODE_ENV === 'development') {
        historiPriceInUSD = new bn(0.5);
      } else {
        const nativeToUsd: bn = await this.getNativeToUSDPrice(
          networkName,
          finalBlockNumber,
        );

        const historiToNativePrice = await this.getHistoriToNativeTokenPrice(
          networkName,
          provider,
          finalBlockNumber,
        );

        this.logger.log(
          'Histori Token to Native Token Price: ' +
            historiToNativePrice.toString(),
        );

        historiPriceInUSD = nativeToUsd.multipliedBy(historiToNativePrice);
      }
      return {
        chain_id: chainId,
        network_name: networkName,
        block_height: finalBlockNumber,
        price: `$${historiPriceInUSD.toFixed(12)}`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch Histori price in USD: ${error.message}`,
      );
    }
  }

  private async getHistoriToNativeTokenPrice(
    networkName: string,
    provider: ethers.JsonRpcProvider,
    blockNumber: number,
  ): Promise<bn> {
    const historiPoolAddress = this.networkToPoolAddress[`${networkName}-hst`]; // Fetch the HST/ETH pool address
    if (!historiPoolAddress) {
      throw new BadRequestException(
        `Unsupported network for HST: ${networkName}`,
      );
    }

    this.logger.log(`Using WETH/HST pool address: ${historiPoolAddress}`);
    const price = await this.getPriceFromPool(
      provider,
      historiPoolAddress,
      blockNumber,
    );
    const priceInverse = new bn(1).div(price);
    return priceInverse;
  }
}
