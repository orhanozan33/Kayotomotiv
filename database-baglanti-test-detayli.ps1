# Database Baglanti Test Detayli
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DATABASE BAGLANTI TEST DETAYLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. .env dosyasi kontrol
Write-Host "1. .env dosyasi kontrol ediliyor..." -ForegroundColor Yellow
$rootEnvPath = Join-Path $PSScriptRoot ".env"
$backendEnvPath = Join-Path $PSScriptRoot "backend\.env"

if (Test-Path $rootEnvPath) {
    Write-Host "   OK: Root .env dosyasi mevcut" -ForegroundColor Green
    $rootEnv = Get-Content $rootEnvPath
    $dbHost = ($rootEnv | Select-String "DB_HOST=(.+)").Matches.Groups[1].Value
    $dbPort = ($rootEnv | Select-String "DB_PORT=(.+)").Matches.Groups[1].Value
    $dbName = ($rootEnv | Select-String "DB_NAME=(.+)").Matches.Groups[1].Value
    $dbUser = ($rootEnv | Select-String "DB_USER=(.+)").Matches.Groups[1].Value
    $dbPassword = ($rootEnv | Select-String "DB_PASSWORD=(.+)").Matches.Groups[1].Value
    
    Write-Host "   DB_HOST: $dbHost" -ForegroundColor White
    Write-Host "   DB_PORT: $dbPort" -ForegroundColor White
    Write-Host "   DB_NAME: $dbName" -ForegroundColor White
    Write-Host "   DB_USER: $dbUser" -ForegroundColor White
    Write-Host "   DB_PASSWORD: $($dbPassword ? '[SET]' : '[NOT SET]')" -ForegroundColor White
} else {
    Write-Host "   ERROR: Root .env dosyasi yok!" -ForegroundColor Red
}

if (Test-Path $backendEnvPath) {
    Write-Host "   OK: Backend .env dosyasi mevcut" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Backend .env dosyasi yok" -ForegroundColor Yellow
}

Write-Host ""

# 2. Backend process kontrol
Write-Host "2. Backend process kontrol ediliyor..." -ForegroundColor Yellow
$backendProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($backendProcess) {
    Write-Host "   OK: Backend calisiyor (port 3001)" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Backend calismiyor" -ForegroundColor Yellow
    Write-Host "   Backend'i baslatmak icin: cd backend && npm run dev" -ForegroundColor Cyan
}

Write-Host ""

# 3. Database baglanti testi
Write-Host "3. Database baglanti testi..." -ForegroundColor Yellow
Write-Host "   Supabase baglantisi test ediliyor..." -ForegroundColor Cyan

$testScript = @"
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'db.rxbtkjihvqjmamdwmsev.supabase.co',
  port: 6543,
  database: 'postgres',
  user: 'postgres',
  password: 'orhanozan33',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

try {
  const client = await pool.connect();
  console.log('OK: Baglanti basarili!');
  const result = await client.query('SELECT NOW()');
  console.log('OK: Query basarili!');
  client.release();
  await pool.end();
  process.exit(0);
} catch (error) {
  console.error('ERROR: Baglanti hatasi:', error.message);
  console.error('ERROR Code:', error.code);
  await pool.end();
  process.exit(1);
}
"@

$testScriptPath = Join-Path $PSScriptRoot "test-supabase-quick.js"
$testScript | Out-File -FilePath $testScriptPath -Encoding utf8

Set-Location backend
try {
    $result = node "../test-supabase-quick.js" 2>&1
    Write-Host $result
} catch {
    Write-Host "   ERROR: Test script calistirilamadi" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Set-Location ..

Remove-Item $testScriptPath -ErrorAction SilentlyContinue

Write-Host ""

# 4. Cozum onerileri
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COZUM ONERILERI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Port degistir (6543 -> 5432):" -ForegroundColor Yellow
Write-Host "   .env dosyasinda DB_PORT=5432 yap" -ForegroundColor White
Write-Host ""
Write-Host "2. Backend'i yeniden baslat:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Environment variables kontrol:" -ForegroundColor Yellow
Write-Host "   - DB_HOST=db.rxbtkjihvqjmamdwmsev.supabase.co" -ForegroundColor White
Write-Host "   - DB_PORT=6543 veya 5432" -ForegroundColor White
Write-Host "   - DB_NAME=postgres" -ForegroundColor White
Write-Host "   - DB_USER=postgres" -ForegroundColor White
Write-Host "   - DB_PASSWORD=orhanozan33" -ForegroundColor White
Write-Host ""

