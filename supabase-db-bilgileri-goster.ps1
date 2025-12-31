# Supabase Database Bilgilerini Göster
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE DATABASE BILGILERI" -ForegroundColor Cyan
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
Write-Host "2. Environment variables aliniyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $dbVars = $envVars.envs | Where-Object { 
        $_.key -like "DB_*" -and $_.target -contains "production" 
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "SUPABASE DATABASE BILGILERI" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $dbHost = $dbVars | Where-Object { $_.key -eq "DB_HOST" } | Select-Object -First 1
    $dbPort = $dbVars | Where-Object { $_.key -eq "DB_PORT" } | Select-Object -First 1
    $dbName = $dbVars | Where-Object { $_.key -eq "DB_NAME" } | Select-Object -First 1
    $dbUser = $dbVars | Where-Object { $_.key -eq "DB_USER" } | Select-Object -First 1
    $dbPassword = $dbVars | Where-Object { $_.key -eq "DB_PASSWORD" } | Select-Object -First 1
    
    if ($dbHost) {
        Write-Host "✅ DB_HOST:" -ForegroundColor Green
        Write-Host "   $($dbHost.value)" -ForegroundColor White
        Write-Host "   Environment: $($dbHost.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ DB_HOST: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    if ($dbPort) {
        Write-Host "✅ DB_PORT:" -ForegroundColor Green
        Write-Host "   $($dbPort.value)" -ForegroundColor White
        Write-Host "   Environment: $($dbPort.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ DB_PORT: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    if ($dbName) {
        Write-Host "✅ DB_NAME:" -ForegroundColor Green
        Write-Host "   $($dbName.value)" -ForegroundColor White
        Write-Host "   Environment: $($dbName.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ DB_NAME: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    if ($dbUser) {
        Write-Host "✅ DB_USER:" -ForegroundColor Green
        Write-Host "   $($dbUser.value)" -ForegroundColor White
        Write-Host "   Environment: $($dbUser.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ DB_USER: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    
    if ($dbPassword) {
        Write-Host "✅ DB_PASSWORD:" -ForegroundColor Green
        Write-Host "   [SET - Gizli]" -ForegroundColor White
        Write-Host "   Environment: $($dbPassword.target -join ', ')" -ForegroundColor Gray
    } else {
        Write-Host "❌ DB_PASSWORD: NOT SET" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "CONNECTION STRING" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($dbHost -and $dbPort -and $dbName -and $dbUser -and $dbPassword) {
        $connectionString = "postgresql://$($dbUser.value):[PASSWORD]@$($dbHost.value):$($dbPort.value)/$($dbName.value)"
        Write-Host "Connection String:" -ForegroundColor Yellow
        Write-Host "  $connectionString" -ForegroundColor White
        Write-Host ""
        Write-Host "Supabase Proje ID:" -ForegroundColor Yellow
        Write-Host "  $SUPABASE_PROJECT_ID" -ForegroundColor White
    } else {
        Write-Host "⚠️  Eksik environment variables var, connection string oluşturulamadı" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "SUPABASE DASHBOARD" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Proje Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Database Settings:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/database" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Table Editor:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/editor" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "SQL Editor:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "VERCEL DASHBOARD" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Environment Variables:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "   ERROR: Environment variables alinamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

