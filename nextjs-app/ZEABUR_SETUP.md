# Zeabur Deployment Setup Guide

## Environment Variables

Zeabur Dashboard > Settings > Environment Variables'a şu variable'ları ekleyin:

### Zorunlu Variables:

```bash
# Database Connection
DATABASE_URL=postgresql://root:b51YkdQPD4UnW83R96fc2BOm7zSTqsj0@sjc1.clusters.zeabur.com:29595/zeabur?sslmode=require

# JWT Secret (min 32 karakter)
JWT_SECRET=your-super-s3cr3t-jwt-key-ch@nge-this-in-production-min-32-chars

# Backend Admin Password Hash
BACKEND_PASSWORD_HASH=$2a$10$dS3A5VdyubEHGSnI5ITF2OL/CHYP4qDFna6.RMOv9SuWg4/9tJifa

# Node Environment
NODE_ENV=production

# Database SSL (true/false)
DB_SSL=true

# Frontend URL (Deployment sonrası Zeabur URL'i ile güncelleyin)
FRONTEND_URL=https://[your-zeabur-url].zeabur.app
```

### Deployment Sonrası:

1. Zeabur deployment tamamlandıktan sonra URL'i kopyalayın
2. `FRONTEND_URL` variable'ını bu URL ile güncelleyin
3. Deployment otomatik olarak yeniden başlayacak

## Zeabur Dashboard Ayarları

1. **Root Directory**: `nextjs-app`
2. **Build Command**: `npm run build` (otomatik)
3. **Start Command**: `npm start` (otomatik)
4. **Node Version**: 20.x (otomatik)

## Database

Zeabur PostgreSQL database kullanılıyor. Connection string yukarıdaki gibi.

## Notes

- TypeORM `synchronize: true` olduğu için tablolar otomatik oluşturulacak
- Seed data ilk deployment'da otomatik çalışacak
- SSL otomatik olarak aktif edilecek (production mode'da)

