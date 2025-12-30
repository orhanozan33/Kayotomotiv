# Vercel Projelerini Silme Script'i

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vercel Projelerini Silme" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

$projectsToDelete = @("backend", "frontend", "backoffice")

Write-Host "Silinecek Projeler:" -ForegroundColor Yellow
foreach ($project in $projectsToDelete) {
    Write-Host "  - $project" -ForegroundColor Gray
}
Write-Host ""

$confirm = Read-Host "Devam etmek istiyor musunuz? (E/H)"
if ($confirm -ne "E" -and $confirm -ne "e") {
    Write-Host "İşlem iptal edildi." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Projeler siliniyor..." -ForegroundColor Cyan
Write-Host ""

foreach ($projectName in $projectsToDelete) {
    Write-Host "Proje: $projectName" -ForegroundColor Yellow
    
    try {
        # Önce proje ID'sini bul
        $listUrl = "https://api.vercel.com/v9/projects?teamId=team_1123s"
        $projects = Invoke-RestMethod -Uri $listUrl -Method GET -Headers $headers -ErrorAction Stop
        
        $project = $projects.projects | Where-Object { $_.name -eq $projectName }
        
        if ($project) {
            Write-Host "  Proje bulundu: $($project.id)" -ForegroundColor Gray
            
            # Projeyi sil
            $deleteUrl = "https://api.vercel.com/v9/projects/$($project.id)"
            try {
                Invoke-RestMethod -Uri $deleteUrl -Method DELETE -Headers $headers -ErrorAction Stop
                Write-Host "  ✅ $projectName silindi" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  $projectName silinemedi: $_" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠️  $projectName bulunamadı (zaten silinmiş olabilir)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Hata: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Temizleme tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Şimdi Supabase tablolarını temizleyin:" -ForegroundColor Yellow
Write-Host "  Supabase Dashboard -> SQL Editor -> SUPABASE_TEMIZLEME.sql çalıştırın" -ForegroundColor Cyan

