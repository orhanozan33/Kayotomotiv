import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export type VehicleStatus = 'available' | 'reserved' | 'sold';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  brand!: string;

  @Column({ type: 'varchar' })
  model!: string;

  @Column({ type: 'integer' })
  year!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'integer', nullable: true })
  mileage?: number;

  @Column({ type: 'varchar', name: 'fuel_type' })
  fuelType!: string;

  @Column({ type: 'varchar' })
  transmission!: string;

  @Column({ type: 'varchar', nullable: true })
  color?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    default: 'available',
  })
  status!: VehicleStatus;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ name: 'reservation_end_time', type: 'timestamp', nullable: true })
  reservationEndTime?: Date;

  @Column({ type: 'varchar', name: 'created_by', nullable: true })
  createdBy?: string;

  // Use string-based relation to avoid circular dependency
  @OneToMany('VehicleImage', 'vehicle', {
    cascade: true,
  })
  images!: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

