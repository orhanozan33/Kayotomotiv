// Hybrid Database Connection: PostgreSQL Pool + Supabase API
// Hem PostgreSQL pool hem de Supabase REST API desteği

import pool from './database.js';
import supabase from './supabase.js';

// PostgreSQL Pool için wrapper (mevcut kod için)
export const db = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error('❌ PostgreSQL query error:', error.message);
      // Supabase API'ye fallback yap
      throw error;
    }
  },
  connect: () => pool.connect(),
  end: () => pool.end()
};

// Supabase API için wrapper
export const supabaseApi = {
  // Vehicles
  getVehicles: async (filters = {}) => {
    let query = supabase.from('vehicles').select('*');
    
    if (filters.brand) query = query.ilike('brand', `%${filters.brand}%`);
    if (filters.model) query = query.ilike('model', `%${filters.model}%`);
    if (filters.year) query = query.eq('year', filters.year);
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
    if (filters.status) query = query.eq('status', filters.status);
    
    if (filters.excludeSold !== false) {
      query = query.in('status', ['available', 'reserved']);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  getVehicleById: async (id) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getVehicleImages: async (vehicleId) => {
    const { data, error } = await supabase
      .from('vehicle_images')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  // Users
  getUserByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },
  
  // Settings
  getSettings: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');
    
    if (error) throw error;
    
    const settings = {};
    data.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  },
  
  // Pages
  getPageBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

// Default export: PostgreSQL pool (mevcut kod için)
export default pool;

// Named export: Supabase API
export { supabase };

