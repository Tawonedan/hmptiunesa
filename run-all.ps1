param (
    [switch]$Backend,
    [switch]$Supabase,
    [switch]$SameWindow
)

$RootDir = $PSScriptRoot

if ($SameWindow) {
    $processes = @()
    try {
        if ($Supabase) {
            Write-Host "[1/3] Starting Supabase local stack..." -ForegroundColor Cyan
            $sb = Start-Process -FilePath "supabase" -ArgumentList "start" -PassThru -NoNewWindow
            $processes += $sb
        }

        if ($Backend) {
            Write-Host "[2/3] Starting Express backend..." -ForegroundColor Yellow
            $be = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$RootDir\backend" -PassThru -NoNewWindow
            $processes += $be
        }

        Write-Host "[3/3] Starting Vue frontend (Vite)..." -ForegroundColor Green
        Set-Location "$RootDir\frontend"
        npm run dev
    }
    finally {
        foreach ($proc in $processes) {
            if ($proc -and -not $proc.HasExited) {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
else {
    Write-Host "Starting services in dedicated terminal windows..." -ForegroundColor Cyan

    if ($Supabase) {
        Write-Host "-> Launching Supabase stack..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "supabase start"
    }

    if ($Backend) {
        Write-Host "-> Launching Backend API (Port 5000)..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootDir\backend'; npm run dev"
    }

    Write-Host "-> Launching Frontend (Vite)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$RootDir\frontend'; npm run dev"

    Write-Host "All requested services are running." -ForegroundColor Green
}
