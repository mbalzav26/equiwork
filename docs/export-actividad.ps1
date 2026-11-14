# Documentacion unicamente — diagramas de actividad UML (PlantUML)
$ErrorActionPreference = "Stop"
$root = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "actividad"

Get-ChildItem "$root\*.puml" | Sort-Object Name | ForEach-Object {
    $png = $_.FullName -replace "\.puml$", ".png"
    Write-Host "Actividad: $($_.Name)"
    $code = curl.exe -sS -X POST "https://kroki.io/plantuml/png" `
        -H "Content-Type: text/plain" `
        --data-binary "@$($_.FullName)" `
        -o $png `
        -w "%{http_code}"
    if ($code -ne "200") { throw "Kroki HTTP $code - $($_.Name)" }
    if ((Get-Item $png).Length -lt 1000) { throw "PNG invalido: $png" }
    Start-Sleep -Milliseconds 800
}

Write-Host "PNG en docs/actividad/"
