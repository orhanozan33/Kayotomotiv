@echo off
cd /d "C:\Users\orhan\OneDrive\Masaüstü\oto tamir"
set "dest=C:\Users\orhan\OneDrive\Masaüstü\araba resımlerı\nextjs yedek"
if not exist "%dest%" mkdir "%dest%"

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set mytime=%mytime: =0%
set "zipfile=%dest%\oto-tamir-backup-%mydate%-%mytime%.zip"

echo Yedekleme başlatılıyor...
echo Kaynak: %CD%
echo Hedef: %zipfile%

powershell -NoProfile -ExecutionPolicy Bypass -Command "$items = Get-ChildItem -Path . -File | Where-Object { $_.Name -ne 'backup.ps1' -and $_.Name -ne 'backup.bat' -and $_.Name -notlike '*.zip' -and $_.Name -notlike '*.log' }; $dirs = Get-ChildItem -Path . -Directory | Where-Object { $_.Name -ne 'node_modules' -and $_.Name -ne '.next' -and $_.Name -ne '.git' }; $allItems = @($items) + @($dirs); Compress-Archive -Path $allItems.FullName -DestinationPath '%zipfile%' -CompressionLevel Fastest -Force; $size = [math]::Round((Get-Item '%zipfile%').Length / 1MB, 2); Write-Host 'Yedek başarıyla oluşturuldu!' -ForegroundColor Green; Write-Host 'Dosya: %zipfile%' -ForegroundColor Green; Write-Host 'Boyut:' $size 'MB' -ForegroundColor Green"

pause







