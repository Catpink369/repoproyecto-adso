import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';

// para que BigInt se pueda serializar a JSON 
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  // archivos estáticos desde la carpeta "uploads"
  app.useStaticAssets('C:/Users/angie/backend/uploads', {
    prefix: '/uploads/', // Accede a las imágenes con /uploads/filename.jpg
  });

  // solicitudes CORS 
  app.enableCors({
    origin: 'http://localhost:5173', // puerto de Vite/React
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Productos')
    .setDescription('API para gestionar productos, categorías y clasificaciones')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT' 
    )
    .addApiKey(         
      { type: 'apiKey', in: 'header', name: 'x-api-key' },
      'x-api-key'
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    explorer: true, // Habilita el explorador de rutas
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token JWT en Swagger UI
      filter: true, // Habilita el filtrado de rutas
      showRequestDuration: true, // Muestra la duración de las solicitudes
    },
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Transforma los datos entrantes a los tipos definidos en los DTOs
    whitelist: false, // Elimina propiedades no definidas en los DTOs
  }));

  await app.listen(3000);
}
bootstrap();