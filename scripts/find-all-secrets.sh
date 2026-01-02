#!/bin/bash
# Find all secret values needed for GitHub Actions

echo "=================================================="
echo "🔍 Finding All GitHub Secrets"
echo "=================================================="
echo ""

echo "✅ SECRETS WE HAVE:"
echo "-------------------"
echo ""
echo "1. SONAR_TOKEN"
echo "   Value: 255bd3d46cbcc47de8b737c0e6549316406e8b57"
echo "   Source: ~/.zshrc"
echo ""

echo "2. SONAR_ORGANIZATION"
echo "   Value: tumativerse"
echo "   Source: sonar-project.properties"
echo ""

echo "=================================================="
echo "🔎 SEARCHING LOCAL ENV FILES:"
echo "=================================================="
echo ""

echo "3. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
if [ -f .env.local ]; then
    VALUE=$(grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local 2>/dev/null | cut -d '=' -f 2 | tr -d '"' | tr -d "'")
    if [ -n "$VALUE" ]; then
        echo "   ✅ Found in .env.local"
        echo "   Value: $VALUE"
    else
        echo "   ⚠️  Not found in .env.local"
    fi
else
    echo "   ❌ .env.local not found"
fi
echo ""

echo "4. CLERK_SECRET_KEY"
if [ -f .env.local ]; then
    VALUE=$(grep "CLERK_SECRET_KEY=" .env.local 2>/dev/null | cut -d '=' -f 2 | tr -d '"' | tr -d "'")
    if [ -n "$VALUE" ]; then
        echo "   ✅ Found in .env.local"
        echo "   Value: $VALUE"
    else
        echo "   ⚠️  Not found in .env.local"
    fi
else
    echo "   ❌ .env.local not found"
fi
echo ""

echo "5. CODECOV_TOKEN"
# Check all env files
FOUND=false
for file in .env .env.local .env.production; do
    if [ -f "$file" ]; then
        VALUE=$(grep "CODECOV_TOKEN" "$file" 2>/dev/null | cut -d '=' -f 2 | tr -d '"' | tr -d "'")
        if [ -n "$VALUE" ]; then
            echo "   ✅ Found in $file"
            echo "   Value: $VALUE"
            FOUND=true
            break
        fi
    fi
done
if [ "$FOUND" = false ]; then
    echo "   ❌ Not found in any .env file"
    echo "   📍 Get from: https://codecov.io/gh/YOUR_USERNAME/mo-app/settings"
    echo "   Or login to codecov.io → Select mo-app → Settings → Copy upload token"
fi
echo ""

echo "6. SNYK_TOKEN"
# Check all env files
FOUND=false
for file in .env .env.local .env.production; do
    if [ -f "$file" ]; then
        VALUE=$(grep "SNYK_TOKEN" "$file" 2>/dev/null | cut -d '=' -f 2 | tr -d '"' | tr -d "'")
        if [ -n "$VALUE" ]; then
            echo "   ✅ Found in $file"
            echo "   Value: $VALUE"
            FOUND=true
            break
        fi
    fi
done
if [ "$FOUND" = false ]; then
    echo "   ❌ Not found in any .env file"
    echo "   📍 Get from: https://app.snyk.io/account"
    echo "   Or login to snyk.io → Account Settings → General → Auth Token → Show"
fi
echo ""

echo "=================================================="
echo "📋 SUMMARY - Copy these to GitHub Secrets:"
echo "=================================================="
echo ""
echo "Go to: https://github.com/YOUR_USERNAME/mo-app/settings/secrets/actions"
echo ""
echo "Add each secret by clicking 'New repository secret'"
echo ""
echo "Note: For Clerk keys, using production keys is fine since"
echo "      you don't have a separate test environment."
echo ""
echo "=================================================="
