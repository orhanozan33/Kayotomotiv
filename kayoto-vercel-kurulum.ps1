# Kayoto Vercel Monorepo Kurulum Script'i

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KAYOTO VERCEL MONOREPO KURULUM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Proje dizini bulunamadi: $projectRoot" -ForegroundColor Red
    exit 1
}

Push-Location $projectRoot

Write-Host "1. Vercel projesi olusturuluyor..." -ForegroundColor Yellow
Write-Host ""

# Vercel projesi oluştur
$deployOutput = & vercel --prod --token $VercelToken --yes 2>&1

if ($LASTEXITCODE -eq 0) {
    $projectUrl = ($deployOutput | Select-String -Pattern "https://.*\.vercel\.app" | Select-Object -First 1).Matches.Value
    
    if ($projectUrl) {
        Write-Host "✅ Proje olusturuldu: $projectUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "2. Environment variables ekleniyor..." -ForegroundColor Yellow
        
        # Environment variables ekle
        $headers = @{
            "Authorization" = "Bearer $VercelToken"
            "Content-Type" = "application/json"
        }
        
        $envVars = @{
            "DB_HOST" = "db.xlioxvlohlgpswhpjawa.supabase.co"
            "DB_PORT" = "5432"
            "DB_NAME" = "postgres"
            "DB_USER" = "postgres"
            "DB_PASSWORD" = "orhanozan33"
            "JWT_SECRET" = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
            "BACKEND_PASSWORD_HASH" = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"
            "FRONTEND_URL" = $projectUrl
        }
        
        # Proje ID'sini al
        $projectName = "kayoto"
        $projectUrl = "https://api.vercel.com/v9/projects/$projectName"
        
        foreach ($key in $envVars.Keys) {
            $value = $envVars[$key]
            $envVar = @{
                key = $key
                value = $value
                type = "encrypted"
                target = @("production", "preview", "development")
            } | ConvertTo-Json
            
            try {
                $addUrl = "https://api.vercel.com/v10/projects/$projectName/env"
                Invoke-RestMethod -Uri $addUrl -Method POST -Headers $headers -Body $envVar -ErrorAction Stop | Out-Null
                Write-Host "  ✅ $key eklendi" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  $key eklenemedi: $_" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Kurulum tamamlandi!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Proje URL:" -ForegroundColor Yellow
        Write-Host "  Frontend: $projectUrl" -ForegroundColor Cyan
        Write-Host "  Backoffice: $projectUrl/admin" -ForegroundColor Cyan
        Write-Host "  Backend API: $projectUrl/api" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "⚠️  Proje URL bulunamadi" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Vercel deploy basarisiz" -ForegroundColor Red
    Write-Host "Output: $deployOutput" -ForegroundColor Red
}

Pop-Location

