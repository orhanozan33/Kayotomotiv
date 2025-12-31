# Vercel DB_PASSWORD Ekle
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"
$DB_PASSWORD = "orhanozan33"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL DB_PASSWORD EKLEME" -ForegroundColor Cyan
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
    Write-Host "   OK: Proje bulundu: $($project.name) (ID: $PROJECT_ID)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Mevcut DB_PASSWORD variable'larını sil
Write-Host "2. Mevcut DB_PASSWORD variable'ları kontrol ediliyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $existingPasswordVars = $envVars.envs | Where-Object { $_.key -eq "DB_PASSWORD" }
    
    if ($existingPasswordVars.Count -gt 0) {
        Write-Host "   Mevcut DB_PASSWORD variable'ları bulundu, siliniyor..." -ForegroundColor Yellow
        foreach ($env in $existingPasswordVars) {
            try {
                Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($env.id)" `
                    -Method DELETE `
                    -Headers @{
                        "Authorization" = "Bearer $VERCEL_TOKEN"
                    } | Out-Null
                Write-Host "     - Silindi: $($env.target -join ', ')" -ForegroundColor Gray
            } catch {
                Write-Host "     - Silinemedi: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "   Mevcut DB_PASSWORD variable bulunamadi" -ForegroundColor Gray
    }
} catch {
    Write-Host "   WARNING: Mevcut variable'lar kontrol edilemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Yeni DB_PASSWORD ekle
Write-Host "3. DB_PASSWORD ekleniyor..." -ForegroundColor Yellow

$environments = @("production", "preview", "development")

foreach ($targetEnv in $environments) {
    try {
        $body = @{
            key = "DB_PASSWORD"
            value = $DB_PASSWORD
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
        
        Write-Host "   ✅ DB_PASSWORD eklendi: $targetEnv" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Hata ($targetEnv): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Son kontrol
Write-Host "4. Son kontrol..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $passwordVars = $envVars.envs | Where-Object { $_.key -eq "DB_PASSWORD" }
    
    if ($passwordVars.Count -gt 0) {
        Write-Host "   ✅ DB_PASSWORD variable'ları eklendi:" -ForegroundColor Green
        foreach ($env in $passwordVars) {
            Write-Host "     - $($env.target -join ', ')" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ DB_PASSWORD variable'ları eklenemedi!" -ForegroundColor Red
    }
} catch {
    Write-Host "   WARNING: Son kontrol yapilamadi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ DB_PASSWORD eklendi!" -ForegroundColor Green
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
Write-Host "5. Admin giriş test edin:" -ForegroundColor Cyan
Write-Host "   https://kayotomotiv.vercel.app/admin/login" -ForegroundColor White
Write-Host "   Email: admin@kayoto.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""

