# Vercel Environment Variables Supabase Duzeltme
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENV VARIABLES SUPABASE DUZELTME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Proje bul
Write-Host "1. Vercel projesi bulunuyor..." -ForegroundColor Yellow
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

# 2. Mevcut environment variables kontrol
Write-Host "2. Mevcut environment variables kontrol ediliyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "MEVCUT ENVIRONMENT VARIABLES" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $dbVars = $envVars.envs | Where-Object { 
        $_.key -like "DB_*" 
    }
    
    $correctHost = "db.$SUPABASE_PROJECT_ID.supabase.co"
    
    foreach ($var in $dbVars) {
        $hasProduction = $var.target -contains "production"
        $status = if ($hasProduction) { "OK" } else { "WARNING" }
        $color = if ($hasProduction) { "Green" } else { "Yellow" }
        
        Write-Host "$($var.key):" -ForegroundColor Yellow
        Write-Host "   Value: [SET - Sifreli]" -ForegroundColor Gray
        Write-Host "   Environment: $($var.target -join ', ')" -ForegroundColor $color
        if (-not $hasProduction) {
            Write-Host "   WARNING: Production icin ayarli degil!" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "DOGRU AYARLAR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vercel Dashboard'dan kontrol edin:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "DB_HOST: $correctHost" -ForegroundColor White
    Write-Host "DB_PORT: 5432 (Direct Connection - onerilen)" -ForegroundColor White
    Write-Host "DB_NAME: postgres" -ForegroundColor White
    Write-Host "DB_USER: postgres" -ForegroundColor White
    Write-Host "DB_PASSWORD: orhanozan33" -ForegroundColor White
    Write-Host ""
    Write-Host "ONEMLI: Her bir variable'in Production, Preview, Development icin ayarli oldugundan emin olun!" -ForegroundColor Red
    Write-Host ""
    
} catch {
    Write-Host "   ERROR: Environment variables alinamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COZUM ADIMLARI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vercel Dashboard'a git:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Her bir variable'i kontrol et ve duzelt:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   DB_HOST:" -ForegroundColor Cyan
Write-Host "     - Value: $correctHost" -ForegroundColor White
Write-Host "     - Environment: Production, Preview, Development (hepsini isaretle)" -ForegroundColor White
Write-Host ""
Write-Host "   DB_PORT:" -ForegroundColor Cyan
Write-Host "     - Value: 5432 (Direct Connection)" -ForegroundColor White
Write-Host "     - Environment: Production, Preview, Development (hepsini isaretle)" -ForegroundColor White
Write-Host ""
Write-Host "   DB_NAME:" -ForegroundColor Cyan
Write-Host "     - Value: postgres" -ForegroundColor White
Write-Host "     - Environment: Production, Preview, Development (hepsini isaretle)" -ForegroundColor White
Write-Host ""
Write-Host "   DB_USER:" -ForegroundColor Cyan
Write-Host "     - Value: postgres" -ForegroundColor White
Write-Host "     - Environment: Production, Preview, Development (hepsini isaretle)" -ForegroundColor White
Write-Host ""
Write-Host "   DB_PASSWORD:" -ForegroundColor Cyan
Write-Host "     - Value: orhanozan33" -ForegroundColor White
Write-Host "     - Environment: Production, Preview, Development (hepsini isaretle)" -ForegroundColor White
Write-Host ""
Write-Host "3. Degisikliklerden sonra yeni deployment baslat:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor Cyan
Write-Host ""

