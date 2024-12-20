// contract.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { ContractTypeResponseDto } from 'src/dtos/response/contract-type-response.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
// import { ContractDeploymentResponseDto } from 'src/dtos/response/contract-deployment-response.dto';
import { GetContractTypeRequestDto } from 'src/dtos/request/get-contract-type-request.dto';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { ContractStorageResponseDto } from 'src/dtos/response/contract-storage-response.dto';
import { ContractAddressPositionDto } from 'src/dtos/request/get-contract-storage.dto';
import { GetContractCodeDto } from 'src/dtos/request/get-contract-code.dto';
import { ContractCodeResponseDto } from 'src/dtos/response/contract-code-response.dto';
import { GetMerkleProofDto } from 'src/dtos/request/get-merkle-proof.dto';
import { MerkleProofResponseDto } from 'src/dtos/response/merkle-proof-response.dto';
// import { GetDeploymentRequestDto } from 'src/dtos/request/get-deployment-request.dto';
// import { ContractCodeResponseDto } from 'src/dtos/response/contract-code-response.dto';

@ApiTags('Contract')
@Controller(':network/contract')
export class ContractController {
  private readonly logger = new Logger(ContractController.name);
  constructor(
    private readonly contractService: ContractService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly ethersHelperService: EthersHelperService,
  ) {}

  @Get('is-of-type')
  @ApiOperation({
    summary: 'Check if a contract implements a specific ERC standard',
  })
  @ApiResponse({
    status: 200,
    description: 'Contract type check completed successfully.',
    type: ContractTypeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid network name or contract address.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async checkContractType(
    @Param('network') networkName: string,
    @Query() dto: GetContractTypeRequestDto,
  ): Promise<ContractTypeResponseDto> {
    const { token_address, token_type } = dto;
    const chainId = await this.supportedNetworksService.getChainId(networkName);
    // Configure provider based on network

    const provider = await this.ethersHelperService.getProvider(networkName);
    const isOfType = await this.contractService.isContractOfType(
      token_address,
      token_type,
      provider,
    );

    return {
      chain_id: chainId,
      network_name: networkName,
      token_address,
      type_checked: token_type,
      is_of_type: isOfType,
    };
  }

  @Get('storage')
  @ApiOperation({
    summary: 'Get the storage value at a specific position for a contract',
  })
  @ApiResponse({
    status: 200,
    description: 'Contract storage value fetched successfully.',
    type: ContractStorageResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid contract address, position, or network name.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getStorageAtPosition(
    @Param('network') networkName: string,
    @Query() params: ContractAddressPositionDto,
  ): Promise<ContractStorageResponseDto> {
    const { contract_address, position } = params;
    const provider = await this.ethersHelperService.getProvider(networkName);
    const chainId = await this.supportedNetworksService.getChainId(networkName);

    try {
      const storageValue = await provider.getStorage(
        contract_address,
        position,
      );
      return {
        network: networkName,
        chain_id: chainId,
        contract_address,
        position,
        storage_value: storageValue,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch storage value.');
    }
  }

  @Get('code')
  @ApiOperation({
    summary: 'Get the contract code at a specific address',
  })
  @ApiResponse({
    status: 200,
    description: 'Contract code fetched successfully.',
    type: ContractCodeResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid contract address or network name.',
  })
  @ApiParam({
    name: 'network',
    description: 'Blockchain network name or chain id',
    example: 'eth-mainnet',
    required: true,
  })
  @ApiQuery({
    name: 'projectId',
    description:
      'The id of your project. Can be found in your Histori dashboard.',
    example: '8ry9f6t9dct1se2hlagxnd9n2a',
    required: true,
    type: 'string',
  })
  async getContractCode(
    @Param('network') networkName: string,
    @Query() query: GetContractCodeDto,
  ): Promise<ContractCodeResponseDto> {
    const { contract_address } = query;
    const provider = await this.ethersHelperService.getProvider(networkName);
    const chain_id =
      await this.supportedNetworksService.getChainId(networkName);

    try {
      const code = await provider.getCode(contract_address);
      return {
        network: networkName,
        chain_id,
        contract_address,
        code,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch contract code.');
    }
  }

  @Get('merkle-proof')
  @ApiOperation({
    summary:
      'Get the Merkle inclusion proof for an account and its storage keys.',
  })
  @ApiResponse({
    status: 200,
    description: 'Merkle inclusion proof fetched successfully.',
    type: MerkleProofResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input parameters.',
  })
  async getMerkleInclusionProof(
    @Param('network') networkName: string,
    @Query() query: GetMerkleProofDto,
  ): Promise<MerkleProofResponseDto> {
    const { contract_address, storage_keys, block_height, date } = query;

    const storage_keys_array = storage_keys.split(',');

    if (process.env.NODE_ENV === 'development') {
      this.logger.log(`Fetching Merkle proof for ${contract_address}`);
      this.logger.log(`Storage keys: ${storage_keys_array}`);
      this.logger.log(`Block height: ${block_height}`);
      this.logger.log(`Date: ${date}`);
    }

    try {
      // Fetch network details
      const chain_id =
        await this.supportedNetworksService.getChainId(networkName);
      const provider = await this.ethersHelperService.getProvider(networkName, {
        fallback: true,
      });

      const finalBlockNumber =
        await this.ethersHelperService.getFinalBlockNumber(
          date,
          block_height,
          provider,
        );

      // Fetch Merkle proof using ContractService
      const proof = await this.contractService.getMerkleInclusionProof({
        address: contract_address,
        storageKeys: storage_keys_array,
        blockNumber: finalBlockNumber,
        provider,
      });

      return {
        ...proof,
        address: contract_address,
        network: networkName,
        chain_id,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to fetch Merkle inclusion proof.');
    }
  }

  // @Get('deployment-block')
  // @ApiOperation({ summary: 'Get the contract deployment block number' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Contract deployment block number fetched successfully.',
  //   type: ContractDeploymentResponseDto,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid network name or contract address.',
  // })
  // @ApiParam({
  //   name: 'network',
  //   description:
  //     'Blockchain network name or chain id',
  //   example: 'eth-mainnet',
  // })
  // async getDeploymentBlock(
  //   @Param('network') networkName: string,
  //   @Query() dto: GetDeploymentRequestDto,
  // ): Promise<ContractDeploymentResponseDto> {
  //   const { contract_address } = dto;
  //   const chainId = await this.supportedNetworksService.getChainId(networkName);
  //   const provider = new ethers.JsonRpcProvider(
  //     process.env[`RPC_URL_${chainId}`],
  //   );
  //   const deploymentDetails =
  //     await this.contractService.getContractDeploymentDetails(
  //       contract_address,
  //       provider,
  //     );

  //   return {
  //     network_name: networkName,
  //     chain_id: chainId,
  //     contract_address,
  //     block_height: deploymentDetails.blockNumber,
  //   };
  // }

  // @Get('deployment-block-hash')
  // @ApiOperation({ summary: 'Get the contract deployment block hash' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Contract deployment block hash fetched successfully.',
  //   type: ContractDeploymentResponseDto,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid network name or contract address.',
  // })
  // @ApiParam({
  //   name: 'network',
  //   description:
  //     'Blockchain network name or chain id',
  //   example: 'eth-mainnet',
  // })
  // async getDeploymentBlockHash(
  //   @Param('network') networkName: string,
  //   @Query() dto: GetDeploymentRequestDto,
  // ): Promise<ContractDeploymentResponseDto> {
  //   const { contract_address } = dto;
  //   const chainId = await this.supportedNetworksService.getChainId(networkName);
  //   const provider = new ethers.JsonRpcProvider(
  //     process.env[`RPC_URL_${chainId}`],
  //   );
  //   const deploymentDetails =
  //     await this.contractService.getContractDeploymentDetails(
  //       contract_address,
  //       provider,
  //     );

  //   return {
  //     network_name: networkName,
  //     chain_id: chainId,
  //     contract_address,
  //     block_hash: deploymentDetails.blockHash,
  //   };
  // }

  // @Get('code')
  // @ApiOperation({ summary: 'Get the contract code as of block number' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Contract code fetched successfully.',
  //   type: ContractDeploymentResponseDto,
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid network name or contract address.',
  // })
  // @ApiParam({
  //   name: 'network',
  //   description:
  //     'Blockchain network name or chain id',
  //   example: 'eth-mainnet',
  // })
  // async getContractCode(
  //   @Param('network') networkName: string,
  //   @Query() dto: GetDeploymentRequestDto,
  // ): Promise<ContractCodeResponseDto> {
  //   const { contract_address } = dto;
  //   const chainId = await this.supportedNetworksService.getChainId(networkName);
  //   const provider = new ethers.JsonRpcProvider(
  //     process.env[`RPC_URL_${chainId}`],
  //   );
  //   const deploymentDetails =
  //     await this.contractService.getContractDeploymentDetails(
  //       contract_address,
  //       provider,
  //     );

  //   return {
  //     network_name: networkName,
  //     chain_id: chainId,
  //     contract_address,
  //     code: deploymentDetails.code,
  //   };
  // }
}
