import 'reflect-metadata';
import dotenv from 'dotenv';
import { join } from 'path';
import { AppDataSource } from '@/lib/config/typeorm';
import { User } from '@/lib/entities/User';
import { Vehicle } from '@/lib/entities/Vehicle';
import { VehicleImage } from '@/lib/entities/VehicleImage';
import { RepairService } from '@/lib/entities/RepairService';
import { CarWashPackage } from '@/lib/entities/CarWashPackage';
import { CarWashAddon } from '@/lib/entities/CarWashAddon';
import { Settings } from '@/lib/entities/Settings';
import { Page } from '@/lib/entities/Page';
import bcrypt from 'bcryptjs';

// Load environment variables
const envPath = join(process.cwd(), '.env');
dotenv.config({ path: envPath });

export async function seedDatabase() {
  try {
    // Initialize database connection first (directly, not through initializeDatabase to avoid circular calls)
    console.log('🔄 Initializing database connection...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected');
    } else {
      console.log('✅ Database already connected');
    }

    console.log('🌱 Starting database seeding...');

    const userRepo = AppDataSource.getRepository(User);
    const vehicleRepo = AppDataSource.getRepository(Vehicle);
    const vehicleImageRepo = AppDataSource.getRepository(VehicleImage);
    const repairServiceRepo = AppDataSource.getRepository(RepairService);
    const carWashPackageRepo = AppDataSource.getRepository(CarWashPackage);
    const carWashAddonRepo = AppDataSource.getRepository(CarWashAddon);
    const settingsRepo = AppDataSource.getRepository(Settings);
    const pageRepo = AppDataSource.getRepository(Page);

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
    ];

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
      }
    }
    console.log('✅ Seeded vehicles');

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
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
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
