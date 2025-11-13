# Stats Page Test Script

Write-Host "=== Stats Page Test ===" -ForegroundColor Cyan
Write-Host ""

# Check stats page files
Write-Host "1. Checking stats page files..." -ForegroundColor Yellow
$files = @(
    "app/(main)/stats/page.tsx",
    "components/stats/StatsDisplay.tsx",
    "components/stats/StatsChart.tsx",
    "components/stats/HealthReminder.tsx",
    "lib/actions/stats.ts",
    "types/stats.ts"
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# Check dependencies
Write-Host "2. Checking required dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$requiredDeps = @("recharts", "next-intl", "next-themes", "zod")

foreach ($dep in $requiredDeps) {
    if ($packageJson.dependencies.PSObject.Properties.Name -contains $dep) {
        Write-Host "  OK: $dep" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $dep" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Stats page features:" -ForegroundColor White
Write-Host "  - Daily/Weekly/Monthly statistics display"
Write-Host "  - Daily goal progress tracking"
Write-Host "  - Visualization charts (bar and line charts)"
Write-Host "  - Health reminder notifications"
Write-Host "  - Goal achievement encouragement messages"
Write-Host ""
Write-Host "Manual testing steps:" -ForegroundColor Yellow
Write-Host "  1. Visit http://localhost:3000/stats"
Write-Host "  2. Verify page loads and displays stat cards"
Write-Host "  3. Check charts render correctly"
Write-Host "  4. Test health reminder notification feature"
Write-Host "  5. Perform rotation on homepage, then check stats update"
Write-Host ""
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "  - Login required to view statistics"
Write-Host "  - Redis (Upstash) configuration required for data storage"
Write-Host "  - Browser notification permission required"
Write-Host ""
