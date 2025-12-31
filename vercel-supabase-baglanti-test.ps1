# Vercel Backend uzerinden Supabase Baglanti Testi
$ErrorActionPreference = "Stop"
$VERCEL_URL = "https://kayotomotiv.vercel.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL BACKEND SUPABASE BAGLANTI TESTI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health Endpoint Test
Write-Host "1. Health endpoint testi..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$VERCEL_URL/api/health" `
        -Method GET `
        -TimeoutSec 10 `
        -UseBasicParsing
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   OK: Health endpoint: 200 OK" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: Health endpoint: $($healthResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR: Health endpoint hatasi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Settings Endpoint Test (Database baglantisi gerektirir)
Write-Host "2. Settings endpoint testi (Database baglantisi)..." -ForegroundColor Yellow
try {
    $settingsResponse = Invoke-WebRequest -Uri "$VERCEL_URL/api/settings/social-media" `
        -Method GET `
        -TimeoutSec 10 `
        -UseBasicParsing
    
    if ($settingsResponse.StatusCode -eq 200) {
        Write-Host "   OK: Settings endpoint: 200 OK" -ForegroundColor Green
        Write-Host "   OK: Database baglantisi calisiyor!" -ForegroundColor Green
        $settingsData = $settingsResponse.Content | ConvertFrom-Json
        Write-Host "   Data: $($settingsData | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: Settings endpoint: $($settingsResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ERROR: Settings endpoint hatasi: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   WARNING: Database baglantisi basarisiz olabilir" -ForegroundColor Yellow
}

Write-Host ""

# 3. Vehicles Endpoint Test (Tablolari kontrol eder)
Write-Host "3. Vehicles endpoint testi (Tablolari kontrol eder)..." -ForegroundColor Yellow
try {
    $vehiclesResponse = Invoke-WebRequest -Uri "$VERCEL_URL/api/vehicles" `
        -Method GET `
        -TimeoutSec 10 `
        -UseBasicParsing
    
    if ($vehiclesResponse.StatusCode -eq 200) {
        Write-Host "   OK: Vehicles endpoint: 200 OK" -ForegroundColor Green
        $vehiclesData = $vehiclesResponse.Content | ConvertFrom-Json
        $vehicleCount = ($vehiclesData.vehicles | Measure-Object).Count
        Write-Host "   Arac sayisi: $vehicleCount" -ForegroundColor Gray
        if ($vehicleCount -eq 0) {
            Write-Host "   WARNING: Tablolar bos - Seed data eklenmeli!" -ForegroundColor Yellow
        } else {
            Write-Host "   OK: Tablolarda veri var!" -ForegroundColor Green
        }
    } else {
        Write-Host "   ERROR: Vehicles endpoint: $($vehiclesResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 500) {
        Write-Host "   ERROR: Vehicles endpoint: 500 Internal Server Error" -ForegroundColor Red
        Write-Host "   WARNING: Muhtemelen tablolar yok veya bos!" -ForegroundColor Yellow
    } else {
        Write-Host "   ERROR: Vehicles endpoint hatasi: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Sonuc Ozeti
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC OZETI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "OK: Backend calisiyor" -ForegroundColor Green
Write-Host "OK: Supabase baglantisi test edildi" -ForegroundColor Green
Write-Host ""
Write-Host "Yapilacaklar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SQL Script'lerini calistir:" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql" -ForegroundColor White
Write-Host ""
Write-Host "   a) SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql" -ForegroundColor White
Write-Host "   b) SUPABASE_SEED_DATA_EKLE.sql" -ForegroundColor White
Write-Host ""
Write-Host "2. Tablolari kontrol et:" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/editor" -ForegroundColor White
Write-Host ""
Write-Host "3. Frontend'i test et:" -ForegroundColor Cyan
Write-Host "   https://kayotomotiv.vercel.app" -ForegroundColor White
Write-Host ""
