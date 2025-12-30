# Supabase Otomatik Kurulum - Service Role Key ile
$ErrorActionPreference = "Stop"

$SUPABASE_PROJECT_ID = "qttwfdsyafvifngtsxjc"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dHdmZHN5YWZ2aWZuZ3RzeGpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwODI2MywiZXhwIjoyMDgyNjg0MjYzfQ.do69xaCx0Y7bSKc5fjXESnQ-Heu_I_JOzIxttJnH9Ec"
$SUPABASE_URL = "https://$SUPABASE_PROJECT_ID.supabase.co"

$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$VERCEL_PROJECT_NAME = "kayotomotiv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE OTOMATIK KURULUM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proje ID: $SUPABASE_PROJECT_ID" -ForegroundColor Yellow
Write-Host ""

# 1. Supabase SQL script'i oku
Write-Host "1. SQL script okunuyor..." -ForegroundColor Yellow
try {
    $sqlContent = Get-Content -Path "SUPABASE_YENI_PROJE_KURULUM.sql" -Raw -Encoding UTF8
    Write-Host "   OK: SQL script okundu ($($sqlContent.Length) karakter)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: SQL script okunamadi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Supabase REST API ile SQL çalıştır
Write-Host "2. Supabase'de tablolar olusturuluyor..." -ForegroundColor Yellow
Write-Host "   NOT: Supabase REST API SQL execution desteklemiyor" -ForegroundColor Gray
Write-Host "   MANUEL ADIM GEREKLI:" -ForegroundColor Yellow
Write-Host "   1. Supabase SQL Editor'e git:" -ForegroundColor White
Write-Host "      https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql" -ForegroundColor Cyan
Write-Host "   2. SUPABASE_YENI_PROJE_KURULUM.sql dosyasini calistir" -ForegroundColor White
Write-Host ""

# 3. Supabase connection bilgilerini al
Write-Host "3. Supabase connection bilgileri aliniyor..." -ForegroundColor Yellow
try {
    # Supabase Management API ile project bilgilerini al
    $projectResponse = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
            "Content-Type" = "application/json"
        }
    
    Write-Host "   OK: Proje bilgileri alindi" -ForegroundColor Green
    Write-Host "   Proje adi: $($projectResponse.name)" -ForegroundColor Gray
    
    # Database connection bilgileri
    $DB_HOST = "db.$SUPABASE_PROJECT_ID.supabase.co"
    $DB_PORT = "6543" # Session Pooler (IPv4 icin)
    $DB_NAME = "postgres"
    $DB_USER = "postgres"
    
    Write-Host "   DB_HOST: $DB_HOST" -ForegroundColor Gray
    Write-Host "   DB_PORT: $DB_PORT (Session Pooler)" -ForegroundColor Gray
    Write-Host "   DB_NAME: $DB_NAME" -ForegroundColor Gray
    Write-Host "   DB_USER: $DB_USER" -ForegroundColor Gray
    
} catch {
    Write-Host "   WARNING: Proje bilgileri alinamadi: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Varsayilan degerler kullaniliyor..." -ForegroundColor Yellow
    
    $DB_HOST = "db.$SUPABASE_PROJECT_ID.supabase.co"
    $DB_PORT = "6543"
    $DB_NAME = "postgres"
    $DB_USER = "postgres"
}

Write-Host ""

# 4. Supabase password al (API ile alamıyoruz, kullanıcıdan isteyeceğiz)
Write-Host "4. Supabase Database Password gerekiyor..." -ForegroundColor Yellow
Write-Host "   Password'u Supabase Dashboard'dan alin:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/database" -ForegroundColor Cyan
Write-Host ""
$DB_PASSWORD = Read-Host "Database Password'u girin (veya Enter'a basin manuel eklemek icin)"

if ([string]::IsNullOrWhiteSpace($DB_PASSWORD)) {
    Write-Host "   WARNING: Password girilmedi, manuel eklemeniz gerekecek" -ForegroundColor Yellow
}

Write-Host ""

# 5. Vercel projesini bul
Write-Host "5. Vercel projesi bulunuyor..." -ForegroundColor Yellow
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

# 6. Vercel environment variables güncelle
Write-Host "6. Vercel environment variables guncelleniyor..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "DB_HOST"; value = $DB_HOST },
    @{ key = "DB_PORT"; value = $DB_PORT },
    @{ key = "DB_NAME"; value = $DB_NAME },
    @{ key = "DB_USER"; value = $DB_USER }
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
Write-Host "  1. Supabase SQL Editor'e git:" -ForegroundColor White
Write-Host "     https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql" -ForegroundColor Cyan
Write-Host "  2. SUPABASE_YENI_PROJE_KURULUM.sql dosyasini calistir" -ForegroundColor White
Write-Host "  3. Vercel deployment'i test et" -ForegroundColor White
Write-Host ""

