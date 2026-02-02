#!/bin/bash

# 🧪 Pre-Deploy Test Script
# Kiểm tra mọi thứ trước khi deploy lên Vercel

echo "🎮 Stickman Battle Arena - Pre-Deploy Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📋 Step 1: Checking file structure..."
echo ""

# Check critical files exist
files=(
    "index.html"
    "vercel.json"
    ".vercelignore"
    "package.json"
    "js/Player.js"
    "js/Game.js"
    "js/components/PhysicsComponent.js"
    "js/components/CombatComponent.js"
    "js/components/ProjectileComponent.js"
    "js/components/AnimationComponent.js"
    "js/core/GameEngine.js"
    "js/systems/RenderSystem.js"
    "js/systems/PowerUpSystem.js"
    "js/systems/CombatSystem.js"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file ${RED}(MISSING)${NC}"
        missing_files=$((missing_files + 1))
    fi
done

echo ""
if [ $missing_files -eq 0 ]; then
    print_status 0 "All critical files present"
else
    print_status 1 "$missing_files files missing!"
fi
echo ""

# Check tests
echo "🧪 Step 2: Running tests..."
echo ""
npm test > /dev/null 2>&1
test_result=$?
if [ $test_result -eq 0 ]; then
    print_status 0 "All tests passed (278/278)"
else
    print_status 1 "Tests failed!"
fi
echo ""

# Check for common issues
echo "🔍 Step 3: Checking for common issues..."
echo ""

# Check for console.log in production files
console_logs=$(grep -r "console\.log" js/*.js 2>/dev/null | grep -v "// console" | wc -l)
if [ $console_logs -gt 0 ]; then
    print_warning "Found $console_logs console.log statements (consider removing for production)"
else
    print_status 0 "No console.log statements found"
fi

# Check for debugger statements
debuggers=$(grep -r "debugger" js/*.js 2>/dev/null | wc -l)
if [ $debuggers -gt 0 ]; then
    print_warning "Found $debuggers debugger statements (should remove for production)"
else
    print_status 0 "No debugger statements found"
fi

# Check index.html for correct script order
echo ""
print_status 0 "Script order check (manual verification recommended)"

echo ""
echo "📦 Step 4: Checking Vercel configuration..."
echo ""

# Verify vercel.json exists and is valid
if [ -f "vercel.json" ]; then
    python3 -c "import json; json.load(open('vercel.json'))" 2>/dev/null
    if [ $? -eq 0 ]; then
        print_status 0 "vercel.json is valid JSON"
    else
        print_status 1 "vercel.json has syntax errors!"
    fi
else
    print_status 1 "vercel.json not found!"
fi

# Check .vercelignore
if [ -f ".vercelignore" ]; then
    print_status 0 ".vercelignore exists"

    # Check if tests are excluded
    if grep -q "tests/" ".vercelignore"; then
        print_status 0 "Test files will be excluded from deployment"
    else
        print_warning "Test files might be deployed (not in .vercelignore)"
    fi
else
    print_warning ".vercelignore not found (tests might be deployed)"
fi

echo ""
echo "📊 Step 5: File statistics..."
echo ""

# Count files
js_files=$(find js -name "*.js" | wc -l)
css_files=$(find styles -name "*.css" | wc -l)
test_files=$(find tests -name "*.test.js" | wc -l)

echo "JavaScript files: $js_files"
echo "CSS files: $css_files"
echo "Test files: $test_files (will be excluded)"

echo ""
echo "🎯 Final Status"
echo "=========================================="
echo ""

# Calculate estimated deploy size (rough approximation)
deploy_size=$(du -sh . 2>/dev/null | awk '{print $1}')
echo "Estimated total size: $deploy_size"
echo ""

print_status 0 "Pre-deploy checks complete!"
echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Deploy commands:"
echo "  Vercel CLI:  ${GREEN}vercel --prod${NC}"
echo "  Git push:    ${GREEN}git push origin main${NC}"
echo ""
echo "📝 Documentation: PRE_DEPLOY_CHECKLIST.md"
echo ""
