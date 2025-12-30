# Vercel Environment Variables Import Script'i

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37",
    [string]$ProjectName = "kayoto"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENVIRONMENT VARIABLES IMPORT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

$envVars = @{
    "DB_HOST" = "db.xlioxvlohlgpswhpjawa.supabase.co"
    "DB_PORT" = "5432"
    "DB_NAME" = "postgres"
    "DB_USER" = "postgres"
    "DB_PASSWORD" = "orhanozan33"
    "JWT_SECRET" = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
    "BACKEND_PASSWORD_HASH" = "`$2a`$10`$2BqRLz7wMX5DdoxyIg9eJeS/Ft4Fmc7.ka9ukMhSnbFrT7OGMXH4m"
    "FRONTEND_URL" = "https://kayoto.vercel.app"
}

Write-Host "Environment variables ekleniyor..." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    $envVar = @{
        key = $key
        value = $value
        type = "encrypted"
        target = @("production", "preview", "development")
    } | ConvertTo-Json
    
    try {
        $addUrl = "https://api.vercel.com/v10/projects/$ProjectName/env"
        $response = Invoke-RestMethod -Uri $addUrl -Method POST -Headers $headers -Body $envVar -ErrorAction Stop
        
        Write-Host "  ✅ $key eklendi" -ForegroundColor Green
        $successCount++
    } catch {
        $errorMessage = $_.Exception.Message
        if ($errorMessage -match "already exists") {
            Write-Host "  ⚠️  $key zaten mevcut (güncelleniyor...)" -ForegroundColor Yellow
            
            # Mevcut değişkeni bul ve güncelle
            try {
                $listUrl = "https://api.vercel.com/v10/projects/$ProjectName/env"
                $existing = Invoke-RestMethod -Uri $listUrl -Method GET -Headers $headers -ErrorAction Stop
                $existingVar = $existing.envs | Where-Object { $_.key -eq $key -and $_.target -contains "production" } | Select-Object -First 1
                
                if ($existingVar) {
                    $updateUrl = "https://api.vercel.com/v10/projects/$ProjectName/env/$($existingVar.id)"
                    $updateBody = @{
                        value = $value
                        target = @("production", "preview", "development")
                    } | ConvertTo-Json
                    
                    Invoke-RestMethod -Uri $updateUrl -Method PATCH -Headers $headers -Body $updateBody -ErrorAction Stop | Out-Null
                    Write-Host "    ✅ $key güncellendi" -ForegroundColor Green
                    $successCount++
                }
            } catch {
                Write-Host "    ❌ $key güncellenemedi: $_" -ForegroundColor Red
                $failCount++
            }
        } else {
            Write-Host "  ❌ $key eklenemedi: $errorMessage" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Import tamamlandi!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Basarili: $successCount" -ForegroundColor Green
Write-Host "Basarisiz: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

