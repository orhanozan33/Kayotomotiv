# Hızlı Vercel Deploy Script'i (Klasör Yolundan)

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HIZLI VERCEL DEPLOY (Klasör Yolundan)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Proje dizini bulunamadi: $projectRoot" -ForegroundColor Red
    exit 1
}

Push-Location $projectRoot

Write-Host "Vercel projesi olusturuluyor..." -ForegroundColor Yellow
Write-Host ""

# Vercel deploy
$deployOutput = & vercel --prod --token $VercelToken --yes 2>&1

if ($LASTEXITCODE -eq 0) {
    $projectUrl = ($deployOutput | Select-String -Pattern "https://.*\.vercel\.app" | Select-Object -First 1).Matches.Value
    
    if ($projectUrl) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ Proje basariyla olusturuldu!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Proje URL: $projectUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "SIMDI YAPMANIZ GEREKENLER:" -ForegroundColor Yellow
        Write-Host "  1. Environment variables ekleyin:" -ForegroundColor Gray
        Write-Host "     https://vercel.com/orhanozan33-1123s-projects/kayoto/settings/environment-variables" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  2. Ekleyeceginiz degiskenler:" -ForegroundColor Gray
        Write-Host "     - DB_HOST=db.xlioxvlohlgpswhpjawa.supabase.co" -ForegroundColor White
        Write-Host "     - DB_PORT=5432" -ForegroundColor White
        Write-Host "     - DB_NAME=postgres" -ForegroundColor White
        Write-Host "     - DB_USER=postgres" -ForegroundColor White
        Write-Host "     - DB_PASSWORD=orhanozan33" -ForegroundColor White
        Write-Host "     - JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b" -ForegroundColor White
        Write-Host "     - BACKEND_PASSWORD_HASH=`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m" -ForegroundColor White
        Write-Host "     - FRONTEND_URL=$projectUrl" -ForegroundColor White
        Write-Host ""
        Write-Host "  3. Her degisken icin: Production, Preview, Development secin" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  4. Test edin:" -ForegroundColor Gray
        Write-Host "     Frontend: $projectUrl" -ForegroundColor Cyan
        Write-Host "     Backoffice: $projectUrl/admin" -ForegroundColor Cyan
        Write-Host "     Backend API: $projectUrl/api/health" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "⚠️  Proje URL bulunamadi" -ForegroundColor Yellow
        Write-Host "Output: $deployOutput" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Vercel deploy basarisiz" -ForegroundColor Red
    Write-Host "Output: $deployOutput" -ForegroundColor Red
}

Pop-Location

