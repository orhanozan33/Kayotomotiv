import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CarWashAppointment } from './CarWashAppointment';
import { CarWashAddon } from './CarWashAddon';

@Entity('car_wash_appointment_addons')
export class CarWashAppointmentAddon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'appointment_id' })
  appointmentId!: string;

  @ManyToOne(() => CarWashAppointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment?: CarWashAppointment;

  @Column({ type: 'uuid', name: 'addon_id' })
  addonId!: string;

  @ManyToOne(() => CarWashAddon)
  @JoinColumn({ name: 'addon_id' })
  addon?: CarWashAddon;

  @Column({ type: 'varchar', length: 200, name: 'addon_name' })
  addonName!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

