# Vercel Environment Variables - Yeni Supabase Proje
$ErrorActionPreference = "Stop"
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"

# Yeni Supabase Proje Bilgileri
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"
$SUPABASE_HOST = "db.$SUPABASE_PROJECT_ID.supabase.co"
$SUPABASE_PORT = "6543"  # Session Pooler port
$SUPABASE_DB_NAME = "postgres"
$SUPABASE_DB_USER = "postgres"
# DB_PASSWORD - Supabase Dashboard'dan alınacak

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL ENV VARIABLES - YENI SUPABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Proje bul
Write-Host "1. Proje bulunuyor..." -ForegroundColor Yellow
try {
    $projectsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $project = $projectsResponse.projects | Where-Object { 
        $_.name -eq $PROJECT_NAME -or $_.name -like "*kayoto*" 
    } | Select-Object -First 1
    
    if (-not $project) {
        Write-Host "   ERROR: Proje bulunamadi!" -ForegroundColor Red
        exit 1
    }
    
    $PROJECT_ID = $project.id
    Write-Host "   OK: Proje bulundu: $($project.name) (ID: $PROJECT_ID)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Mevcut environment variables'ları listele
Write-Host "2. Mevcut environment variables kontrol ediliyor..." -ForegroundColor Yellow
try {
    $envVars = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "   Mevcut DB variables:" -ForegroundColor Cyan
    $dbVars = $envVars.envs | Where-Object { $_.key -like "DB_*" -or $_.key -eq "JWT_SECRET" }
    foreach ($env in $dbVars) {
        Write-Host "     - $($env.key) (Environment: $($env.target -join ', '))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   WARNING: Environment variables listelenemedi: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Yeni environment variables ekle/güncelle
Write-Host "3. Environment variables güncelleniyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   NOT: Supabase password'u manuel olarak eklemeniz gerekiyor!" -ForegroundColor Yellow
Write-Host "   Supabase Dashboard > Settings > Database > Connection String > Session Pooler" -ForegroundColor Cyan
Write-Host ""

$envVarsToAdd = @(
    @{
        key = "DB_HOST"
        value = $SUPABASE_HOST
        target = @("production", "preview", "development")
    },
    @{
        key = "DB_PORT"
        value = $SUPABASE_PORT
        target = @("production", "preview", "development")
    },
    @{
        key = "DB_NAME"
        value = $SUPABASE_DB_NAME
        target = @("production", "preview", "development")
    },
    @{
        key = "DB_USER"
        value = $SUPABASE_DB_USER
        target = @("production", "preview", "development")
    },
    @{
        key = "JWT_SECRET"
        value = "ba4890d271a19ad517a4b2b7f0909f2e8112889eec86562d5c045965ebc8398b"
        target = @("production", "preview", "development")
    }
)

foreach ($envVar in $envVarsToAdd) {
    Write-Host "   $($envVar.key) = $($envVar.value)" -ForegroundColor Cyan
    
    foreach ($targetEnv in $envVar.target) {
        try {
            # Önce mevcut variable'ı sil (varsa)
            $existing = $envVars.envs | Where-Object { 
                $_.key -eq $envVar.key -and $_.target -contains $targetEnv 
            }
            
            if ($existing) {
                foreach ($e in $existing) {
                    try {
                        Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$($e.id)" `
                            -Method DELETE `
                            -Headers @{
                                "Authorization" = "Bearer $VERCEL_TOKEN"
                            } | Out-Null
                        Write-Host "     - Eski variable silindi ($targetEnv)" -ForegroundColor Gray
                    } catch {
                        # Ignore delete errors
                    }
                }
            }
            
            # Yeni variable ekle
            $body = @{
                key = $envVar.key
                value = $envVar.value
                target = @($targetEnv)
                type = "encrypted"
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$PROJECT_ID/env" `
                -Method POST `
                -Headers @{
                    "Authorization" = "Bearer $VERCEL_TOKEN"
                    "Content-Type" = "application/json"
                } `
                -Body $body
            
            Write-Host "     ✅ Eklendi: $targetEnv" -ForegroundColor Green
            
        } catch {
            Write-Host "     ❌ Hata ($targetEnv): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SONUC" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Environment variables güncellendi!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  MANUEL ADIM GEREKLI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Supabase Dashboard'a git:" -ForegroundColor Cyan
Write-Host "   https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/settings/database" -ForegroundColor White
Write-Host ""
Write-Host "2. Connection String > Session Pooler > Password'u kopyala" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Vercel Dashboard'a git:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME/settings/environment-variables" -ForegroundColor White
Write-Host ""
Write-Host "4. DB_PASSWORD ekle:" -ForegroundColor Cyan
Write-Host "   Key: DB_PASSWORD" -ForegroundColor White
Write-Host "   Value: [Supabase password]" -ForegroundColor White
Write-Host "   Environment: Production, Preview, Development" -ForegroundColor White
Write-Host ""
Write-Host "5. Deployment'ı yeniden başlat:" -ForegroundColor Cyan
Write-Host "   https://vercel.com/orhanozan33/$PROJECT_NAME" -ForegroundColor White
Write-Host ""
