import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { VersionAndNetworkGuard } from './guards/supported-versions-networks.guard';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
      whitelist: true, // Automatically remove properties not in the DTO
      // forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Histori API')
    .setDescription('API for token data and historical balances')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'apiKey') // Add API key to Swagger docs
    .build();

  const document = SwaggerModule.createDocument(app, config);

  writeFileSync(join(process.cwd(), 'swagger.json'), JSON.stringify(document));

  SwaggerModule.setup('api-docs', app, document); // Serve Swagger docs at /api-docs

  // app.setGlobalPrefix(':version/:network_name'); // Set global prefix for all routes
  // Apply the global guard to validate version and network
  app.useGlobalGuards(new VersionAndNetworkGuard());

  const port = process.env.PORT || 3000; // Use PORT from .env or fallback to 3000
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
