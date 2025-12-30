# Kayoto Projesini Ayaklandırma Script'i

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37",
    [string]$ProjectName = "kayoto"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KAYOTO PROJESI AYAKLANDIRILIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

# ADIM 1: Environment Variables Ekle
Write-Host "1. Environment Variables ekleniyor..." -ForegroundColor Yellow
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
    
    $envVar = @{
        key = $key
        value = $value
        type = "encrypted"
        target = @("production", "preview", "development")
    } | ConvertTo-Json
    
    try {
        $addUrl = "https://api.vercel.com/v10/projects/$ProjectName/env"
        $response = Invoke-RestMethod -Uri $addUrl -Method POST -Headers $headers -Body $envVar -ErrorAction Stop
        
        Write-Host "  ✅ $key eklendi" -ForegroundColor Green
        $successCount++
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "already exists") {
            Write-Host "  ⚠️  $key zaten mevcut" -ForegroundColor Yellow
            
            # Mevcut değişkeni güncelle
            try {
                $listUrl = "https://api.vercel.com/v10/projects/$ProjectName/env"
                $existing = Invoke-RestMethod -Uri $listUrl -Method GET -Headers $headers -ErrorAction Stop
                $existingVar = $existing.envs | Where-Object { $_.key -eq $key -and $_.target -contains "production" } | Select-Object -First 1
                
                if ($existingVar) {
                    $updateUrl = "https://api.vercel.com/v10/projects/$ProjectName/env/$($existingVar.id)"
                    $updateBody = @{
                        value = $value
                        target = @("production", "preview", "development")
                    } | ConvertTo-Json
                    
                    Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateBody -ErrorAction Stop | Out-Null
                    Write-Host "    ✅ $key güncellendi" -ForegroundColor Green
                    $successCount++
                }
            } catch {
                Write-Host "    ⚠️  $key güncellenemedi (devam ediliyor)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ❌ $key eklenemedi: $errorMessage" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "Environment Variables: $successCount başarılı, $failCount başarısız" -ForegroundColor $(if ($failCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# ADIM 2: Proje Ayarlarını Güncelle
Write-Host "2. Proje ayarları güncelleniyor..." -ForegroundColor Yellow
Write-Host ""

try {
    $updateUrl = "https://api.vercel.com/v9/projects/$ProjectName"
    $updateBody = @{
        buildCommand = "npm run build:all"
        outputDirectory = "."
        installCommand = "npm install"
        framework = $null
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateBody -ErrorAction Stop | Out-Null
    Write-Host "  ✅ Proje ayarları güncellendi" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Proje ayarları güncellenemedi: $_" -ForegroundColor Yellow
    Write-Host "     Manuel olarak Vercel Dashboard'dan güncelleyin" -ForegroundColor Yellow
}

Write-Host ""

# ADIM 3: Deployment Tetikle
Write-Host "3. Yeni deployment tetikleniyor..." -ForegroundColor Yellow
Write-Host ""

try {
    $deployUrl = "https://api.vercel.com/v13/deployments"
    $deployBody = @{
        name = $ProjectName
        gitSource = @{
            type = "github"
            repo = "orhanozan33/Kayotomotiv"
            ref = "main"
        }
    } | ConvertTo-Json
    
    $deployment = Invoke-RestMethod -Uri $deployUrl -Method POST -Headers $headers -Body $deployBody -ErrorAction Stop
    Write-Host "  ✅ Deployment tetiklendi" -ForegroundColor Green
    Write-Host "     URL: $($deployment.url)" -ForegroundColor Cyan
} catch {
    Write-Host "  ⚠️  Deployment tetiklenemedi: $_" -ForegroundColor Yellow
    Write-Host "     Manuel olarak Vercel Dashboard'dan redeploy edin" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "İŞLEM TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SIMDI YAPMANIZ GEREKENLER:" -ForegroundColor Yellow
Write-Host "  1. Vercel Dashboard'da Build ayarlarını kontrol edin:" -ForegroundColor Gray
Write-Host "     https://vercel.com/orhanozan33/kayoto/settings" -ForegroundColor Cyan
Write-Host "     - Build Command: npm run build:all" -ForegroundColor Gray
Write-Host "     - Output Directory: ." -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Deployment durumunu kontrol edin:" -ForegroundColor Gray
Write-Host "     https://vercel.com/orhanozan33/kayoto/deployments" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Test edin:" -ForegroundColor Gray
Write-Host "     Frontend: https://kayoto.vercel.app" -ForegroundColor Cyan
Write-Host "     Backoffice: https://kayoto.vercel.app/admin" -ForegroundColor Cyan
Write-Host "     Backend API: https://kayoto.vercel.app/api/health" -ForegroundColor Cyan
Write-Host ""

