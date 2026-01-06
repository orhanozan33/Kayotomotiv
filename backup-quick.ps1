$destPath = "D:\SAyfalarımız"
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
    Write-Host "D:\SAyfalarımız klasörü oluşturuldu" -ForegroundColor Green
}

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$zipPath = "$destPath\oto-tamir-full-backup-$timestamp.zip"

$sourcePath = "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
Set-Location $sourcePath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "YEDEKLEME BASLIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kaynak: $sourcePath" -ForegroundColor White
Write-Host "Hedef: $zipPath" -ForegroundColor White
Write-Host ""

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "ZIP dosyasi olusturuluyor..." -ForegroundColor Yellow
Write-Host "Bu islem biraz zaman alabilir, lutfen bekleyin..." -ForegroundColor Yellow
Write-Host ""

try {
    # Compress nextjs-app folder (main application)
    if (Test-Path "nextjs-app") {
        Write-Host "nextjs-app klasörü yedekleniyor..." -ForegroundColor Cyan
        $nextjsZip = "$destPath\oto-tamir-nextjs-app-$timestamp.zip"
        Compress-Archive -Path "nextjs-app" -DestinationPath $nextjsZip -CompressionLevel Optimal -Force
        
        if (Test-Path $nextjsZip) {
            $file = Get-Item $nextjsZip
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "✓ nextjs-app yedeklendi: $sizeMB MB" -ForegroundColor Green
        }
    }
    
    # Compress supabase schema files
    if (Test-Path "nextjs-app\supabase-schema.sql") {
        Write-Host "Supabase schema dosyalari yedekleniyor..." -ForegroundColor Cyan
        $schemaFiles = @(
            "nextjs-app\supabase-schema.sql",
            "nextjs-app\supabase-fix-schema.sql",
            "nextjs-app\fix-vehicle-reservations-table.sql"
        )
        $schemaZip = "$destPath\oto-tamir-database-schema-$timestamp.zip"
        Compress-Archive -Path $schemaFiles -DestinationPath $schemaZip -CompressionLevel Optimal -Force
        
        if (Test-Path $schemaZip) {
            $file = Get-Item $schemaZip
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "✓ Database schema yedeklendi: $sizeMB MB" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "YEDEKLEME TAMAMLANDI!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Yedekler D:\SAyfalarımız klasöründe" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "HATA: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}







