#!/bin/bash
# Script to extract GitHub Secret values from local environment
# Run this and manually add secrets to GitHub Settings

echo "=================================================="
echo "GitHub Secrets Values for mo-app"
echo "=================================================="
echo ""
echo "⚠️  IMPORTANT: These values must be added manually to GitHub"
echo "   Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions"
echo ""
echo "=================================================="

echo ""
echo "1. SONAR_TOKEN"
echo "   Value: 255bd3d46cbcc47de8b737c0e6549316406e8b57"
echo ""

echo "2. SONAR_ORGANIZATION"
echo "   Value: tumativerse"
echo ""

echo "3. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local 2>/dev/null; then
    VALUE=$(grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local | cut -d '=' -f 2)
    echo "   Value: $VALUE"
else
    echo "   ❌ Not found in .env.local"
    echo "   Get from: https://dashboard.clerk.com → API Keys"
fi
echo ""

echo "4. CLERK_SECRET_KEY"
if grep -q "CLERK_SECRET_KEY" .env.local 2>/dev/null; then
    VALUE=$(grep "CLERK_SECRET_KEY" .env.local | cut -d '=' -f 2)
    echo "   Value: $VALUE"
else
    echo "   ❌ Not found in .env.local"
    echo "   Get from: https://dashboard.clerk.com → API Keys"
fi
echo ""

echo "5. CODECOV_TOKEN (Optional)"
echo "   Get from: https://codecov.io/gh/YOUR_USERNAME/mo-app/settings"
echo "   Or skip and make non-blocking in workflow"
echo ""

echo "6. SNYK_TOKEN (Optional)"
echo "   Get from: https://app.snyk.io/account → Auth Token"
echo "   Or skip and make non-blocking in workflow"
echo ""

echo "=================================================="
echo "How to add these secrets to GitHub:"
echo "=================================================="
echo "1. Go to: https://github.com/YOUR_USERNAME/mo-app"
echo "2. Click: Settings → Secrets and variables → Actions"
echo "3. Click: 'New repository secret'"
echo "4. Name: (use exact names above, e.g., SONAR_TOKEN)"
echo "5. Secret: (paste the value shown above)"
echo "6. Click: 'Add secret'"
echo "7. Repeat for each secret"
echo "=================================================="
