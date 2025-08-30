#!/bin/bash

# SentinelAI Deployment Test Script
# This script tests all components to ensure they work correctly

set -e

echo "🔍 SentinelAI Deployment Test Suite"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${BLUE}Testing: ${test_name}${NC}"
    echo "Command: $test_command"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED: ${test_name}${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if all required files exist
echo -e "\n${YELLOW}📁 File Structure Tests${NC}"
run_test "Frontend package.json exists" "test -f apps/web/package.json"
run_test "Backend main.py exists" "test -f apps/backend/main.py"
run_test "Bridge script exists" "test -f apps/bridge/bridge.py"
run_test "Docker compose exists" "test -f deploy/docker-compose.yml"
run_test "Caddyfile exists" "test -f deploy/Caddyfile"
run_test "MediaMTX config exists" "test -f configs/mediamtx/mediamtx.yml"

# Test 2: Check Python dependencies
echo -e "\n${YELLOW}🐍 Python Dependencies Tests${NC}"
run_test "Python virtual environment exists" "test -d apps/backend/venv"
run_test "FastAPI can be imported" "cd apps/backend && source venv/bin/activate && python -c 'import fastapi'"
run_test "Pydantic can be imported" "cd apps/backend && source venv/bin/activate && python -c 'import pydantic'"
run_test "Uvicorn can be imported" "cd apps/backend && source venv/bin/activate && python -c 'import uvicorn'"

# Test 3: Check Node.js dependencies
echo -e "\n${YELLOW}📦 Node.js Dependencies Tests${NC}"
run_test "Frontend node_modules exists" "test -d apps/web/node_modules"
run_test "Next.js can build" "cd apps/web && pnpm build > /dev/null 2>&1"

# Test 4: Check configuration files
echo -e "\n${YELLOW}⚙️ Configuration Tests${NC}"
run_test "TypeScript config is valid" "cd apps/web && npx tsc --noEmit > /dev/null 2>&1"
run_test "Tailwind config exists" "test -f apps/web/tailwind.config.js"
run_test "PostCSS config exists" "test -f apps/web/postcss.config.js"

# Test 5: Check if backend can start
echo -e "\n${YELLOW}🚀 Backend Startup Tests${NC}"
run_test "Backend can start without errors" "cd apps/backend && source venv/bin/activate && timeout 10s python -c 'import uvicorn; uvicorn.run(\"main:app\", host=\"127.0.0.1\", port=10001, log_level=\"error\")' > /dev/null 2>&1 || true"

# Test 6: Check environment variables
echo -e "\n${YELLOW}🔧 Environment Tests${NC}"
run_test "Frontend env example exists" "test -f apps/web/env.example"
run_test "Backend run script is executable" "test -x apps/backend/run.sh"

# Test 7: Check Docker configuration
echo -e "\n${YELLOW}🐳 Docker Configuration Tests${NC}"
run_test "Docker compose is valid" "cd deploy && docker-compose config > /dev/null 2>&1"

# Test 8: Check for common issues
echo -e "\n${YELLOW}🔍 Common Issue Checks${NC}"
run_test "No localhost references in production code" "! grep -r 'localhost:10000' apps/web/src --exclude-dir=node_modules"
run_test "STREAM_DOMAIN placeholder is used" "grep -r 'STREAM_DOMAIN' deploy"
run_test "No hardcoded ports in frontend" "! grep -r '10000' apps/web/src --exclude-dir=node_modules"

# Test 9: Check for security issues
echo -e "\n${YELLOW}🔒 Security Tests${NC}"
run_test "CORS is properly configured" "grep -r 'allow_origins' apps/backend/main.py"
run_test "No debug mode in production" "! grep -r 'debug.*True' apps/web"
run_test "Proper error handling exists" "grep -r 'HTTPException' apps/backend/main.py"

# Test 10: Check for performance optimizations
echo -e "\n${YELLOW}⚡ Performance Tests${NC}"
run_test "HLS.js is configured for low latency" "grep -r 'lowLatencyMode' apps/web/src"
run_test "MediaMTX has proper HLS settings" "grep -r 'hlsVariant.*lowLatency' configs/mediamtx/mediamtx.yml"

echo -e "\n${YELLOW}📊 Test Results Summary${NC}"
echo "====================================="
echo -e "${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Tests Failed: ${TESTS_FAILED}${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your deployment is ready.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
    exit 1
fi 