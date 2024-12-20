import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PermitService {
  async validatePermitSignature({
    message,
    contract_address,
    token_name,
    chain_id,
    signature,
  }: {
    message: any;
    contract_address: string;
    chain_id: number;
    token_name: string;
    signature: string;
  }): Promise<boolean> {
    const domain = {
      name: token_name,
      version: '1',
      chainId: chain_id,
      verifyingContract: contract_address,
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    try {
      const recoveredAddress = ethers.verifyTypedData(
        domain,
        types,
        message,
        signature,
      );

      return recoveredAddress.toLowerCase() === message.owner.toLowerCase();
    } catch (error) {
      console.error('Error validating signature:', error.message);
      return false;
    }
  }
}
