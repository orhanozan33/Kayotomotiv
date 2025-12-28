# Project Structure Overview

## Directory Structure

```
/oto-tamir
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL connection pool
│   │   │   └── upload.js            # Multer configuration for file uploads
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication endpoints
│   │   │   ├── vehicleController.js # Vehicle CRUD operations
│   │   │   ├── reservationController.js # Reservations & test drives
│   │   │   ├── repairController.js  # Repair services, quotes, appointments
│   │   │   ├── carWashController.js # Car wash packages, addons, appointments
│   │   │   └── pageController.js    # CMS page management
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication & admin check
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── models/
│   │   │   ├── User.js              # User model with password hashing
│   │   │   └── Vehicle.js           # Vehicle model with queries
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes
│   │   │   ├── vehicles.js          # Vehicle routes
│   │   │   ├── reservations.js      # Reservation routes
│   │   │   ├── repair.js            # Repair routes
│   │   │   ├── carWash.js           # Car wash routes
│   │   │   └── pages.js             # Page routes
│   │   ├── utils/
│   │   │   ├── jwt.js               # JWT token generation/verification
│   │   │   ├── migrate.js           # Database migration runner
│   │   │   └── generatePasswordHash.js # Password hash utility
│   │   └── server.js                # Express app entry point
│   ├── migrations/
│   │   ├── 001_initial_schema.sql   # Complete database schema
│   │   └── 002_seed_data.sql        # Initial data (admin user, sample services)
│   ├── package.json
│   ├── .env.example                 # Environment variables template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Main layout with header/footer
│   │   │   └── ServiceCard.jsx      # Service card component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Homepage with service cards
│   │   │   ├── AutoSalesPage.jsx    # Vehicle listings with filters
│   │   │   ├── AutoSalesDetailPage.jsx # Vehicle detail with reservation forms
│   │   │   ├── AutoRepairPage.jsx   # Repair services & quote form
│   │   │   └── CarWashPage.jsx      # Car wash packages & appointment form
│   │   ├── services/
│   │   │   └── api.js               # Axios API client with interceptors
│   │   ├── styles/
│   │   │   └── index.css            # Global styles
│   │   ├── App.jsx                  # Router configuration
│   │   └── main.jsx                 # React entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
│
├── backoffice/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx           # Admin layout with sidebar
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Admin login
│   │   │   ├── DashboardPage.jsx    # Statistics overview
│   │   │   ├── VehiclesPage.jsx     # Vehicle management CRUD
│   │   │   ├── ReservationsPage.jsx # Reservations & test drives management
│   │   │   ├── RepairServicesPage.jsx # Repair services CRUD
│   │   │   ├── RepairQuotesPage.jsx # Quote & appointment management
│   │   │   ├── CarWashPage.jsx      # Car wash management
│   │   │   └── PagesPage.jsx        # CMS page management
│   │   ├── services/
│   │   │   └── api.js               # Admin API client
│   │   ├── styles/
│   │   │   └── index.css            # Global styles
│   │   ├── App.jsx                  # Router with auth guard
│   │   └── main.jsx                 # React entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
│
├── README.md                        # Main documentation
├── PROJECT_STRUCTURE.md             # This file
└── .gitignore                       # Root gitignore

```

## Key Features Implemented

### Backend API
✅ RESTful API with Express.js
✅ PostgreSQL database with comprehensive schema
✅ JWT-based authentication
✅ Role-based access control (customer/admin)
✅ File upload support (vehicle images)
✅ Error handling middleware
✅ Database migrations
✅ Seed data for initial setup

### Frontend (Public Website)
✅ Responsive React application
✅ Service cards on homepage
✅ Vehicle listings with filters (brand, model, year, price)
✅ Vehicle detail pages with image galleries
✅ Reservation request forms
✅ Test drive request forms
✅ Repair service listings
✅ Quote request flow
✅ Car wash package selection
✅ Appointment booking

### Backoffice (Admin Panel)
✅ Admin authentication
✅ Dashboard with statistics
✅ Vehicle CRUD operations
✅ Reservation management
✅ Test drive request management
✅ Repair service management
✅ Quote request management
✅ Repair appointment management
✅ Car wash package/addon management
✅ Car wash appointment management
✅ CMS page management

## Database Tables

1. **users** - User accounts
2. **vehicles** - Vehicle listings
3. **vehicle_images** - Vehicle image galleries
4. **vehicle_reservations** - Reservation requests
5. **test_drive_requests** - Test drive requests
6. **repair_services** - Repair service catalog
7. **repair_quotes** - Quote requests
8. **repair_quote_items** - Quote line items
9. **repair_appointments** - Repair appointments
10. **car_wash_packages** - Wash packages
11. **car_wash_addons** - Wash add-ons
12. **car_wash_appointments** - Wash appointments
13. **car_wash_appointment_addons** - Appointment add-on selections
14. **pages** - CMS pages

## Next Steps

1. Install dependencies in all three projects
2. Set up PostgreSQL database
3. Configure environment variables
4. Run database migrations
5. Start all three servers
6. Access:
   - Frontend: http://localhost:3000
   - Backoffice: http://localhost:3002
   - Backend API: http://localhost:3001

See README.md for detailed setup instructions.


