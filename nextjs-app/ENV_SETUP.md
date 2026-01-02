# Environment Variables Setup Guide

## Supabase Database Configuration

### Option 1: Connection String (Recommended for Vercel)

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Database**
3. Find **Connection string** section
4. Select **Connection pooling** mode
5. Copy the connection string (it should look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password
7. Set this as `DATABASE_URL` in Vercel environment variables

### Option 2: Individual Settings

If you prefer individual settings, use these variables:

```
DB_HOST=db.[YOUR-PROJECT-REF].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]
DB_SSL=true
```

## Required Environment Variables

### 1. Database Connection
- `DATABASE_URL` (or `POSTGRES_URL`) - Supabase connection string with pooling
- OR use individual settings: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DB_SSL=true` (required for Supabase)

### 2. JWT Secret
Generate a secure random string (minimum 32 characters):
```bash
openssl rand -base64 32
```
Set as: `JWT_SECRET`

### 3. Backend Password Hash
Generate bcrypt hash for admin password:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```
Set as: `BACKEND_PASSWORD_HASH`

### 4. Frontend URL
- `FRONTEND_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

### 5. Optional Database Pool Settings
```
DB_POOL_MAX=1
DB_IDLE_TIMEOUT_MS=10000
DB_CONN_TIMEOUT_MS=15000
```

## Vercel Environment Variables Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add all required variables:
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (generate secure random string)
   - `BACKEND_PASSWORD_HASH` (bcrypt hash)
   - `FRONTEND_URL` (your Vercel URL)
   - `NODE_ENV=production`
4. Make sure to set them for **Production**, **Preview**, and **Development** environments
5. Redeploy your application after adding variables

## Supabase Setup Steps

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Wait for database to be ready

2. **Get Connection String**
   - Go to Project Settings > Database
   - Copy connection string with pooling enabled

3. **Run Database Migrations** (if needed)
   - Use Supabase SQL Editor to run your schema
   - Or use migration scripts from your project

4. **Configure Row Level Security (RLS)** (if needed)
   - Set up RLS policies in Supabase dashboard

## Testing Connection

After setting up environment variables, test the connection:
1. Deploy to Vercel
2. Check Vercel function logs
3. Look for: `✅ Database connected successfully`

## Troubleshooting

### Connection Issues
- Make sure `DB_SSL=true` is set
- Use connection pooling URL (pgbouncer=true)
- Check that password doesn't contain special characters that need URL encoding

### Build Failures
- Ensure all required environment variables are set in Vercel
- Check that `JWT_SECRET` is at least 32 characters
- Verify `DATABASE_URL` format is correct

### Runtime Errors
- Check Vercel function logs
- Verify database connection string is correct
- Ensure Supabase project is active and not paused

