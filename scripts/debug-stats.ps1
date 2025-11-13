# Debug Stats Page

Write-Host "=== Stats Page Debug Info ===" -ForegroundColor Cyan
Write-Host ""

# Check if dev server is running
Write-Host "1. Checking dev server..." -ForegroundColor Yellow
$response = $null
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing 2>$null
    Write-Host "   OK: Dev server is running" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Dev server is not running" -ForegroundColor Red
    Write-Host "   Run: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check Redis configuration
Write-Host "2. Checking Redis configuration..." -ForegroundColor Yellow
$hasRedis = $false
if (Test-Path .env.local) {
    $envContent = Get-Content .env.local -Raw
    if ($envContent -match "UPSTASH_REDIS_REST_URL") {
        $hasRedis = $true
    }
}

if ($hasRedis) {
    Write-Host "   OK: Redis configured (persistent storage)" -ForegroundColor Green
} else {
    Write-Host "   INFO: Redis not configured (using in-memory storage)" -ForegroundColor Yellow
    Write-Host "   This is normal for development" -ForegroundColor Gray
}

Write-Host ""

# Check modified files
Write-Host "3. Checking modified files..." -ForegroundColor Yellow
$modifiedFiles = @(
    "lib/storage.ts",
    "lib/actions/stats.ts"
)

foreach ($file in $modifiedFiles) {
    if (Test-Path $file) {
        Write-Host "   OK: $file" -ForegroundColor Green
    } else {
        Write-Host "   ERROR: $file not found" -ForegroundColor Red
    }
}

Write-Host ""

# Instructions
Write-Host "=== Testing Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open these URLs in your browser:" -ForegroundColor White
Write-Host "  1. Stats page:  http://localhost:3000/stats" -ForegroundColor Cyan
Write-Host "  2. Home page:   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected behavior:" -ForegroundColor White
Write-Host "  - No immediate health reminder notification" -ForegroundColor Green
Write-Host "  - Stats show 0 initially (no data yet)" -ForegroundColor Green
Write-Host "  - After rotation, stats update to non-zero" -ForegroundColor Green
Write-Host ""
Write-Host "Browser Console:" -ForegroundColor White
Write-Host "  Press F12 to open DevTools" -ForegroundColor Gray
Write-Host "  Look for: [Storage] Redis not configured..." -ForegroundColor Gray
Write-Host ""
