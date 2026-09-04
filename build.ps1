# Builds the React app into src/main/resources/static, then packages the Spring Boot jar.
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $root 'frontend'
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source

Write-Host ''
Write-Host '[1/2] Building frontend into src/main/resources/static...' -ForegroundColor Cyan
Push-Location $frontendDir
try {
    & $npm run build:spring
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed (exit code $LASTEXITCODE)" }
}
finally {
    Pop-Location
}

Write-Host '[2/2] Packaging Spring Boot jar...' -ForegroundColor Cyan
& (Join-Path $root 'mvnw.cmd') -f (Join-Path $root 'pom.xml') clean package
if ($LASTEXITCODE -ne 0) { throw "Backend build failed (exit code $LASTEXITCODE)" }

Write-Host ''
Write-Host 'Done. Jar(s):' -ForegroundColor Green
Get-ChildItem (Join-Path $root 'target') -Filter *.jar | Select-Object -ExpandProperty FullName
