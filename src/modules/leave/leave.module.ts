import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from '../../entities/leave.entity';
import { Employee } from '../../entities/employee.entity';
import { PublicHoliday } from '../../entities/public-holiday.entity';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { LeaveCalculatorService } from '../../services/leave-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Leave, Employee, PublicHoliday])],
  controllers: [LeaveController],
  providers: [LeaveService, LeaveCalculatorService],
  exports: [LeaveService],
})
export class LeaveModule {}
