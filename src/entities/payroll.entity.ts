import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

@Entity('payrolls')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, (employee) => employee.payrolls)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'basic_salary' })
  basicSalary: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'house_allowance',
  })
  houseAllowance: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'commuter_allowance',
  })
  commuterAllowance: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'airtime_allowance',
  })
  airtimeAllowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'gross_salary' })
  grossSalary: number;

  // Deductions
  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'nssf_tier1' })
  nssfTier1: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'nssf_tier2' })
  nssfTier2: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_nssf' })
  totalNssf: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'shif_deduction' })
  shifDeduction: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'housing_levy_employee',
  })
  housingLevyEmployee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'taxable_income' })
  taxableIncome: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'paye' })
  paye: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'personal_relief',
    default: 2400,
  })
  personalRelief: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'total_deductions',
  })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'net_salary' })
  netSalary: number;

  // Employer contributions
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'employer_nssf',
  })
  employerNssf: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'employer_housing_levy',
  })
  employerHousingLevy: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'nita_levy' })
  nitaLevy: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'approved', 'paid', 'failed'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'text', name: 'payslip_path', nullable: true })
  payslipPath: string;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
