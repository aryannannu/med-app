$url = 'https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/MinGit-2.47.1-64-bit.zip'
$dest = Join-Path $env:LOCALAPPDATA "Programs\Git"
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
}
$zip = Join-Path $dest "mingit.zip"
Write-Host "Downloading MinGit from $url..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
Write-Host "Extracting MinGit to $dest..."
Expand-Archive -Path $zip -DestinationPath $dest -Force
Remove-Item $zip -Force

$gitCmd = Join-Path $dest "cmd"
$currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($currentPath -notlike "*$gitCmd*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$gitCmd", [EnvironmentVariableTarget]::User)
}
$env:Path = "$env:Path;$gitCmd"

Write-Host "MinGit successfully installed!"
& (Join-Path $gitCmd "git.exe") --version
