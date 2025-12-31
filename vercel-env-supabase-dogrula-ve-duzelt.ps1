# Vercel Environment Variables Dogrulama ve Duzeltme
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENV VARIABLES DOGRULAMA" -ForegroundColor Cyan
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

# 2. Environment variables al
Write-Host "2. Environment variables kontrol ediliyor..." -ForegroundColor Yellow
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
        $_.key -like "DB_*" -and $_.target -contains "production" 
    }
    
    $dbHost = $dbVars | Where-Object { $_.key -eq "DB_HOST" } | Select-Object -First 1
    $dbPort = $dbVars | Where-Object { $_.key -eq "DB_PORT" } | Select-Object -First 1
    $dbName = $dbVars | Where-Object { $_.key -eq "DB_NAME" } | Select-Object -First 1
    $dbUser = $dbVars | Where-Object { $_.key -eq "DB_USER" } | Select-Object -First 1
    $dbPassword = $dbVars | Where-Object { $_.key -eq "DB_PASSWORD" } | Select-Object -First 1
    
    $correctHost = "db.$SUPABASE_PROJECT_ID.supabase.co"
    
    Write-Host "DB_HOST:" -ForegroundColor Yellow
    if ($dbHost) {
        Write-Host "   Mevcut: [SET - Sifreli]" -ForegroundColor Gray
        Write-Host "   Beklenen: $correctHost" -ForegroundColor Cyan
        if ($dbHost.value -ne $correctHost) {
            Write-Host "   WARNING: DB_HOST yanlis olabilir!" -ForegroundColor Red
        }
        Write-Host "   Environment: $($dbHost.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    Write-Host "DB_PORT:" -ForegroundColor Yellow
    if ($dbPort) {
        Write-Host "   Mevcut: [SET - Sifreli]" -ForegroundColor Gray
        Write-Host "   Beklenen: 6543 (Session Pooler) veya 5432 (Direct)" -ForegroundColor Cyan
        Write-Host "   Environment: $($dbPort.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    Write-Host "DB_NAME:" -ForegroundColor Yellow
    if ($dbName) {
        Write-Host "   Mevcut: [SET - Sifreli]" -ForegroundColor Gray
        Write-Host "   Beklenen: postgres" -ForegroundColor Cyan
        Write-Host "   Environment: $($dbName.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    Write-Host "DB_USER:" -ForegroundColor Yellow
    if ($dbUser) {
        Write-Host "   Mevcut: [SET - Sifreli]" -ForegroundColor Gray
        Write-Host "   Beklenen: postgres" -ForegroundColor Cyan
        Write-Host "   Environment: $($dbUser.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    Write-Host "DB_PASSWORD:" -ForegroundColor Yellow
    if ($dbPassword) {
        Write-Host "   Mevcut: [SET - Gizli]" -ForegroundColor Gray
        Write-Host "   Beklenen: orhanozan33" -ForegroundColor Cyan
        Write-Host "   Environment: $($dbPassword.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "   ERROR: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "COZUM ADIMLARI" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Vercel Dashboard'a git:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. DB_HOST'i kontrol et ve guncelle:" -ForegroundColor Yellow
    Write-Host "   Key: DB_HOST" -ForegroundColor White
    Write-Host "   Value: $correctHost" -ForegroundColor White
    Write-Host "   Environment: Production, Preview, Development" -ForegroundColor White
    Write-Host ""
    Write-Host "3. DB_PORT'u kontrol et:" -ForegroundColor Yellow
    Write-Host "   Key: DB_PORT" -ForegroundColor White
    Write-Host "   Value: 6543 (Session Pooler) veya 5432 (Direct)" -ForegroundColor White
    Write-Host "   Environment: Production, Preview, Development" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Tüm environment variables'ları Production, Preview, Development için ayarla!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. Redeploy yap:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "   ERROR: Environment variables alinamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

