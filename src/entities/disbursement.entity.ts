import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Payroll } from './payroll.entity';

@Entity('disbursements')
export class Disbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payroll)
  @JoinColumn({ name: 'payroll_id' })
  payroll: Payroll;

  @Column({ name: 'payroll_id' })
  payrollId: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'conversation_id', nullable: true })
  conversationId: string;

  @Column({ name: 'originator_conversation_id', nullable: true })
  originatorConversationId: string;

  @Column({ name: 'mpesa_receipt_number', nullable: true })
  mpesaReceiptNumber: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', name: 'response_description', nullable: true })
  responseDescription: string;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', name: 'processed_at', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
