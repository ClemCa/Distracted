# Starts the Spring Boot backend and the Vite dev server in the background.
# Both logs stream into this console. Press Ctrl+C to stop both.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root 'frontend'

$npm = (Get-Command npm.cmd -ErrorAction Stop).Source
$mvnw = Join-Path $root 'mvnw.cmd'

# Launch each .cmd through cmd.exe so both inherit this console (no new window).
$backend = Start-Process -FilePath 'cmd.exe' `
    -ArgumentList "/c `"$mvnw`" spring-boot:run" `
    -WorkingDirectory $root -NoNewWindow -PassThru

$frontend = Start-Process -FilePath 'cmd.exe' `
    -ArgumentList "/c `"$npm`" run dev" `
    -WorkingDirectory $frontendDir -NoNewWindow -PassThru

Write-Host ''
Write-Host 'Backend : http://localhost:8081' -ForegroundColor Cyan
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
