$targetDir = "$env:LOCALAPPDATA\Programs\Python311"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$zipPath = "$env:TEMP\python-3.11.9-embed.zip"
Write-Host "Downloading Python 3.11.9 embeddable..."
Invoke-WebRequest -Uri "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip" -OutFile $zipPath

Write-Host "Extracting to $targetDir..."
Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force

# Enable site-packages in python311._pth
$pthFile = "$targetDir\python311._pth"
if (Test-Path $pthFile) {
    $content = Get-Content $pthFile
    $content = $content -replace '#import site', 'import site'
    $content | Set-Content $pthFile
}

# Download get-pip.py
$getpip = "$targetDir\get-pip.py"
Write-Host "Downloading get-pip.py..."
Invoke-WebRequest -Uri "https://bootstrap.pypa.io/get-pip.py" -OutFile $getpip

Write-Host "Installing pip..."
& "$targetDir\python.exe" $getpip --no-warn-script-location

Write-Host "Verifying Python and Pip..."
& "$targetDir\python.exe" --version
& "$targetDir\python.exe" -m pip --version

# Add to user PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$targetDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$targetDir;$targetDir\Scripts;$userPath", "User")
}
