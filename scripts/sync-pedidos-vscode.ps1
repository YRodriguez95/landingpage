param(
  [int]$IntervalSeconds = 5,
  [switch]$Once
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $root "firebase-config.js"
$jsonPath = Join-Path $root "pedidos-vscode.json"
$mdPath = Join-Path $root "pedidos-vscode.md"

function Get-ConfigValue {
  param(
    [string]$Content,
    [string]$Name,
    [string]$DefaultValue = ""
  )

  $match = [regex]::Match($Content, "$Name\s*:\s*""([^""]+)""")
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return $DefaultValue
}

function Get-CollectionName {
  param([string]$Content)

  $match = [regex]::Match($Content, "TLOU_FIREBASE_COLLECTION\s*=\s*""([^""]+)""")
  if ($match.Success) {
    return $match.Groups[1].Value
  }

  return "pedidos"
}

function Convert-FirestoreValue {
  param($Value)

  if ($null -eq $Value) { return $null }
  if ($Value.stringValue -ne $null) { return $Value.stringValue }
  if ($Value.integerValue -ne $null) { return [int64]$Value.integerValue }
  if ($Value.doubleValue -ne $null) { return [double]$Value.doubleValue }
  if ($Value.booleanValue -ne $null) { return [bool]$Value.booleanValue }
  if ($Value.nullValue -ne $null) { return $null }
  if ($Value.timestampValue -ne $null) { return $Value.timestampValue }

  return $Value
}

function Convert-FirestoreDocument {
  param($Document)

  $pedido = [ordered]@{}
  $documentId = Split-Path $Document.name -Leaf

  if ($documentId -notmatch "^TLU-[A-Z0-9]{6}$") {
    return $null
  }

  if ($Document.fields) {
    foreach ($field in $Document.fields.PSObject.Properties) {
      $pedido[$field.Name] = Convert-FirestoreValue $field.Value
    }
  }

  if (-not $pedido.Contains("id")) {
    $pedido["id"] = $documentId
  }

  return [pscustomobject]$pedido
}

function Write-PedidosMarkdown {
  param(
    [array]$Pedidos,
    [string]$Path
  )

  $lines = @(
    "# Pedidos Firebase",
    "",
    "Actualizado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    "",
    "Total: $($Pedidos.Count)",
    ""
  )

  if ($Pedidos.Count -eq 0) {
    $lines += "No hay pedidos registrados."
  }
  else {
    foreach ($pedido in $Pedidos) {
      $lines += "## $($pedido.id)"
      $lines += ""
      $lines += "- Nombre: $($pedido.nombre)"
      $lines += "- Email: $($pedido.email)"
      $lines += "- Plataforma: $($pedido.plataforma)"
      $lines += "- Edicion: $($pedido.edicion)"
      $lines += "- Estado: $($pedido.estado)"
      $lines += "- Fecha: $($pedido.fecha)"
      if ($pedido.notas) {
        $lines += "- Notas: $($pedido.notas)"
      }
      $lines += ""
    }
  }

  Set-Content -Path $Path -Value $lines -Encoding UTF8
}

function Sync-Pedidos {
  if (-not (Test-Path $configPath)) {
    throw "No se encontro firebase-config.js"
  }

  $config = Get-Content -Path $configPath -Raw
  $projectId = Get-ConfigValue -Content $config -Name "projectId"
  $apiKey = Get-ConfigValue -Content $config -Name "apiKey"
  $collection = Get-CollectionName -Content $config

  if (-not $projectId -or -not $apiKey) {
    throw "Faltan projectId o apiKey en firebase-config.js"
  }

  $encodedCollection = [uri]::EscapeDataString($collection)
  $url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/$encodedCollection`?key=$apiKey"
  $response = Invoke-RestMethod -Uri $url -Method Get

  $pedidos = @()
  if ($response.documents) {
    $pedidos = @($response.documents | ForEach-Object { Convert-FirestoreDocument $_ } | Where-Object { $null -ne $_ } | Sort-Object fecha -Descending)
  }

  $output = [ordered]@{
    actualizado = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    total = $pedidos.Count
    pedidos = $pedidos
  }

  $output | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding UTF8
  Write-PedidosMarkdown -Pedidos $pedidos -Path $mdPath

  Write-Host "Pedidos sincronizados: $($pedidos.Count). Archivos: pedidos-vscode.json y pedidos-vscode.md"
}

$modeText = if ($Once) { "una sincronizacion" } else { "monitor continuo" }
Write-Host "Iniciando $modeText de pedidos Firebase para VS Code..."

do {
  try {
    Sync-Pedidos
  }
  catch {
    Write-Host "Error al sincronizar pedidos: $($_.Exception.Message)" -ForegroundColor Red
  }

  if (-not $Once) {
    Start-Sleep -Seconds $IntervalSeconds
  }
} while (-not $Once)
