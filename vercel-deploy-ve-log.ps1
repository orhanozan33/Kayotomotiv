# Vercel Deployment Tetikle ve Log'ları Çek

param(
    [string]$VercelToken = "qKXFrkCC2xoh2cBKaVG4Jvkv",
    [string]$ProjectName = "kayotomotiv"
)

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL DEPLOYMENT VE LOG KONTROL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ADIM 1: Projeyi Bul
Write-Host "1. Proje bulunuyor..." -ForegroundColor Yellow
try {
    $projectsUrl = "https://api.vercel.com/v9/projects"
    $projects = Invoke-RestMethod -Uri $projectsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    $project = $projects.projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "❌ Proje bulunamadı" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Proje bulundu: $($project.name) (ID: $($project.id))" -ForegroundColor Green
    $projectId = $project.id
} catch {
    Write-Host "❌ Hata: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ADIM 2: Son Deployment'ı Bul
Write-Host "2. Son deployment bulunuyor..." -ForegroundColor Yellow
try {
    $deploymentsUrl = "https://api.vercel.com/v6/deployments?projectId=$projectId&limit=1"
    $deployments = Invoke-RestMethod -Uri $deploymentsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    if ($deployments.deployments.Count -eq 0) {
        Write-Host "⚠️  Deployment bulunamadı, yeni deployment oluşturuluyor..." -ForegroundColor Yellow
        
        # Yeni deployment oluştur
        $createDeployUrl = "https://api.vercel.com/v13/deployments"
        $createDeployBody = @{
            name = $ProjectName
            project = $projectId
        } | ConvertTo-Json
        
        $newDeployment = Invoke-RestMethod -Uri $createDeployUrl -Method POST -Headers $headers -Body $createDeployBody -ErrorAction Stop
        $deploymentId = $newDeployment.id
        Write-Host "✅ Yeni deployment oluşturuldu: $deploymentId" -ForegroundColor Green
    } else {
        $deployment = $deployments.deployments[0]
        $deploymentId = $deployment.id
        Write-Host "✅ Son deployment bulundu: $deploymentId" -ForegroundColor Green
        Write-Host "   URL: $($deployment.url)" -ForegroundColor Gray
        Write-Host "   Durum: $($deployment.readyState)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Deployment hatası: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "   Detay: $($errorDetails.error.message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""

# ADIM 3: Build Log'larını Çek
Write-Host "3. Build log'ları çekiliyor..." -ForegroundColor Yellow
try {
    $logsUrl = "https://api.vercel.com/v2/deployments/$deploymentId/events"
    $logs = Invoke-RestMethod -Uri $logsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    if ($logs.length -eq 0) {
        Write-Host "⚠️  Log bulunamadı, build henüz başlamamış olabilir" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Log'lar bulundu ($($logs.length) adet):" -ForegroundColor Green
        Write-Host ""
        foreach ($log in $logs) {
            $type = $log.type
            $payload = $log.payload
            if ($payload.text) {
                Write-Host $payload.text -ForegroundColor $(if ($type -eq 'command' -or $type -eq 'stdout') { "White" } elseif ($type -eq 'stderr') { "Red" } else { "Gray" })
            }
        }
    }
} catch {
    Write-Host "⚠️  Log çekilemedi: $_" -ForegroundColor Yellow
    Write-Host "   Alternatif: Vercel Dashboard'dan log'ları kontrol edin" -ForegroundColor Yellow
}

Write-Host ""

# ADIM 4: Build Ayarlarını Kontrol Et
Write-Host "4. Build ayarları kontrol ediliyor..." -ForegroundColor Yellow
try {
    $projectUrl = "https://api.vercel.com/v9/projects/$projectId"
    $projectDetails = Invoke-RestMethod -Uri $projectUrl -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "   Build Command: $($projectDetails.buildCommand)" -ForegroundColor Gray
    Write-Host "   Output Directory: $($projectDetails.outputDirectory)" -ForegroundColor Gray
    Write-Host "   Install Command: $($projectDetails.installCommand)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Build ayarları çekilemedi: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KONTROL TAMAMLANDI" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment URL:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/$ProjectName/deployments" -ForegroundColor Cyan
Write-Host ""

