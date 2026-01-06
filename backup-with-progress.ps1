$destPath = "D:\SAyfalarimiz"
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    Write-Host "D:\SAyfalarimiz klasoru olusturuldu" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$zipPath = "$destPath\oto-tamir-full-backup-$timestamp.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YEDEKLEME BASLIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hedef: $zipPath" -ForegroundColor White
Write-Host ""

# Get current directory
$currentDir = Get-Location
$sourcePath = $currentDir.Path

Write-Host "Dosyalar taranıyor..." -ForegroundColor Yellow

# Collect all files to backup (excluding node_modules, .next, .git, zip files, logs, backup scripts)
$allFiles = @()
$excludeDirs = @('node_modules', '.next', '.git')
$excludeFiles = @('*.zip', '*.log', 'backup*.ps1', 'backup*.bat', 'check-backup.ps1')

Get-ChildItem -Path $sourcePath -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $file = $_
    $relativePath = $file.FullName.Substring($sourcePath.Length + 1)
    $dirName = Split-Path $relativePath -Parent
    
    # Check if file is in excluded directory
    $excluded = $false
    foreach ($excludeDir in $excludeDirs) {
        if ($relativePath -like "*\$excludeDir\*" -or $relativePath -like "$excludeDir\*") {
            $excluded = $true
            break
        }
    }
    
    # Check if file matches exclude pattern
    if (-not $excluded) {
        foreach ($pattern in $excludeFiles) {
            if ($file.Name -like $pattern) {
                $excluded = $true
                break
            }
        }
    }
    
    if (-not $excluded) {
        $allFiles += $file
    }
}

$totalFiles = $allFiles.Count
Write-Host "Toplam $totalFiles dosya bulundu" -ForegroundColor Green
Write-Host ""

if ($totalFiles -eq 0) {
    Write-Host "HATA: Yedeklenecek dosya bulunamadi!" -ForegroundColor Red
    exit
}

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "Eski yedek silindi" -ForegroundColor Yellow
}

Write-Host "ZIP dosyasi olusturuluyor..." -ForegroundColor Yellow
Write-Host ""

try {
    # Use .NET ZipFile for progress tracking
    Add-Type -Assembly System.IO.Compression.FileSystem
    
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    
    $currentFile = 0
    $startTime = Get-Date
    
    foreach ($file in $allFiles) {
        $currentFile++
        $percent = [math]::Round(($currentFile / $totalFiles) * 100, 1)
        $relativePath = $file.FullName.Substring($sourcePath.Length + 1)
        $fileName = Split-Path $relativePath -Leaf
        
        # Calculate elapsed time and estimate remaining
        $elapsed = (Get-Date) - $startTime
        if ($currentFile -gt 0) {
            $avgTimePerFile = $elapsed.TotalSeconds / $currentFile
            $remainingFiles = $totalFiles - $currentFile
            $estimatedSeconds = $avgTimePerFile * $remainingFiles
            $estimatedTime = [TimeSpan]::FromSeconds($estimatedSeconds)
            
            # Show progress
            $status = "[$currentFile/$totalFiles] ($percent%) - $fileName"
            if ($estimatedSeconds -gt 0 -and $estimatedSeconds -lt 3600) {
                $status += " - Kalan: $([math]::Round($estimatedTime.TotalMinutes, 1)) dk"
            }
            Write-Host $status -ForegroundColor Cyan
            
            # PowerShell progress bar
            Write-Progress -Activity "Yedekleniyor..." -Status "$fileName" -PercentComplete $percent -CurrentOperation "$currentFile / $totalFiles dosya"
        }
        
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
        $sizeGB = [math]::Round($file.Length / 1GB, 2)
        $elapsedTotal = (Get-Date) - $startTime
        
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
        Write-Host "Toplam Dosya: $totalFiles" -ForegroundColor White
        Write-Host "Sure: $([math]::Round($elapsedTotal.TotalMinutes, 1)) dakika" -ForegroundColor White
        Write-Host "Tarih: $($file.LastWriteTime)" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host "HATA: ZIP dosyasi olusturulamadi!" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "HATA: $_" -ForegroundColor Red
    
    # Fallback to Compress-Archive
    Write-Host "Alternatif yontem deneniyor (ilerleme gostermeden)..." -ForegroundColor Yellow
    try {
        $itemsToCompress = Get-ChildItem -Path $sourcePath -Exclude node_modules,.next,.git,*.zip,*.log,backup*.ps1,backup*.bat,check-backup.ps1 -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer }
        Compress-Archive -Path $itemsToCompress -DestinationPath $zipPath -CompressionLevel Optimal -Force
        
        if (Test-Path $zipPath) {
            $file = Get-Item $zipPath
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "Yedek olusturuldu: $($file.FullName) ($sizeMB MB)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Alternatif yontem de basarisiz: $_" -ForegroundColor Red
    }
}






