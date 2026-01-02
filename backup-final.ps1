$destPath = "C:\Users\orhan\OneDrive\Masaüstü\araba resımlerı\nextjs yedek"
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$zipPath = "$destPath\oto-tamir-backup-$timestamp.zip"

Set-Location "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

Write-Host "Yedekleme baslatiliyor..." -ForegroundColor Cyan

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Collect all items to zip
$itemsToZip = New-Object System.Collections.ArrayList

# Add root level files
$rootFiles = Get-ChildItem -Path . -File | Where-Object {
    $_.Name -notlike "*.zip" -and 
    $_.Name -notlike "*.log" -and 
    $_.Name -ne "backup.ps1" -and 
    $_.Name -ne "backup.bat" -and 
    $_.Name -ne "backup-simple.ps1" -and 
    $_.Name -ne "backup-final.ps1" -and 
    $_.Name -ne "check-backup.ps1"
}

foreach ($file in $rootFiles) {
    [void]$itemsToZip.Add($file.FullName)
}

# Add directories (recursive will be handled by Compress-Archive)
$dirs = Get-ChildItem -Path . -Directory | Where-Object {
    $_.Name -ne "node_modules" -and 
    $_.Name -ne ".next" -and 
    $_.Name -ne ".git"
}

foreach ($dir in $dirs) {
    [void]$itemsToZip.Add($dir.FullName)
}

Write-Host "Toplam $($itemsToZip.Count) oge bulundu" -ForegroundColor Cyan

if ($itemsToZip.Count -eq 0) {
    Write-Host "Yedeklenecek oge bulunamadi!" -ForegroundColor Red
    exit
}

try {
    Write-Host "ZIP dosyasi olusturuluyor..." -ForegroundColor Cyan
    Compress-Archive -Path $itemsToZip.ToArray() -DestinationPath $zipPath -CompressionLevel Optimal -Force -ErrorAction Stop
    
    # Wait a bit for file system
    Start-Sleep -Seconds 3
    
    if (Test-Path $zipPath) {
        $file = Get-Item $zipPath
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Yedek basariyla olusturuldu!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Dosya: $($file.FullName)" -ForegroundColor White
        Write-Host "Boyut: $sizeMB MB ($sizeKB KB)" -ForegroundColor White
        Write-Host "Tarih: $($file.LastWriteTime)" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "HATA: Yedek dosyasi olusturulamadi!" -ForegroundColor Red
    }
} catch {
    Write-Host "HATA: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.Exception.StackTrace -ForegroundColor Red
}
