# Supabase Database Bağlantı Testi
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE DATABASE BAGLANTI TESTI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Supabase bağlantı bilgileri
$SUPABASE_PROJECT_ID = "rxbtkjihvqjmamdwmsev"
$DB_HOST = "db.$SUPABASE_PROJECT_ID.supabase.co"
$DB_PORT = "6543"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "orhanozan33"

Write-Host "Bağlantı Bilgileri:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  Database: $DB_NAME" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host "  Password: [SET]" -ForegroundColor White
Write-Host ""

# Test 1: DNS Resolution
Write-Host "1. DNS Resolution Test..." -ForegroundColor Yellow
try {
    $dnsResult = [System.Net.Dns]::GetHostAddresses($DB_HOST)
    Write-Host "   ✅ DNS Resolution başarılı" -ForegroundColor Green
    Write-Host "   IP Address(es):" -ForegroundColor Gray
    foreach ($ip in $dnsResult) {
        Write-Host "     - $($ip.IPAddressToString)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ DNS Resolution başarısız: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Port Connectivity
Write-Host "2. Port Connectivity Test..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connect = $tcpClient.BeginConnect($DB_HOST, $DB_PORT, $null, $null)
    $wait = $connect.AsyncWaitHandle.WaitOne(5000, $false)
    
    if ($wait) {
        $tcpClient.EndConnect($connect)
        Write-Host "   ✅ Port $DB_PORT erişilebilir" -ForegroundColor Green
        $tcpClient.Close()
    } else {
        Write-Host "   ❌ Port $DB_PORT erişilemez (timeout)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Port connectivity hatası: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Vercel API Test
Write-Host "3. Vercel API Test..." -ForegroundColor Yellow
$VERCEL_TOKEN = "qKXFrkCC2xoh2cBKaVG4Jvkv"
$PROJECT_NAME = "kayotomotiv"

try {
    $projectsResponse = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    $project = $projectsResponse.projects | Where-Object { 
        $_.name -eq $PROJECT_NAME -or $_.name -like "*kayoto*" 
    } | Select-Object -First 1
    
    if ($project) {
        Write-Host "   ✅ Vercel projesi bulundu: $($project.name)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Vercel projesi bulunamadı" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Vercel API test başarısız: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Vercel Deployment Test
Write-Host "4. Vercel Deployment Test..." -ForegroundColor Yellow
try {
    $deployments = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=$($project.id)&limit=1" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    if ($deployments.deployments.Count -gt 0) {
        $latestDeployment = $deployments.deployments[0]
        Write-Host "   ✅ Son deployment: $($latestDeployment.uid)" -ForegroundColor Green
        Write-Host "   URL: $($latestDeployment.url)" -ForegroundColor Gray
        Write-Host "   Durum: $($latestDeployment.readyState)" -ForegroundColor $(if ($latestDeployment.readyState -eq "READY") { "Green" } else { "Yellow" })
    }
} catch {
    Write-Host "   ⚠️  Deployment bilgisi alınamadı: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: API Health Check
Write-Host "5. API Health Check..." -ForegroundColor Yellow
try {
    $healthUrl = "https://kayotomotiv.vercel.app/api/health"
    Write-Host "   Testing: $healthUrl" -ForegroundColor Gray
    
    $healthResponse = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 10 -UseBasicParsing
    
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Health endpoint çalışıyor" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Response: $($healthData | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Health endpoint yanıt verdi ama status: $($healthResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Health endpoint hatası: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: API Vehicles Test
Write-Host "6. API Vehicles Test..." -ForegroundColor Yellow
try {
    $vehiclesUrl = "https://kayotomotiv.vercel.app/api/vehicles"
    Write-Host "   Testing: $vehiclesUrl" -ForegroundColor Gray
    
    $vehiclesResponse = Invoke-WebRequest -Uri $vehiclesUrl -Method GET -TimeoutSec 10 -UseBasicParsing
    
    if ($vehiclesResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Vehicles endpoint çalışıyor" -ForegroundColor Green
        $vehiclesData = $vehiclesResponse.Content | ConvertFrom-Json
        $vehicleCount = if ($vehiclesData.vehicles) { $vehiclesData.vehicles.Count } else { 0 }
        Write-Host "   Araç sayısı: $vehicleCount" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Vehicles endpoint yanıt verdi ama status: $($vehiclesResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Vehicles endpoint hatası: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error Body: $errorBody" -ForegroundColor Red
        } catch {
            # Ignore
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST TAMAMLANDI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel Logs:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/kayotomotiv" -ForegroundColor Cyan
Write-Host ""
Write-Host "Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "  https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID" -ForegroundColor Cyan
Write-Host ""

