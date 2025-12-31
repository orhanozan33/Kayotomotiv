# .env Dosyasini Supabase'e Gore Guncelle
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ".ENV DOSYASI GUNCELLEME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envContent = @"
# Local Development Environment Variables
# Supabase Database Connection
# Proje ID: rxbtkjihvqjmamdwmsev

# Database Connection
DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=orhanozan33

# JWT Secret
JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b

# Backend Password Hash
BACKEND_PASSWORD_HASH=`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m

# Frontend URLs
FRONTEND_URL=http://localhost:3000,http://localhost:3002

# Node Environment
NODE_ENV=development
"@

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "Mevcut .env dosyasi bulundu, yedekleniyor..." -ForegroundColor Yellow
    $backupPath = "$envPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $envPath $backupPath
    Write-Host "Yedek olusturuldu: $backupPath" -ForegroundColor Green
}

Write-Host ".env dosyasi guncelleniyor..." -ForegroundColor Yellow
$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
Write-Host "OK: .env dosyasi guncellendi!" -ForegroundColor Green
Write-Host ""
Write-Host "Guncel .env icerigi:" -ForegroundColor Cyan
Write-Host "  DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co" -ForegroundColor White
Write-Host "  DB_PORT=6543" -ForegroundColor White
Write-Host "  DB_NAME=postgres" -ForegroundColor White
Write-Host "  DB_USER=postgres" -ForegroundColor White
Write-Host "  DB_PASSWORD=orhanozan33" -ForegroundColor White
Write-Host ""

