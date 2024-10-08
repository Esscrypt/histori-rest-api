import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { VersionAndNetworkGuard } from './guards/supported-versions-networks.guard';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as packageJson from '../package.json';
import { ApiKeyGuard } from './guards/api-key.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; // Adjust the path if necessary

dotenv.config(); // Load environment variables from .env file

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

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Histori API')
    .setDescription('API for token data and historical balances')
    .setVersion(appVersion)
    .addServer('https://api.histori.xyz', 'Production server')
    .addServer('http://localhost:3000', 'Local development server')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'apiKey')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync(join(process.cwd(), 'swagger.json'), JSON.stringify(document));
  SwaggerModule.setup('api-docs', app, document);

  // Get the User repository from the application context
  const userRepository = app.get(getRepositoryToken(User));

  // Apply the global guards
  app.useGlobalGuards(new VersionAndNetworkGuard());
  app.useGlobalGuards(new ApiKeyGuard(userRepository));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
