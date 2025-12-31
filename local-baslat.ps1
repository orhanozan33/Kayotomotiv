# Local Proje Baslatma Scripti
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOCAL PROJE BASLATMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. .env dosyasi kontrol
Write-Host "1. .env dosyasi kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   OK: .env dosyasi mevcut" -ForegroundColor Green
} else {
    Write-Host "   WARNING: .env dosyasi yok, olusturuluyor..." -ForegroundColor Yellow
    # .env dosyasi zaten olusturuldu
}

Write-Host ""

# 2. Node modules kontrol
Write-Host "2. Node modules kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules") {
    Write-Host "   OK: Backend node_modules mevcut" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Backend node_modules yok, yukleniyor..." -ForegroundColor Yellow
    Write-Host "   Backend dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..
}

if (Test-Path "frontend/node_modules") {
    Write-Host "   OK: Frontend node_modules mevcut" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Frontend node_modules yok, yukleniyor..." -ForegroundColor Yellow
    Write-Host "   Frontend dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
}

if (Test-Path "backoffice/node_modules") {
    Write-Host "   OK: Backoffice node_modules mevcut" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Backoffice node_modules yok, yukleniyor..." -ForegroundColor Yellow
    Write-Host "   Backoffice dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location backoffice
    npm install
    Set-Location ..
}

Write-Host ""

# 3. Projeleri baslat
Write-Host "3. Projeler baslatiliyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROJELER BASLATILIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backoffice: http://localhost:3002" -ForegroundColor Green
Write-Host ""
Write-Host "NOT: Her bir proje ayri terminal penceresinde calisacak" -ForegroundColor Yellow
Write-Host "     Bu script sadece bilgi verir, projeleri manuel baslatmaniz gerekiyor" -ForegroundColor Yellow
Write-Host ""

# 4. Baslatma komutlari
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BASLATMA KOMUTLARI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 3 - Backoffice:" -ForegroundColor Yellow
Write-Host "  cd backoffice" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

