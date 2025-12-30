# Vercel Deployment Kontrol
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL DEPLOYMENT KONTROL" -ForegroundColor Cyan
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

# 2. Son deployment'ları listele
Write-Host "2. Son deployment'lar kontrol ediliyor..." -ForegroundColor Yellow
try {
    $deployments = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=5" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host ""
    Write-Host "   Son 5 Deployment:" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($deployment in $deployments.deployments) {
        $status = $deployment.readyState
        $statusColor = switch ($status) {
            "READY" { "Green" }
            "BUILDING" { "Yellow" }
            "ERROR" { "Red" }
            "QUEUED" { "Yellow" }
            default { "White" }
        }
        
        $created = [DateTimeOffset]::FromUnixTimeSeconds($deployment.createdAt / 1000).LocalDateTime.ToString("yyyy-MM-dd HH:mm:ss")
        
        Write-Host "   - ID: $($deployment.uid)" -ForegroundColor White
        Write-Host "     Durum: $status" -ForegroundColor $statusColor
        Write-Host "     Tarih: $created" -ForegroundColor Gray
        Write-Host "     URL: $($deployment.url)" -ForegroundColor Cyan
        Write-Host ""
    }
    
    $latestDeployment = $deployments.deployments[0]
    $LATEST_DEPLOYMENT_ID = $latestDeployment.uid
    
    Write-Host "   En son deployment: $LATEST_DEPLOYMENT_ID" -ForegroundColor Green
    Write-Host "   Durum: $($latestDeployment.readyState)" -ForegroundColor $(if ($latestDeployment.readyState -eq "READY") { "Green" } else { "Yellow" })
    
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Build logs kontrol et
Write-Host "3. Build logs kontrol ediliyor..." -ForegroundColor Yellow
try {
    $buildLogs = Invoke-RestMethod -Uri "https://api.vercel.com/v1/deployments/$LATEST_DEPLOYMENT_ID/events" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    if ($buildLogs -and $buildLogs.Count -gt 0) {
        Write-Host "   OK: Build logs bulundu ($($buildLogs.Count) event)" -ForegroundColor Green
        Write-Host ""
        Write-Host "   Son 10 build event:" -ForegroundColor Cyan
        $buildLogs | Select-Object -Last 10 | ForEach-Object {
            $type = $_.type
            $payload = $_.payload | ConvertTo-Json -Compress
            Write-Host "   - [$type] $payload" -ForegroundColor $(if ($type -eq "error") { "Red" } else { "White" })
        }
    } else {
        Write-Host "   WARNING: Build logs bulunamadi" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: Build logs alinamadi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Runtime logs kontrol et
Write-Host "4. Runtime logs kontrol ediliyor..." -ForegroundColor Yellow
Write-Host "   NOT: Runtime logs sadece deployment hazir olduktan sonra gorunur" -ForegroundColor Gray
Write-Host "   NOT: Eger deployment BUILDING veya ERROR durumundaysa runtime logs olmaz" -ForegroundColor Gray
Write-Host ""

# 5. Deployment detayları
Write-Host "5. Deployment detaylari..." -ForegroundColor Yellow
try {
    $deploymentDetails = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments/$LATEST_DEPLOYMENT_ID" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "   Build durumu: $($deploymentDetails.builds[0].readyState)" -ForegroundColor $(if ($deploymentDetails.builds[0].readyState -eq "READY") { "Green" } else { "Yellow" })
    Write-Host "   Build hatasi: $(if ($deploymentDetails.builds[0].error) { $deploymentDetails.builds[0].error } else { 'Yok' })" -ForegroundColor $(if ($deploymentDetails.builds[0].error) { "Red" } else { "Green" })
    
} catch {
    Write-Host "   WARNING: Detaylar alinamadi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dashboard: https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor Cyan
Write-Host "Deployment: https://vercel.com/orhanozan33/$PROJECT_NAME/$LATEST_DEPLOYMENT_ID" -ForegroundColor Cyan
Write-Host ""

