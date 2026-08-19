$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Starting Vite dev server on port 5173..."
npm run dev -- --host 0.0.0.0 --port 5173
