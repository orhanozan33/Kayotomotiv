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

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_brand', nullable: true })
  vehicleBrand?: string;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_model', nullable: true })
  vehicleModel?: string;

  @Column({ type: 'integer', name: 'vehicle_year', nullable: true })
  vehicleYear?: number;

  @Column({ type: 'varchar', length: 20, name: 'license_plate', nullable: true })
  licensePlate?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_spent', default: 0 })
  totalSpent!: number;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

