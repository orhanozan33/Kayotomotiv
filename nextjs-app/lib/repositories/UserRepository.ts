import { Repository } from 'typeorm';
import { AppDataSource } from '@/lib/config/typeorm';
import { User } from '@/lib/entities/User';

export class UserRepository {
  private userRepo: Repository<User>;

  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async create(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<User> {
    const user = this.userRepo.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role || 'customer',
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await user.setPassword(data.password);
    return this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'createdAt'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: { 
    email?: string; 
    password?: string;
    firstName?: string; 
    lastName?: string; 
    phone?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<User | null> {
    // Filter out undefined values to prevent SQL errors
    const cleanData: any = {};
    if (data.email !== undefined) cleanData.email = data.email;
    if (data.firstName !== undefined) cleanData.firstName = data.firstName;
    if (data.lastName !== undefined) cleanData.lastName = data.lastName;
    if (data.phone !== undefined) cleanData.phone = data.phone;
    if (data.role !== undefined) cleanData.role = data.role;
    if (data.isActive !== undefined) cleanData.isActive = data.isActive;
    
    // Handle password separately
    if (data.password !== undefined && data.password.trim()) {
      const user = await this.findById(id);
      if (user) {
        await user.setPassword(data.password);
        cleanData.passwordHash = user.passwordHash;
      }
    }
    
    if (Object.keys(cleanData).length === 0) {
      return this.findById(id);
    }
    
    await this.userRepo.update(id, cleanData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
}

export default new UserRepository();

