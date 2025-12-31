import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from './Customer';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId?: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ type: 'uuid', name: 'service_record_id', nullable: true })
  serviceRecordId?: string;

  @Column({ type: 'varchar', length: 255, name: 'customer_name' })
  customerName!: string;

  @Column({ type: 'varchar', length: 50, name: 'customer_phone', nullable: true })
  customerPhone?: string;

  @Column({ type: 'varchar', length: 255, name: 'customer_email', nullable: true })
  customerEmail?: string;

  @Column({ type: 'varchar', length: 50, name: 'license_plate', nullable: true })
  licensePlate?: string;

  @Column({ type: 'text', name: 'service_name' })
  serviceName!: string;

  @Column({ type: 'text', name: 'service_description', nullable: true })
  serviceDescription?: string;

  @Column({ type: 'varchar', length: 50, name: 'service_type', nullable: true })
  serviceType?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'date', name: 'performed_date' })
  performedDate!: Date;

  @Column({ type: 'jsonb', name: 'company_info', nullable: true })
  companyInfo?: any;

  @CreateDateColumn({ name: 'printed_at', default: () => 'CURRENT_TIMESTAMP' })
  printedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

