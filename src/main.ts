import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Lunch Tracker API')
    .setDescription('API for managing lunch groups, users, and transactions')
    .setVersion('1.0')
    .addTag('users', 'User management operations')
    .addTag('groups', 'Group management operations')
    .addTag('transactions', 'Transaction management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(configService.get('app.port') ?? 3000);
}
bootstrap();
