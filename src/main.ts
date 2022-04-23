import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import CustomLogger from './logs/customLogger';

const PORT = parseInt(process.env.PORT) || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Alpha Finance App')
    .setDescription('Server for Alpha Finance App')
    .setVersion('1.0')
    .addTag('finance')
    .addServer('http://localhost:4000')
    .addServer('https://finance-app-nestjs-server.herokuapp.com')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Alpha Finance App: Server',
  };
  SwaggerModule.setup('docs', app, document, customOptions);

  app.useLogger(app.get(CustomLogger));

  await app.listen(PORT);
}

bootstrap();
