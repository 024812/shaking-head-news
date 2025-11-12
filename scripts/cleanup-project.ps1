# Project Cleanup Script
# Clean up unnecessary files and directories before deployment

Write-Host "Cleaning project..." -ForegroundColor Cyan

# 1. Clean build cache
Write-Host "`nCleaning build cache..." -ForegroundColor Yellow

if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed .next" -ForegroundColor Green
}

if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item "tsconfig.tsbuildinfo" -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed tsconfig.tsbuildinfo" -ForegroundColor Green
}

# 2. Clean .gitkeep files if directory has other files
Write-Host "`nChecking .gitkeep files..." -ForegroundColor Yellow

$gitkeepDirs = @("config", "lib", "messages", "types", "components")

foreach ($dir in $gitkeepDirs) {
    $gitkeepPath = Join-Path $dir ".gitkeep"
    if (Test-Path $gitkeepPath) {
        $otherFiles = Get-ChildItem $dir -File | Where-Object { $_.Name -ne ".gitkeep" }
        if ($otherFiles.Count -gt 0) {
            Remove-Item $gitkeepPath -Force
            Write-Host "  Removed $gitkeepPath" -ForegroundColor Green
        }
    }
}

# 3. Check for old project backup
Write-Host "`nChecking for old project backup..." -ForegroundColor Yellow

$backupDir = "old-vue-project-backup-20251112-102218"
if (Test-Path $backupDir) {
    Write-Host "  Found old project backup: $backupDir" -ForegroundColor Yellow
    Write-Host "  You may want to delete it manually" -ForegroundColor Gray
}

# 4. Verify required files
Write-Host "`nVerifying required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.ts",
    ".env.example",
    "README.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
    }
}

# 5. Check environment variables
Write-Host "`nChecking environment variables..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "  OK: .env.local exists" -ForegroundColor Green
} else {
    Write-Host "  WARNING: .env.local not found" -ForegroundColor Yellow
    Write-Host "  Please copy from .env.example and configure" -ForegroundColor Gray
}

# 6. Run type check
Write-Host "`nRunning TypeScript type check..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "  TypeScript check passed" -ForegroundColor Green
} else {
    Write-Host "  TypeScript check failed" -ForegroundColor Red
}

# Complete
Write-Host "`nProject cleanup complete!" -ForegroundColor Cyan
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Run production build: npm run build" -ForegroundColor Gray
Write-Host "  2. Test production version: npm start" -ForegroundColor Gray
Write-Host "  3. Check deployment checklist: docs/PRE_DEPLOYMENT_CHECKLIST.md" -ForegroundColor Gray
Write-Host ""
