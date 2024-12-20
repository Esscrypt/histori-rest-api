import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { NetworkGuard } from './guards/supported-networks.guard';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as packageJson from '../package.json';
import { SupportedNetworksService } from './services/supported-networks.service';

dotenv.config(); // Load environment variables

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { BlockHeightGuard } from './guards/block-height.guard';
import { EthersHelperService } from './services/ethers-helper.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET',
    allowedHeaders: 'Content-Type, x-api-key',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      // forbidNonWhitelisted: true,
      // whitelist: true,
    }),
  );

  // Get the version from package.json
  const appVersion = packageJson.version;

  const supportedNetworksService = app.get(SupportedNetworksService);
  const ethersHelperService = app.get(EthersHelperService);

  app.useGlobalGuards(new NetworkGuard(supportedNetworksService));
  app.useGlobalGuards(new BlockHeightGuard(ethersHelperService));

  const port = process.env.PORT || 3001;

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Histori Multichain Data API')
    .setDescription(
      'Welcome to the Histori Multichain Data API! Our API provides seamless access to a comprehensive range of token data, multichain transaction histories, decoded event logs, and detailed on-chain analytics across multiple blockchain networks. \n\n' +
        'With Histori, developers can build robust crypto applications such as wallet activity feeds, tax and accounting tools, DAO analytics, and Web3 financial services with enterprise-grade data. \n\n' +
        'This API is designed to serve projects of any scale, from independent developers to large teams, enabling high-quality, consistent access to multichain on-chain data in a single platform.',
    )
    .setTermsOfService('https://histori.xyz/support/terms-conditions')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .setContact(
      'Histori Support',
      'https://histori.xyz/contact',
      'support@histori.xyz',
    )
    .setVersion(appVersion)
    .addServer(`http:/localhost:${port}`, 'Local development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  document.openapi = '3.1.0';

  writeFileSync(join(process.cwd(), 'swagger.json'), JSON.stringify(document));
  SwaggerModule.setup('api-docs', app, document);

  // Start the app in development mode
  await app.listen(port);
  console.log(`Development server running at http://localhost:${port}`);
}

bootstrap();
