$ErrorActionPreference = 'Stop'
$dir = Join-Path $PSScriptRoot 'models'
$file = Join-Path $dir 'aasist.onnx'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$url = 'https://huggingface.co/SpeechAntiSpoofingBenchmarks/AASIST/resolve/main/aasist.onnx?download=true'
Write-Host 'Downloading AASIST ONNX model...' -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile $file
if ((Get-Item $file).Length -lt 1000000) { throw 'The downloaded model is unexpectedly small. Delete models/aasist.onnx and try again.' }
Write-Host "Model ready: $file" -ForegroundColor Green
