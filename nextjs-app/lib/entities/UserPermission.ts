import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity('user_permissions')
@Unique(['userId', 'page'])
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 100 })
  page!: string;

  @Column({ type: 'boolean', name: 'can_view', default: false })
  canView!: boolean;

  @Column({ type: 'boolean', name: 'can_add', default: false })
  canAdd!: boolean;

  @Column({ type: 'boolean', name: 'can_edit', default: false })
  canEdit!: boolean;

  @Column({ type: 'boolean', name: 'can_delete', default: false })
  canDelete!: boolean;

  @Column({ type: 'varchar', length: 255, name: 'permission_password', nullable: true })
  permissionPassword?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

