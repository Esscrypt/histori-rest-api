import { Module } from '@nestjs/common';
import { EnsService } from '../services/ens.service';
import { EthersHelperService } from '../services/ethers-helper.service';
import { DynamicConnectionService } from '../services/dynamic-connection.service';
import { SupportedNetworksService } from '../services/supported-networks.service';
import { CurrencyService } from 'src/services/currency.service';

@Module({
  providers: [
    EnsService,
    EthersHelperService,
    DynamicConnectionService,
    SupportedNetworksService,
    CurrencyService,
  ],
  exports: [
    EnsService,
    EthersHelperService,
    DynamicConnectionService,
    SupportedNetworksService,
    CurrencyService,
  ], // Export these services to make them available to other modules
})
export class CommonModule {}
