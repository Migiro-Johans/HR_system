import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from '../../entities/payroll.entity';
import { Employee } from '../../entities/employee.entity';
import { PayrollCalculatorService } from '../../services/payroll-calculator.service';
import { PayslipGeneratorService } from '../../services/payslip-generator.service';
import { KraExportService } from '../../services/kra-export.service';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private payrollCalculatorService: PayrollCalculatorService,
    private payslipGeneratorService: PayslipGeneratorService,
    private kraExportService: KraExportService,
  ) {}

  /**
   * Generate payroll for a specific employee
   */
  async generatePayrollForEmployee(
    employeeId: string,
    month: number,
    year: number,
  ): Promise<Payroll> {
    // Find employee
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check if payroll already exists
    const existingPayroll = await this.payrollRepository.findOne({
      where: { employeeId, month, year },
    });

    if (existingPayroll) {
      throw new Error(
        `Payroll for employee ${employee.employeeNumber} already exists for ${month}/${year}`,
      );
    }

    // Calculate payroll
    const calculation = this.payrollCalculatorService.calculatePayroll({
      basicSalary: Number(employee.basicSalary),
      houseAllowance: Number(employee.houseAllowance),
      commuterAllowance: Number(employee.commuterAllowance),
      airtimeAllowance: Number(employee.airtimeAllowance),
    });

    // Create payroll record
    const payroll = this.payrollRepository.create({
      employeeId: employee.id,
      month,
      year,
      basicSalary: calculation.basicSalary,
      houseAllowance: calculation.houseAllowance,
      commuterAllowance: calculation.commuterAllowance,
      airtimeAllowance: calculation.airtimeAllowance,
      grossSalary: calculation.grossSalary,
      nssfTier1: calculation.nssfTier1,
      nssfTier2: calculation.nssfTier2,
      totalNssf: calculation.totalNssf,
      shifDeduction: calculation.shifDeduction,
      housingLevyEmployee: calculation.housingLevyEmployee,
      taxableIncome: calculation.taxableIncome,
      paye: calculation.paye,
      personalRelief: calculation.personalRelief,
      totalDeductions: calculation.totalDeductions,
      netSalary: calculation.netSalary,
      employerNssf: calculation.employerNssf,
      employerHousingLevy: calculation.employerHousingLevy,
      nitaLevy: calculation.nitaLevy,
      status: 'draft',
    });

    return await this.payrollRepository.save(payroll);
  }

  /**
   * Generate payroll for all active employees
   */
  async generatePayrollForAllEmployees(
    month: number,
    year: number,
  ): Promise<Payroll[]> {
    const employees = await this.employeeRepository.find({
      where: { status: 'active' },
    });

    const payrolls: Payroll[] = [];

    for (const employee of employees) {
      try {
        const payroll = await this.generatePayrollForEmployee(
          employee.id,
          month,
          year,
        );
        payrolls.push(payroll);
      } catch (error) {
        console.error(
          `Failed to generate payroll for employee ${employee.employeeNumber}:`,
          error.message,
        );
      }
    }

    return payrolls;
  }

  /**
   * Get payroll by ID
   */
  async findOne(id: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!payroll) {
      throw new NotFoundException(`Payroll with ID ${id} not found`);
    }

    return payroll;
  }

  /**
   * Get payrolls for a specific month
   */
  async findByMonth(month: number, year: number): Promise<Payroll[]> {
    return await this.payrollRepository.find({
      where: { month, year },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get payroll history for an employee
   */
  async findByEmployee(employeeId: string): Promise<Payroll[]> {
    return await this.payrollRepository.find({
      where: { employeeId },
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  /**
   * Approve payroll
   */
  async approve(id: string): Promise<Payroll> {
    const payroll = await this.findOne(id);
    payroll.status = 'approved';
    return await this.payrollRepository.save(payroll);
  }

  /**
   * Generate payslip PDF
   */
  async generatePayslip(id: string): Promise<string> {
    const payroll = await this.findOne(id);

    const payslipPath = await this.payslipGeneratorService.generatePayslipPDF(
      payroll.employee,
      payroll,
    );

    payroll.payslipPath = payslipPath;
    await this.payrollRepository.save(payroll);

    return payslipPath;
  }

  /**
   * Generate KRA P10 export
   */
  async generateP10Export(month: number, year: number): Promise<string> {
    const payrolls = await this.findByMonth(month, year);

    const payrollData = payrolls.map((payroll) => ({
      payroll,
      employee: payroll.employee,
    }));

    return await this.kraExportService.generateP10Export(
      payrollData,
      month,
      year,
    );
  }

  /**
   * Generate NSSF remittance export
   */
  async generateNSSFRemittance(month: number, year: number): Promise<string> {
    const payrolls = await this.findByMonth(month, year);

    const payrollData = payrolls.map((payroll) => ({
      payroll,
      employee: payroll.employee,
    }));

    return await this.kraExportService.generateNSSFRemittance(
      payrollData,
      month,
      year,
    );
  }

  /**
   * Generate SHIF remittance export
   */
  async generateSHIFRemittance(month: number, year: number): Promise<string> {
    const payrolls = await this.findByMonth(month, year);

    const payrollData = payrolls.map((payroll) => ({
      payroll,
      employee: payroll.employee,
    }));

    return await this.kraExportService.generateSHIFRemittance(
      payrollData,
      month,
      year,
    );
  }
}
