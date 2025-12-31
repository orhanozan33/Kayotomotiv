# Tum Projeleri Durdur
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TUM PROJELERI DURDURMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Backend (port 3001)
Write-Host "1. Backend durduruluyor (port 3001)..." -ForegroundColor Yellow
$backendProcesses = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($backendProcesses) {
    foreach ($pid in $backendProcesses) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   OK: Backend process durduruldu (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "   WARNING: Process durdurulamadi (PID: $pid)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   OK: Backend zaten durdurulmus" -ForegroundColor Green
}

# 2. Frontend (port 3000)
Write-Host "2. Frontend durduruluyor (port 3000)..." -ForegroundColor Yellow
$frontendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($frontendProcesses) {
    foreach ($pid in $frontendProcesses) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   OK: Frontend process durduruldu (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "   WARNING: Process durdurulamadi (PID: $pid)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   OK: Frontend zaten durdurulmus" -ForegroundColor Green
}

# 3. Backoffice (port 3002)
Write-Host "3. Backoffice durduruluyor (port 3002)..." -ForegroundColor Yellow
$backofficeProcesses = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($backofficeProcesses) {
    foreach ($pid in $backofficeProcesses) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   OK: Backoffice process durduruldu (PID: $pid)" -ForegroundColor Green
        } catch {
            Write-Host "   WARNING: Process durdurulamadi (PID: $pid)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   OK: Backoffice zaten durdurulmus" -ForegroundColor Green
}

# 4. Node process'leri kontrol
Write-Host "4. Node process'leri kontrol ediliyor..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   WARNING: Hala calisan Node process'leri var:" -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses) {
        Write-Host "     PID: $($proc.Id) - $($proc.ProcessName)" -ForegroundColor Gray
    }
    Write-Host "   Bu process'leri manuel olarak durdurun (Task Manager)" -ForegroundColor Yellow
} else {
    Write-Host "   OK: Calisan Node process yok" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TUM PROJELER DURDURULDU" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

