$env:Path = "C:\Program Files\nodejs;" + [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Node version:"
node -v
Write-Host "NPM version:"
npm -v

Write-Host "Installing dependencies..."
npm install --force

Write-Host "Building project to verify compilation..."
npm run build

Write-Host "Setup completed successfully!"
