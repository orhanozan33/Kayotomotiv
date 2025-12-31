# Vercel Environment Variables Kontrol ve Duzeltme
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENV VARIABLES KONTROL" -ForegroundColor Cyan
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
    
    Write-Host "DB_HOST:" -ForegroundColor Yellow
    if ($dbHost) {
        Write-Host "   Mevcut: [SET - Sifreli]" -ForegroundColor Gray
        Write-Host "   Beklenen: db.$SUPABASE_PROJECT_ID.supabase.co" -ForegroundColor Cyan
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
    Write-Host "DOGRU AYARLAR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vercel Dashboard'dan kontrol edin:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "DB_HOST: db.$SUPABASE_PROJECT_ID.supabase.co" -ForegroundColor White
    Write-Host "DB_PORT: 6543 (Session Pooler - IPv4 icin)" -ForegroundColor White
    Write-Host "DB_NAME: postgres" -ForegroundColor White
    Write-Host "DB_USER: postgres" -ForegroundColor White
    Write-Host "DB_PASSWORD: orhanozan33" -ForegroundColor White
    Write-Host ""
    Write-Host "NOT: Eger Session Pooler calismiyorsa, port 5432 kullanin" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "   ERROR: Environment variables alinamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

