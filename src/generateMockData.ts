import { sequelize, Token, Allowance, Balance } from './models';
import { v4 as uuidv4 } from 'uuid';
import * as faker from 'faker';

async function generateMockData() {
  try {
    // Ensure the database tables are created
    await sequelize.sync({ force: true });

    // Generate mock tokens
    const tokens: InstanceType<typeof Token>[] = []; // Correctly typing the tokens array
    for (let i = 0; i < 5; i++) {
      const token = await Token.create({
        name: faker.finance.currencyName(),
        symbol: faker.finance.currencyCode(),
        decimals: 18,
        contractAddress: uuidv4(), // Mocking contract addresses with UUIDs
        totalSupply: faker.finance.amount(1000000, 10000000, 0),
        blockNumber: faker.datatype.number({ min: 1000000, max: 1200000 }),
        tokenURI: faker.internet.url(),
        additionalMetadata: {
          description: faker.lorem.sentence(),
          website: faker.internet.url(),
        },
      });

      tokens.push(token); // Now TypeScript knows the correct type of token
    }

    console.log('Mock tokens generated.');

    // Generate mock balances and allowances
    for (const token of tokens) {
      for (let i = 0; i < 10; i++) {
        const holder = uuidv4(); // Mocking holder addresses with UUIDs
        const spender = uuidv4(); // Mocking spender addresses with UUIDs

        await Balance.create({
          tokenId: token.id,
          holder,
          balance: faker.finance.amount(1000, 10000, 0),
          blockNumber: token.blockNumber,
        });

        await Allowance.create({
          tokenId: token.id,
          owner: holder,
          spender,
          allowance: faker.finance.amount(1000, 5000, 0),
          blockNumber: token.blockNumber,
        });
      }
    }

    console.log('Mock balances and allowances generated.');
  } catch (error) {
    console.error('Error generating mock data:', error);
  } finally {
    await sequelize.close();
  }
}

generateMockData();
