import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import bcrypt from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', default: 'customer' })
  role!: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Helper method to set password
  async setPassword(password: string): Promise<void> {
    this.passwordHash = await bcrypt.hash(password, 10);
  }

  // Helper method to verify password
  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Exclude password from JSON
  toJSON() {
    const { passwordHash, ...rest } = this;
    return rest;
  }
}

