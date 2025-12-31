# Vercel Logs Kontrol - 500 Hatası
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL LOGS KONTROL - 500 HATASI" -ForegroundColor Cyan
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
    
    $project = $projectsResponse.projects | Where-Object { 
        $_.name -eq $PROJECT_NAME -or $_.name -like "*kayoto*" 
    } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "   ERROR: Proje bulunamadi!" -ForegroundColor Red
        exit 1
    }
    
    $PROJECT_ID = $project.id
    Write-Host "   OK: Proje bulundu: $($project.name)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Son deployment'ı bul
Write-Host "2. Son deployment bulunuyor..." -ForegroundColor Yellow
try {
    $deployments = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    if ($deployments.deployments.Count -eq 0) {
        Write-Host "   ERROR: Deployment bulunamadi!" -ForegroundColor Red
        exit 1
    }
    
    $latestDeployment = $deployments.deployments[0]
    $DEPLOYMENT_ID = $latestDeployment.uid
    Write-Host "   OK: Son deployment: $DEPLOYMENT_ID" -ForegroundColor Green
    Write-Host "   URL: $($latestDeployment.url)" -ForegroundColor Gray
    
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Environment variables kontrol
Write-Host "3. Environment variables kontrol ediliyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $dbVars = $envVars.envs | Where-Object { $_.key -like "DB_*" -or $_.key -eq "JWT_SECRET" }
    
    Write-Host "   Database ve JWT variables:" -ForegroundColor Cyan
    foreach ($env in $dbVars) {
        $value = if ($env.value.Length -gt 20) { $env.value.Substring(0, 20) + "..." } else { $env.value }
        $status = if ($env.value) { "✅ SET" } else { "❌ NOT SET" }
        Write-Host "     $($env.key): $status" -ForegroundColor $(if ($env.value) { "Green" } else { "Red" })
    }
    
    $requiredVars = @("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_SECRET")
    $missingVars = $requiredVars | Where-Object {
        -not ($dbVars | Where-Object { $_.key -eq $_ -and $_.target -contains "production" })
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host ""
        Write-Host "   ❌ EKSIK VARIABLES:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "     - $var" -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "   ✅ Tüm required variables mevcut" -ForegroundColor Green
    }
    
} catch {
    Write-Host "   WARNING: Environment variables kontrol edilemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Logs URL:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME/$DEPLOYMENT_ID/logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Environment Variables:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  YAPILACAKLAR:" -ForegroundColor Yellow
Write-Host "  1. Vercel logs'u kontrol edin (yukarıdaki link)" -ForegroundColor White
Write-Host "  2. Environment variables'ları kontrol edin" -ForegroundColor White
Write-Host "  3. DB_PASSWORD eklendi mi kontrol edin" -ForegroundColor White
Write-Host "  4. Supabase SQL script çalıştırıldı mı kontrol edin" -ForegroundColor White
Write-Host ""

