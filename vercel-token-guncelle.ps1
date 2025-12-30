# Vercel Token Güncelleme Script'i

param(
    [string]$NewToken = ""
)

if ([string]::IsNullOrEmpty($NewToken)) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "VERCEL TOKEN GUNCELLEME" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Kullanım:" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File vercel-token-guncelle.ps1 -NewToken 'YENİ_TOKEN'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Veya token'ı script içinde güncelleyin:" -ForegroundColor Yellow
    Write-Host "  1. vercel-otomatik-ayarla.ps1 dosyasını açın" -ForegroundColor Gray
    Write-Host "  2. `$VercelToken değişkenini yeni token ile güncelleyin" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL TOKEN GUNCELLENIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Script dosyalarını güncelle
$scripts = @(
    "vercel-otomatik-ayarla.ps1",
    "vercel-proje-olustur-ayarla.ps1",
    "kayoto-ayaga-kaldir.ps1"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        try {
            $content = Get-Content $script -Raw
            $content = $content -replace 'vck_[^"\s]+', $NewToken
            $content = $content -replace 'vck_[^''\s]+', $NewToken
            Set-Content $script -Value $content -NoNewline
            Write-Host "  ✅ $script güncellendi" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ $script güncellenemedi: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TOKEN GUNCELLENDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Şimdi script'i çalıştırabilirsiniz:" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File vercel-otomatik-ayarla.ps1" -ForegroundColor Cyan
Write-Host ""

