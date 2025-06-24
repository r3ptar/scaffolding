#!/bin/bash

# Feature Testing Runner
# Tests individual features with comprehensive validation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
FEATURE_NAME=""
TEST_ENV="development"
GENERATE_REPORT=false
VERBOSE=false
TEST_DIR="."

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            TEST_ENV="$2"
            shift 2
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --dir)
            TEST_DIR="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 <feature-name> [options]"
            echo "Options:"
            echo "  --env <env>       Test environment (default: development)"
            echo "  --report          Generate detailed test report"
            echo "  --verbose, -v     Show detailed test output"
            echo "  --dir <path>      Test directory (default: current)"
            echo "  --help, -h        Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 inventory"
            echo "  $0 combat --env staging --report"
            echo "  $0 adventure --verbose"
            exit 0
            ;;
        *)
            FEATURE_NAME="$1"
            shift
            ;;
    esac
done

# Validate feature name
if [ -z "$FEATURE_NAME" ]; then
    echo -e "${RED}Error: Feature name required${NC}"
    echo "Usage: $0 <feature-name> [options]"
    exit 1
fi

# Setup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_DIR="test-results/feature-tests/${FEATURE_NAME}"
REPORT_FILE="${RESULTS_DIR}/test-report-${TIMESTAMP}.json"
LOG_FILE="${RESULTS_DIR}/test-log-${TIMESTAMP}.log"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Helper functions
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "$1" | tee -a "$LOG_FILE"
    else
        echo -e "$1" >> "$LOG_FILE"
    fi
}

check_prerequisites() {
    log "${BLUE}Checking prerequisites...${NC}"
    
    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        log "${RED}npm not found. Please install Node.js${NC}"
        exit 1
    fi
    
    # Check if feature test file exists
    local test_files=(
        "${TEST_DIR}/tests/features/${FEATURE_NAME}.test.js"
        "${TEST_DIR}/tests/features/${FEATURE_NAME}.test.ts"
        "${TEST_DIR}/tests/${FEATURE_NAME}.test.js"
        "${TEST_DIR}/tests/${FEATURE_NAME}.test.ts"
    )
    
    local test_file=""
    for file in "${test_files[@]}"; do
        if [ -f "$file" ]; then
            test_file="$file"
            break
        fi
    done
    
    if [ -z "$test_file" ]; then
        log "${YELLOW}No test file found for feature: ${FEATURE_NAME}${NC}"
        log "Looked in: ${test_files[*]}"
        return 1
    fi
    
    log_verbose "Found test file: $test_file"
    echo "$test_file"
}

run_api_tests() {
    log "${BLUE}Running API tests for ${FEATURE_NAME}...${NC}"
    
    # Check API health
    local api_health=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Basic bGxtdXNlcjp0aGVjb29raWVqYXI=" \
        -H "OpenAI-Authorization: Bearer billding" \
        http://localhost:3000/v1/health || echo "000")
    
    if [ "$api_health" != "200" ]; then
        log "${YELLOW}Warning: API not responding (status: $api_health)${NC}"
    fi
    
    # Run API-specific tests
    local api_test_cmd="npm test -- --testNamePattern='API|api|endpoint' --testPathPattern='${FEATURE_NAME}'"
    log_verbose "Running: $api_test_cmd"
    
    if $api_test_cmd 2>&1 | tee -a "$LOG_FILE"; then
        log "${GREEN}✓ API tests passed${NC}"
        return 0
    else
        log "${RED}✗ API tests failed${NC}"
        return 1
    fi
}

run_frontend_tests() {
    log "${BLUE}Running frontend tests for ${FEATURE_NAME}...${NC}"
    
    # Check if frontend is running
    local frontend_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")
    
    if [ "$frontend_health" != "200" ]; then
        log "${YELLOW}Warning: Frontend not responding (status: $frontend_health)${NC}"
    fi
    
    # Run frontend-specific tests
    local frontend_test_cmd="npm test -- --testNamePattern='UI|ui|component|Component' --testPathPattern='${FEATURE_NAME}'"
    log_verbose "Running: $frontend_test_cmd"
    
    if $frontend_test_cmd 2>&1 | tee -a "$LOG_FILE"; then
        log "${GREEN}✓ Frontend tests passed${NC}"
        return 0
    else
        log "${RED}✗ Frontend tests failed${NC}"
        return 1
    fi
}

run_integration_tests() {
    log "${BLUE}Running integration tests for ${FEATURE_NAME}...${NC}"
    
    # Run full integration tests
    local integration_test_cmd="npm test -- --testNamePattern='integration|Integration|e2e|E2E' --testPathPattern='${FEATURE_NAME}'"
    log_verbose "Running: $integration_test_cmd"
    
    if $integration_test_cmd 2>&1 | tee -a "$LOG_FILE"; then
        log "${GREEN}✓ Integration tests passed${NC}"
        return 0
    else
        log "${RED}✗ Integration tests failed${NC}"
        return 1
    fi
}

run_performance_tests() {
    log "${BLUE}Running performance tests for ${FEATURE_NAME}...${NC}"
    
    # Simple performance check
    local start_time=$(date +%s%N)
    
    # Run a basic performance test
    curl -s -w "Response time: %{time_total}s\n" \
        -H "Authorization: Basic bGxtdXNlcjp0aGVjb29raWVqYXI=" \
        -H "OpenAI-Authorization: Bearer billding" \
        "http://localhost:3000/v1/${FEATURE_NAME}" > /dev/null
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    log_verbose "Performance test completed in ${duration}ms"
    
    if [ "$duration" -lt 1000 ]; then
        log "${GREEN}✓ Performance tests passed (${duration}ms)${NC}"
        return 0
    else
        log "${YELLOW}⚠ Performance warning: ${duration}ms${NC}"
        return 0
    fi
}

generate_report() {
    log "${BLUE}Generating test report...${NC}"
    
    # Create JSON report
    cat > "$REPORT_FILE" << EOF
{
  "feature": "${FEATURE_NAME}",
  "environment": "${TEST_ENV}",
  "timestamp": "${TIMESTAMP}",
  "results": {
    "api_tests": ${API_RESULT:-false},
    "frontend_tests": ${FRONTEND_RESULT:-false},
    "integration_tests": ${INTEGRATION_RESULT:-false},
    "performance_tests": ${PERFORMANCE_RESULT:-false}
  },
  "summary": {
    "total_tests": 4,
    "passed": ${PASSED_COUNT:-0},
    "failed": ${FAILED_COUNT:-0},
    "duration": "${DURATION:-0}s"
  },
  "logs": "${LOG_FILE}"
}
EOF
    
    log "${GREEN}Report generated: ${REPORT_FILE}${NC}"
    
    # Display summary
    log ""
    log "Test Summary for ${FEATURE_NAME}:"
    log "================================"
    log "Environment: ${TEST_ENV}"
    log "Total Tests: 4"
    log "${GREEN}Passed: ${PASSED_COUNT:-0}${NC}"
    log "${RED}Failed: ${FAILED_COUNT:-0}${NC}"
    log "Duration: ${DURATION:-0}s"
    log ""
    
    if [ "${FAILED_COUNT:-0}" -gt 0 ]; then
        log "${RED}❌ Feature tests FAILED${NC}"
        return 1
    else
        log "${GREEN}✅ All feature tests PASSED${NC}"
        return 0
    fi
}

# Main execution
main() {
    local start_time=$(date +%s)
    
    log "${BLUE}Starting feature tests for: ${FEATURE_NAME}${NC}"
    log "Environment: ${TEST_ENV}"
    log "Timestamp: ${TIMESTAMP}"
    log ""
    
    # Check prerequisites
    if ! TEST_FILE=$(check_prerequisites); then
        log "${RED}Prerequisites check failed${NC}"
        exit 1
    fi
    
    # Track results
    PASSED_COUNT=0
    FAILED_COUNT=0
    
    # Run different test types
    if run_api_tests; then
        API_RESULT=true
        ((PASSED_COUNT++))
    else
        API_RESULT=false
        ((FAILED_COUNT++))
    fi
    
    if run_frontend_tests; then
        FRONTEND_RESULT=true
        ((PASSED_COUNT++))
    else
        FRONTEND_RESULT=false
        ((FAILED_COUNT++))
    fi
    
    if run_integration_tests; then
        INTEGRATION_RESULT=true
        ((PASSED_COUNT++))
    else
        INTEGRATION_RESULT=false
        ((FAILED_COUNT++))
    fi
    
    if run_performance_tests; then
        PERFORMANCE_RESULT=true
        ((PASSED_COUNT++))
    else
        PERFORMANCE_RESULT=false
        ((FAILED_COUNT++))
    fi
    
    # Calculate duration
    local end_time=$(date +%s)
    DURATION=$((end_time - start_time))
    
    # Generate report if requested
    if [ "$GENERATE_REPORT" = true ]; then
        generate_report
    else
        log ""
        log "Test Results: ${GREEN}${PASSED_COUNT} passed${NC}, ${RED}${FAILED_COUNT} failed${NC}"
        log "Duration: ${DURATION}s"
    fi
    
    # Exit with appropriate code
    if [ "$FAILED_COUNT" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Run main function
main "$@"