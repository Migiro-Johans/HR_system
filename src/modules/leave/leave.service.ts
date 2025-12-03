import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from '../../entities/leave.entity';
import { Employee } from '../../entities/employee.entity';
import { LeaveCalculatorService } from '../../services/leave-calculator.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private leaveRepository: Repository<Leave>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private leaveCalculatorService: LeaveCalculatorService,
  ) {}

  async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const { employeeId, leaveType, startDate, endDate, reason } = createLeaveDto;

    // Find employee
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Calculate working days
    const { workingDays, totalDays } =
      await this.leaveCalculatorService.calculateWorkingDays(
        new Date(startDate),
        new Date(endDate),
      );

    // Validate leave request based on type
    let validation: any;

    switch (leaveType) {
      case 'annual':
        validation = this.leaveCalculatorService.validateAnnualLeave(
          employee.annualLeaveBalance,
          workingDays,
        );
        break;

      case 'sick':
        const sickLeaveTaken = await this.calculateSickLeaveTaken(employeeId);
        validation = this.leaveCalculatorService.validateSickLeave(
          sickLeaveTaken,
          workingDays,
        );
        break;

      case 'maternity':
        validation = this.leaveCalculatorService.validateMaternityLeave(workingDays);
        break;

      case 'paternity':
        validation = this.leaveCalculatorService.validatePaternityLeave(workingDays);
        break;

      case 'unpaid':
        validation = { valid: true, message: 'Unpaid leave is always valid' };
        break;

      default:
        throw new BadRequestException('Invalid leave type');
    }

    if (!validation.valid && leaveType !== 'sick') {
      throw new BadRequestException(validation.message);
    }

    // Create leave record
    const leave = this.leaveRepository.create({
      employeeId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays,
      workingDays,
      reason,
      status: 'pending',
    });

    return await this.leaveRepository.save(leave);
  }

  async findAll(): Promise<Leave[]> {
    return await this.leaveRepository.find({
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found`);
    }

    return leave;
  }

  async findByEmployee(employeeId: string): Promise<Leave[]> {
    return await this.leaveRepository.find({
      where: { employeeId },
      order: { startDate: 'DESC' },
    });
  }

  async approve(id: string, approvedBy: string): Promise<Leave> {
    const leave = await this.findOne(id);

    if (leave.status !== 'pending') {
      throw new BadRequestException('Leave is not in pending status');
    }

    // Update employee leave balance
    const employee = leave.employee;

    if (leave.leaveType === 'annual') {
      employee.annualLeaveBalance -= leave.workingDays;
      await this.employeeRepository.save(employee);
    }

    leave.status = 'approved';
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();

    return await this.leaveRepository.save(leave);
  }

  async reject(id: string, rejectionReason: string): Promise<Leave> {
    const leave = await this.findOne(id);

    if (leave.status !== 'pending') {
      throw new BadRequestException('Leave is not in pending status');
    }

    leave.status = 'rejected';
    leave.rejectionReason = rejectionReason;

    return await this.leaveRepository.save(leave);
  }

  async cancel(id: string): Promise<Leave> {
    const leave = await this.findOne(id);

    if (leave.status === 'cancelled') {
      throw new BadRequestException('Leave is already cancelled');
    }

    // Restore leave balance if it was approved annual leave
    if (leave.status === 'approved' && leave.leaveType === 'annual') {
      const employee = leave.employee;
      employee.annualLeaveBalance += leave.workingDays;
      await this.employeeRepository.save(employee);
    }

    leave.status = 'cancelled';

    return await this.leaveRepository.save(leave);
  }

  private async calculateSickLeaveTaken(employeeId: string): Promise<number> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const sickLeaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.leaveType = :leaveType', { leaveType: 'sick' })
      .andWhere('leave.status = :status', { status: 'approved' })
      .andWhere('leave.startDate BETWEEN :startOfYear AND :endOfYear', {
        startOfYear,
        endOfYear,
      })
      .getMany();

    return sickLeaves.reduce((total, leave) => total + leave.workingDays, 0);
  }
}
