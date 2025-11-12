# Cleanup old Vue project files

Write-Host "Starting cleanup of old project files..." -ForegroundColor Cyan

# Create backup directory
$backupDir = "old-vue-project-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Creating backup directory: $backupDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup important files
Write-Host "Backing up important files..." -ForegroundColor Yellow
if (Test-Path "src/data") {
    Copy-Item "src/data" "$backupDir/data" -Recurse -Force
    Write-Host "  Backed up src/data" -ForegroundColor Green
}

# Move old project files to backup directory
Write-Host "Moving old project files..." -ForegroundColor Yellow

$filesToMove = @(
    "src",
    "vite.config.ts",
    "index.html",
    "manifest.config.ts",
    ".postcssrc",
    ".stylelintignore",
    ".stylelintrc",
    "dist"
)

foreach ($file in $filesToMove) {
    if (Test-Path $file) {
        Move-Item $file $backupDir -Force -ErrorAction SilentlyContinue
        Write-Host "  Moved $file" -ForegroundColor Green
    }
}

# Clean cache
Write-Host "Cleaning cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "  Cleaned .next cache" -ForegroundColor Green

Write-Host ""
Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "Old project files backed up to: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Visit: http://localhost:3000" -ForegroundColor White
Write-Host ""
