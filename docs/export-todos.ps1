$ErrorActionPreference = "Stop"
$docs = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Diagramas EquiWork (solo docs) ==="
& "$docs\export-diagramas.ps1"
& "$docs\export-actividad.ps1"

& "$docs\export-mapa-sitio.ps1"

Write-Host "=== Exportacion completa ==="
