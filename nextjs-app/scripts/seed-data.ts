import 'reflect-metadata';
import dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '@/lib/entities/User';
import { Vehicle } from '@/lib/entities/Vehicle';
import { VehicleImage } from '@/lib/entities/VehicleImage';
import { RepairService } from '@/lib/entities/RepairService';
import { CarWashPackage } from '@/lib/entities/CarWashPackage';
import { CarWashAddon } from '@/lib/entities/CarWashAddon';
import { Settings } from '@/lib/entities/Settings';
import { Page } from '@/lib/entities/Page';
import { VehicleReservation } from '@/lib/entities/VehicleReservation';
import { TestDriveRequest } from '@/lib/entities/TestDriveRequest';
import { RepairServicePricing } from '@/lib/entities/RepairServicePricing';
import { RepairQuote } from '@/lib/entities/RepairQuote';
import { RepairQuoteItem } from '@/lib/entities/RepairQuoteItem';
import { RepairAppointment } from '@/lib/entities/RepairAppointment';
import { CarWashAppointment } from '@/lib/entities/CarWashAppointment';
import { CarWashAppointmentAddon } from '@/lib/entities/CarWashAppointmentAddon';
import { Customer } from '@/lib/entities/Customer';
import { CustomerVehicle } from '@/lib/entities/CustomerVehicle';
import { ServiceRecord } from '@/lib/entities/ServiceRecord';
import { Receipt } from '@/lib/entities/Receipt';
import { ContactMessage } from '@/lib/entities/ContactMessage';
import { UserPermission } from '@/lib/entities/UserPermission';
import bcrypt from 'bcryptjs';

// Load environment variables - try .env.local first, then .env
const envLocalPath = join(process.cwd(), '.env.local');
const envPath = join(process.cwd(), '.env');
dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath }); // Fallback to .env if .env.local doesn't exist

// Create DataSource specifically for seed script (bypasses env.ts validation)
const databaseUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL)?.trim();
if (!databaseUrl) {
  throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
}

const SeedDataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    Vehicle,
    VehicleImage,
    Settings,
    VehicleReservation,
    TestDriveRequest,
    RepairService,
    RepairServicePricing,
    RepairQuote,
    RepairQuoteItem,
    RepairAppointment,
    CarWashPackage,
    CarWashAddon,
    CarWashAppointment,
    CarWashAppointmentAddon,
    Customer,
    CustomerVehicle,
    ServiceRecord,
    Receipt,
    ContactMessage,
    UserPermission,
    Page,
  ],
  synchronize: false,
  logging: false,
});

export async function seedDatabase() {
  try {
    // Initialize database connection
    console.log('🔄 Initializing database connection...');
    if (!SeedDataSource.isInitialized) {
      await SeedDataSource.initialize();
      console.log('✅ Database connected');
    } else {
      console.log('✅ Database already connected');
    }

    console.log('🌱 Starting database seeding...');

    const userRepo = SeedDataSource.getRepository(User);
    const vehicleRepo = SeedDataSource.getRepository(Vehicle);
    const vehicleImageRepo = SeedDataSource.getRepository(VehicleImage);
    const repairServiceRepo = SeedDataSource.getRepository(RepairService);
    const carWashPackageRepo = SeedDataSource.getRepository(CarWashPackage);
    const carWashAddonRepo = SeedDataSource.getRepository(CarWashAddon);
    const settingsRepo = SeedDataSource.getRepository(Settings);
    const pageRepo = SeedDataSource.getRepository(Page);

    // 1. Create default admin user
    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@gmail.com' } });
    if (!existingAdmin) {
      const adminUser = new User();
      adminUser.email = 'admin@gmail.com';
      adminUser.passwordHash = await bcrypt.hash('33333333', 10);
      adminUser.firstName = 'Admin';
      adminUser.lastName = 'User';
      adminUser.role = 'admin';
      adminUser.isActive = true;
      await userRepo.save(adminUser);
      console.log('✅ Created admin user (admin@gmail.com / 33333333)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // 2. Seed Vehicles
    const vehicles = [
      {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        price: '450000.00',
        mileage: 15000,
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Beyaz',
        description: '2022 model Toyota Corolla, tek el, bakımlı, garantili. Tüm özellikler mevcut.',
        status: 'available',
        featured: true,
      },
      {
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2021,
        price: '520000.00',
        mileage: 25000,
        fuelType: 'diesel',
        transmission: 'manual',
        color: 'Siyah',
        description: '2021 model Volkswagen Golf, dizel motor, düşük yakıt tüketimi, konforlu sürüş.',
        status: 'available',
        featured: true,
      },
      {
        brand: 'Ford',
        model: 'Focus',
        year: 2023,
        price: '480000.00',
        mileage: 8000,
        fuelType: 'hybrid',
        transmission: 'automatic',
        color: 'Gri',
        description: '2023 model Ford Focus Hybrid, çevre dostu, teknoloji dolu, sıfır gibi.',
        status: 'available',
        featured: false,
      },
      {
        brand: 'BMW',
        model: '320i',
        year: 2022,
        price: '850000.00',
        mileage: 12000,
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Siyah',
        description: '2022 model BMW 320i, lüks sedan, sportif sürüş, tüm özellikler mevcut.',
        status: 'available',
        featured: true,
      },
      {
        brand: 'Mercedes-Benz',
        model: 'C180',
        year: 2021,
        price: '780000.00',
        mileage: 18000,
        fuelType: 'diesel',
        transmission: 'automatic',
        color: 'Gri',
        description: '2021 model Mercedes-Benz C180, konforlu ve prestijli sedan.',
        status: 'available',
        featured: true,
      },
      {
        brand: 'Audi',
        model: 'A3',
        year: 2023,
        price: '720000.00',
        mileage: 5000,
        fuelType: 'petrol',
        transmission: 'automatic',
        color: 'Kırmızı',
        description: '2023 model Audi A3, şık ve dinamik hatchback, sıfır gibi.',
        status: 'available',
        featured: false,
      },
      {
        brand: 'Hyundai',
        model: 'Tucson',
        year: 2020,
        price: '550000.00',
        mileage: 40000,
        fuelType: 'diesel',
        transmission: 'automatic',
        color: 'Beyaz',
        description: '2020 model Hyundai Tucson, geniş ve konforlu SUV, bakımlı.',
        status: 'available',
        featured: false,
      },
      {
        brand: 'Renault',
        model: 'Clio',
        year: 2022,
        price: '380000.00',
        mileage: 25000,
        fuelType: 'petrol',
        transmission: 'manual',
        color: 'Siyah',
        description: '2022 model Renault Clio, şehir içi kullanım için ideal, ekonomik.',
        status: 'available',
        featured: false,
      },
      {
        brand: 'Nissan',
        model: 'Qashqai',
        year: 2019,
        price: '480000.00',
        mileage: 60000,
        fuelType: 'diesel',
        transmission: 'automatic',
        color: 'Beyaz',
        description: '2019 model Nissan Qashqai, popüler SUV modeli, bakımlı.',
        status: 'available',
        featured: false,
      },
      {
        brand: 'Opel',
        model: 'Corsa',
        year: 2023,
        price: '420000.00',
        mileage: 8000,
        fuelType: 'petrol',
        transmission: 'manual',
        color: 'Kırmızı',
        description: '2023 model Opel Corsa, şık ve ekonomik şehir aracı.',
        status: 'available',
        featured: false,
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;
    
    for (const vehicleData of vehicles) {
      const existing = await vehicleRepo.findOne({
        where: {
          brand: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
        },
      });
      
      if (!existing) {
        const vehicle = new Vehicle();
        Object.assign(vehicle, vehicleData);
        const savedVehicle = await vehicleRepo.save(vehicle);
        
        // Add a primary image for each vehicle
        const vehicleImage = new VehicleImage();
        vehicleImage.vehicleId = savedVehicle.id;
        vehicleImage.imageUrl = `/images/vehicles/${vehicleData.brand.toLowerCase()}-${vehicleData.model.toLowerCase()}-${vehicleData.year}.jpg`;
        vehicleImage.isPrimary = true;
        vehicleImage.displayOrder = 0;
        await vehicleImageRepo.save(vehicleImage);
        createdCount++;
      } else {
        skippedCount++;
      }
    }
    
    // Get total vehicle count from database
    const totalVehicles = await vehicleRepo.count();
    console.log(`✅ Seeded vehicles: ${createdCount} created, ${skippedCount} already existed`);
    console.log(`📊 Total vehicles in database: ${totalVehicles}`);

    // 3. Seed Repair Services
    const repairServices = [
      { name: 'Oil Change', description: 'Engine oil and oil filter replacement', category: 'Maintenance', basePrice: 299.00, displayOrder: 1 },
      { name: 'Brake Service', description: 'Brake pad replacement and brake fluid check', category: 'Safety', basePrice: 899.00, displayOrder: 2 },
      { name: 'Air Filter Replacement', description: 'Engine air filter replacement', category: 'Maintenance', basePrice: 199.00, displayOrder: 3 },
      { name: 'Battery Replacement', description: 'Car battery replacement service', category: 'Electrical', basePrice: 1299.00, displayOrder: 4 },
      { name: 'Tire Rotation', description: 'Tire rotation and pressure check', category: 'Maintenance', basePrice: 149.00, displayOrder: 5 },
      { name: 'Transmission Service', description: 'Transmission fluid change', category: 'Maintenance', basePrice: 899.00, displayOrder: 6 },
      { name: 'Coolant Flush', description: 'Coolant system flush and refill', category: 'Maintenance', basePrice: 599.00, displayOrder: 7 },
      { name: 'Timing Belt Replacement', description: 'Timing belt replacement service', category: 'Engine', basePrice: 2499.00, displayOrder: 8 },
    ];

    for (const service of repairServices) {
      const existing = await repairServiceRepo.findOne({ where: { name: service.name } });
      if (!existing) {
        const repairService = new RepairService();
        Object.assign(repairService, service);
        await repairServiceRepo.save(repairService);
      }
    }
    console.log('✅ Seeded repair services');

    // 4. Seed Car Wash Packages
    const carWashPackages = [
      { name: 'Basic Wash', description: 'Exterior wash and dry', basePrice: 79.00, durationMinutes: 15, displayOrder: 1 },
      { name: 'Standard Wash', description: 'Exterior wash, dry, tire shine, and interior vacuum', basePrice: 149.00, durationMinutes: 30, displayOrder: 2 },
      { name: 'Premium Wash', description: 'Full exterior wash, wax, interior cleaning, tire shine', basePrice: 249.00, durationMinutes: 60, displayOrder: 3 },
      { name: 'Deluxe Wash', description: 'Complete detailing: exterior, interior, wax, polish, engine bay', basePrice: 499.00, durationMinutes: 120, displayOrder: 4 },
    ];

    for (const pkg of carWashPackages) {
      const existing = await carWashPackageRepo.findOne({ where: { name: pkg.name } });
      if (!existing) {
        const carWashPackage = new CarWashPackage();
        Object.assign(carWashPackage, pkg);
        await carWashPackageRepo.save(carWashPackage);
      }
    }
    console.log('✅ Seeded car wash packages');

    // 5. Seed Car Wash Add-ons
    const carWashAddons = [
      { name: 'Interior Detailing', description: 'Deep interior cleaning and protection', price: 199.00, displayOrder: 1 },
      { name: 'Wax Protection', description: 'Premium wax application', price: 149.00, displayOrder: 2 },
      { name: 'Engine Bay Cleaning', description: 'Engine compartment cleaning', price: 99.00, displayOrder: 3 },
      { name: 'Headlight Restoration', description: 'Headlight cleaning and polishing', price: 149.00, displayOrder: 4 },
    ];

    for (const addon of carWashAddons) {
      const existing = await carWashAddonRepo.findOne({ where: { name: addon.name } });
      if (!existing) {
        const carWashAddon = new CarWashAddon();
        Object.assign(carWashAddon, addon);
        await carWashAddonRepo.save(carWashAddon);
      }
    }
    console.log('✅ Seeded car wash add-ons');

    // 6. Seed Settings
    const defaultSettings = [
      { key: 'social_facebook', value: 'https://www.facebook.com/kayototamir' },
      { key: 'social_instagram', value: 'https://www.instagram.com/kayototamir' },
      { key: 'social_x', value: 'https://twitter.com/kayototamir' },
      { key: 'contact_phone', value: '+90 555 123 4567' },
      { key: 'facebook_url', value: 'https://www.facebook.com/kayototamir' },
      { key: 'instagram_url', value: 'https://www.instagram.com/kayototamir' },
      { key: 'x_url', value: 'https://twitter.com/kayototamir' },
      { key: 'phone_number', value: '+90 555 123 4567' },
      { key: 'company_name', value: 'KAY Oto Servis' },
      { key: 'company_tax_number', value: '1234567890' },
      { key: 'company_address', value: 'Örnek Mahalle, Örnek Sokak No:123, İstanbul' },
      { key: 'company_phone', value: '+90 555 123 4567' },
      { key: 'company_email', value: 'info@kayototamir.com' },
      { key: 'tax_rate', value: '18' },
      { key: 'federal_tax_rate', value: '5' },
      { key: 'provincial_tax_rate', value: '9.975' },
    ];

    for (const setting of defaultSettings) {
      const existing = await settingsRepo.findOne({ where: { key: setting.key } });
      if (!existing) {
        const settings = new Settings();
        settings.key = setting.key;
        settings.value = setting.value;
        await settingsRepo.save(settings);
      }
    }
    console.log('✅ Seeded settings');

    // 7. Seed Pages
    const pages = [
      { slug: 'about', title: 'About Us', content: 'Welcome to our automotive service center. We provide quality auto repair, sales, and car wash services.', metaDescription: 'Learn about our automotive services' },
      { slug: 'contact', title: 'Contact Us', content: 'Get in touch with us for any inquiries.', metaDescription: 'Contact information' },
    ];

    for (const page of pages) {
      const existing = await pageRepo.findOne({ where: { slug: page.slug } });
      if (!existing) {
        const pageEntity = new Page();
        Object.assign(pageEntity, page);
        await pageRepo.save(pageEntity);
      }
    }
    console.log('✅ Seeded pages');

    console.log('✅ Database seeding completed successfully!');
    
    // Close database connection
    if (SeedDataSource.isInitialized) {
      await SeedDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    // Close connection even on error
    if (SeedDataSource.isInitialized) {
      await SeedDataSource.destroy().catch(() => {});
    }
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed script failed:', error);
      process.exit(1);
    });
}
