import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://frontend:3000', // Para comunicación interna en Docker
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('VAMBE API')
    .setDescription(
      'API para procesamiento de archivos CSV y clasificación de clientes mediante IA',
    )
    .setVersion('1.0')
    .addTag('Health', 'Endpoints de salud y estado de la aplicación')
    .addTag(
      'CSV Parser',
      'Endpoints para procesamiento y validación de archivos CSV',
    )
    .addTag(
      'AI Classification',
      'Endpoints para clasificación de clientes y generación de recomendaciones 3S mediante IA',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
