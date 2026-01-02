# 🔧 Supabase Schema Fix - Adım Adım

## ⚠️ ÖNEMLİ: Sadece SQL kodunu kopyala!

Supabase SQL Editor'e **SADECE SQL kodunu** yapıştır. Markdown dosyalarını değil!

---

## 📋 ADIM 1: Fix SQL Dosyasını Aç

1. Proje klasöründe `nextjs-app/supabase-fix-schema.sql` dosyasını aç
2. **TÜM İÇERİĞİNİ** kopyala (Ctrl+A, sonra Ctrl+C)

---

## 📋 ADIM 2: Supabase'e Git

1. [Supabase Dashboard](https://supabase.com/dashboard) → Projeni seç (`kayotomotiv`)
2. Sol menüden **SQL Editor** → **New query**

---

## 📋 ADIM 3: SQL'i Yapıştır ve Çalıştır

1. SQL Editor'e kopyaladığın SQL kodunu yapıştır (Ctrl+V)
2. **RUN** butonuna tıkla (veya F5)
3. "Success. No rows returned" mesajını görmelisin

---

## ✅ Başarı Kontrolü

SQL başarıyla çalıştıysa:
- Hata mesajı yok
- "Schema fixes applied successfully!" mesajı görünür

---

## 🚨 HATA ALIRSAN

### Hata: "syntax error at or near #"
**Neden:** Markdown dosyasını (README.md, SUPABASE_SETUP.md vb.) yapıştırdın  
**Çözüm:** `supabase-fix-schema.sql` dosyasını aç ve sadece onu kopyala

### Hata: "column already exists"
**Neden:** Kolonlar zaten eklenmiş  
**Çözüm:** Bu normal, devam edebilirsin

### Hata: "relation does not exist"
**Neden:** Tablolar henüz oluşturulmamış  
**Çözüm:** Önce `supabase-schema.sql` dosyasını çalıştır

---

## 📝 Sonraki Adım

Fix SQL'i başarıyla çalıştırdıktan sonra:

```bash
cd "C:\Users\orhan\OneDrive\Masaüstü\oto tamir\nextjs-app"
npm run seed
```

Seed script'i çalıştır ve veritabanını doldur.

