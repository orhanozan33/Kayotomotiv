# Vercel Projelerini Listele

param(
    [string]$VercelToken = "vck_30SelLzv3008tnFQOvl1PUxTqyqo3JPu4dtmBHAlz112qZpvKj0soi37"
)

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

Write-Host "Vercel Projeleri Listeleniyor..." -ForegroundColor Cyan
Write-Host ""

try {
    # Önce team'leri listele
    $teamsUrl = "https://api.vercel.com/v2/teams"
    $teams = Invoke-RestMethod -Uri $teamsUrl -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "Teams:" -ForegroundColor Yellow
    foreach ($team in $teams.teams) {
        Write-Host "  - $($team.name) (ID: $($team.id), Slug: $($team.slug))" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Her team için projeleri listele
    foreach ($team in $teams.teams) {
        Write-Host "Projeler ($($team.name)):" -ForegroundColor Yellow
        try {
            $projectsUrl = "https://api.vercel.com/v9/projects?teamId=$($team.id)"
            $projects = Invoke-RestMethod -Uri $projectsUrl -Method GET -Headers $headers -ErrorAction Stop
            
            if ($projects.projects.Count -eq 0) {
                Write-Host "  (Proje yok)" -ForegroundColor Gray
            } else {
                foreach ($project in $projects.projects) {
                    Write-Host "  - $($project.name) (ID: $($project.id))" -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "  Hata: $_" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # Personal account projeleri
    Write-Host "Personal Account Projeleri:" -ForegroundColor Yellow
    try {
        $projectsUrl = "https://api.vercel.com/v9/projects"
        $projects = Invoke-RestMethod -Uri $projectsUrl -Method GET -Headers $headers -ErrorAction Stop
        
        if ($projects.projects.Count -eq 0) {
            Write-Host "  (Proje yok)" -ForegroundColor Gray
        } else {
            foreach ($project in $projects.projects) {
                Write-Host "  - $($project.name) (ID: $($project.id))" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "  Hata: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Hata: $_" -ForegroundColor Red
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($errorDetails) {
        Write-Host "Detay: $($errorDetails.error.message)" -ForegroundColor Red
    }
}

