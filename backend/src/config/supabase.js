import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
// Proje ID: rxbtkjihvqjmamdwmsev
const SUPABASE_URL = 'https://rxbtkjihvqjmamdwmsev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4YnRramlodnFqbWFtZHdtc2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMzg2NjEsImV4cCI6MjA4MjcxNDY2MX0.OiLg1niyYflJpmv_9gjtfRoDJyezXnMiJ3cAxcQYjwg';

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

