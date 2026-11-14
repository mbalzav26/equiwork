$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

$edgePaths = @(
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
)
$edge = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge no encontrado para captura PNG." }

$sizes = @{
    "01-login.html"         = "1320,780"
    "02-dashboard.html"     = "1320,980"
    "03-colaboradores.html" = "1320,920"
    "04-eventos.html"       = "1320,880"
    "05-reportes.html"      = "1320,820"
    "06-encuesta.html"      = "1320,880"
}

Get-ChildItem "$dir\*.html" | Sort-Object Name | ForEach-Object {
    $name = $_.Name
    $png = Join-Path $dir ($name -replace "\.html$", ".png")
    $size = $sizes[$name]
    if (-not $size) { $size = "1320,900" }
    $uri = "file:///" + ($_.FullName -replace "\\", "/")
    Write-Host "Wireframe: $name -> $([System.IO.Path]::GetFileName($png))"
    & $edge --headless=new --disable-gpu --window-size=$size "--screenshot=$png" $uri 2>$null
    $wait = 0
    while (-not (Test-Path $png) -and $wait -lt 15) {
        Start-Sleep -Milliseconds 500
        $wait++
    }
    if (-not (Test-Path $png)) { throw "Fallo: $png" }
}

Write-Host "PNG en docs/wireframes/"
