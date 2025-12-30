# Vercel CLI ile Proje Ayarları

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37",
    [string]$ProjectName = "kayoto"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL CLI ILE AYARLAR YAPILIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Token'ı ayarla
$env:VERCEL_TOKEN = $VercelToken

# ADIM 1: Proje bilgilerini al
Write-Host "1. Proje bilgileri alınıyor..." -ForegroundColor Yellow
Write-Host ""

try {
    $projectInfo = vercel ls --token $VercelToken 2>&1
    Write-Host $projectInfo
} catch {
    Write-Host "  ⚠️  Proje listesi alınamadı: $_" -ForegroundColor Yellow
}

Write-Host ""

# ADIM 2: Environment Variables Ekle
Write-Host "2. Environment variables ekleniyor..." -ForegroundColor Yellow
Write-Host ""

$envVars = @{
    "DB_HOST" = "db.xlioxvlohlgpswhpjawa.supabase.co"
    "DB_PORT" = "5432"
    "DB_NAME" = "postgres"
    "DB_USER" = "postgres"
    "DB_PASSWORD" = "orhanozan33"
    "JWT_SECRET" = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
    "BACKEND_PASSWORD_HASH" = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"
    "FRONTEND_URL" = "https://kayoto.vercel.app"
}

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    try {
        # Vercel CLI ile env var ekle
        $result = vercel env add $key production preview development --token $VercelToken 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $key eklendi" -ForegroundColor Green
            $successCount++
        } else {
            # Manuel olarak value'yu girmek gerekebilir
            Write-Host "  ⚠️  $key için manuel giriş gerekebilir" -ForegroundColor Yellow
            Write-Host "     Komut: vercel env add $key production preview development" -ForegroundColor Gray
            Write-Host "     Value: $value" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ❌ $key eklenemedi: $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "Environment Variables: $successCount başarılı, $failCount başarısız" -ForegroundColor $(if ($failCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NOT: Vercel CLI interaktif olduğu için" -ForegroundColor Yellow
Write-Host "     Environment variables'ları manuel" -ForegroundColor Yellow
Write-Host "     olarak Vercel Dashboard'dan ekleyin" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

