#!/usr/bin/env pwsh
# Production Testing Script
# 用于测试 Vercel 部署的生产环境

param(
    [Parameter(Mandatory=$true)]
    [string]$Url = "https://your-site.vercel.app"
)

Write-Host "🧪 Testing Production Deployment" -ForegroundColor Cyan
Write-Host "URL: $Url" -ForegroundColor Yellow
Write-Host ""

# 1. 基础连接测试
Write-Host "1️⃣ Testing Basic Connectivity..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected status code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to access site: $_" -ForegroundColor Red
    exit 1
}

# 2. 检查关键页面
Write-Host ""
Write-Host "2️⃣ Testing Key Pages..." -ForegroundColor Green

$pages = @(
    @{ Path = "/"; Name = "Home Page" },
    @{ Path = "/login"; Name = "Login Page" },
    @{ Path = "/rss"; Name = "RSS Management" },
    @{ Path = "/stats"; Name = "Statistics" },
    @{ Path = "/api/auth/providers"; Name = "Auth API" }
)

foreach ($page in $pages) {
    try {
        $pageUrl = "$Url$($page.Path)"
        $response = Invoke-WebRequest -Uri $pageUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ $($page.Name): OK" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ $($page.Name): Status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ $($page.Name): Failed" -ForegroundColor Red
    }
}

# 3. 检查响应头
Write-Host ""
Write-Host "3️⃣ Checking Security Headers..." -ForegroundColor Green

$securityHeaders = @(
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Content-Security-Policy"
)

$response = Invoke-WebRequest -Uri $Url -Method GET
foreach ($header in $securityHeaders) {
    if ($response.Headers[$header]) {
        Write-Host "  ✅ $header: Present" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️ $header: Missing" -ForegroundColor Yellow
    }
}

# 4. 检查资源加载
Write-Host ""
Write-Host "4️⃣ Checking Resource Loading..." -ForegroundColor Green

$content = $response.Content
if ($content -match '<script') {
    Write-Host "  ✅ JavaScript files detected" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ No JavaScript files found" -ForegroundColor Yellow
}

if ($content -match '<link.*stylesheet') {
    Write-Host "  ✅ CSS files detected" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ No CSS files found" -ForegroundColor Yellow
}

# 5. 性能建议
Write-Host ""
Write-Host "5️⃣ Performance Recommendations:" -ForegroundColor Green
Write-Host "  📊 Run Lighthouse test: https://pagespeed.web.dev/analysis?url=$Url" -ForegroundColor Cyan
Write-Host "  🔍 Check Web Vitals in Vercel Analytics" -ForegroundColor Cyan
Write-Host "  🐛 Monitor errors in Vercel Logs" -ForegroundColor Cyan

# 6. 手动测试清单
Write-Host ""
Write-Host "6️⃣ Manual Testing Checklist:" -ForegroundColor Green
Write-Host "  [ ] Test Google OAuth login" -ForegroundColor White
Write-Host "  [ ] Test news refresh functionality" -ForegroundColor White
Write-Host "  [ ] Test page rotation animation" -ForegroundColor White
Write-Host "  [ ] Test settings save/load" -ForegroundColor White
Write-Host "  [ ] Test RSS source management" -ForegroundColor White
Write-Host "  [ ] Test theme switching" -ForegroundColor White
Write-Host "  [ ] Test language switching" -ForegroundColor White
Write-Host "  [ ] Test mobile responsiveness" -ForegroundColor White
Write-Host "  [ ] Check browser console for errors" -ForegroundColor White
Write-Host "  [ ] Test on different browsers (Chrome, Firefox, Safari)" -ForegroundColor White

Write-Host ""
Write-Host "✅ Production testing completed!" -ForegroundColor Green
Write-Host ""
