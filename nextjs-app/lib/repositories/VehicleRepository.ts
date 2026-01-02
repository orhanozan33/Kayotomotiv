import { Repository } from 'typeorm';
import { AppDataSource } from '@/lib/config/typeorm';
import { Vehicle, VehicleImage } from '@/lib/entities';
import type { VehicleStatus } from '@/lib/entities/Vehicle';

export interface VehicleFilters {
  brand?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  excludeSold?: boolean;
}

export class VehicleRepository {
  private vehicleRepo: Repository<Vehicle>;
  private imageRepo: Repository<VehicleImage>;

  constructor() {
    this.vehicleRepo = AppDataSource.getRepository(Vehicle);
    this.imageRepo = AppDataSource.getRepository(VehicleImage);
  }

  async findAll(filters: VehicleFilters = {}): Promise<Vehicle[]> {
    const queryBuilder = this.vehicleRepo.createQueryBuilder('vehicle');

    if (filters.brand) {
      queryBuilder.andWhere('vehicle.brand ILIKE :brand', { brand: `%${filters.brand}%` });
    }

    if (filters.model) {
      queryBuilder.andWhere('vehicle.model ILIKE :model', { model: `%${filters.model}%` });
    }

    if (filters.year) {
      queryBuilder.andWhere('vehicle.year = :year', { year: filters.year });
    }

    if (filters.minPrice) {
      queryBuilder.andWhere('vehicle.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      queryBuilder.andWhere('vehicle.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.status) {
      queryBuilder.andWhere('vehicle.status = :status', { status: filters.status });
    } else if (filters.excludeSold !== false) {
      queryBuilder.andWhere('vehicle.status IN (:...statuses)', {
        statuses: ['available', 'reserved'],
      });
    }

    if (filters.excludeSold === true) {
      queryBuilder.andWhere('vehicle.status != :sold', { sold: 'sold' });
    }

    if (filters.featured !== undefined) {
      queryBuilder.andWhere('vehicle.featured = :featured', { featured: filters.featured });
    }

    queryBuilder.orderBy('vehicle.createdAt', 'DESC');

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.vehicleRepo.findOne({
      where: { id },
      relations: ['images'],
    });
  }

  async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.vehicleRepo.create(data);
    return this.vehicleRepo.save(vehicle);
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle | null> {
    // Filter out undefined and null values to prevent SQL errors
    const cleanData: Partial<Vehicle> = {};
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof Vehicle];
      // Only include defined, non-null values (but allow false, 0, empty string)
      if (value !== undefined && value !== null) {
        (cleanData as any)[key] = value;
      }
    });
    
    if (Object.keys(cleanData).length === 0) {
      return this.findById(id);
    }
    
    // TypeORM update requires at least one field
    if (Object.keys(cleanData).length > 0) {
      await this.vehicleRepo.update(id, cleanData);
    }
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    // Use query runner for transaction to ensure all related data is deleted
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, delete all related images using raw SQL to ensure hard delete
      await queryRunner.query('DELETE FROM vehicle_images WHERE vehicle_id = $1', [id]);
      
      // Then delete the vehicle using raw SQL for hard delete
      await queryRunner.query('DELETE FROM vehicles WHERE id = $1', [id]);
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getImages(vehicleId: string): Promise<VehicleImage[]> {
    return this.imageRepo.find({
      where: { vehicleId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async addImage(
    vehicleId: string,
    imageUrl: string,
    isPrimary: boolean = false
  ): Promise<VehicleImage> {
    if (isPrimary) {
      await this.imageRepo.update({ vehicleId }, { isPrimary: false });
    }

    const maxOrderResult = await this.imageRepo
      .createQueryBuilder('image')
      .select('MAX(image.displayOrder)', 'max')
      .where('image.vehicleId = :vehicleId', { vehicleId })
      .getRawOne();

    const displayOrder = (maxOrderResult?.max ?? -1) + 1;

    const image = this.imageRepo.create({
      vehicleId,
      imageUrl,
      isPrimary,
      displayOrder,
    });

    return this.imageRepo.save(image);
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.imageRepo.delete(imageId);
  }

  async updateImage(
    imageId: string,
    updates: { isPrimary?: boolean; displayOrder?: number }
  ): Promise<VehicleImage | null> {
    if (updates.isPrimary === true) {
      const image = await this.imageRepo.findOne({ where: { id: imageId } });
      if (image) {
        await this.imageRepo.update({ vehicleId: image.vehicleId }, { isPrimary: false });
      }
    }

    await this.imageRepo.update(imageId, updates);
    return this.imageRepo.findOne({ where: { id: imageId } });
  }

  async updateImagesOrder(imageOrders: { imageId: string; display_order: number }[]): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { imageId, display_order } of imageOrders) {
        await queryRunner.manager.update(VehicleImage, imageId, { displayOrder: display_order });
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkExpiredReservations(): Promise<Vehicle[]> {
    const now = new Date();
    const vehicles = await this.vehicleRepo
      .createQueryBuilder('vehicle')
      .where('vehicle.status = :status', { status: 'reserved' })
      .andWhere('vehicle.reservationEndTime IS NOT NULL')
      .andWhere('vehicle.reservationEndTime < :now', { now })
      .getMany();

    if (vehicles.length > 0) {
      await this.vehicleRepo.update(
        vehicles.map((v) => v.id),
        { status: 'available', reservationEndTime: undefined as any }
      );
    }

    return vehicles;
  }
}

export default new VehicleRepository();

