import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('KaziHR - Kenyan Compliant HRMS')
    .setDescription(
      'HRMS API for Kenya with Payroll (SHIF, NSSF, PAYE, Housing Levy), Leave Management, and M-Pesa Disbursement',
    )
    .setVersion('1.0')
    .addTag('employees', 'Employee management endpoints')
    .addTag('payroll', 'Payroll calculation and management')
    .addTag('leave', 'Leave management with public holiday support')
    .addTag('disbursement', 'M-Pesa salary disbursement')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   KaziHR - Kenyan Compliant HRMS                         ║
  ║                                                           ║
  ║   Application is running on: http://localhost:${port}        ║
  ║   API Prefix: /${apiPrefix}                                  ║
  ║   Swagger Docs: http://localhost:${port}/api/docs            ║
  ║                                                           ║
  ║   Features:                                               ║
  ║   ✓ Payroll Engine (SHIF, NSSF, Housing Levy, PAYE)     ║
  ║   ✓ Leave Management (Public Holidays Support)          ║
  ║   ✓ M-Pesa Integration (Daraja API)                     ║
  ║   ✓ KRA iTax P10 Export                                 ║
  ║   ✓ Payslip PDF Generator                               ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
