import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './Customer';
import { CustomerVehicle } from './CustomerVehicle';
import { User } from './User';

@Entity('service_records')
export class ServiceRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId!: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ type: 'uuid', name: 'vehicle_id', nullable: true })
  vehicleId?: string;

  @ManyToOne(() => CustomerVehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle?: CustomerVehicle;

  @Column({ type: 'varchar', length: 100, name: 'service_type' })
  serviceType!: string;

  @Column({ type: 'varchar', length: 200, name: 'service_name' })
  serviceName!: string;

  @Column({ type: 'text', name: 'service_description', nullable: true })
  serviceDescription?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'date', name: 'performed_date' })
  performedDate!: Date;

  @Column({ type: 'uuid', name: 'performed_by', nullable: true })
  performedBy?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer?: User;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', name: 'quote_id', nullable: true })
  quoteId?: string;

  @Column({ type: 'uuid', name: 'appointment_id', nullable: true })
  appointmentId?: string;

  @Column({ type: 'uuid', name: 'car_wash_appointment_id', nullable: true })
  carWashAppointmentId?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

