# Vercel'de yeni proje oluştur ve deploy et
$ErrorActionPreference = "Stop"

$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayoto"
$GIT_REPO = "orhanozan33/Kayotomotiv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL YENİ PROJE OLUŞTURULUYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Proje oluştur
Write-Host "1. Proje oluşturuluyor..." -ForegroundColor Yellow
$createProjectBody = @{
    name = $PROJECT_NAME
    gitRepository = @{
        type = "github"
        repo = $GIT_REPO
    }
    framework = "other"
    buildCommand = "npm run build:all"
    outputDirectory = "dist"
    installCommand = "npm install"
} | ConvertTo-Json -Depth 10

try {
    $createResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $createProjectBody
    
    Write-Host "✅ Proje oluşturuldu: $($createResponse.name)" -ForegroundColor Green
    $PROJECT_ID = $createResponse.id
} catch {
    Write-Host "⚠️  Proje oluşturulamadı veya zaten mevcut" -ForegroundColor Yellow
    Write-Host "   Hata: $($_.Exception.Message)" -ForegroundColor Red
    
    # Mevcut projeyi bul
    Write-Host "   Mevcut proje aranıyor..." -ForegroundColor Yellow
    $listResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $existingProject = $listResponse.projects | Where-Object { $_.name -eq $PROJECT_NAME }
    if ($existingProject) {
        $PROJECT_ID = $existingProject.id
        Write-Host "✅ Mevcut proje bulundu: $PROJECT_ID" -ForegroundColor Green
    } else {
        Write-Host "❌ Proje bulunamadı!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# 2. Environment variables ekle
Write-Host "2. Environment variables ekleniyor..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "DB_HOST"; value = "db.xlioxvlohlgpswhpjawa.supabase.co"; target = "production,preview,development" },
    @{ key = "DB_PORT"; value = "5432"; target = "production,preview,development" },
    @{ key = "DB_NAME"; value = "postgres"; target = "production,preview,development" },
    @{ key = "DB_USER"; value = "postgres"; target = "production,preview,development" },
    @{ key = "DB_PASSWORD"; value = "orhanozan33"; target = "production,preview,development" },
    @{ key = "JWT_SECRET"; value = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"; target = "production,preview,development" },
    @{ key = "BACKEND_PASSWORD_HASH"; value = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"; target = "production,preview,development" },
    @{ key = "FRONTEND_URL"; value = "https://kayoto.vercel.app,https://kayoto.vercel.app/admin"; target = "production,preview,development" }
)

foreach ($envVar in $envVars) {
    try {
        $envBody = @{
            key = $envVar.key
            value = $envVar.value
            target = $envVar.target -split ","
        } | ConvertTo-Json -Depth 10
        
        Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $envBody | Out-Null
        
        Write-Host "   ✅ $($envVar.key) eklendi" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  $($envVar.key) eklenemedi: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# 3. Deployment tetikle
Write-Host "3. Deployment tetikleniyor..." -ForegroundColor Yellow
try {
    $deployResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments?projectId=$PROJECT_ID" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "✅ Deployment başlatıldı!" -ForegroundColor Green
    Write-Host "   URL: https://$PROJECT_NAME.vercel.app" -ForegroundColor Cyan
    Write-Host "   Dashboard: https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Deployment tetiklenemedi: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Manuel olarak GitHub'dan deploy edin:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/new?import=github&repo=$GIT_REPO" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

