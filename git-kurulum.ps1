# Git Repository Kurulum Script'i

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GIT REPOSITORY KURULUM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Proje dizini bulunamadi: $projectRoot" -ForegroundColor Red
    exit 1
}

Push-Location $projectRoot

Write-Host "Git repository kontrol ediliyor..." -ForegroundColor Yellow

# Git repository var mı kontrol et
if (Test-Path ".git") {
    Write-Host "✅ Git repository zaten mevcut" -ForegroundColor Green
    Write-Host ""
    Write-Host "Remote repository kontrol ediliyor..." -ForegroundColor Yellow
    
    $remoteUrl = & git remote get-url origin 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Remote repository: $remoteUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "SIMDI YAPMANIZ GEREKENLER:" -ForegroundColor Yellow
        Write-Host "  1. Değişiklikleri commit edin:" -ForegroundColor Gray
        Write-Host "     git add ." -ForegroundColor Cyan
        Write-Host "     git commit -m 'Monorepo yapılandırması'" -ForegroundColor Cyan
        Write-Host "     git push" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  2. Vercel Dashboard'dan import edin:" -ForegroundColor Gray
        Write-Host "     https://vercel.com/new" -ForegroundColor Cyan
        Write-Host "     Repository'nizi seçin ve import edin" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Remote repository bulunamadi" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Remote repository eklemek icin:" -ForegroundColor Yellow
        Write-Host "  git remote add origin https://github.com/KULLANICI_ADI/kayoto.git" -ForegroundColor Cyan
        Write-Host "  git push -u origin main" -ForegroundColor Cyan
    }
} else {
    Write-Host "⚠️  Git repository bulunamadi" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Git repository olusturuluyor..." -ForegroundColor Yellow
    
    & git init
    & git add .
    & git commit -m "Initial commit - Kayoto monorepo"
    
    Write-Host "✅ Git repository olusturuldu" -ForegroundColor Green
    Write-Host ""
    Write-Host "SIMDI YAPMANIZ GEREKENLER:" -ForegroundColor Yellow
    Write-Host "  1. GitHub'da yeni repository olusturun:" -ForegroundColor Gray
    Write-Host "     https://github.com/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  2. Remote repository ekleyin:" -ForegroundColor Gray
    Write-Host "     git remote add origin https://github.com/KULLANICI_ADI/kayoto.git" -ForegroundColor Cyan
    Write-Host "     git branch -M main" -ForegroundColor Cyan
    Write-Host "     git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  3. Vercel Dashboard'dan import edin:" -ForegroundColor Gray
    Write-Host "     https://vercel.com/new" -ForegroundColor Cyan
    Write-Host "     Repository'nizi seçin ve import edin" -ForegroundColor Gray
}

Pop-Location

