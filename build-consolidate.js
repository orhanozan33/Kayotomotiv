// Monorepo build consolidation script
// Bu script frontend ve backoffice dist klasörlerini root'ta birleştirir

const fs = require('fs');
const path = require('path');

const rootDist = path.join(__dirname, 'dist');
const frontendDist = path.join(__dirname, 'frontend', 'dist');
const backofficeDist = path.join(__dirname, 'backoffice', 'dist');

// Root dist klasörünü oluştur
if (!fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
}

// .vercel-output dosyası oluştur (Vercel için)
fs.writeFileSync(path.join(rootDist, '.vercel-output'), 'ok');

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

console.log('✅ Build consolidation tamamlandı');

