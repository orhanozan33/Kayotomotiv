import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Proje ID: rxbtkjihvqjmamdwmsev
const SUPABASE_URL = 'https://rxbtkjihvqjmamdwmsev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4YnRramlodnFqbWFkd21zZXYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2NzEwODI2MywiZXhwIjoyMDgyNjg0MjYzfQ.placeholder'; // Anon key - Supabase Dashboard'dan alınmalı

// Supabase client oluştur
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'kayoto-backend'
    }
  }
});

// Test connection
supabase.from('users').select('count').limit(1)
  .then(() => {
    console.log('✅ Supabase API bağlantısı başarılı');
    console.log('✅ Supabase URL:', SUPABASE_URL);
    console.log('✅ Supabase Proje ID: rxbtkjihvqjmamdwmsev');
  })
  .catch((err) => {
    console.error('❌ Supabase API bağlantı hatası:', err.message);
  });

export default supabase;

