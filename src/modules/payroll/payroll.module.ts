import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { Employee } from '../../entities/employee.entity';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { PayrollCalculatorService } from '../../services/payroll-calculator.service';
import { PayslipGeneratorService } from '../../services/payslip-generator.service';
import { KraExportService } from '../../services/kra-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, Employee])],
  controllers: [PayrollController],
  providers: [
    PayrollService,
    PayrollCalculatorService,
    PayslipGeneratorService,
    KraExportService,
  ],
  exports: [PayrollService],
})
export class PayrollModule {}
