# Add Conda environment to PATH
$condaPath = "C:\Users\Om Chavan\AppData\Local\Microsoft\WinGet\Packages\Microsoft.Winget.Source_8wekyb3d8bbwe\Scripts\conda.exe"
if (Test-Path $condaPath) {
    $condaEnvPath = Join-Path (Split-Path $condaPath -Parent) "envs\krishise_env"
    if (Test-Path $condaEnvPath) {
        $env:Path = $condaEnvPath + ";" + $env:Path
    }
}

Write-Host "Starting Vite dev server on port 5173..."
npm run dev -- --host [IP_ADDRESS] --port 5173
