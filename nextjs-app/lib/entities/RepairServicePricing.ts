import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RepairService } from './RepairService';

@Entity('repair_service_pricing')
export class RepairServicePricing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'service_id' })
  serviceId!: string;

  @ManyToOne(() => RepairService)
  @JoinColumn({ name: 'service_id' })
  service?: RepairService;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_brand', nullable: true })
  vehicleBrand?: string;

  @Column({ type: 'varchar', length: 100, name: 'vehicle_model', nullable: true })
  vehicleModel?: string;

  @Column({ type: 'integer', name: 'vehicle_year_from', nullable: true })
  vehicleYearFrom?: number;

  @Column({ type: 'integer', name: 'vehicle_year_to', nullable: true })
  vehicleYearTo?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

