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

@Entity('customer_vehicles')
export class CustomerVehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId!: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'integer', nullable: true })
  year?: number;

  @Column({ type: 'varchar', length: 50, name: 'license_plate', nullable: true })
  licensePlate?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vin?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Column({ type: 'integer', nullable: true })
  mileage?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

