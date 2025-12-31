# Backend .env Dosyasini Supabase'e Gore Guncelle
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKEND .ENV DOSYASI GUNCELLEME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendEnvPath = Join-Path $PSScriptRoot "backend\.env"

if (Test-Path $backendEnvPath) {
    Write-Host "Mevcut backend/.env dosyasi bulundu, yedekleniyor..." -ForegroundColor Yellow
    $backupPath = "$backendEnvPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $backendEnvPath $backupPath
    Write-Host "Yedek olusturuldu: $backupPath" -ForegroundColor Green
    Write-Host ""
}

# Mevcut dosyayi oku (eger varsa)
$existingContent = ""
if (Test-Path $backendEnvPath) {
    $existingContent = Get-Content $backendEnvPath -Raw
}

# Supabase database bilgileri ile guncelle
$newContent = $existingContent

# DB_HOST guncelle
if ($newContent -match "DB_HOST=.*") {
    $newContent = $newContent -replace "DB_HOST=.*", "DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co"
} else {
    $newContent += "`nDB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co"
}

# DB_PORT guncelle
if ($newContent -match "DB_PORT=.*") {
    $newContent = $newContent -replace "DB_PORT=.*", "DB_PORT=6543"
} else {
    $newContent += "`nDB_PORT=6543"
}

# DB_NAME guncelle (ototamir -> postgres)
if ($newContent -match "DB_NAME=.*") {
    $newContent = $newContent -replace "DB_NAME=.*", "DB_NAME=postgres"
} else {
    $newContent += "`nDB_NAME=postgres"
}

# DB_USER guncelle
if ($newContent -match "DB_USER=.*") {
    $newContent = $newContent -replace "DB_USER=.*", "DB_USER=postgres"
} else {
    $newContent += "`nDB_USER=postgres"
}

# DB_PASSWORD guncelle
if ($newContent -match "DB_PASSWORD=.*") {
    $newContent = $newContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=orhanozan33"
} else {
    $newContent += "`nDB_PASSWORD=orhanozan33"
}

# JWT_SECRET guncelle (eger yoksa)
if (-not ($newContent -match "JWT_SECRET=.*")) {
    $newContent += "`nJWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
} else {
    $newContent = $newContent -replace "JWT_SECRET=.*", "JWT_SECRET=ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
}

# BACKEND_PASSWORD_HASH ekle (eger yoksa)
if (-not ($newContent -match "BACKEND_PASSWORD_HASH=.*")) {
    $newContent += "`nBACKEND_PASSWORD_HASH=`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"
}

# NODE_ENV ekle (eger yoksa)
if (-not ($newContent -match "NODE_ENV=.*")) {
    $newContent += "`nNODE_ENV=development"
}

Write-Host "backend/.env dosyasi guncelleniyor..." -ForegroundColor Yellow
$newContent | Out-File -FilePath $backendEnvPath -Encoding utf8 -NoNewline
Write-Host "OK: backend/.env dosyasi guncellendi!" -ForegroundColor Green
Write-Host ""
Write-Host "Guncel backend/.env icerigi:" -ForegroundColor Cyan
Write-Host "  DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co" -ForegroundColor White
Write-Host "  DB_PORT=6543" -ForegroundColor White
Write-Host "  DB_NAME=postgres (Supabase)" -ForegroundColor Green
Write-Host "  DB_USER=postgres" -ForegroundColor White
Write-Host "  DB_PASSWORD=orhanozan33" -ForegroundColor White
Write-Host ""

