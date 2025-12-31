// Re-export TypeORM entities and repository for backward compatibility
export { Vehicle, VehicleImage } from '@/lib/entities';
export type { VehicleStatus } from '@/lib/entities/Vehicle';
export { default as VehicleRepository, type VehicleFilters } from '@/lib/repositories/VehicleRepository';

