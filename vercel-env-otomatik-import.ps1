# Vercel Environment Variables Otomatik Import
$ErrorActionPreference = "Stop"

$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayoto"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENV VARIABLES IMPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Proje bul
Write-Host "1. Proje bulunuyor..." -ForegroundColor Yellow
try {
    $projectsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $project = $projectsResponse.projects | Where-Object { $_.name -eq $PROJECT_NAME }
    
    if (-not $project) {
        Write-Host "❌ Proje bulunamadı: $PROJECT_NAME" -ForegroundColor Red
        Write-Host "   Önce Vercel Dashboard'dan projeyi oluşturun:" -ForegroundColor Yellow
        Write-Host "   https://vercel.com/new?import=github&repo=orhanozan33/Kayotomotiv" -ForegroundColor Cyan
        exit 1
    }
    
    $PROJECT_ID = $project.id
    Write-Host "✅ Proje bulundu: $PROJECT_ID" -ForegroundColor Green
} catch {
    Write-Host "❌ Proje bulunamadı: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Environment variables oku
Write-Host "2. Environment variables okunuyor..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "DB_HOST"; value = "db.xlioxvlohlgpswhpjawa.supabase.co" },
    @{ key = "DB_PORT"; value = "5432" },
    @{ key = "DB_NAME"; value = "postgres" },
    @{ key = "DB_USER"; value = "postgres" },
    @{ key = "DB_PASSWORD"; value = "orhanozan33" },
    @{ key = "JWT_SECRET"; value = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b" },
    @{ key = "BACKEND_PASSWORD_HASH"; value = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m" },
    @{ key = "FRONTEND_URL"; value = "https://kayoto.vercel.app,https://kayoto.vercel.app/admin" }
)

$targets = @("production", "preview", "development")

Write-Host ""

# 3. Environment variables ekle
Write-Host "3. Environment variables ekleniyor..." -ForegroundColor Yellow

$successCount = 0
$failCount = 0

foreach ($envVar in $envVars) {
    try {
        $envBody = @{
            key = $envVar.key
            value = $envVar.value
            target = $targets
            type = "encrypted"
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $envBody
        
        Write-Host "   ✅ $($envVar.key) eklendi" -ForegroundColor Green
        $successCount++
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "already exists" -or $errorMessage -match "duplicate") {
            Write-Host "   ⚠️  $($envVar.key) zaten mevcut (güncelleniyor...)" -ForegroundColor Yellow
            
            # Mevcut env var'ı sil ve yeniden ekle
            try {
                # Önce mevcut env var'ları listele
                $existingEnvs = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
                    -Method GET `
                    -Headers @{
                        "Authorization" = "Bearer $VERCEL_TOKEN"
                    }
                
                $existingEnv = $existingEnvs.envs | Where-Object { $_.key -eq $envVar.key }
                if ($existingEnv) {
                    # Mevcut env var'ı sil
                    Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($existingEnv.id)" `
                        -Method DELETE `
                        -Headers @{
                            "Authorization" = "Bearer $VERCEL_TOKEN"
                        } | Out-Null
                    
                    # Yeniden ekle
                    $envBody = @{
                        key = $envVar.key
                        value = $envVar.value
                        target = $targets
                        type = "encrypted"
                    } | ConvertTo-Json -Depth 10
                    
                    Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
                        -Method POST `
                        -Headers @{
                            "Authorization" = "Bearer $VERCEL_TOKEN"
                            "Content-Type" = "application/json"
                        } `
                        -Body $envBody | Out-Null
                    
                    Write-Host "   ✅ $($envVar.key) güncellendi" -ForegroundColor Green
                    $successCount++
                }
            } catch {
                Write-Host "   ❌ $($envVar.key) güncellenemedi: $($_.Exception.Message)" -ForegroundColor Red
                $failCount++
            }
        } else {
            Write-Host "   ❌ $($envVar.key) eklenemedi: $errorMessage" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUÇ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Başarılı: $successCount" -ForegroundColor Green
Write-Host "❌ Başarısız: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($successCount -eq $envVars.Count) {
    Write-Host "🎉 Tüm environment variables başarıyla eklendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Kontrol için:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Bazı environment variables eklenemedi." -ForegroundColor Yellow
    Write-Host "   Manuel olarak Vercel Dashboard'dan ekleyin:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
}

Write-Host ""

