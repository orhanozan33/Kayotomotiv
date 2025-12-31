import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { RepairQuote } from './RepairQuote';

@Entity('repair_appointments')
export class RepairAppointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'quote_id', nullable: true })
  quoteId?: string;

  @ManyToOne(() => RepairQuote)
  @JoinColumn({ name: 'quote_id' })
  quote?: RepairQuote;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', name: 'customer_id', nullable: true })
  customerId?: string;

  @Column({ type: 'varchar', length: 200, name: 'customer_name' })
  customerName!: string;

  @Column({ type: 'varchar', length: 255, name: 'customer_email' })
  customerEmail!: string;

  @Column({ type: 'varchar', length: 20, name: 'customer_phone' })
  customerPhone!: string;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_brand' })
  vehicleBrand!: string;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_model' })
  vehicleModel!: string;

  @Column({ type: 'integer', name: 'vehicle_year' })
  vehicleYear!: number;

  @Column({ type: 'date', name: 'appointment_date' })
  appointmentDate!: Date;

  @Column({ type: 'time', name: 'appointment_time' })
  appointmentTime!: string;

  @Column({ type: 'text', name: 'service_description', nullable: true })
  serviceDescription?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

