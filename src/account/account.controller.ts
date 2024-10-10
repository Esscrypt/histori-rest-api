// import { Controller } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { AccountService } from './account.service';
// import { GetAccountRequestDto } from 'src/dtos/account.dto';

// @ApiTags('Account')
// @Controller(':version/:networkName/account')
// export class AccountController {
//   constructor(private readonly accountService: AccountService) {}

//   @Get('transactions/:address')
//   @ApiOperation({
//     summary: 'Get transaction history of the account',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'The transaction history.',
//   })
//   @ApiParam({
//     name: 'address',
//     description: 'The Ethereum address of the user',
//   })
//   async getTransactionHistory(
//     @Param('version') version: string,
//     @Param('networkName') networkName: string,
//     @Param() params: GetAccountRequestDto,
//   ): Promise<any[]> {
//     return this.accountService.getTransactionHistory(
//       networkName,
//       params.address,
//     );
//   }

//   @Get('holdings/:address')
//   @ApiOperation({
//     summary: 'Get token holdings for the account',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'The token holdings.',
//   })
//   @ApiParam({
//     name: 'address',
//     description: 'The Ethereum address of the user',
//   })
//   async getTokenHoldings(
//     @Param('version') version: string,
//     @Param('networkName') networkName: string,
//     @Param() params: GetAccountRequestDto,
//   ): Promise<any[]> {
//     return this.accountService.getTokenHoldings(networkName, params.address);
//   }
// }
