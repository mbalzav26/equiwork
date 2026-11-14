$ErrorActionPreference = "Stop"
$dir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "diagramas"
Get-ChildItem $dir -Filter "UC*.puml" | Sort-Object Name | ForEach-Object {
  $png = [System.IO.Path]::ChangeExtension($_.FullName, ".png")
  $code = curl.exe -sS -X POST "https://kroki.io/plantuml/png" `
    -H "Content-Type: text/plain" `
    --data-binary "@$($_.FullName)" `
    -o $png `
    -w "%{http_code}"
  if ($code -ne "200") { throw "Kroki HTTP $code - $($_.Name)" }
  Write-Host "OK: $png"
}
