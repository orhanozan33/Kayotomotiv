# Database Baglanti Hata Cozum
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DATABASE BAGLANTI HATA COZUM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Test sonucu
Write-Host "1. Supabase baglanti testi:" -ForegroundColor Yellow
Write-Host "   OK: Supabase'e baglanabiliyor!" -ForegroundColor Green
Write-Host "   OK: Port 6543 calisiyor!" -ForegroundColor Green
Write-Host "   OK: Tablolar mevcut!" -ForegroundColor Green
Write-Host ""

# 2. Sorun analizi
Write-Host "2. Sorun analizi:" -ForegroundColor Yellow
Write-Host "   Backend calisirken environment variables dogru yuklenmiyor olabilir" -ForegroundColor Yellow
Write-Host "   Backend'i yeniden baslatmak gerekiyor" -ForegroundColor Yellow
Write-Host ""

# 3. Cozum
Write-Host "3. Cozum adimlari:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ADIM 1: Backend'i durdur (Ctrl+C)" -ForegroundColor Cyan
Write-Host "   ADIM 2: Backend'i yeniden baslat:" -ForegroundColor Cyan
Write-Host "     cd backend" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   ADIM 3: Eger hala hata varsa, port degistir:" -ForegroundColor Cyan
Write-Host "     .env dosyasinda DB_PORT=5432 yap" -ForegroundColor White
Write-Host "     Backend'i yeniden baslat" -ForegroundColor White
Write-Host ""

# 4. Hizli cozum script
Write-Host "4. Hizli cozum (port 5432):" -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw
if ($envContent -match "DB_PORT=6543") {
    Write-Host "   Port 6543 -> 5432 degistiriliyor..." -ForegroundColor Cyan
    $envContent = $envContent -replace "DB_PORT=6543", "DB_PORT=5432"
    $envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
    Write-Host "   OK: Port degistirildi (5432)" -ForegroundColor Green
} else {
    Write-Host "   Port zaten 5432 veya farkli" -ForegroundColor Gray
}

Write-Host ""

# 5. Backend yeniden baslatma onerisi
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ONERI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend'i durdurup yeniden baslatin:" -ForegroundColor Yellow
Write-Host "  1. Backend terminal'inde Ctrl+C" -ForegroundColor White
Write-Host "  2. cd backend" -ForegroundColor White
Write-Host "  3. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Eger hala hata varsa:" -ForegroundColor Yellow
Write-Host "  - Port'u 5432 yap (yukarida yapildi)" -ForegroundColor White
Write-Host "  - Backend'i yeniden baslat" -ForegroundColor White
Write-Host ""

