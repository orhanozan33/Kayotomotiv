# GitHub Push Script'i

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GITHUB PUSH HAZIRLIGI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

if (-not (Test-Path $projectRoot)) {
    Write-Host "❌ Proje dizini bulunamadi: $projectRoot" -ForegroundColor Red
    exit 1
}

Push-Location $projectRoot

# Git repository kontrolü
if (-not (Test-Path ".git")) {
    Write-Host "Git repository olusturuluyor..." -ForegroundColor Yellow
    & git init
    Write-Host "✅ Git repository olusturuldu" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository mevcut" -ForegroundColor Green
}

Write-Host ""
Write-Host "Dosyalar ekleniyor..." -ForegroundColor Yellow

# Tüm dosyaları ekle
& git add .

Write-Host "✅ Dosyalar eklendi" -ForegroundColor Green

Write-Host ""
Write-Host "Commit yapiliyor..." -ForegroundColor Yellow

# Commit yap
& git commit -m "Initial commit - Kayoto monorepo setup" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit yapildi" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit yapilamadi (muhtemelen degisiklik yok)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GITHUB'A PUSH ETME ADIMLARI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. GitHub'da yeni repository olusturun:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor Cyan
Write-Host "   Repository adi: kayoto" -ForegroundColor Gray
Write-Host "   Public veya Private secin" -ForegroundColor Gray
Write-Host "   'Initialize this repository with a README' secmeyin" -ForegroundColor Gray
Write-Host "   'Create repository' butonuna tiklayin" -ForegroundColor Gray
Write-Host ""

Write-Host "2. GitHub repository URL'ini alin:" -ForegroundColor Yellow
Write-Host "   Ornek: https://github.com/KULLANICI_ADI/kayoto.git" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Remote repository ekleyin:" -ForegroundColor Yellow
Write-Host "   Asagidaki komutu calistirin (URL'yi kendi repository URL'inizle degistirin):" -ForegroundColor Gray
Write-Host ""
Write-Host "   git remote add origin https://github.com/KULLANICI_ADI/kayoto.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Veya otomatik push icin repository URL'ini girin:" -ForegroundColor Yellow
$repoUrl = Read-Host "GitHub repository URL (ornek: https://github.com/KULLANICI_ADI/kayoto.git)"

if ($repoUrl) {
    Write-Host ""
    Write-Host "Remote repository ekleniyor..." -ForegroundColor Yellow
    
    # Mevcut remote'u kontrol et
    $existingRemote = & git remote get-url origin 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⚠️  Remote repository zaten mevcut: $existingRemote" -ForegroundColor Yellow
        $update = Read-Host "Guncellemek istiyor musunuz? (E/H)"
        if ($update -eq "E" -or $update -eq "e") {
            & git remote set-url origin $repoUrl
            Write-Host "✅ Remote repository guncellendi" -ForegroundColor Green
        }
    } else {
        & git remote add origin $repoUrl
        Write-Host "✅ Remote repository eklendi" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Branch'i main olarak ayarliyor..." -ForegroundColor Yellow
    & git branch -M main
    
    Write-Host ""
    Write-Host "GitHub'a push ediliyor..." -ForegroundColor Yellow
    & git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ BASARILI! GitHub'a push edildi!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "SIMDI VERCEL'DEN IMPORT EDIN:" -ForegroundColor Yellow
        Write-Host "  1. https://vercel.com/new" -ForegroundColor Cyan
        Write-Host "  2. GitHub repository'nizi secin" -ForegroundColor Gray
        Write-Host "  3. Project Name: kayoto" -ForegroundColor Gray
        Write-Host "  4. Deploy edin" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Push basarisiz!" -ForegroundColor Red
        Write-Host "Manuel olarak calistirin:" -ForegroundColor Yellow
        Write-Host "  git push -u origin main" -ForegroundColor Cyan
        Write-Host ""
    }
} else {
    Write-Host "⚠️  Repository URL girilmedi, manuel olarak push edin" -ForegroundColor Yellow
}

Pop-Location

