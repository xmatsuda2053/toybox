# polaris フォルダを基準としたパス
$iconDir = "src/assets/icons"
$outputFile = "src/assets/icons.ts"

if (-not (Test-Path $iconDir)) {
    Write-Error "Directory not found: $iconDir"
    return
}

$files = Get-ChildItem $iconDir -Filter *.svg
$imports = @()
$mapping = @()

foreach ($file in $files) {
    $name = $file.BaseName
    $varName = $name -replace '-', '_'
    $imports += "import $varName from `"@assets/icons/$($file.Name)?raw`";"
    $mapping += "  `"$name`": $varName,"
}

$finalContent = @(
    $imports
    ""
    "export const icons: Record<string, string> = {"
    $mapping
    "};"
)

$finalContent | Out-File -FilePath $outputFile -Encoding utf8
Write-Host "Successfully generated $outputFile" -ForegroundColor Green