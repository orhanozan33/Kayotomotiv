# Supabase SQL Otomatik Çalıştırma (PostgREST API ile)
$ErrorActionPreference = "Stop"

$SUPABASE_PROJECT_ID = "qttwfdsyafvifngtsxjc"
$SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dHdmZHN5YWZ2aWZuZ3RzeGpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzEwODI2MywiZXhwIjoyMDgyNjg0MjYzfQ.do69xaCx0Y7bSKc5fjXESnQ-Heu_I_JOzIxttJnH9Ec"
$SUPABASE_URL = "https://$SUPABASE_PROJECT_ID.supabase.co"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE SQL OTOMATIK CALISTIRMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# NOT: Supabase REST API SQL execution desteklemiyor
# SQL script'i manuel olarak Supabase SQL Editor'de çalıştırmanız gerekiyor

Write-Host "NOT: Supabase REST API SQL execution desteklemiyor" -ForegroundColor Yellow
Write-Host "SQL script'i manuel olarak Supabase SQL Editor'de calistirmaniz gerekiyor" -ForegroundColor Yellow
Write-Host ""

# SQL script dosyasını göster
Write-Host "SQL Script Dosyasi:" -ForegroundColor Cyan
Write-Host "  SUPABASE_YENI_PROJE_KURULUM.sql" -ForegroundColor White
Write-Host ""

# Supabase SQL Editor linki
Write-Host "Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql" -ForegroundColor Green
Write-Host ""

# Adımlar
Write-Host "ADIMLAR:" -ForegroundColor Yellow
Write-Host "  1. Yukaridaki linke tikla" -ForegroundColor White
Write-Host "  2. 'New query' butonuna tikla" -ForegroundColor White
Write-Host "  3. SUPABASE_YENI_PROJE_KURULUM.sql dosyasini ac" -ForegroundColor White
Write-Host "  4. Icerigini kopyala-yapistir" -ForegroundColor White
Write-Host "  5. 'Run' butonuna tikla" -ForegroundColor White
Write-Host ""

# SQL script içeriğini göster (ilk 50 satır)
Write-Host "SQL Script Icerigi (ilk 50 satir):" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $sqlLines = Get-Content -Path "SUPABASE_YENI_PROJE_KURULUM.sql" -TotalCount 50
    $sqlLines | ForEach-Object { Write-Host $_ -ForegroundColor White }
    Write-Host "..." -ForegroundColor Gray
    Write-Host "(Toplam $(Get-Content -Path 'SUPABASE_YENI_PROJE_KURULUM.sql' | Measure-Object -Line).Lines satir)" -ForegroundColor Gray
} catch {
    Write-Host "  SQL script okunamadi" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

