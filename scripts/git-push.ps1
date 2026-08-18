$gitPath = "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    $gitPath = "git"
}

# 1. Git init if not already a repo
if (-not (Test-Path ".git")) {
    & $gitPath init -b main
} else {
    & $gitPath branch -M main
}

# 2. Configure Git user if not configured
$userName = & $gitPath config user.name
if (-not $userName) {
    & $gitPath config user.name "aryannannu"
}
$userEmail = & $gitPath config user.email
if (-not $userEmail) {
    & $gitPath config user.email "aryannannu@users.noreply.github.com"
}

# 3. Configure Remote origin
$existingRemote = & $gitPath remote get-url origin 2>$null
if (-not $existingRemote) {
    & $gitPath remote add origin git@github.com:aryannannu/med-app.git
} else {
    & $gitPath remote set-url origin git@github.com:aryannannu/med-app.git
}

Write-Host "Remote URL: " (& $gitPath remote get-url origin)

# 4. Stage and commit
& $gitPath add .
$status = & $gitPath status --porcelain
if ($status) {
    & $gitPath commit -m "feat: complete HealIt medicine & store discovery mobile app with floating liquid glass nav"
} else {
    Write-Host "No changes to commit."
}

# 5. Push to GitHub
Write-Host "Pushing to main branch on GitHub..."
& $gitPath push -u origin main --force
