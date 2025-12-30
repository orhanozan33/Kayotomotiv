# Vercel API Test - Runtime logs icin istek gonder
$ErrorActionPreference = "Stop"

$PROJECT_URL = "https://kayotomotiv.vercel.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERCEL API TEST - RUNTIME LOGS ICIN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Health check
Write-Host "1. Health check endpoint test ediliyor..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$PROJECT_URL/api/health" `
        -Method GET `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "   OK: Status Code: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Root API endpoint
Write-Host "2. Root API endpoint test ediliyor..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "$PROJECT_URL/api" `
        -Method GET `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "   OK: Status Code: $($apiResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($apiResponse.Content.Substring(0, [Math]::Min(200, $apiResponse.Content.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Vehicles endpoint
Write-Host "3. Vehicles endpoint test ediliyor..." -ForegroundColor Yellow
try {
    $vehiclesResponse = Invoke-WebRequest -Uri "$PROJECT_URL/api/vehicles" `
        -Method GET `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "   OK: Status Code: $($vehiclesResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Frontend test
Write-Host "4. Frontend test ediliyor..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "$PROJECT_URL" `
        -Method GET `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "   OK: Status Code: $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Admin test
Write-Host "5. Admin panel test ediliyor..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-WebRequest -Uri "$PROJECT_URL/admin" `
        -Method GET `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "   OK: Status Code: $($adminResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOT: Simdi Vercel Dashboard > Logs sayfasina gidin" -ForegroundColor Yellow
Write-Host "NOT: Runtime logs gorunmeye baslayacak" -ForegroundColor Yellow
Write-Host ""
Write-Host "Logs URL: https://vercel.com/orhanozan33/kayotomotiv/2tXVsRdjM9AVcxPEZ1quAzLgUfvB/logs" -ForegroundColor Cyan
Write-Host ""

