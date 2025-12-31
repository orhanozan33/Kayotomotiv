# Local Proje Baslatma - Tum Projeleri Baslat
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LOCAL PROJE BASLATMA - TUM PROJELER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. .env dosyasi kontrol
Write-Host "1. .env dosyasi kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   OK: .env dosyasi mevcut" -ForegroundColor Green
} else {
    Write-Host "   ERROR: .env dosyasi yok!" -ForegroundColor Red
    Write-Host "   .env dosyasi olusturulmali!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Dependencies kontrol ve yukleme
Write-Host "2. Dependencies kontrol ediliyor..." -ForegroundColor Yellow

# Backend
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "   Backend dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..
}

# Frontend
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "   Frontend dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
}

# Backoffice
if (-not (Test-Path "backoffice/node_modules")) {
    Write-Host "   Backoffice dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location backoffice
    npm install
    Set-Location ..
}

Write-Host "   OK: Dependencies hazir" -ForegroundColor Green
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

# Backend baslat (arka planda)
Write-Host "Backend baslatiliyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"
Start-Sleep -Seconds 3

# Frontend baslat (arka planda)
Write-Host "Frontend baslatiliyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"
Start-Sleep -Seconds 3

# Backoffice baslat (arka planda)
Write-Host "Backoffice baslatiliyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backoffice'; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TUM PROJELER BASLATILDI!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backoffice: http://localhost:3002" -ForegroundColor Green
Write-Host ""
Write-Host "Her proje ayri bir terminal penceresinde calisiyor" -ForegroundColor Yellow
Write-Host ""

