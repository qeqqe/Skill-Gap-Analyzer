import { NestFactory } from '@nestjs/core';
import { IngestionModule } from './ingestion.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule, {
    bufferLogs: true,
    cors: true,
  });

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.useLogger(app.get(Logger));

  app.use(cookieParser());

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const server = app.getHttpAdapter().getInstance();

  console.log('\n\n=== REGISTERED ROUTES ===');
  if (server && server._router && server._router.stack) {
    const routes = server._router.stack
      .filter((layer) => layer.route)
      .map((layer) => {
        const route = layer.route;
        const methods = Object.keys(route.methods)
          .map((m) => m.toUpperCase())
          .join(',');
        return {
          path: route.path,
          method: methods,
        };
      });

    routes.forEach((r) => console.log(`${r.method} ${r.path}`));
  } else {
    console.log(
      'Unable to retrieve routes - server structure is different than expected',
    );
  }
  console.log('========================\n\n');

  const port = configService.get<number>('HTTP_PORT', 3002);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Ingestion service running on port ${port}`);
}

bootstrap();
