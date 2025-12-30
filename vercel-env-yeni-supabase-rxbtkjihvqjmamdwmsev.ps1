# Vercel Environment Variables - Yeni Supabase Projesi Guncelleme
# Proje ID: rxbtkjihvqjmamdwmsev
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$VERCEL_PROJECT_NAME = "kayotomotiv"

# Yeni Supabase projesi bilgileri
$NEW_DB_HOST = "db.rxbtkjihvqjmamdwmsev.supabase.co"
$NEW_DB_PORT = "6543" # Session Pooler portu (IPv4 icin)
$NEW_DB_NAME = "postgres"
$NEW_DB_USER = "postgres"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENV - YENI SUPABASE GUNCELLEME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "YENI SUPABASE PROJESI:" -ForegroundColor Yellow
Write-Host "  Proje ID: rxbtkjihvqjmamdwmsev" -ForegroundColor White
Write-Host "  Host: $NEW_DB_HOST" -ForegroundColor White
Write-Host "  Port: $NEW_DB_PORT (Session Pooler - IPv4 icin)" -ForegroundColor White
Write-Host "  Database: $NEW_DB_NAME" -ForegroundColor White
Write-Host "  User: $NEW_DB_USER" -ForegroundColor White
Write-Host ""
Write-Host "NOT: DB_PASSWORD'i Supabase Dashboard'dan almaniz gerekiyor!" -ForegroundColor Yellow
Write-Host ""

# Kullanıcıdan password al
$DB_PASSWORD = Read-Host "Supabase Database Password'u girin (veya Enter'a basin manuel eklemek icin)"

if ([string]::IsNullOrWhiteSpace($DB_PASSWORD)) {
    Write-Host ""
    Write-Host "WARNING: Password girilmedi, sadece DB_HOST ve DB_PORT guncellenecek" -ForegroundColor Yellow
    Write-Host "DB_PASSWORD'i manuel olarak Vercel Dashboard'dan ekleyin:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/orhanozan33/$VERCEL_PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
    Write-Host ""
}

# 1. Proje bul
Write-Host "1. Vercel projesi bulunuyor..." -ForegroundColor Yellow
try {
    $projectsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $project = $projectsResponse.projects | Where-Object { 
        $_.name -eq $VERCEL_PROJECT_NAME -or $_.name -like "*kayoto*" 
    } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "   ERROR: Vercel projesi bulunamadi!" -ForegroundColor Red
        exit 1
    }
    
    $VERCEL_PROJECT_ID = $project.id
    Write-Host "   OK: Vercel projesi bulundu: $($project.name)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Vercel projesi bulunamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Environment variables güncelle
Write-Host "2. Environment variables guncelleniyor..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "DB_HOST"; value = $NEW_DB_HOST },
    @{ key = "DB_PORT"; value = $NEW_DB_PORT },
    @{ key = "DB_NAME"; value = $NEW_DB_NAME },
    @{ key = "DB_USER"; value = $NEW_DB_USER }
)

if (-not [string]::IsNullOrWhiteSpace($DB_PASSWORD)) {
    $envVars += @{ key = "DB_PASSWORD"; value = $DB_PASSWORD }
}

$targets = @("production", "preview", "development")
$successCount = 0

foreach ($envVar in $envVars) {
    try {
        # Mevcut env var'ı bul ve sil
        $existingEnvs = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env" `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
            }
        
        $existingEnv = $existingEnvs.envs | Where-Object { $_.key -eq $envVar.key }
        
        if ($existingEnv) {
            # Mevcut env var'ı sil
            Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env/$($existingEnv.id)" `
                -Method DELETE `
                -Headers @{
                    "Authorization" = "Bearer $VERCEL_TOKEN"
                } | Out-Null
        }
        
        # Yeni env var ekle
        $envBody = @{
            key = $envVar.key
            value = $envVar.value
            target = $targets
            type = "encrypted"
        } | ConvertTo-Json -Depth 10
        
        Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/env" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $envBody | Out-Null
        
        Write-Host "   OK: $($envVar.key) = $($envVar.value)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   ERROR: $($envVar.key) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "   Toplam: $successCount/$($envVars.Count) guncellendi" -ForegroundColor $(if ($successCount -eq $envVars.Count) { "Green" } else { "Yellow" })

if ([string]::IsNullOrWhiteSpace($DB_PASSWORD)) {
    Write-Host ""
    Write-Host "MANUEL ADIM GEREKLI:" -ForegroundColor Yellow
    Write-Host "  DB_PASSWORD'i Vercel Dashboard'dan ekleyin:" -ForegroundColor Yellow
    Write-Host "  https://vercel.com/orhanozan33/$VERCEL_PROJECT_NAME/settings/environment-variables" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SONRAKI ADIMLAR:" -ForegroundColor Yellow
Write-Host "  1. Supabase projesi hazir olunca SQL Editor'e git:" -ForegroundColor White
Write-Host "     https://supabase.com/dashboard/project/rxbtkjihvqjmamdwmsev/sql" -ForegroundColor Cyan
Write-Host "  2. SUPABASE_PROJE_rxbtkjihvqjmamdwmsev_KURULUM.sql dosyasini calistir" -ForegroundColor White
Write-Host "  3. Supabase password'u al ve Vercel'e ekle" -ForegroundColor White
Write-Host "  4. Vercel deployment'i test et" -ForegroundColor White
Write-Host ""

