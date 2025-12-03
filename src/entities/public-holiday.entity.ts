import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('public_holidays')
export class PublicHoliday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  name: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true, name: 'is_gazetted' })
  isGazetted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
