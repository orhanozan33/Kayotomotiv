# Otomatik Yeniden Kurulum Script'i

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OTOMATIK YENİDEN KURULUM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bu script:" -ForegroundColor Yellow
Write-Host "  1. Vercel projelerini oluşturur" -ForegroundColor Gray
Write-Host "  2. Environment variables ekler" -ForegroundColor Gray
Write-Host "  3. Deploy eder" -ForegroundColor Gray
Write-Host ""
Write-Host "NOT: Supabase migration'larını manuel çalıştırmanız gerekecek" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Devam etmek istiyor musunuz? (E/H)"
if ($confirm -ne "E" -and $confirm -ne "e") {
    Write-Host "İşlem iptal edildi." -ForegroundColor Yellow
    exit
}

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

$projectRoot = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

# Backend Environment Variables
$backendEnvVars = @{
    "DB_HOST" = "db.xlioxvlohlgpswhpjawa.supabase.co"
    "DB_PORT" = "5432"
    "DB_NAME" = "postgres"
    "DB_USER" = "postgres"
    "DB_PASSWORD" = "orhanozan33"
    "JWT_SECRET" = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
    "BACKEND_PASSWORD_HASH" = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADIM 1: Backend Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $projectRoot "backend"
if (Test-Path $backendDir) {
    Push-Location $backendDir
    
    Write-Host "Backend deploy ediliyor..." -ForegroundColor Yellow
    $backendDeploy = & vercel --prod --token $VercelToken --yes 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $backendUrl = ($backendDeploy | Select-String -Pattern "https://backend-.*\.vercel\.app" | Select-Object -First 1).Matches.Value
        Write-Host "✅ Backend deploy edildi: $backendUrl" -ForegroundColor Green
        
        # Environment variables ekle
        Write-Host ""
        Write-Host "Environment variables ekleniyor..." -ForegroundColor Yellow
        
        foreach ($key in $backendEnvVars.Keys) {
            $value = $backendEnvVars[$key]
            $envVar = @{
                key = $key
                value = $value
                type = "encrypted"
                target = @("production", "preview", "development")
            } | ConvertTo-Json
            
            try {
                $addUrl = "https://api.vercel.com/v10/projects/backend/env"
                Invoke-RestMethod -Uri $addUrl -Method POST -Headers $headers -Body $envVar -ErrorAction Stop | Out-Null
                Write-Host "  ✅ $key eklendi" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  $key eklenemedi: $_" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "⚠️  FRONTEND_URL'yi manuel eklemeniz gerekecek (frontend ve backoffice deploy edildikten sonra)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Backend deploy başarısız" -ForegroundColor Red
    }
    
    Pop-Location
} else {
    Write-Host "❌ Backend dizini bulunamadı: $backendDir" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADIM 2: Frontend Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendDir = Join-Path $projectRoot "frontend"
if (Test-Path $frontendDir) {
    Push-Location $frontendDir
    
    Write-Host "Frontend deploy ediliyor..." -ForegroundColor Yellow
    $frontendDeploy = & vercel --prod --token $VercelToken --yes 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $frontendUrl = ($frontendDeploy | Select-String -Pattern "https://frontend-.*\.vercel\.app" | Select-Object -First 1).Matches.Value
        Write-Host "✅ Frontend deploy edildi: $frontendUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend deploy başarısız" -ForegroundColor Red
    }
    
    Pop-Location
} else {
    Write-Host "❌ Frontend dizini bulunamadı: $frontendDir" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADIM 3: Backoffice Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backofficeDir = Join-Path $projectRoot "backoffice"
if (Test-Path $backofficeDir) {
    Push-Location $backofficeDir
    
    Write-Host "Backoffice deploy ediliyor..." -ForegroundColor Yellow
    $backofficeDeploy = & vercel --prod --token $VercelToken --yes 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $backofficeUrl = ($backofficeDeploy | Select-String -Pattern "https://backoffice-.*\.vercel\.app" | Select-Object -First 1).Matches.Value
        Write-Host "✅ Backoffice deploy edildi: $backofficeUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ Backoffice deploy başarısız" -ForegroundColor Red
    }
    
    Pop-Location
} else {
    Write-Host "❌ Backoffice dizini bulunamadı: $backofficeDir" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KURULUM TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Şimdi yapmanız gerekenler:" -ForegroundColor Yellow
Write-Host "  1. ⏳ Backend FRONTEND_URL environment variable'ını güncelleyin" -ForegroundColor Gray
Write-Host "  2. ⏳ Supabase migration'larını çalıştırın (YENIDEN_KURULUM_REHBERI.md)" -ForegroundColor Gray
Write-Host "  3. ⏳ RLS'i kapatın (YENIDEN_KURULUM_REHBERI.md)" -ForegroundColor Gray
Write-Host "  4. ⏳ Test edin" -ForegroundColor Gray
Write-Host ""

