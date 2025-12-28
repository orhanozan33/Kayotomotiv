# Automotive Business Platform

A production-ready full-stack platform for managing an automotive business with three main services:
- **Auto Sales / Gallery** (Oto Galeri)
- **Auto Repair** (Oto Tamir)
- **Car Wash** (Oto Yıkama)

## Project Structure

```
/project-root
 ├── backend/          # Node.js + Express + PostgreSQL API
 ├── frontend/         # React + Vite Public Website
 └── backoffice/       # React + Vite Admin Panel
```

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

### Frontend & Backoffice
- React 18
- Vite
- React Router
- Axios

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE ototamir;
```

2. Update database credentials in `backend/.env` (see Environment Variables section)

3. Run migrations:
```bash
cd backend
npm install
npm run migrate
```

This will create all tables and seed initial data including:
- Default admin user (email: `admin@gmail.com`, password: `33333333` - **CHANGE THIS IN PRODUCTION!**)

### 2. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ototamir
DB_USER=postgres
DB_PASSWORD=333333

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Backoffice (Admin Panel) Setup

1. Navigate to backoffice directory:
```bash
cd backoffice
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The backoffice will run on `http://localhost:3002`

## Default Admin Credentials

**IMPORTANT:** Change these immediately in production!

- Email: `admin@gmail.com`
- Password: `33333333`

To change the admin password, you can either:
1. Update it directly in the database
2. Use the admin panel after logging in (if user profile update is implemented)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create vehicle (admin only)
- `PUT /api/vehicles/:id` - Update vehicle (admin only)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin only)
- `POST /api/vehicles/:id/images` - Upload vehicle image (admin only)

### Reservations & Test Drives
- `POST /api/reservations` - Create reservation request
- `GET /api/reservations` - Get reservations (requires auth)
- `PUT /api/reservations/:id/status` - Update reservation status (admin only)
- `POST /api/reservations/test-drive` - Create test drive request
- `GET /api/reservations/test-drive` - Get test drive requests (requires auth)
- `PUT /api/reservations/test-drive/:id/status` - Update test drive status (admin only)

### Repair Services
- `GET /api/repair/services` - Get active repair services
- `POST /api/repair/services` - Create service (admin only)
- `PUT /api/repair/services/:id` - Update service (admin only)
- `POST /api/repair/quotes` - Create quote request
- `GET /api/repair/quotes` - Get quotes (requires auth)
- `PUT /api/repair/quotes/:id/status` - Update quote status (admin only)
- `POST /api/repair/appointments` - Create appointment
- `GET /api/repair/appointments` - Get appointments (requires auth)
- `PUT /api/repair/appointments/:id/status` - Update appointment status (admin only)

### Car Wash
- `GET /api/car-wash/packages` - Get active packages
- `POST /api/car-wash/packages` - Create package (admin only)
- `PUT /api/car-wash/packages/:id` - Update package (admin only)
- `GET /api/car-wash/addons` - Get active addons
- `POST /api/car-wash/addons` - Create addon (admin only)
- `PUT /api/car-wash/addons/:id` - Update addon (admin only)
- `POST /api/car-wash/appointments` - Create appointment
- `GET /api/car-wash/appointments` - Get appointments (requires auth)
- `PUT /api/car-wash/appointments/:id/status` - Update appointment status (admin only)

### Pages
- `GET /api/pages` - Get active pages
- `GET /api/pages/:slug` - Get page by slug
- `POST /api/pages` - Create page (admin only)
- `PUT /api/pages/:id` - Update page (admin only)
- `DELETE /api/pages/:id` - Delete page (admin only)

## Frontend Features

### Public Website
- **Homepage**: Service cards linking to each service area
- **Auto Sales**: Vehicle listings with filters, detail pages, reservation and test drive requests
- **Auto Repair**: Services list, quote request flow, appointment booking
- **Car Wash**: Package selection, add-ons, appointment booking

### Admin Panel
- **Dashboard**: Overview statistics
- **Vehicles Management**: CRUD operations for vehicle listings
- **Reservations**: Manage vehicle reservations and test drive requests
- **Repair Services**: Manage repair services and pricing
- **Repair Quotes**: View and manage quote requests
- **Car Wash**: Manage packages, add-ons, and appointments
- **Pages**: Manage CMS pages

## Database Schema

The database includes the following main tables:
- `users` - User accounts (customers and admins)
- `vehicles` - Vehicle listings
- `vehicle_images` - Vehicle image galleries
- `vehicle_reservations` - Vehicle reservation requests
- `test_drive_requests` - Test drive requests
- `repair_services` - Repair service catalog
- `repair_quotes` - Repair quote requests
- `repair_appointments` - Repair appointments
- `car_wash_packages` - Car wash packages
- `car_wash_addons` - Car wash add-ons
- `car_wash_appointments` - Car wash appointments
- `pages` - CMS pages

See `backend/migrations/001_initial_schema.sql` for complete schema.

## Production Deployment

### Important Security Notes

1. **Change default admin credentials** before deploying
2. **Update JWT_SECRET** with a strong random string
3. **Set NODE_ENV=production**
4. **Configure proper CORS** origins in backend
5. **Use environment variables** for all sensitive data
6. **Enable HTTPS** in production
7. **Configure database backups**
8. **Set up proper file storage** (S3, Cloudinary, etc.) for images instead of local uploads

### Build Commands

```bash
# Backend (production)
cd backend
npm install --production
npm start

# Frontend (production build)
cd frontend
npm run build
# Serve the dist/ folder with a web server

# Backoffice (production build)
cd backoffice
npm run build
# Serve the dist/ folder with a web server
```

## Development

The project uses:
- **ES Modules** (import/export syntax)
- **React Hooks** for state management
- **React Router** for navigation
- **Axios** for API calls

## License

ISC

## Support

For issues and questions, please contact the development team.

