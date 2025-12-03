import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Disbursement } from '../../entities/disbursement.entity';
import { Payroll } from '../../entities/payroll.entity';
import { DisbursementController } from './disbursement.controller';
import { DisbursementService } from './disbursement.service';
import { MpesaService } from '../../services/mpesa.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disbursement, Payroll]),
    ConfigModule,
  ],
  controllers: [DisbursementController],
  providers: [DisbursementService, MpesaService],
  exports: [DisbursementService],
})
export class DisbursementModule {}
