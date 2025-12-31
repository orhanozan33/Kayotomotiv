import Vehicle from '../models/Vehicle.js';
import pool from '../config/database.js';

export const getVehicles = async (req, res, next) => {
  try {
    console.log('📥 getVehicles called with filters:', req.query);
    
    const filters = {
      brand: req.query.brand,
      model: req.query.model,
      year: req.query.year ? parseInt(req.query.year) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      status: req.query.status || undefined, // Allow explicit status filter
      featured: req.query.featured === 'true' ? true : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      excludeSold: req.query.excludeSold !== 'false' // Default to true, but allow override
    };

    console.log('🔍 Filters applied:', filters);

    const vehicles = await Vehicle.findAll(filters);
    console.log('✅ Vehicles found:', vehicles.length);

    // Get images for each vehicle
    const vehiclesWithImages = await Promise.all(
      vehicles.map(async (vehicle) => {
        try {
          const images = await Vehicle.getImages(vehicle.id);
          return { ...vehicle, images: images || [] };
        } catch (imageError) {
          console.warn('⚠️  Error loading images for vehicle', vehicle.id, ':', imageError.message);
          return { ...vehicle, images: [] };
        }
      })
    );

    console.log('✅ Returning', vehiclesWithImages.length, 'vehicles with images');
    res.json({ vehicles: vehiclesWithImages });
  } catch (error) {
    console.error('❌ getVehicles error:', error);
    console.error('❌ Error stack:', error.stack);
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const images = await Vehicle.getImages(vehicle.id);
    res.json({ vehicle: { ...vehicle, images } });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const vehicleData = {
      ...req.body,
      created_by: req.user.id
    };
    const vehicle = await Vehicle.create(vehicleData);
    res.status(201).json({ vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.update(req.params.id, req.body);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    await Vehicle.delete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const addVehicleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const image = await Vehicle.addImage(req.params.id, imageUrl, req.body.is_primary === 'true');
    res.status(201).json({ image });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleImage = async (req, res, next) => {
  try {
    await Vehicle.deleteImage(req.params.imageId);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleImage = async (req, res, next) => {
  try {
    const { is_primary, display_order } = req.body;
    const image = await Vehicle.updateImage(req.params.imageId, { is_primary, display_order });
    res.json({ image });
  } catch (error) {
    next(error);
  }
};

export const updateImagesOrder = async (req, res, next) => {
  try {
    const { imageOrders } = req.body; // Array of { imageId, display_order }
    await Vehicle.updateImagesOrder(imageOrders);
    res.json({ message: 'Images order updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const checkExpiredReservations = async (req, res, next) => {
  try {
    // Check for vehicles with expired reservations
    const result = await pool.query(
      `UPDATE vehicles 
       SET status = 'available', reservation_end_time = NULL 
       WHERE status = 'reserved' 
       AND reservation_end_time IS NOT NULL 
       AND reservation_end_time < CURRENT_TIMESTAMP
       RETURNING *`
    );

    res.json({ 
      message: 'Expired reservations checked',
      updated: result.rows.length,
      vehicles: result.rows
    });
  } catch (error) {
    next(error);
  }
};

