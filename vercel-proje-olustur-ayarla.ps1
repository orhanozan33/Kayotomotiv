# Vercel Projesi Oluştur ve Ayarla

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37",
    [string]$ProjectName = "kayoto"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL PROJESI OLUSTURULUYOR/AYARLANIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

# ADIM 1: Projeyi Bul veya Oluştur
Write-Host "1. Proje kontrol ediliyor..." -ForegroundColor Yellow
Write-Host ""

$projectId = $null

try {
    # Önce personal account'ta ara
    $projectsUrl = "https://api.vercel.com/v9/projects"
    $projects = Invoke-RestMethod -Uri $projectsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    $project = $projects.projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1
    
    if ($project) {
        Write-Host "  ✅ Proje bulundu: $($project.name) (ID: $($project.id))" -ForegroundColor Green
        $projectId = $project.id
    } else {
        Write-Host "  ⚠️  Proje bulunamadı, oluşturuluyor..." -ForegroundColor Yellow
        
        # Proje oluştur
        $createBody = @{
            name = $ProjectName
            gitRepository = @{
                type = "github"
                repo = "orhanozan33/Kayotomotiv"
            }
        } | ConvertTo-Json
        
        $newProject = Invoke-RestMethod -Uri $projectsUrl -Method POST -Headers $headers -Body $createBody -ErrorAction Stop
        Write-Host "  ✅ Proje oluşturuldu: $($newProject.name) (ID: $($newProject.id))" -ForegroundColor Green
        $projectId = $newProject.id
    }
} catch {
    Write-Host "  ❌ Proje işlemi başarısız: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "     Hata: $($errorDetails.error.message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ADIM 2: Build Ayarlarını Güncelle
Write-Host "2. Build ayarları güncelleniyor..." -ForegroundColor Yellow
Write-Host ""

try {
    $updateUrl = "https://api.vercel.com/v9/projects/$projectId"
    $updateBody = @{
        buildCommand = "npm run build:all"
        outputDirectory = "."
        installCommand = "npm install"
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateBody -ErrorAction Stop
    Write-Host "  ✅ Build ayarları güncellendi" -ForegroundColor Green
    Write-Host "     Build Command: npm run build:all" -ForegroundColor Gray
    Write-Host "     Output Directory: ." -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️  Build ayarları güncellenemedi: $_" -ForegroundColor Yellow
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "     Hata: $($errorDetails.error.message)" -ForegroundColor Red
    }
}

Write-Host ""

# ADIM 3: Mevcut Environment Variables'ları Listele
Write-Host "3. Mevcut environment variables kontrol ediliyor..." -ForegroundColor Yellow
Write-Host ""

try {
    $envListUrl = "https://api.vercel.com/v10/projects/$projectId/env"
    $existingEnvs = Invoke-RestMethod -Uri $envListUrl -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "  Mevcut değişkenler: $($existingEnvs.envs.Count) adet" -ForegroundColor Gray
} catch {
    Write-Host "  ⚠️  Mevcut değişkenler listelenemedi: $_" -ForegroundColor Yellow
    $existingEnvs = @{ envs = @() }
}

Write-Host ""

# ADIM 4: Environment Variables Ekle/Güncelle
Write-Host "4. Environment variables ekleniyor/güncelleniyor..." -ForegroundColor Yellow
Write-Host ""

$envVars = @{
    "DB_HOST" = "db.xlioxvlohlgpswhpjawa.supabase.co"
    "DB_PORT" = "5432"
    "DB_NAME" = "postgres"
    "DB_USER" = "postgres"
    "DB_PASSWORD" = "orhanozan33"
    "JWT_SECRET" = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
    "BACKEND_PASSWORD_HASH" = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"
    "FRONTEND_URL" = "https://kayoto.vercel.app"
}

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    # Mevcut değişkeni kontrol et
    $existingVar = $existingEnvs.envs | Where-Object { 
        $_.key -eq $key
    } | Select-Object -First 1
    
    if ($existingVar) {
        # Güncelle
        try {
            $updateEnvUrl = "https://api.vercel.com/v10/projects/$projectId/env/$($existingVar.id)"
            $updateEnvBody = @{
                value = $value
                target = @("production", "preview", "development")
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $updateEnvUrl -Method PATCH -Headers $headers -Body $updateEnvBody -ErrorAction Stop | Out-Null
            Write-Host "  ✅ $key güncellendi" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ❌ $key güncellenemedi: $_" -ForegroundColor Red
            $failCount++
        }
    } else {
        # Yeni ekle
        try {
            $addEnvUrl = "https://api.vercel.com/v10/projects/$projectId/env"
            $addEnvBody = @{
                key = $key
                value = $value
                type = "encrypted"
                target = @("production", "preview", "development")
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $addEnvUrl -Method POST -Headers $headers -Body $addEnvBody -ErrorAction Stop | Out-Null
            Write-Host "  ✅ $key eklendi" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  ❌ $key eklenemedi: $_" -ForegroundColor Red
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($errorDetails) {
                Write-Host "     Hata: $($errorDetails.error.message)" -ForegroundColor Red
            }
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "Environment Variables: $successCount başarılı, $failCount başarısız" -ForegroundColor $(if ($failCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "İŞLEM TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment durumunu kontrol edin:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/$ProjectName/deployments" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test edin:" -ForegroundColor Yellow
Write-Host "  Frontend: https://$ProjectName.vercel.app" -ForegroundColor Cyan
Write-Host "  Backoffice: https://$ProjectName.vercel.app/admin" -ForegroundColor Cyan
Write-Host "  Backend API: https://$ProjectName.vercel.app/api/health" -ForegroundColor Cyan
Write-Host ""

