// Monorepo build consolidation script
// Bu script root'ta dist klasörü oluşturur (Vercel için gerekli)

const fs = require('fs');
const path = require('path');

const rootDist = path.join(__dirname, 'dist');
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const backofficeDist = path.join(__dirname, 'backoffice', 'dist');

// Root dist klasörünü oluştur
if (!fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
  console.log('✅ Root dist klasörü oluşturuldu');
}

// .vercel-output dosyası oluştur (Vercel için)
const vercelOutput = path.join(rootDist, '.vercel-output');
fs.writeFileSync(vercelOutput, 'ok');
console.log('✅ .vercel-output dosyası oluşturuldu');

// Frontend ve backoffice dist'lerinin var olduğunu kontrol et
if (fs.existsSync(frontendDist)) {
  console.log('✅ Frontend dist bulundu');
} else {
  console.log('⚠️  Frontend dist bulunamadı');
}

if (fs.existsSync(backofficeDist)) {
  console.log('✅ Backoffice dist bulundu');
} else {
  console.log('⚠️  Backoffice dist bulunamadı');
}

// Root dist'e bir index.html placeholder ekle (Vercel için)
const indexPlaceholder = path.join(rootDist, 'index.html');
if (!fs.existsSync(indexPlaceholder)) {
  fs.writeFileSync(indexPlaceholder, '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Redirecting...</body></html>');
  console.log('✅ Root index.html placeholder oluşturuldu');
}

console.log('✅ Build consolidation tamamlandı');
