import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('vehicle_images')
export class VehicleImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'vehicle_id' })
  vehicleId!: string;

  // Use string-based relation to avoid circular dependency
  @ManyToOne('Vehicle', 'images', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle!: any;

  @Column({ type: 'varchar', name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary!: boolean;

  @Column({ type: 'integer', name: 'display_order', default: 0 })
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

