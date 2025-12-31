# Vercel Yeni Deployment Baslat
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL YENI DEPLOYMENT" -ForegroundColor Cyan
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
    Write-Host "   Proje ID: $PROJECT_ID" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Son deployment'ları listele
Write-Host "2. Son deployment'lar listeleniyor..." -ForegroundColor Yellow
try {
    $deploymentsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=5" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host ""
    Write-Host "Son 5 Deployment:" -ForegroundColor Cyan
    foreach ($deployment in $deploymentsResponse.deployments) {
        $status = $deployment.readyState
        $statusColor = switch ($status) {
            "READY" { "Green" }
            "BUILDING" { "Yellow" }
            "ERROR" { "Red" }
            default { "Gray" }
        }
        Write-Host "  - $($deployment.url) - $status - $($deployment.createdAt)" -ForegroundColor $statusColor
    }
    
    $latestDeployment = $deploymentsResponse.deployments[0]
    Write-Host ""
    Write-Host "En Son Deployment:" -ForegroundColor Cyan
    Write-Host "  URL: $($latestDeployment.url)" -ForegroundColor White
    Write-Host "  Durum: $($latestDeployment.readyState)" -ForegroundColor White
    Write-Host "  Tarih: $($latestDeployment.createdAt)" -ForegroundColor White
    
} catch {
    Write-Host "   ERROR: Deployment'lar alinamadi: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Yeni deployment baslat (GitHub'dan)
Write-Host "3. Yeni deployment baslatma..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Yeni deployment baslatmak icin:" -ForegroundColor Cyan
Write-Host "  1. GitHub'a yeni bir commit push edin" -ForegroundColor White
Write-Host "  2. Veya Vercel Dashboard'dan 'Redeploy' butonuna tiklayin" -ForegroundColor White
Write-Host ""
Write-Host "Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor Cyan
Write-Host ""

# 4. Aciklama
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ACIKLAMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "'A more recent Production Deployment has been created' hatasi:" -ForegroundColor Yellow
Write-Host "  - Bu bir hata degil, bilgilendirme mesajidir" -ForegroundColor White
Write-Host "  - Yeni bir deployment zaten olusturulmus" -ForegroundColor White
Write-Host "  - Eski deployment'i redeploy edemezsiniz" -ForegroundColor White
Write-Host ""
Write-Host "Cozum:" -ForegroundColor Yellow
Write-Host "  1. En son deployment'i kontrol edin (yukarida listelendi)" -ForegroundColor White
Write-Host "  2. Eger yeni deployment yoksa, GitHub'a commit push edin" -ForegroundColor White
Write-Host "  3. Veya Vercel Dashboard'dan 'Redeploy' butonuna tiklayin" -ForegroundColor White
Write-Host ""

