# Supabase Bağlantı Doğrulama
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE BAGLANTI DOGRULAMA" -ForegroundColor Cyan
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

# 2. Environment variables kontrol
Write-Host "2. Environment variables kontrol ediliyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $dbVars = $envVars.envs | Where-Object { 
        $_.key -like "DB_*" -and $_.target -contains "production" 
    }
    
    Write-Host "   Database variables (Production):" -ForegroundColor Cyan
    $correctValues = @{
        "DB_HOST" = "db.$SUPABASE_PROJECT_ID.supabase.co"
        "DB_PORT" = "6543"
        "DB_NAME" = "postgres"
        "DB_USER" = "postgres"
    }
    
    $allCorrect = $true
    foreach ($varName in @("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD")) {
        $var = $dbVars | Where-Object { $_.key -eq $varName } | Select-Object -First 1
        
        if ($var) {
            $value = if ($var.value.Length -gt 30) { $var.value.Substring(0, 30) + "..." } else { $var.value }
            $expected = $correctValues[$varName]
            
            if ($expected) {
                if ($var.value -eq $expected) {
                    Write-Host "     ✅ $varName = $value" -ForegroundColor Green
                } else {
                    Write-Host "     ⚠️  $varName = $value (Beklenen: $expected)" -ForegroundColor Yellow
                    $allCorrect = $false
                }
            } else {
                Write-Host "     ✅ $varName = SET" -ForegroundColor Green
            }
        } else {
            Write-Host "     ❌ $varName = NOT SET" -ForegroundColor Red
            $allCorrect = $false
        }
    }
    
    Write-Host ""
    if ($allCorrect) {
        Write-Host "   ✅ Tüm database variables doğru!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Bazı variables yanlış veya eksik!" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   WARNING: Environment variables kontrol edilemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Supabase Bağlantı Bilgileri:" -ForegroundColor Yellow
Write-Host "  Host: db.$SUPABASE_PROJECT_ID.supabase.co" -ForegroundColor White
Write-Host "  Port: 6543 (Session Pooler)" -ForegroundColor White
Write-Host "  Database: postgres" -ForegroundColor White
Write-Host "  User: postgres" -ForegroundColor White
Write-Host ""
Write-Host "Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/database" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel Environment Variables:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""

