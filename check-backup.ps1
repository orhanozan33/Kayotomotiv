$backupPath = "C:\Users\orhan\OneDrive\Masaüstü\araba resımlerı\nextjs yedek"
$files = Get-ChildItem -Path $backupPath -Filter "*.zip" -ErrorAction SilentlyContinue

if ($files) {
    $latest = $files | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    Write-Host "Yedek basariyla olusturuldu!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Dosya: $($latest.FullName)"
    $sizeMB = [math]::Round($latest.Length / 1MB, 2)
    Write-Host "Boyut: $sizeMB MB"
    Write-Host "Tarih: $($latest.LastWriteTime)"
} else {
    Write-Host "Henuz yedek dosyasi olusmadi. Lutfen bir kac saniye daha bekleyin." -ForegroundColor Yellow
}

