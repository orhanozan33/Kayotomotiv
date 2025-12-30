// Monorepo build consolidation script
// Bu script frontend ve backoffice dist'lerini root dist'e kopyalar

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

// Frontend dist'i kontrol et ve kopyala
if (fs.existsSync(frontendDist)) {
  console.log('✅ Frontend dist bulundu');
  
  // Frontend dist içeriğini root dist'e kopyala
  const frontendFiles = fs.readdirSync(frontendDist);
  frontendFiles.forEach(file => {
    const srcPath = path.join(frontendDist, file);
    const destPath = path.join(rootDist, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // Klasör ise recursive kopyala
      copyRecursiveSync(srcPath, destPath);
    } else {
      // Dosya ise kopyala
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log('✅ Frontend dist root dist\'e kopyalandı');
} else {
  console.log('⚠️  Frontend dist bulunamadı');
}

// Backoffice dist'i kontrol et
if (fs.existsSync(backofficeDist)) {
  console.log('✅ Backoffice dist bulundu');
  // Backoffice için admin klasörü oluştur
  const adminDist = path.join(rootDist, 'admin');
  if (!fs.existsSync(adminDist)) {
    fs.mkdirSync(adminDist, { recursive: true });
  }
  
  // Backoffice dist içeriğini root dist/admin'e kopyala
  const backofficeFiles = fs.readdirSync(backofficeDist);
  backofficeFiles.forEach(file => {
    const srcPath = path.join(backofficeDist, file);
    const destPath = path.join(adminDist, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  console.log('✅ Backoffice dist root dist/admin\'e kopyalandı');
} else {
  console.log('⚠️  Backoffice dist bulunamadı');
}

// Recursive kopyalama fonksiyonu
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// .vercel-output dosyası oluştur (Vercel için)
const vercelOutput = path.join(rootDist, '.vercel-output');
fs.writeFileSync(vercelOutput, 'ok');
console.log('✅ .vercel-output dosyası oluşturuldu');

// Root dist'te index.html olduğundan emin ol
const indexHtml = path.join(rootDist, 'index.html');
if (!fs.existsSync(indexHtml)) {
  // Frontend'den kopyala veya placeholder oluştur
  const frontendIndex = path.join(frontendDist, 'index.html');
  if (fs.existsSync(frontendIndex)) {
    fs.copyFileSync(frontendIndex, indexHtml);
    console.log('✅ index.html frontend\'den kopyalandı');
  } else {
    fs.writeFileSync(indexHtml, '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=/"></head><body>Redirecting...</body></html>');
    console.log('✅ index.html placeholder oluşturuldu');
  }
}

console.log('✅ Build consolidation tamamlandı');
console.log(`✅ Root dist klasörü hazır: ${rootDist}`);
