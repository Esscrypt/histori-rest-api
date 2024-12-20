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
} from '@nestjs/swagger';
import { PermitService } from './permit.service';
import { EthersHelperService } from 'src/services/ethers-helper.service';
import { ValidationResponseDto } from 'src/dtos/response/permit-validation-response.dto';
import { ValidateSignatureDto } from 'src/dtos/request/validate-permit-signature.dto';
import { SupportedNetworksService } from 'src/services/supported-networks.service';
import { BalanceService } from 'src/balance/balance.service';

@ApiTags('Permit')
@Controller(':network/permit')
export class PermitController {
  private readonly logger = new Logger(PermitController.name);

  constructor(
    private readonly permitService: PermitService,
    private readonly ethersHelperService: EthersHelperService,
    private readonly supportedNetworksService: SupportedNetworksService,
    private readonly balanceService: BalanceService,
  ) {}

  @Get('/validate-signature')
  @ApiOperation({ summary: 'Validate an EIP-712 permit signature' })
  @ApiResponse({
    status: 200,
    description: 'EIP-712 signature validated successfully.',
    type: ValidationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input, signature, or network configuration.',
  })
  @ApiParam({
    name: 'network',
    description: 'The blockchain network name (e.g., eth-mainnet).',
    example: 'eth-mainnet',
  })
  async validatePermitSignature(
    @Param('network') networkName: string,
    @Query() dto: ValidateSignatureDto,
  ): Promise<ValidationResponseDto> {
    this.logger.debug(
      `Validating signature for contract ${dto.contract_address}`,
    );
    const chainId =
      dto.chain_id ||
      (await this.supportedNetworksService.getChainId(networkName));
    // const provider = await this.ethersHelperService.getProvider(networkName);

    const balance = BigInt(
      (
        await this.balanceService.getSingleBalance({
          networkName,
          holder: dto.owner,
          token_address: dto.contract_address,
        })
      ).balance,
    );

    if (BigInt(dto.value) < balance) {
      throw new BadRequestException(
        "Owner's token balance is less than the value to be permitted",
      );
    }

    const isValid = await this.permitService.validatePermitSignature({
      message: {
        owner: dto.owner,
        spender: dto.spender,
        value: dto.value,
        nonce: dto.nonce,
        deadline: dto.deadline,
      },
      token_name: dto.token_name,
      contract_address: dto.contract_address,
      chain_id: chainId,
      signature: dto.signature,
    });

    const provider = await this.ethersHelperService.getProvider(networkName);

    const blockTimestamp =
      await this.ethersHelperService.convertBlockNumberToTimestamp(
        dto.deadline,
        provider,
      );

    return {
      is_valid: isValid,
      network_name: networkName,
      chain_id: dto.chain_id,
      signature: dto.signature,
      owner: dto.owner,
      spender: dto.spender,
      value: dto.value,
      nonce: dto.nonce,
      deadline_timestamp: dto.deadline,
      deadline_date: new Date(blockTimestamp * 1000),
      verifying_contract: dto.contract_address,
    };
  }
}
