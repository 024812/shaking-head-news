# CI/CD Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Get Vercel Credentials (2 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → General
3. Copy these values:
   - **Project ID**: `prj_xxxxxxxxxxxxx`
   - **Org ID**: `team_xxxxxxxxxxxxx`

4. Go to [Account Tokens](https://vercel.com/account/tokens)
5. Create new token → Copy it

### Step 2: Add GitHub Secrets (1 minute)

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Add these 3 secrets:

| Name                | Value                  |
| ------------------- | ---------------------- |
| `VERCEL_TOKEN`      | Your Vercel token      |
| `VERCEL_ORG_ID`     | Your Vercel org ID     |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |

### Step 3: Test the Pipeline (2 minutes)

```bash
# Create test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "<!-- CI/CD test -->" >> README.md

# Commit and push
git commit -am "test: verify CI/CD pipeline"
git push origin test/ci-pipeline
```

Then create a PR on GitHub and watch the magic happen! ✨

## 📊 What Happens Next?

When you push code or create a PR, the pipeline automatically:

1. ✅ **Checks code quality** (ESLint + Prettier)
2. ✅ **Validates types** (TypeScript)
3. ✅ **Runs tests** (Vitest + Playwright)
4. ✅ **Builds the app** (Next.js)
5. ✅ **Deploys preview** (Vercel)
6. ✅ **Runs performance audit** (Lighthouse)

Total time: ~10-15 minutes

## 🎯 Common Workflows

### Working on a Feature

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

The pipeline will:

- Run all checks
- Deploy a preview
- Comment the preview URL on your PR

### Deploying to Production

```bash
# Merge your PR to main
# Or push directly to main (not recommended)
git checkout main
git merge feature/my-feature
git push origin main
```

The pipeline will:

- Run all checks
- Deploy to production
- Update your live site

## 🔧 Troubleshooting

### "VERCEL_TOKEN not found"

→ Add the secret in GitHub repository settings

### Build fails with env var errors

→ Check Vercel project settings → Environment Variables

### Tests timeout

→ Check if preview deployment is accessible

### Coverage upload fails

→ Add `CODECOV_TOKEN` secret (optional)

## 📚 Full Documentation

- [Detailed Checklist](ACTIONS_SETUP.md)
- [Workflow File](workflows/ci.yml)

## 💡 Pro Tips

1. **Enable branch protection** on `main` to require checks before merge
2. **Set up Codecov** for coverage tracking (optional)
3. **Use conventional commits** for better changelog generation
4. **Review Lighthouse scores** to maintain performance

## 🆘 Need Help?

1. Check the [troubleshooting guide](ACTIONS_SETUP.md#troubleshooting)
2. Review [GitHub Actions logs](../../actions)
3. Check [Vercel deployment logs](https://vercel.com/dashboard)
4. Open an issue in the repository

---

**Ready to go?** Just add those 3 secrets and push your code! 🚀
