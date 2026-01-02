# Oto Tamir - Car Service Management System

A comprehensive car service management system built with Next.js, TypeScript, and Supabase.

## 🚀 Features

- Vehicle management and tracking
- Repair service records
- Customer management
- Car wash appointments
- Repair quotes and invoices
- Admin dashboard
- Multi-language support (TR, EN, FR)
- Responsive design

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd oto-tamir/nextjs-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the `nextjs-app` directory:

```env
# Supabase Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-minimum-32-characters

# Backend Password Hash (generate with bcrypt)
BACKEND_PASSWORD_HASH=your-bcrypt-hash

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment variable setup instructions.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🚀 Deployment to Vercel + Supabase

### Step 1: Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **Database**
3. Copy the **Connection string** (use Connection pooling mode)
4. Run your database schema/migrations in Supabase SQL Editor

### Step 2: Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `nextjs-app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. Add environment variables in Vercel:
   - Go to **Settings** > **Environment Variables**
   - Add all variables from `.env.local`:
     - `DATABASE_URL` (from Supabase)
     - `JWT_SECRET`
     - `BACKEND_PASSWORD_HASH`
     - `FRONTEND_URL` (will be auto-set by Vercel)
     - `NODE_ENV=production`

7. Deploy!

#### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
cd nextjs-app
vercel
```

Follow the prompts and add environment variables when asked.

### Step 3: Verify Deployment

1. Check Vercel deployment logs for any errors
2. Visit your deployed URL
3. Test database connection (check Vercel function logs)
4. Verify API endpoints are working

## 📁 Project Structure

```
nextjs-app/
├── app/                    # Next.js app directory
│   ├── api/              # API routes
│   ├── admin-panel/      # Admin dashboard
│   └── ...
├── components/           # React components
├── lib/                  # Utilities and configs
│   ├── config/          # Database and env configs
│   ├── entities/        # TypeORM entities
│   └── services/        # API services
├── public/               # Static files
└── scripts/             # Utility scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 🔐 Security Notes

- Never commit `.env.local` or `.env` files
- Use strong JWT secrets (minimum 32 characters)
- Enable SSL for database connections in production
- Use connection pooling for Supabase
- Keep dependencies updated

## 📚 Documentation

- [Environment Variables Setup](./ENV_SETUP.md) - Detailed env var configuration
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check that `DB_SSL=true` is set
- Ensure Supabase project is not paused
- Use connection pooling URL (pgbouncer=true)

### Build Failures
- Check all required environment variables are set
- Verify `JWT_SECRET` is at least 32 characters
- Check Vercel build logs for specific errors

### API Errors
- Check Vercel function logs
- Verify database connection
- Ensure CORS headers are configured correctly

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues and questions, please check the documentation or contact the development team.
