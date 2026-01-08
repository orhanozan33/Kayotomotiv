$destPath = "C:\Users\orhan\OneDrive\Masaüstü\araba resımlerı\nextjs yedek"
New-Item -ItemType Directory -Path $destPath -Force | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$zipPath = "$destPath\oto-tamir-backup-$timestamp.zip"

Set-Location "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"

$items = @()
$items += Get-ChildItem -Path . -File | Where-Object { $_.Name -notlike "*.zip" -and $_.Name -notlike "*.log" }
$items += Get-ChildItem -Path . -Directory | Where-Object { $_.Name -ne "node_modules" -and $_.Name -ne ".next" -and $_.Name -ne ".git" -and $_.Name -ne "backup.ps1" -and $_.Name -ne "backup.bat" }

Compress-Archive -Path $items.FullName -DestinationPath $zipPath -Force
$size = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)

Write-Output "Yedek oluşturuldu: $zipPath"
Write-Output "Boyut: $size MB"








