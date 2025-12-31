# Projeyi Yeniden Baslat
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PROJE YENIDEN BASLATMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. .env dosyasi kontrol
Write-Host "1. .env dosyasi kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   OK: .env dosyasi mevcut" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "DB_NAME=postgres") {
        Write-Host "   OK: DB_NAME=postgres (Supabase)" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: DB_NAME kontrol edilmeli!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERROR: .env dosyasi yok!" -ForegroundColor Red
    Write-Host "   env-guncelle-supabase.ps1 scriptini calistirin!" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Calisan process'leri durdur
Write-Host "2. Calisan process'ler kontrol ediliyor..." -ForegroundColor Yellow

# Backend (port 3001)
$backendProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backendProcess) {
    Write-Host "   Backend process bulundu, durduruluyor..." -ForegroundColor Yellow
    $pid = ($backendProcess | Select-Object -First 1).OwningProcess
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Frontend (port 3000)
$frontendProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontendProcess) {
    Write-Host "   Frontend process bulundu, durduruluyor..." -ForegroundColor Yellow
    $pid = ($frontendProcess | Select-Object -First 1).OwningProcess
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Backoffice (port 3002)
$backofficeProcess = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
if ($backofficeProcess) {
    Write-Host "   Backoffice process bulundu, durduruluyor..." -ForegroundColor Yellow
    $pid = ($backofficeProcess | Select-Object -First 1).OwningProcess
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host "   OK: Process'ler temizlendi" -ForegroundColor Green
Write-Host ""

# 3. Dependencies kontrol
Write-Host "3. Dependencies kontrol ediliyor..." -ForegroundColor Yellow

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "   Backend dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "   Frontend dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
}

if (-not (Test-Path "backoffice/node_modules")) {
    Write-Host "   Backoffice dependencies yukleniyor..." -ForegroundColor Cyan
    Set-Location backoffice
    npm install
    Set-Location ..
}

Write-Host "   OK: Dependencies hazir" -ForegroundColor Green
Write-Host ""

# 4. Projeleri baslat
Write-Host "4. Projeler baslatiliyor..." -ForegroundColor Yellow
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
$backendScript = @"
cd '$PWD\backend'
`$env:NODE_ENV='development'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
Start-Sleep -Seconds 3

# Frontend baslat (arka planda)
Write-Host "Frontend baslatiliyor..." -ForegroundColor Cyan
$frontendScript = @"
cd '$PWD\frontend'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
Start-Sleep -Seconds 3

# Backoffice baslat (arka planda)
Write-Host "Backoffice baslatiliyor..." -ForegroundColor Cyan
$backofficeScript = @"
cd '$PWD\backoffice'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backofficeScript
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
Write-Host "Supabase database kullaniliyor (postgres)" -ForegroundColor Green
Write-Host ""

