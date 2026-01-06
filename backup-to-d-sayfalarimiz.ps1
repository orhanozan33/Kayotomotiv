$destPath = "D:\SAyfalarımız"
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    Write-Host "D:\SAyfalarımız klasörü oluşturuldu" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$zipPath = "$destPath\oto-tamir-full-backup-$timestamp.zip"

Set-Location "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YEDEKLEME BASLIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kaynak: $(Get-Location)" -ForegroundColor White
Write-Host "Hedef: $zipPath" -ForegroundColor White
Write-Host ""

# Collect all files and directories
Write-Host "Dosyalar taraniyor..." -ForegroundColor Yellow
$allItems = @()

# Root files
$rootFiles = Get-ChildItem -Path . -File | Where-Object {
    $_.Name -notlike "*.zip" -and $_.Name -notlike "*.log" -and 
    $_.Name -notlike "backup*.ps1" -and $_.Name -notlike "backup*.bat" -and
    $_.Name -ne "check-backup.ps1"
}
foreach ($f in $rootFiles) { $allItems += $f.FullName }

# Directories (will include all contents)
$dirs = Get-ChildItem -Path . -Directory | Where-Object {
    $_.Name -ne "node_modules" -and $_.Name -ne ".next" -and $_.Name -ne ".git"
}
foreach ($d in $dirs) { $allItems += $d.FullName }

Write-Host "Toplam $($allItems.Count) oge bulundu" -ForegroundColor Green
Write-Host ""

if ($allItems.Count -eq 0) {
    Write-Host "HATA: Yedeklenecek oge bulunamadi!" -ForegroundColor Red
    exit
}

# Remove old zip
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Eski yedek silindi" -ForegroundColor Yellow
}

# Create ZIP with progress
Write-Host "ZIP dosyasi olusturuluyor..." -ForegroundColor Yellow

# First, count all files that will be added
Write-Host "Toplam dosya sayisi hesaplaniyor..." -ForegroundColor Yellow
$allFiles = @()
foreach ($item in $allItems) {
    if (Test-Path $item -PathType Container) {
        $files = Get-ChildItem -Path $item -Recurse -File -ErrorAction SilentlyContinue
        $allFiles += $files
    } else {
        $allFiles += Get-Item $item
    }
}
$totalFiles = $allFiles.Count
Write-Host "Toplam $totalFiles dosya yedeklenecek" -ForegroundColor Green
Write-Host ""

try {
    # Use .NET ZipFile for better control
    Add-Type -Assembly System.IO.Compression.FileSystem
    
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    
    $currentFile = 0
    $basePath = (Get-Location).Path
    $startTime = Get-Date
    
    foreach ($file in $allFiles) {
        $currentFile++
        $percent = [math]::Round(($currentFile / $totalFiles) * 100, 1)
        $relativePath = $file.FullName.Substring($basePath.Length + 1)
        $fileName = Split-Path $relativePath -Leaf
        
        # Calculate elapsed time and estimate remaining
        $elapsed = (Get-Date) - $startTime
        $avgTimePerFile = $elapsed.TotalSeconds / $currentFile
        $remainingFiles = $totalFiles - $currentFile
        $estimatedSeconds = $avgTimePerFile * $remainingFiles
        $estimatedTime = [TimeSpan]::FromSeconds($estimatedSeconds)
        
        # Show progress in terminal
        $status = "[$currentFile/$totalFiles] ($percent%) - $fileName"
        if ($estimatedSeconds -gt 0) {
            $status += " - Kalan: $([math]::Round($estimatedTime.TotalMinutes, 1)) dakika"
        }
        Write-Host $status -ForegroundColor Cyan
        
        # Also use Write-Progress for PowerShell progress bar
        Write-Progress -Activity "Yedekleniyor..." -Status "$fileName" -PercentComplete $percent -CurrentOperation "$currentFile / $totalFiles dosya"
        
        try {
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $relativePath) | Out-Null
        } catch {
            Write-Host "  UYARI: $relativePath eklenemedi - $_" -ForegroundColor Yellow
        }
    }
    
    $zip.Dispose()
    Write-Progress -Activity "Yedekleniyor..." -Completed
    
    Start-Sleep -Seconds 1
    
    if (Test-Path $zipPath) {
        $file = Get-Item $zipPath
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "YEDEK BASARIYLA OLUSTURULDU!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Dosya: $($file.FullName)" -ForegroundColor White
        Write-Host "Boyut: $sizeMB MB ($sizeKB KB)" -ForegroundColor White
        Write-Host "Tarih: $($file.LastWriteTime)" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "HATA: ZIP dosyasi olusturulamadi!" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "HATA: $_" -ForegroundColor Red
    
    # Fallback to Compress-Archive
    Write-Host "Alternatif yontem deneniyor..." -ForegroundColor Yellow
    try {
        Compress-Archive -Path $allItems -DestinationPath $zipPath -CompressionLevel Optimal -Force
        if (Test-Path $zipPath) {
            $file = Get-Item $zipPath
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "Yedek olusturuldu: $($file.FullName) ($sizeMB MB)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Alternatif yontem de basarisiz: $_" -ForegroundColor Red
    }
}







