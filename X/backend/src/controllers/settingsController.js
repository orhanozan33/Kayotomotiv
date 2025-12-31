import { supabaseApi, supabase } from '../config/database-api.js';
import pool from '../config/database.js';

export const getSettings = async (req, res, next) => {
  try {
    // Try Supabase API first, fallback to PostgreSQL pool
    let settings = {};
    try {
      settings = await supabaseApi.getSettings();
    } catch (supabaseError) {
      console.warn('⚠️  Supabase API failed, trying PostgreSQL pool:', supabaseError.message);
      const result = await pool.query('SELECT key, value FROM settings');
      result.rows.forEach(row => {
        settings[row.key] = row.value;
      });
    }
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    console.log('updateSettings called with:', settings);
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' });
    }
    
    // Try Supabase API first, fallback to PostgreSQL pool
    try {
      await supabaseApi.updateSettings(settings);
      console.log('✅ Settings updated via Supabase API');
    } catch (supabaseError) {
      console.warn('⚠️  Supabase API failed, trying PostgreSQL pool:', supabaseError.message);
      for (const [key, value] of Object.entries(settings)) {
        console.log(`Updating setting ${key} = ${value}`);
        await pool.query(
          `INSERT INTO settings (key, value, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) 
           DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, value || '']
        );
        console.log(`Setting ${key} updated successfully`);
      }
    }
    
    console.log('All settings updated successfully');
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    next(error);
  }
};

export const getSocialMediaLinks = async (req, res, next) => {
  try {
    console.log('📥 getSocialMediaLinks called');
    
    // Default empty links
    const links = {
      facebook: '',
      instagram: '',
      x: '',
      phone: ''
    };
    
    try {
      // Try Supabase API first
      const settings = await supabaseApi.getSettingsByKeys([
        'social_facebook', 
        'social_instagram', 
        'social_x', 
        'contact_phone'
      ]);
      
      console.log('✅ Supabase API: Settings retrieved');
      
      if (settings.contact_phone) links.phone = settings.contact_phone;
      if (settings.social_facebook) links.facebook = settings.social_facebook;
      if (settings.social_instagram) links.instagram = settings.social_instagram;
      if (settings.social_x) links.x = settings.social_x;
    } catch (supabaseError) {
      console.warn('⚠️  Supabase API failed, trying PostgreSQL pool:', supabaseError.message);
      try {
        const result = await pool.query(
          `SELECT key, value FROM settings 
           WHERE key IN ('social_facebook', 'social_instagram', 'social_x', 'contact_phone')`
        );
        
        console.log('✅ PostgreSQL: Settings query result:', result.rows.length, 'rows');
        
        result.rows.forEach(row => {
          if (row.key === 'contact_phone') {
            links.phone = row.value || '';
          } else {
            const key = row.key.replace('social_', '');
            links[key] = row.value || '';
          }
        });
      } catch (dbError) {
        console.error('⚠️  Settings table query failed, returning empty links:', dbError.message);
        // If settings table doesn't exist or query fails, return empty links
        // This prevents 500 error and allows frontend to continue
      }
    }
    
    res.json({ links });
  } catch (error) {
    console.error('❌ getSocialMediaLinks error:', error);
    next(error);
  }
};

export const getCompanyInfo = async (req, res, next) => {
  try {
    const info = {
      company_name: '',
      company_tax_number: '',
      company_address: '',
      company_phone: '',
      company_email: ''
    };
    
    // Try Supabase API first, fallback to PostgreSQL pool
    try {
      const settings = await supabaseApi.getSettingsByKeys([
        'company_name', 
        'company_tax_number', 
        'company_address', 
        'company_phone', 
        'company_email'
      ]);
      Object.assign(info, settings);
    } catch (supabaseError) {
      console.warn('⚠️  Supabase API failed, trying PostgreSQL pool:', supabaseError.message);
      const result = await pool.query(
        `SELECT key, value FROM settings 
         WHERE key IN ('company_name', 'company_tax_number', 'company_address', 'company_phone', 'company_email')`
      );
      result.rows.forEach(row => {
        info[row.key] = row.value || '';
      });
    }
    
    res.json({ companyInfo: info });
  } catch (error) {
    next(error);
  }
};

export const getContactLocations = async (req, res, next) => {
  try {
    // Parse locations from settings
    const locations = [
      { name: '', address: '', phone: '', hours: '' },
      { name: '', address: '', phone: '', hours: '' },
      { name: '', address: '', phone: '', hours: '' }
    ];
    
    // Try Supabase API first, fallback to PostgreSQL pool
    try {
      const { data, error } = await supabase.from('settings')
        .select('key, value')
        .like('key', 'contact_location_%')
        .order('key');
      
      if (!error && data) {
        data.forEach(row => {
          const keyParts = row.key.split('_');
          const index = parseInt(keyParts[2]) - 1; // contact_location_1_name -> index 0
          const field = keyParts[3]; // name, address, phone, hours
          
          if (index >= 0 && index < 3 && locations[index]) {
            locations[index][field] = row.value || '';
          }
        });
      }
    } catch (supabaseError) {
      console.warn('⚠️  Supabase API failed, trying PostgreSQL pool:', supabaseError.message);
      const result = await pool.query(
        `SELECT key, value FROM settings 
         WHERE key LIKE 'contact_location_%' 
         ORDER BY key`
      );
      
      result.rows.forEach(row => {
        const keyParts = row.key.split('_');
        const index = parseInt(keyParts[2]) - 1; // contact_location_1_name -> index 0
        const field = keyParts[3]; // name, address, phone, hours
        
        if (index >= 0 && index < 3 && locations[index]) {
          locations[index][field] = row.value || '';
        }
      });
    }
    
    res.json({ locations });
  } catch (error) {
    next(error);
  }
};

