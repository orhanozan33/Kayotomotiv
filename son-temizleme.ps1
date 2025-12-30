# Son Temizleme Script'i

$ErrorActionPreference = "Stop"

$projectRoot = Get-Location

# Tutulacak dosyalar
$keepFiles = @(
    "README.md",
    "HIZLI_BASLANGIC.md",
    "YENIDEN_KURULUM_REHBERI.md",
    "TEMIZLEME_VE_YENIDEN_KURULUM.ps1",
    "OTOMATIK_YENIDEN_KURULUM.ps1",
    "vercel-projeleri-sil.ps1",
    "SUPABASE_TEMIZLEME.sql",
    "SUPABASE_IZINLER_DUZELTME.sql"
)

Write-Host "Gereksiz dosyalar temizleniyor..." -ForegroundColor Cyan
Write-Host ""

# .md dosyalarını sil
$mdFiles = Get-ChildItem -Path $projectRoot -File -Filter "*.md" | Where-Object { $_.Name -notin $keepFiles }
$mdCount = $mdFiles.Count
$mdFiles | Remove-Item -Force
Write-Host "✅ $mdCount Markdown dosyasi silindi" -ForegroundColor Green

# .ps1 dosyalarını sil
$ps1Files = Get-ChildItem -Path $projectRoot -File -Filter "*.ps1" | Where-Object { $_.Name -notin $keepFiles }
$ps1Count = $ps1Files.Count
$ps1Files | Remove-Item -Force
Write-Host "✅ $ps1Count PowerShell script dosyasi silindi" -ForegroundColor Green

# Root'taki .sql dosyalarını sil (backend/migrations hariç)
$sqlFiles = Get-ChildItem -Path $projectRoot -File -Filter "*.sql" | Where-Object { $_.Name -notin $keepFiles }
$sqlCount = $sqlFiles.Count
$sqlFiles | Remove-Item -Force
Write-Host "✅ $sqlCount SQL dosyasi silindi" -ForegroundColor Green

# Gereksiz .json dosyalarını sil
$jsonFiles = Get-ChildItem -Path $projectRoot -File -Filter "*.json" | Where-Object { 
    $_.Name -notlike "*package*.json" -and 
    $_.Name -notlike "*vercel.json" -and
    $_.Name -notlike "*tsconfig*.json"
}
$jsonCount = $jsonFiles.Count
$jsonFiles | Remove-Item -Force
Write-Host "✅ $jsonCount JSON dosyasi silindi" -ForegroundColor Green

# Dockerfile sil
if (Test-Path (Join-Path $projectRoot "Dockerfile")) {
    Remove-Item (Join-Path $projectRoot "Dockerfile") -Force
    Write-Host "✅ Dockerfile silindi" -ForegroundColor Green
}

# standalone klasörünü sil
if (Test-Path (Join-Path $projectRoot "standalone")) {
    Remove-Item (Join-Path $projectRoot "standalone") -Recurse -Force
    Write-Host "✅ standalone klasoru silindi" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Temizleme tamamlandi!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

