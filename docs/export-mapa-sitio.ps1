# Genera mapa-sitio.png desde mapa-sitio.html (solo documentacion)
$ErrorActionPreference = "Stop"
$docs = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $docs "mapa-sitio.html"
$png = Join-Path $docs "mapa-sitio.png"
$uri = "file:///" + ($html -replace "\\", "/")

$edgePaths = @(
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) {
    throw "No se encontro Microsoft Edge para capturar PNG. Abre mapa-sitio.html y exporta manualmente."
}

& $edge --headless=new --disable-gpu --window-size=1024,1180 "--screenshot=$png" $uri
if (-not (Test-Path $png)) { throw "No se genero $png" }
Write-Host "OK: $png"
