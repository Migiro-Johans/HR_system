import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Payroll } from './payroll.entity';
import { Leave } from './leave.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_number', unique: true })
  employeeNumber: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'id_number', unique: true })
  idNumber: string;

  @Column({ name: 'kra_pin', unique: true })
  kraPin: string;

  @Column({ name: 'nssf_number', nullable: true })
  nssfNumber: string;

  @Column({ name: 'nhif_number', nullable: true })
  nhifNumber: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'mpesa_number', nullable: true })
  mpesaNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'basic_salary' })
  basicSalary: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'house_allowance',
    default: 0,
  })
  houseAllowance: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'commuter_allowance',
    default: 0,
  })
  commuterAllowance: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'airtime_allowance',
    default: 0,
  })
  airtimeAllowance: number;

  @Column({ type: 'date', name: 'date_joined' })
  dateJoined: Date;

  @Column({ type: 'date', name: 'date_left', nullable: true })
  dateLeft: Date;

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'terminated'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'int', name: 'annual_leave_balance', default: 21 })
  annualLeaveBalance: number;

  @Column({ type: 'int', name: 'sick_leave_balance', default: 14 })
  sickLeaveBalance: number;

  @OneToMany(() => Payroll, (payroll) => payroll.employee)
  payrolls: Payroll[];

  @OneToMany(() => Leave, (leave) => leave.employee)
  leaves: Leave[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
