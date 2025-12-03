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

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, (employee) => employee.leaves)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({
    type: 'enum',
    enum: ['annual', 'sick', 'maternity', 'paternity', 'unpaid'],
    name: 'leave_type',
  })
  leaveType: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'int', name: 'total_days' })
  totalDays: number;

  @Column({ type: 'int', name: 'working_days' })
  workingDays: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid', name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', name: 'approved_at', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
