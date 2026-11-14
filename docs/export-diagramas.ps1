# Solo documentacion: no modifica codigo de la aplicacion.
# Secuencias: npx descarga mermaid-cli bajo demanda (cache npm).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Export-PlantUml {
    param([string]$InputFile, [string]$OutputFile)
    $code = curl.exe -sS -X POST "https://kroki.io/plantuml/png" `
        -H "Content-Type: text/plain" `
        --data-binary "@$InputFile" `
        -o $OutputFile `
        -w "%{http_code}"
    if ($code -ne "200") { throw "Kroki PlantUML HTTP $code" }
}

function Export-Mermaid {
    param([string]$InputFile, [string]$OutputFile)
    npx -y @mermaid-js/mermaid-cli -i $InputFile -o $OutputFile -b white -q
    if (-not (Test-Path $OutputFile)) { throw "No se genero $OutputFile" }
    if ((Get-Item $OutputFile).Length -lt 1000) { throw "PNG invalido: $OutputFile" }
}

Write-Host "Clases dominio (Mermaid)..."
Export-Mermaid -InputFile "$root/diagrama-clases-dominio.mmd" -OutputFile "$root/diagrama-clases-dominio.png"

Write-Host "Casos de uso (PlantUML)..."
Export-PlantUml -InputFile "$root/casos-de-uso.puml" -OutputFile "$root/diagrama-casos-de-uso.png"

Get-ChildItem "$root/secuencia\*.mmd" | Sort-Object Name | ForEach-Object {
    $png = $_.FullName -replace "\.mmd$", ".png"
    Write-Host "Secuencia: $($_.Name)"
    Export-Mermaid -InputFile $_.FullName -OutputFile $png
}

Write-Host "Listo."
