# Setup Monitoring and Analytics
# This script helps set up monitoring and analytics tools for the application

Write-Host "🔍 Monitoring and Analytics Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in project root
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "This script will help you set up:" -ForegroundColor Yellow
Write-Host "  1. Sentry (Error Monitoring)" -ForegroundColor White
Write-Host "  2. Google Analytics (User Analytics)" -ForegroundColor White
Write-Host "  3. Vercel Analytics (Performance)" -ForegroundColor White
Write-Host ""

# Function to prompt for yes/no
function Prompt-YesNo {
    param([string]$Question)
    $response = Read-Host "$Question (y/n)"
    return $response -eq "y" -or $response -eq "Y" -or $response -eq "yes"
}

# Function to update .env.local
function Update-EnvFile {
    param(
        [string]$Key,
        [string]$Value
    )
    
    $envFile = ".env.local"
    
    if (-not (Test-Path $envFile)) {
        Write-Host "Creating .env.local file..." -ForegroundColor Yellow
        Copy-Item ".env.example" $envFile
    }
    
    $content = Get-Content $envFile -Raw
    
    if ($content -match "$Key=") {
        # Update existing key
        $content = $content -replace "$Key=.*", "$Key=$Value"
    } else {
        # Add new key
        $content += "`n$Key=$Value"
    }
    
    Set-Content $envFile $content
    Write-Host "✅ Updated $Key in .env.local" -ForegroundColor Green
}

# 1. Sentry Setup
Write-Host ""
Write-Host "1️⃣  Sentry Error Monitoring" -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan

if (Prompt-YesNo "Do you want to set up Sentry?") {
    Write-Host ""
    Write-Host "Installing Sentry..." -ForegroundColor Yellow
    
    # Check if already installed
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.dependencies.'@sentry/nextjs') {
        Write-Host "✅ Sentry is already installed" -ForegroundColor Green
    } else {
        npm install @sentry/nextjs
        Write-Host "✅ Sentry installed" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "To complete Sentry setup:" -ForegroundColor Yellow
    Write-Host "  1. Run: npx @sentry/wizard@latest -i nextjs" -ForegroundColor White
    Write-Host "  2. Follow the wizard to create a Sentry project" -ForegroundColor White
    Write-Host "  3. The wizard will automatically configure your project" -ForegroundColor White
    Write-Host ""
    
    if (Prompt-YesNo "Do you have a Sentry DSN to add now?") {
        $sentryDsn = Read-Host "Enter your Sentry DSN"
        Update-EnvFile "NEXT_PUBLIC_SENTRY_DSN" $sentryDsn
        
        Write-Host ""
        Write-Host "Don't forget to uncomment the Sentry configuration in:" -ForegroundColor Yellow
        Write-Host "  - sentry.client.config.ts" -ForegroundColor White
        Write-Host "  - sentry.server.config.ts" -ForegroundColor White
        Write-Host "  - sentry.edge.config.ts" -ForegroundColor White
    }
} else {
    Write-Host "⏭️  Skipping Sentry setup" -ForegroundColor Gray
}

# 2. Google Analytics Setup
Write-Host ""
Write-Host "2️⃣  Google Analytics" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Cyan

if (Prompt-YesNo "Do you want to set up Google Analytics?") {
    Write-Host ""
    Write-Host "To get your Google Analytics ID:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://analytics.google.com/" -ForegroundColor White
    Write-Host "  2. Create a new GA4 property" -ForegroundColor White
    Write-Host "  3. Copy the Measurement ID (G-XXXXXXXXXX)" -ForegroundColor White
    Write-Host ""
    
    if (Prompt-YesNo "Do you have a Google Analytics ID?") {
        $gaId = Read-Host "Enter your Google Analytics ID (G-XXXXXXXXXX)"
        Update-EnvFile "NEXT_PUBLIC_GA_ID" $gaId
        
        Write-Host ""
        Write-Host "✅ Google Analytics configured" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Add the GA script to app/layout.tsx" -ForegroundColor White
        Write-Host "  2. See docs/MONITORING_QUICK_START.md for details" -ForegroundColor White
    }
} else {
    Write-Host "⏭️  Skipping Google Analytics setup" -ForegroundColor Gray
}

# 3. Vercel Analytics Setup
Write-Host ""
Write-Host "3️⃣  Vercel Analytics" -ForegroundColor Cyan
Write-Host "--------------------" -ForegroundColor Cyan

if (Prompt-YesNo "Do you want to set up Vercel Analytics?") {
    Write-Host ""
    Write-Host "Installing Vercel Analytics..." -ForegroundColor Yellow
    
    # Check if already installed
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.dependencies.'@vercel/analytics') {
        Write-Host "✅ Vercel Analytics is already installed" -ForegroundColor Green
    } else {
        npm install @vercel/analytics
        Write-Host "✅ Vercel Analytics installed" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Add <Analytics /> component to app/layout.tsx" -ForegroundColor White
    Write-Host "  2. Enable Analytics in your Vercel project dashboard" -ForegroundColor White
    Write-Host "  3. See docs/MONITORING_QUICK_START.md for details" -ForegroundColor White
} else {
    Write-Host "⏭️  Skipping Vercel Analytics setup" -ForegroundColor Gray
}

# 4. Vercel Speed Insights
Write-Host ""
Write-Host "4️⃣  Vercel Speed Insights" -ForegroundColor Cyan
Write-Host "-------------------------" -ForegroundColor Cyan

if (Prompt-YesNo "Do you want to set up Vercel Speed Insights?") {
    Write-Host ""
    Write-Host "Installing Vercel Speed Insights..." -ForegroundColor Yellow
    
    # Check if already installed
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.dependencies.'@vercel/speed-insights') {
        Write-Host "✅ Vercel Speed Insights is already installed" -ForegroundColor Green
    } else {
        npm install @vercel/speed-insights
        Write-Host "✅ Vercel Speed Insights installed" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Add <SpeedInsights /> component to app/layout.tsx" -ForegroundColor White
    Write-Host "  2. Enable Speed Insights in your Vercel project dashboard" -ForegroundColor White
} else {
    Write-Host "⏭️  Skipping Vercel Speed Insights setup" -ForegroundColor Gray
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - Full guide: docs/MONITORING_QUICK_START.md" -ForegroundColor White
Write-Host "  - Environment variables: .env.example" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Configuration files created:" -ForegroundColor Yellow
Write-Host "  - lib/sentry.ts (Sentry configuration)" -ForegroundColor White
Write-Host "  - lib/analytics.ts (Analytics tracking)" -ForegroundColor White
Write-Host "  - lib/logger.ts (Logging system)" -ForegroundColor White
Write-Host "  - lib/utils/performance.ts (Performance monitoring)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review and update environment variables in .env.local" -ForegroundColor White
Write-Host "  2. Follow platform-specific setup instructions in the documentation" -ForegroundColor White
Write-Host "  3. Test monitoring in development: npm run dev" -ForegroundColor White
Write-Host "  4. Deploy to production and verify monitoring is working" -ForegroundColor White
Write-Host ""
Write-Host "Happy monitoring! 📊" -ForegroundColor Green
