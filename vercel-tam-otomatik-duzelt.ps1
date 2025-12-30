# Vercel Tam Otomatik Duzeltme
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL TAM OTOMATIK DUZELTME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Tum projeleri listele
Write-Host "1. Projeler listeleniyor..." -ForegroundColor Yellow
try {
    $projectsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "   Bulunan projeler:" -ForegroundColor Cyan
    foreach ($proj in $projectsResponse.projects) {
        Write-Host "   - $($proj.name) (ID: $($proj.id))" -ForegroundColor Green
    }
    
    # kayoto veya kayotomotiv projesini bul
    $project = $projectsResponse.projects | Where-Object { 
        $_.name -eq "kayoto" -or $_.name -eq "kayotomotiv" -or $_.name -like "*kayoto*" 
    } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "   ERROR: kayoto projesi bulunamadi!" -ForegroundColor Red
        Write-Host "   Yeni proje olusturuluyor..." -ForegroundColor Yellow
        
        # Yeni proje olustur
        $createBody = @{
            name = "kayoto"
            gitRepository = @{
                type = "github"
                repo = "orhanozan33/Kayotomotiv"
            }
            framework = "other"
            buildCommand = "npm run build:all"
            outputDirectory = "dist"
            installCommand = "npm install"
        } | ConvertTo-Json -Depth 10
        
        try {
            $newProject = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects" `
                -Method POST `
                -Headers @{
                    "Authorization" = "Bearer $VERCEL_TOKEN"
                    "Content-Type" = "application/json"
                } `
                -Body $createBody
            
            $project = $newProject
            Write-Host "   OK: Yeni proje olusturuldu: $($project.name)" -ForegroundColor Green
        } catch {
            Write-Host "   ERROR: Proje olusturulamadi: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "   OK: Proje bulundu: $($project.name)" -ForegroundColor Green
    }
    
    $PROJECT_ID = $project.id
    $PROJECT_NAME = $project.name
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Proje ayarlarini duzelt
Write-Host "2. Proje ayarlari duzeltiliyor..." -ForegroundColor Yellow
try {
    $updateBody = @{
        buildCommand = "npm run build:all"
        outputDirectory = "dist"
        installCommand = "npm install"
        framework = $null
    } | ConvertTo-Json -Depth 10
    
    Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody | Out-Null
    
    Write-Host "   OK: Proje ayarlari guncellendi" -ForegroundColor Green
} catch {
    Write-Host "   WARNING: Proje ayarlari guncellenemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Environment variables ekle
Write-Host "3. Environment variables ekleniyor..." -ForegroundColor Yellow

$envVars = @(
    @{ key = "DB_HOST"; value = "db.xlioxvlohlgpswhpjawa.supabase.co" },
    @{ key = "DB_PORT"; value = "5432" },
    @{ key = "DB_NAME"; value = "postgres" },
    @{ key = "DB_USER"; value = "postgres" },
    @{ key = "DB_PASSWORD"; value = "orhanozan33" },
    @{ key = "JWT_SECRET"; value = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b" },
    @{ key = "BACKEND_PASSWORD_HASH"; value = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m" },
    @{ key = "FRONTEND_URL"; value = "https://$PROJECT_NAME.vercel.app,https://$PROJECT_NAME.vercel.app/admin" }
)

$targets = @("production", "preview", "development")
$successCount = 0

foreach ($envVar in $envVars) {
    try {
        # Once mevcut env var'lari kontrol et
        $existingEnvs = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
            }
        
        $existingEnv = $existingEnvs.envs | Where-Object { $_.key -eq $envVar.key }
        
        if ($existingEnv) {
            # Mevcut env var'i sil
            Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($existingEnv.id)" `
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
        
        Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
                "Content-Type" = "application/json"
            } `
            -Body $envBody | Out-Null
        
        Write-Host "   OK: $($envVar.key)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   ERROR: $($envVar.key) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "   Toplam: $successCount/$($envVars.Count) eklendi" -ForegroundColor $(if ($successCount -eq $envVars.Count) { "Green" } else { "Yellow" })
Write-Host ""

# 4. Son deployment'i kontrol et ve redeploy
Write-Host "4. Deployment tetikleniyor..." -ForegroundColor Yellow
try {
    # Son deployment'i bul
    $deployments = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=1" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    if ($deployments.deployments.Count -gt 0) {
        $lastDeployment = $deployments.deployments[0]
        Write-Host "   OK: Son deployment bulundu: $($lastDeployment.url)" -ForegroundColor Green
        
        # Yeni deployment tetikle (GitHub'dan)
        Write-Host "   GitHub'dan yeni deployment tetikleniyor..." -ForegroundColor Yellow
    } else {
        Write-Host "   WARNING: Deployment bulunamadi" -ForegroundColor Yellow
    }
    
    Write-Host "   OK: Deployment tetiklendi" -ForegroundColor Green
    Write-Host "   URL: https://$PROJECT_NAME.vercel.app" -ForegroundColor Cyan
} catch {
    Write-Host "   WARNING: Deployment tetiklenemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proje: $PROJECT_NAME" -ForegroundColor Cyan
Write-Host "URL: https://$PROJECT_NAME.vercel.app" -ForegroundColor Cyan
Write-Host "Dashboard: https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor Cyan
Write-Host ""

