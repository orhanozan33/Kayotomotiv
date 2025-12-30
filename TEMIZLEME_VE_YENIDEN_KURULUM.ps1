# Temizleme ve Yeniden Kurulum Ana Script'i

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEMİZLEME VE YENİDEN KURULUM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bu script şunları yapacak:" -ForegroundColor Yellow
Write-Host "  1. Vercel projelerini silme script'ini çalıştırır" -ForegroundColor Gray
Write-Host "  2. Supabase temizleme SQL'ini gösterir" -ForegroundColor Gray
Write-Host "  3. Yeniden kurulum rehberini açar" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Devam etmek istiyor musunuz? (E/H)"
if ($confirm -ne "E" -and $confirm -ne "e") {
    Write-Host "İşlem iptal edildi." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADIM 1: Vercel Projelerini Sil" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$vercelScript = "vercel-projeleri-sil.ps1"
if (Test-Path $vercelScript) {
    Write-Host "Vercel temizleme script'i çalıştırılıyor..." -ForegroundColor Yellow
    & powershell -ExecutionPolicy Bypass -File $vercelScript
} else {
    Write-Host "⚠️  Vercel temizleme script'i bulunamadı: $vercelScript" -ForegroundColor Yellow
    Write-Host "Manuel olarak Vercel Dashboard'dan projeleri silin." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADIM 2: Supabase Temizleme" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$supabaseScript = "SUPABASE_TEMIZLEME.sql"
if (Test-Path $supabaseScript) {
    Write-Host "✅ Supabase temizleme SQL'i hazır: $supabaseScript" -ForegroundColor Green
    Write-Host ""
    Write-Host "Şimdi yapmanız gerekenler:" -ForegroundColor Yellow
    Write-Host "  1. Supabase Dashboard'a gidin:" -ForegroundColor Cyan
    Write-Host "     https://supabase.com/dashboard/project/xlioxvlohlgpswhpjawa" -ForegroundColor White
    Write-Host "  2. SQL Editor'ü açın" -ForegroundColor Cyan
    Write-Host "  3. $supabaseScript dosyasını açın ve içeriğini kopyalayın" -ForegroundColor Cyan
    Write-Host "  4. SQL Editor'e yapıştırın ve 'Run' butonuna tıklayın" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Supabase temizleme SQL'i bulunamadı: $supabaseScript" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ADIM 3: Yeniden Kurulum Rehberi" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rehber = "YENIDEN_KURULUM_REHBERI.md"
if (Test-Path $rehber) {
    Write-Host "✅ Yeniden kurulum rehberi hazır: $rehber" -ForegroundColor Green
    Write-Host ""
    Write-Host "Rehberi açmak için:" -ForegroundColor Yellow
    Write-Host "  notepad $rehber" -ForegroundColor Cyan
    Write-Host ""
    
    $open = Read-Host "Rehberi şimdi açmak istiyor musunuz? (E/H)"
    if ($open -eq "E" -or $open -eq "e") {
        notepad $rehber
    }
} else {
    Write-Host "⚠️  Yeniden kurulum rehberi bulunamadı: $rehber" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Temizleme tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Şimdi yapmanız gerekenler:" -ForegroundColor Yellow
Write-Host "  1. ✅ Vercel projelerini silin (yukarıda yapıldı)" -ForegroundColor Gray
Write-Host "  2. ⏳ Supabase tablolarını temizleyin (yukarıdaki adımları takip edin)" -ForegroundColor Gray
Write-Host "  3. ⏳ YENIDEN_KURULUM_REHBERI.md dosyasını okuyun ve adımları takip edin" -ForegroundColor Gray
Write-Host ""

