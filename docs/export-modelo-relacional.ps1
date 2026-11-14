$ErrorActionPreference = "Stop"
$docs = Split-Path -Parent $MyInvocation.MyCommand.Path
$puml = Join-Path $docs "diagrama-modelo-relacional.puml"
$png = Join-Path $docs "diagrama-modelo-relacional.png"

$code = curl.exe -sS -X POST "https://kroki.io/plantuml/png" `
    -H "Content-Type: text/plain" `
    --data-binary "@$puml" `
    -o $png `
    -w "%{http_code}"
if ($code -ne "200") { throw "Kroki HTTP $code" }
Write-Host "OK: $png"
