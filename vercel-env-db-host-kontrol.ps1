# Vercel DB_HOST Kontrol ve Düzeltme
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL DB_HOST KONTROL VE DUZELTME" -ForegroundColor Cyan
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

# 2. Mevcut DB_HOST kontrol
Write-Host "2. Mevcut DB_HOST kontrol ediliyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $dbHostVars = $envVars.envs | Where-Object { $_.key -eq "DB_HOST" }
    
    if ($dbHostVars.Count -gt 0) {
        Write-Host "   Mevcut DB_HOST variable'ları:" -ForegroundColor Cyan
        foreach ($env in $dbHostVars) {
            $value = if ($env.value.Length -gt 50) { $env.value.Substring(0, 50) + "..." } else { $env.value }
            Write-Host "     - $value (Environment: $($env.target -join ', '))" -ForegroundColor Gray
        }
    } else {
        Write-Host "   WARNING: DB_HOST variable bulunamadi!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: Environment variables kontrol edilemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Doğru DB_HOST değeri
$CORRECT_DB_HOST = "db.$SUPABASE_PROJECT_ID.supabase.co"
Write-Host "3. Doğru DB_HOST değeri:" -ForegroundColor Yellow
Write-Host "   $CORRECT_DB_HOST" -ForegroundColor Cyan

Write-Host ""

# 4. DB_HOST güncelle
Write-Host "4. DB_HOST güncelleniyor..." -ForegroundColor Yellow

$environments = @("production", "preview", "development")

foreach ($targetEnv in $environments) {
    try {
        # Önce mevcut variable'ı sil
        $existing = $envVars.envs | Where-Object { 
            $_.key -eq "DB_HOST" -and $_.target -contains $targetEnv 
        }
        
        if ($existing) {
            foreach ($e in $existing) {
                try {
                    Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($e.id)" `
                        -Method DELETE `
                        -Headers @{
                            "Authorization" = "Bearer $VERCEL_TOKEN"
                        } | Out-Null
                    Write-Host "     - Eski variable silindi ($targetEnv)" -ForegroundColor Gray
                } catch {
                    # Ignore delete errors
                }
            }
        }
        
        # Yeni variable ekle
        $body = @{
            key = "DB_HOST"
            value = $CORRECT_DB_HOST
            target = @($targetEnv)
            type = "encrypted"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $body
        
        Write-Host "   ✅ DB_HOST eklendi: $targetEnv" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Hata ($targetEnv): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ DB_HOST güncellendi!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  SONRAKI ADIM: Deployment yeniden başlatın!" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Vercel Dashboard:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor White
Write-Host ""
Write-Host "2. Son deployment'ı seç" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 'Redeploy' butonuna tıklayın" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. 2-3 dakika bekleyin" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Test edin:" -ForegroundColor Cyan
Write-Host "   https://kayotomotiv.vercel.app/api/health" -ForegroundColor White
Write-Host "   https://kayotomotiv.vercel.app/api/vehicles" -ForegroundColor White
Write-Host ""

