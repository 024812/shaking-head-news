# CI/CD Setup Script for Windows
# This script helps configure the CI/CD pipeline

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CI/CD Pipeline Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    Write-Host "Please run this script from the project root" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git repository detected" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check for required tools
Write-Host "Checking required tools..." -ForegroundColor Cyan

$tools = @{
    "git" = "Git"
    "node" = "Node.js"
    "npm" = "npm"
}

$allToolsPresent = $true
foreach ($tool in $tools.Keys) {
    if (Test-Command $tool) {
        Write-Host "  ✅ $($tools[$tool]) installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($tools[$tool]) not found" -ForegroundColor Red
        $allToolsPresent = $false
    }
}

if (-not $allToolsPresent) {
    Write-Host ""
    Write-Host "Please install missing tools before continuing" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Cyan
if (Test-Command "vercel") {
    Write-Host "  ✅ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Vercel CLI not installed" -ForegroundColor Yellow
    Write-Host ""
    $installVercel = Read-Host "Would you like to install Vercel CLI? (y/n)"
    if ($installVercel -eq "y") {
        Write-Host "Installing Vercel CLI..." -ForegroundColor Cyan
        npm install -g vercel
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Vercel CLI installed successfully" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to install Vercel CLI" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Vercel Setup
Write-Host "Step 1: Vercel Configuration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "To get your Vercel credentials:" -ForegroundColor White
Write-Host "  1. Visit: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "  2. Select your project" -ForegroundColor Gray
Write-Host "  3. Go to Settings → General" -ForegroundColor Gray
Write-Host "  4. Copy Project ID and Org ID" -ForegroundColor Gray
Write-Host ""
Write-Host "To get your Vercel token:" -ForegroundColor White
Write-Host "  1. Visit: https://vercel.com/account/tokens" -ForegroundColor Gray
Write-Host "  2. Create a new token" -ForegroundColor Gray
Write-Host "  3. Copy the token" -ForegroundColor Gray
Write-Host ""

$configureVercel = Read-Host "Have you configured Vercel? (y/n)"
if ($configureVercel -eq "y") {
    Write-Host "  ✅ Vercel configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Please configure Vercel before proceeding" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: GitHub Secrets
Write-Host "Step 2: GitHub Secrets Configuration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Add these secrets to your GitHub repository:" -ForegroundColor White
Write-Host "  Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor Gray
Write-Host ""
Write-Host "Required secrets:" -ForegroundColor White
Write-Host "  • VERCEL_TOKEN          (from Vercel account settings)" -ForegroundColor Gray
Write-Host "  • VERCEL_ORG_ID         (from Vercel project settings)" -ForegroundColor Gray
Write-Host "  • VERCEL_PROJECT_ID     (from Vercel project settings)" -ForegroundColor Gray
Write-Host ""
Write-Host "Optional secrets:" -ForegroundColor White
Write-Host "  • CODECOV_TOKEN         (from codecov.io)" -ForegroundColor Gray
Write-Host ""

$configureSecrets = Read-Host "Have you added GitHub secrets? (y/n)"
if ($configureSecrets -eq "y") {
    Write-Host "  ✅ GitHub secrets configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Please add GitHub secrets before pushing" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Codecov (Optional)
Write-Host "Step 3: Codecov Configuration (Optional)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "To enable code coverage reporting:" -ForegroundColor White
Write-Host "  1. Visit: https://codecov.io/" -ForegroundColor Gray
Write-Host "  2. Sign in with GitHub" -ForegroundColor Gray
Write-Host "  3. Add your repository" -ForegroundColor Gray
Write-Host "  4. Copy the upload token" -ForegroundColor Gray
Write-Host "  5. Add as CODECOV_TOKEN secret in GitHub" -ForegroundColor Gray
Write-Host ""

$configureCodecov = Read-Host "Would you like to configure Codecov? (y/n)"
if ($configureCodecov -eq "y") {
    Write-Host "  ✅ Remember to add CODECOV_TOKEN to GitHub secrets" -ForegroundColor Green
} else {
    Write-Host "  ⏭️  Skipping Codecov (coverage will still run locally)" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Branch Protection
Write-Host "Step 4: Branch Protection (Recommended)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "Configure branch protection for 'main':" -ForegroundColor White
Write-Host "  1. Go to: Settings → Branches → Add rule" -ForegroundColor Gray
Write-Host "  2. Branch name pattern: main" -ForegroundColor Gray
Write-Host "  3. Enable:" -ForegroundColor Gray
Write-Host "     • Require a pull request before merging" -ForegroundColor Gray
Write-Host "     • Require status checks to pass" -ForegroundColor Gray
Write-Host "     • Require branches to be up to date" -ForegroundColor Gray
Write-Host "  4. Required status checks:" -ForegroundColor Gray
Write-Host "     • Lint & Format Check" -ForegroundColor Gray
Write-Host "     • TypeScript Type Check" -ForegroundColor Gray
Write-Host "     • Unit & Integration Tests" -ForegroundColor Gray
Write-Host "     • Build Application" -ForegroundColor Gray
Write-Host ""

$configureBranchProtection = Read-Host "Have you configured branch protection? (y/n)"
if ($configureBranchProtection -eq "y") {
    Write-Host "  ✅ Branch protection configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Consider configuring branch protection" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Test the Pipeline
Write-Host "Step 5: Test the CI/CD Pipeline" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "To test the pipeline:" -ForegroundColor White
Write-Host "  1. Create a new branch: git checkout -b test/ci-pipeline" -ForegroundColor Gray
Write-Host "  2. Make a small change (e.g., update README.md)" -ForegroundColor Gray
Write-Host "  3. Commit: git commit -am 'test: verify CI/CD pipeline'" -ForegroundColor Gray
Write-Host "  4. Push: git push origin test/ci-pipeline" -ForegroundColor Gray
Write-Host "  5. Create a Pull Request on GitHub" -ForegroundColor Gray
Write-Host "  6. Watch the CI/CD pipeline run" -ForegroundColor Gray
Write-Host ""

$testPipeline = Read-Host "Would you like to create a test branch now? (y/n)"
if ($testPipeline -eq "y") {
    Write-Host ""
    Write-Host "Creating test branch..." -ForegroundColor Cyan
    
    # Check if branch already exists
    $branchExists = git branch --list "test/ci-pipeline"
    if ($branchExists) {
        Write-Host "  ⚠️  Branch 'test/ci-pipeline' already exists" -ForegroundColor Yellow
        $deleteBranch = Read-Host "Delete and recreate? (y/n)"
        if ($deleteBranch -eq "y") {
            git branch -D test/ci-pipeline
        } else {
            Write-Host "  ⏭️  Skipping branch creation" -ForegroundColor Gray
            $testPipeline = "n"
        }
    }
    
    if ($testPipeline -eq "y") {
        git checkout -b test/ci-pipeline
        
        # Add a test commit
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path "README.md" -Value "`n<!-- CI/CD test: $timestamp -->"
        git add README.md
        git commit -m "test: verify CI/CD pipeline setup"
        
        Write-Host "  ✅ Test branch created with test commit" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor White
        Write-Host "  1. Push: git push origin test/ci-pipeline" -ForegroundColor Gray
        Write-Host "  2. Create PR on GitHub" -ForegroundColor Gray
        Write-Host "  3. Watch the pipeline run" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⏭️  You can test the pipeline later" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ CI/CD workflow file created: .github/workflows/ci.yml" -ForegroundColor Green
Write-Host "📚 Documentation: .github/ACTIONS_SETUP.md" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure Vercel credentials" -ForegroundColor White
Write-Host "  2. Add GitHub secrets" -ForegroundColor White
Write-Host "  3. (Optional) Configure Codecov" -ForegroundColor White
Write-Host "  4. (Recommended) Set up branch protection" -ForegroundColor White
Write-Host "  5. Test the pipeline with a PR" -ForegroundColor White
Write-Host ""

Write-Host "For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "  .github/ACTIONS_SETUP.md" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
