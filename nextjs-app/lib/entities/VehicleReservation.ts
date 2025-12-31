import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehicle } from './Vehicle';
import { User } from './User';

@Entity('vehicle_reservations')
export class VehicleReservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'vehicle_id' })
  vehicleId!: string;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle?: Vehicle;

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

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'date', name: 'preferred_date', nullable: true })
  preferredDate?: Date;

  @Column({ type: 'time', name: 'preferred_time', nullable: true })
  preferredTime?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  status!: string;

  @Column({ type: 'timestamp', name: 'reservation_end_time', nullable: true })
  reservationEndTime?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

