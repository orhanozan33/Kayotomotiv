# Vercel Output Directory Düzeltme

param(
    [string]$VercelToken = "qKXFrkCC2xoh2cBKaVG4Jvkv",
    [string]$ProjectName = "kayoto"
)

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

Write-Host "Vercel Build Ayarları Güncelleniyor..." -ForegroundColor Cyan
Write-Host ""

try {
    # Önce projeyi bul
    $projectsUrl = "https://api.vercel.com/v9/projects"
    $projects = Invoke-RestMethod -Uri $projectsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    $project = $projects.projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "❌ Proje bulunamadı" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Proje bulundu: $($project.name)" -ForegroundColor Green
    Write-Host ""
    
    # Build ayarlarını güncelle - outputDirectory'yi kaldır
    $updateUrl = "https://api.vercel.com/v9/projects/$($project.id)"
    $updateBody = @{
        buildCommand = "npm run build:all"
        outputDirectory = $null
        installCommand = "npm install"
    } | ConvertTo-Json -Depth 10
    
    $result = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateBody -ErrorAction Stop
    Write-Host "✅ Build ayarları güncellendi" -ForegroundColor Green
    Write-Host "   Build Command: $($result.buildCommand)" -ForegroundColor Gray
    Write-Host "   Output Directory: (boş - otomatik algılama)" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "❌ Hata: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "   Detay: $($errorDetails.error.message)" -ForegroundColor Red
    }
}

