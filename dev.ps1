# Starts the Spring Boot backend and the Vite dev server together.
# Press Ctrl+C in this window to stop both.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root 'frontend'

$npm = (Get-Command npm.cmd -ErrorAction Stop).Source
$mvnw = Join-Path $root 'mvnw.cmd'

$backend = Start-Process -FilePath $mvnw -ArgumentList 'spring-boot:run' -WorkingDirectory $root -PassThru
$frontend = Start-Process -FilePath $npm -ArgumentList 'run', 'dev' -WorkingDirectory $frontendDir -PassThru

Write-Host ''
Write-Host 'Backend : http://localhost:8080' -ForegroundColor Cyan
Write-Host 'Frontend: http://localhost:5173' -ForegroundColor Cyan
Write-Host 'Press Ctrl+C to stop both.' -ForegroundColor DarkGray
Write-Host ''

try {
    while (-not $backend.HasExited -and -not $frontend.HasExited) {
        Start-Sleep -Seconds 2
    }
    if ($backend.HasExited) { Write-Host 'Backend exited.' -ForegroundColor Yellow }
    if ($frontend.HasExited) { Write-Host 'Frontend exited.' -ForegroundColor Yellow }
}
finally {
    Write-Host 'Shutting down...' -ForegroundColor DarkGray
    foreach ($p in @($backend, $frontend)) {
        if ($p -and -not $p.HasExited) {
            & taskkill.exe /PID $p.Id /T /F 2>$null | Out-Null
        }
    }
}
