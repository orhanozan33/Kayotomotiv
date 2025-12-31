# API Endpoints Test
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API ENDPOINTS TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "https://kayotomotiv.vercel.app"

# Test endpoints
$endpoints = @(
    @{ Path = "/api/health"; Name = "Health Check" },
    @{ Path = "/api/vehicles"; Name = "Vehicles List" },
    @{ Path = "/api/settings/social-media"; Name = "Social Media Settings" },
    @{ Path = "/api"; Name = "API Root" }
)

foreach ($endpoint in $endpoints) {
    $url = "$BASE_URL$($endpoint.Path)"
    Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "  URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        
        Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.Content) {
            try {
                $json = $response.Content | ConvertFrom-Json
                $jsonStr = $json | ConvertTo-Json -Compress -Depth 3
                if ($jsonStr.Length -gt 200) {
                    $jsonStr = $jsonStr.Substring(0, 200) + "..."
                }
                Write-Host "  Response: $jsonStr" -ForegroundColor Gray
            } catch {
                Write-Host "  Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Gray
            }
        }
    } catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
        Write-Host "  ❌ Status: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                if ($errorBody.Length -gt 300) {
                    $errorBody = $errorBody.Substring(0, 300) + "..."
                }
                Write-Host "  Error Body: $errorBody" -ForegroundColor Red
            } catch {
                # Ignore
            }
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST TAMAMLANDI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel Logs:" -ForegroundColor Yellow
Write-Host "  https://vercel.com/orhanozan33/kayotomotiv" -ForegroundColor Cyan
Write-Host ""

