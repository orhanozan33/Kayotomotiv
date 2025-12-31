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
import { CarWashPackage } from './CarWashPackage';

@Entity('car_wash_appointments')
export class CarWashAppointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({ type: 'uuid', name: 'package_id' })
  packageId!: string;

  @ManyToOne(() => CarWashPackage)
  @JoinColumn({ name: 'package_id' })
  package?: CarWashPackage;

  @Column({ type: 'varchar', length: 200, name: 'package_name' })
  packageName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'package_price' })
  packagePrice!: number;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_brand', nullable: true })
  vehicleBrand?: string;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_model', nullable: true })
  vehicleModel?: string;

  @Column({ type: 'jsonb', name: 'addon_ids', nullable: true })
  addonIds?: string[];

  @Column({ type: 'date', name: 'appointment_date' })
  appointmentDate!: Date;

  @Column({ type: 'time', name: 'appointment_time' })
  appointmentTime!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice!: number;

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

