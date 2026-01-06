$destPath = "D:\SAyfalarimiz"
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    Write-Host "D:\SAyfalarimiz klasoru olusturuldu" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YEDEKLEME BASLIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Hedef: D:\SAyfalarimiz" -ForegroundColor White
Write-Host ""

# Backup nextjs-app folder
if (Test-Path "nextjs-app") {
    Write-Host "nextjs-app klasoru yedekleniyor..." -ForegroundColor Cyan
    $nextjsZip = "$destPath\oto-tamir-nextjs-app-$timestamp.zip"
    
    try {
        Compress-Archive -Path "nextjs-app" -DestinationPath $nextjsZip -CompressionLevel Optimal -Force
        
        if (Test-Path $nextjsZip) {
            $file = Get-Item $nextjsZip
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "SUCCESS: nextjs-app yedeklendi" -ForegroundColor Green
            Write-Host "Dosya: $($file.FullName)" -ForegroundColor White
            Write-Host "Boyut: $sizeMB MB" -ForegroundColor White
        }
    } catch {
        Write-Host "HATA: $_" -ForegroundColor Red
    }
}

# Backup database schema files
Write-Host ""
Write-Host "Database schema dosyalari yedekleniyor..." -ForegroundColor Cyan

$schemaFiles = @()
if (Test-Path "nextjs-app\supabase-schema.sql") { $schemaFiles += "nextjs-app\supabase-schema.sql" }
if (Test-Path "nextjs-app\supabase-fix-schema.sql") { $schemaFiles += "nextjs-app\supabase-fix-schema.sql" }
if (Test-Path "nextjs-app\fix-vehicle-reservations-table.sql") { $schemaFiles += "nextjs-app\fix-vehicle-reservations-table.sql" }

if ($schemaFiles.Count -gt 0) {
    $schemaZip = "$destPath\oto-tamir-database-schema-$timestamp.zip"
    try {
        Compress-Archive -Path $schemaFiles -DestinationPath $schemaZip -CompressionLevel Optimal -Force
        
        if (Test-Path $schemaZip) {
            $file = Get-Item $schemaZip
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "SUCCESS: Database schema yedeklendi" -ForegroundColor Green
            Write-Host "Dosya: $($file.FullName)" -ForegroundColor White
            Write-Host "Boyut: $sizeMB MB" -ForegroundColor White
        }
    } catch {
        Write-Host "HATA: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "YEDEKLEME TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Yedekler D:\SAyfalarimiz klasorunde" -ForegroundColor White







