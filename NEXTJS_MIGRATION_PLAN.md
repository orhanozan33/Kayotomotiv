# Next.js Migration Plan - Vercel'de Sorunsuz Çalışan Mimari

## 🎯 Hedef Yapı

```
/project-root
 ├─ app/                    (Next.js App Router)
 │   ├─ page.tsx            (Frontend - Ana sayfa)
 │   ├─ admin/              (Backoffice)
 │   │   └─ page.tsx
 │   └─ api/                (Backend API - Express YOK!)
 │       ├─ auth/
 │       │   └─ route.ts
 │       ├─ vehicles/
 │       │   └─ route.ts
 │       ├─ reservations/
 │       │   └─ route.ts
 │       └─ ...
 │
 ├─ lib/
 │   ├─ db.ts               (DB bağlantısı)
 │   └─ auth.ts             (JWT, middleware)
 │
 ├─ components/             (Shared components)
 │
 ├─ package.json
 └─ next.config.js
```

## ⚠️ ÖNEMLİ

- ❌ Express yok
- ❌ server.js yok
- ❌ app.listen() yok
- ✅ Next.js API Routes (App Router)
- ✅ Serverless functions (otomatik)

## 📋 Migration Adımları

1. Next.js kurulumu
2. Frontend'i Next.js'e çevir
3. Backoffice'i Next.js'e çevir
4. Express route'larını Next.js API route'larına çevir
5. Database connection'ı lib/db.ts'e taşı
6. Middleware'leri Next.js middleware'e çevir

---

**Bu migration büyük bir iş. Devam edeyim mi?**

