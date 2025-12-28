import pool from '../config/database.js';

export const getSettings = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
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
    
    for (const [key, value] of Object.entries(settings)) {
      console.log(`Updating setting ${key} = ${value}`);
      const result = await pool.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, value || '']
      );
      console.log(`Setting ${key} updated successfully`);
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
    const result = await pool.query(
      `SELECT key, value FROM settings 
       WHERE key IN ('social_facebook', 'social_instagram', 'social_x', 'contact_phone')`
    );
    const links = {
      facebook: '',
      instagram: '',
      x: '',
      phone: ''
    };
    result.rows.forEach(row => {
      if (row.key === 'contact_phone') {
        links.phone = row.value || '';
      } else {
        const key = row.key.replace('social_', '');
        links[key] = row.value || '';
      }
    });
    res.json({ links });
  } catch (error) {
    next(error);
  }
};

export const getCompanyInfo = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT key, value FROM settings 
       WHERE key IN ('company_name', 'company_tax_number', 'company_address', 'company_phone', 'company_email')`
    );
    const info = {
      company_name: '',
      company_tax_number: '',
      company_address: '',
      company_phone: '',
      company_email: ''
    };
    result.rows.forEach(row => {
      info[row.key] = row.value || '';
    });
    res.json({ companyInfo: info });
  } catch (error) {
    next(error);
  }
};

export const getContactLocations = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT key, value FROM settings 
       WHERE key LIKE 'contact_location_%' 
       ORDER BY key`
    );
    
    // Parse locations from settings
    const locations = [
      { name: '', address: '', phone: '', hours: '' },
      { name: '', address: '', phone: '', hours: '' },
      { name: '', address: '', phone: '', hours: '' }
    ];
    
    result.rows.forEach(row => {
      const keyParts = row.key.split('_');
      const index = parseInt(keyParts[2]) - 1; // contact_location_1_name -> index 0
      const field = keyParts[3]; // name, address, phone, hours
      
      if (index >= 0 && index < 3 && locations[index]) {
        locations[index][field] = row.value || '';
      }
    });
    
    res.json({ locations });
  } catch (error) {
    next(error);
  }
};

