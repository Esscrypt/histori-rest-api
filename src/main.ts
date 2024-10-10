import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { NetworkGuard } from './guards/supported-networks.guard';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as packageJson from '../package.json';
// import { ApiKeyGuard } from './guards/api-key.guard';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { User } from './entities/user.entity';
import { ChainResolverService } from './services/chainresolver.service';
import { Handler, Context } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';

dotenv.config(); // Load environment variables

// Lambda Handler (used only in production)
let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );

  // Get the version from package.json
  const appVersion = packageJson.version;

  const chainResolverService = app.get(ChainResolverService);
  // const userRepository = app.get(getRepositoryToken(User));

  app.useGlobalGuards(new NetworkGuard(chainResolverService));
  // app.useGlobalGuards(new ApiKeyGuard(userRepository));

  if (process.env.NODE_ENV === 'development') {
    // Swagger configuration for development
    const config = new DocumentBuilder()
      .setTitle('Histori API')
      .setDescription('API for token data and historical balances')
      .setVersion(appVersion)
      .addServer('https://api.histori.xyz', 'Production server')
      .addServer('http://localhost:3001', 'Local development server')
      .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'apiKey')
      .addSecurityRequirements('apiKey')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    writeFileSync(
      join(process.cwd(), 'swagger.json'),
      JSON.stringify(document),
    );
    SwaggerModule.setup('api-docs', app, document);

    // Start the app in development mode
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Development server running at http://localhost:${port}`);
  } else if (process.env.NODE_ENV === 'production') {
    // Production setup using AWS Lambda

    const expressApp = app.getHttpAdapter().getInstance();
    // TODO: maybe use ExpressAdapter for AWS Lambda
    // await app.init();

    server = serverlessExpress({ app: expressApp });
  }
}

// Lambda entry point (only for production)
export const handler: Handler = async (event: any, context: Context) => {
  if (!server) {
    await bootstrap();
  }
  return server(event, context);
};

if (process.env.NODE_ENV === 'development') {
  bootstrap(); // Directly bootstrap for development
}
