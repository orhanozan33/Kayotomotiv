$destPath = "D:\SAyfalarımız"
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    Write-Host "D:\SAyfalarımız klasörü oluşturuldu" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$zipPath = "$destPath\oto-tamir-full-backup-$timestamp.zip"

$sourcePath = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YEDEKLEME BASLIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kaynak: $sourcePath" -ForegroundColor White
Write-Host "Hedef: $zipPath" -ForegroundColor White
Write-Host ""

Set-Location $sourcePath

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Eski yedek silindi" -ForegroundColor Yellow
}

Write-Host "ZIP dosyasi olusturuluyor (bu biraz zaman alabilir)..." -ForegroundColor Yellow

try {
    # Exclude node_modules, .next, .git, and backup files
    $excludeItems = @('node_modules', '.next', '.git', '*.zip', '*.log', 'backup*.ps1', 'backup*.bat', 'check-backup.ps1')
    
    # Get all items to compress
    $itemsToCompress = Get-ChildItem -Path . -Recurse -File | Where-Object {
        $exclude = $false
        foreach ($pattern in $excludeItems) {
            if ($_.FullName -like "*\$pattern" -or $_.FullName -like "*\$pattern\*") {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }
    
    Write-Host "Toplam $($itemsToCompress.Count) dosya yedeklenecek" -ForegroundColor Green
    Write-Host ""
    
    # Use Compress-Archive with progress
    $itemsToCompress | ForEach-Object {
        $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
        Write-Host "Ekleniyor: $relativePath" -ForegroundColor Cyan
    }
    
    # Create temporary directory structure for compression
    $tempDir = "$env:TEMP\backup-temp-$timestamp"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
    # Copy files maintaining structure
    foreach ($file in $itemsToCompress) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        $destFile = Join-Path $tempDir $relativePath
        $destDir = Split-Path $destFile -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $file.FullName $destFile -Force
    }
    
    # Compress the temporary directory
    Write-Host ""
    Write-Host "Sıkıştırılıyor..." -ForegroundColor Yellow
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force
    
    # Clean up temp directory
    Remove-Item -Path $tempDir -Recurse -Force
    
    if (Test-Path $zipPath) {
        $file = Get-Item $zipPath
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        $sizeGB = [math]::Round($file.Length / 1GB, 2)
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "YEDEK BASARIYLA OLUSTURULDU!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Dosya: $($file.FullName)" -ForegroundColor White
        if ($sizeGB -ge 1) {
            Write-Host "Boyut: $sizeGB GB ($sizeMB MB)" -ForegroundColor White
        } else {
            Write-Host "Boyut: $sizeMB MB" -ForegroundColor White
        }
        Write-Host "Tarih: $($file.LastWriteTime)" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "HATA: ZIP dosyasi olusturulamadi!" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "HATA: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}







