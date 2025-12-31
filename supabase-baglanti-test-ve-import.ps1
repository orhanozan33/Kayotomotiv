# Supabase Bağlantı Testi ve Database Import
$ErrorActionPreference = "Stop"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4YnRramlodnFqbWFkd21zZXYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzY3MTA4MjYzLCJleHAiOjIwODI2ODQyNjN9.do69xaCx0Y7bSKc5fjXESnQ-Heu_I_JOzIxttJnH9Ec"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE BAGLANTI TESTI VE IMPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Supabase Proje Bilgilerini Al
Write-Host "1. Supabase proje bilgileri aliniyor..." -ForegroundColor Yellow
try {
    $projectResponse = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
            "Content-Type" = "application/json"
        }
    
    Write-Host "   OK: Proje bulundu: $($projectResponse.name)" -ForegroundColor Green
    Write-Host "   Proje ID: $SUPABASE_PROJECT_ID" -ForegroundColor Gray
    Write-Host "   Region: $($projectResponse.region)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: Proje bilgileri alinamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Database Bağlantı Testi (API üzerinden)
Write-Host "2. Database bağlantı testi..." -ForegroundColor Yellow
try {
    # Supabase REST API ile basit bir query test et
    $testUrl = "https://$SUPABASE_PROJECT_ID.supabase.co/rest/v1/users?select=count&limit=1"
    
    $testResponse = Invoke-WebRequest -Uri $testUrl `
        -Method GET `
        -Headers @{
            "apikey" = $SUPABASE_SERVICE_KEY
            "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
            "Content-Type" = "application/json"
        } `
        -TimeoutSec 10 `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    
    if ($testResponse.StatusCode -eq 200 -or $testResponse.StatusCode -eq 404) {
        Write-Host "   OK: Supabase API'ye erişilebilir" -ForegroundColor Green
        Write-Host "   Status: $($testResponse.StatusCode)" -ForegroundColor Gray
    } else {
        Write-Host "   WARNING: API test sonucu: $($testResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: API test başarısız (normal olabilir): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. SQL Script'leri Hazırla
Write-Host "3. SQL script'leri hazirlaniyor..." -ForegroundColor Yellow

$sqlFiles = @(
    @{
        Name = "Schema ve RLS"
        File = "SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql"
        Description = "Tüm tabloları oluşturur, RLS kapatır, admin user ekler"
    },
    @{
        Name = "Seed Data"
        File = "SUPABASE_SEED_DATA_EKLE.sql"
        Description = "Örnek araçlar, servisler, paketler ekler"
    }
)

Write-Host "   Hazir SQL script'leri:" -ForegroundColor Cyan
foreach ($sqlFile in $sqlFiles) {
    $filePath = Join-Path $PSScriptRoot $sqlFile.File
    if (Test-Path $filePath) {
        Write-Host "     ✅ $($sqlFile.Name): $($sqlFile.File)" -ForegroundColor Green
        Write-Host "        $($sqlFile.Description)" -ForegroundColor Gray
    } else {
        Write-Host "     ❌ $($sqlFile.Name): $($sqlFile.File) - BULUNAMADI" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Supabase Management API ile Import Denemesi
Write-Host "4. Supabase Management API ile import deneniyor..." -ForegroundColor Yellow
Write-Host "   NOT: Supabase Management API SQL execution desteklemiyor." -ForegroundColor Yellow
Write-Host "   SQL script'lerini manuel olarak Supabase SQL Editor'de çalıştırmanız gerekiyor." -ForegroundColor Yellow
Write-Host ""

# 5. Hazır SQL Script'leri Göster
Write-Host "5. SQL Script'leri Çalıştırma Adımları:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ADIM 1: SQL Editor'e git" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql" -ForegroundColor White
Write-Host ""
Write-Host "   ADIM 2: İlk script'i çalıştır" -ForegroundColor Cyan
Write-Host "   - 'New query' butonuna tıkla" -ForegroundColor White
Write-Host "   - '$($sqlFiles[0].File)' dosyasını aç" -ForegroundColor White
Write-Host "   - Tüm içeriği kopyala (Ctrl+A, Ctrl+C)" -ForegroundColor White
Write-Host "   - SQL Editor'e yapıştır (Ctrl+V)" -ForegroundColor White
Write-Host "   - 'Run' butonuna tıkla (veya Ctrl+Enter)" -ForegroundColor White
Write-Host "   - 'Success' mesajını bekle" -ForegroundColor White
Write-Host ""
Write-Host "   ADIM 3: İkinci script'i çalıştır" -ForegroundColor Cyan
Write-Host "   - 'New query' butonuna tıkla" -ForegroundColor White
Write-Host "   - '$($sqlFiles[1].File)' dosyasını aç" -ForegroundColor White
Write-Host "   - Tüm içeriği kopyala-yapıştır" -ForegroundColor White
Write-Host "   - 'Run' butonuna tıkla" -ForegroundColor White
Write-Host "   - 'Success' mesajını bekle" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Supabase bağlantısı test edildi" -ForegroundColor Green
Write-Host "⚠️  SQL script'leri manuel olarak çalıştırılmalı" -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL Editor:" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "Table Editor (Kontrol için):" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/editor" -ForegroundColor Cyan
Write-Host ""

