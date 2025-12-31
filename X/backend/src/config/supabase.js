import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Ensure .env is loaded for local development/test scripts that import this module directly.
dotenv.config();

// Supabase Configuration
// Proje ID: rxbtkjihvqjmamdwmsev
// IMPORTANT: Do NOT hard-code keys in the repo. Use environment variables instead.
// Recommended:
// - SUPABASE_URL=https://<ref>.supabase.co
// - SUPABASE_SERVICE_ROLE_KEY=... (server-side, bypasses RLS)
// Or (limited, respects RLS):
// - SUPABASE_ANON_KEY=...
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rxbtkjihvqjmamdwmsev.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

// Supabase client oluştur
// NOTE: If the key is missing, do NOT crash the server on import.
// We export a proxy that throws only when Supabase is actually used.
const createMissingKeyProxy = () =>
  new Proxy(
    {},
    {
      get() {
        throw new Error('Supabase key is not set (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)');
      }
    }
  );

const supabase = SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
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
    })
  : createMissingKeyProxy();

// Avoid side-effect queries during module import (especially important in serverless).
// If you need a health check, call Supabase from an endpoint explicitly.
if (!SUPABASE_KEY) {
  console.warn('⚠️  Supabase key is not set (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY). Supabase API calls may fail.');
}

export default supabase;

