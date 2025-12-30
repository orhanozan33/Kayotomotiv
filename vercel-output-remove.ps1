# Vercel Output Directory'yi Kaldır

param(
    [string]$VercelToken = "qKXFrkCC2xoh2cBKaVG4Jvkv",
    [string]$ProjectName = "kayotomotiv"
)

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

Write-Host "Vercel Output Directory Kaldırılıyor..." -ForegroundColor Cyan
Write-Host ""

try {
    $projectsUrl = "https://api.vercel.com/v9/projects"
    $projects = Invoke-RestMethod -Uri $projectsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    $project = $projects.projects | Where-Object { $_.name -eq $ProjectName } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "❌ Proje bulunamadı" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Proje bulundu: $($project.name)" -ForegroundColor Green
    Write-Host ""
    
    # Output Directory'yi null yap (kaldır)
    $updateUrl = "https://api.vercel.com/v9/projects/$($project.id)"
    $updateBody = @{
        buildCommand = "npm run build:all"
        outputDirectory = $null
        installCommand = "npm install"
    } | ConvertTo-Json -Depth 10
    
    $result = Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateBody -ErrorAction Stop
    Write-Host "✅ Output Directory kaldırıldı (otomatik algılama)" -ForegroundColor Green
    Write-Host "   Build Command: $($result.buildCommand)" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "❌ Hata: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "   Detay: $($errorDetails.error.message)" -ForegroundColor Red
    }
}

