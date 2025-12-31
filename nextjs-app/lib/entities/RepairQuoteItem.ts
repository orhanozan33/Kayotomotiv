import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { RepairQuote } from './RepairQuote';
import { RepairService } from './RepairService';

@Entity('repair_quote_items')
export class RepairQuoteItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'quote_id' })
  quoteId!: string;

  @ManyToOne(() => RepairQuote)
  @JoinColumn({ name: 'quote_id' })
  quote?: RepairQuote;

  @Column({ type: 'uuid', name: 'service_id' })
  serviceId!: string;

  @ManyToOne(() => RepairService)
  @JoinColumn({ name: 'service_id' })
  service?: RepairService;

  @Column({ type: 'varchar', length: 200, name: 'service_name' })
  serviceName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'integer', default: 1 })
  quantity!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

