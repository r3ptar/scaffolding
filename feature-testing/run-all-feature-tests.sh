#!/bin/bash

# Run All Feature Tests
# Executes all feature tests and generates a comprehensive report

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PARALLEL_JOBS=4
TEST_DIR="."
REPORT_DIR="test-results/feature-tests"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SUMMARY_FILE="${REPORT_DIR}/summary-${TIMESTAMP}.json"
HTML_REPORT="${REPORT_DIR}/report-${TIMESTAMP}.html"

# Track results
TOTAL_FEATURES=0
PASSED_FEATURES=0
FAILED_FEATURES=0
SKIPPED_FEATURES=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --parallel|-p)
            PARALLEL_JOBS="$2"
            shift 2
            ;;
        --sequential|-s)
            PARALLEL_JOBS=1
            shift
            ;;
        --filter|-f)
            FILTER_PATTERN="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --parallel, -p <n>    Number of parallel test jobs (default: 4)"
            echo "  --sequential, -s      Run tests sequentially"
            echo "  --filter, -f <pattern> Only run features matching pattern"
            echo "  --help, -h            Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Setup
mkdir -p "$REPORT_DIR"

# Helper functions
log() {
    echo -e "$1"
}

run_feature_test() {
    local feature=$1
    local test_script="./test-feature.sh"
    
    log "${BLUE}Testing ${feature}...${NC}"
    
    if [ -f "$test_script" ]; then
        if $test_script "$feature" --report > "${REPORT_DIR}/${feature}-${TIMESTAMP}.log" 2>&1; then
            log "${GREEN}✓ ${feature} passed${NC}"
            echo "passed"
        else
            log "${RED}✗ ${feature} failed${NC}"
            echo "failed"
        fi
    else
        log "${YELLOW}⚠ ${feature} skipped (no test script)${NC}"
        echo "skipped"
    fi
}

discover_features() {
    log "${BLUE}Discovering features to test...${NC}"
    
    local features=()
    
    # Look for test files in various locations
    local test_patterns=(
        "tests/features/*.test.js"
        "tests/features/*.test.ts"
        "tests/*.test.js"
        "tests/*.test.ts"
        "*/tests/*.test.js"
        "*/tests/*.test.ts"
    )
    
    for pattern in "${test_patterns[@]}"; do
        while IFS= read -r -d '' file; do
            # Extract feature name from filename
            local basename=$(basename "$file")
            local feature="${basename%.test.*}"
            
            # Apply filter if specified
            if [ -n "${FILTER_PATTERN:-}" ]; then
                if [[ ! "$feature" =~ $FILTER_PATTERN ]]; then
                    continue
                fi
            fi
            
            # Add to features array if not already present
            if [[ ! " ${features[@]} " =~ " ${feature} " ]]; then
                features+=("$feature")
            fi
        done < <(find . -path "$pattern" -print0 2>/dev/null)
    done
    
    echo "${features[@]}"
}

generate_html_report() {
    log "${BLUE}Generating HTML report...${NC}"
    
    cat > "$HTML_REPORT" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Feature Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-value {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status-skipped {
            background: #fff3cd;
            color: #856404;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
            margin-top: 40px;
        }
        .charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        canvas {
            max-width: 100%;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="container">
        <h1>Feature Test Report</h1>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-label">Total Features</div>
                <div class="stat-value total">TOTAL_COUNT</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Passed</div>
                <div class="stat-value passed">PASSED_COUNT</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Failed</div>
                <div class="stat-value failed">FAILED_COUNT</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Skipped</div>
                <div class="stat-value skipped">SKIPPED_COUNT</div>
            </div>
        </div>
        
        <div class="charts">
            <div>
                <canvas id="statusChart"></canvas>
            </div>
            <div>
                <canvas id="passRateChart"></canvas>
            </div>
        </div>
        
        <h2>Feature Details</h2>
        <table>
            <thead>
                <tr>
                    <th>Feature</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <!-- Feature rows will be inserted here -->
            </tbody>
        </table>
        
        <div class="timestamp">Generated at: TIMESTAMP_VALUE</div>
    </div>
    
    <script>
        // Status distribution chart
        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Passed', 'Failed', 'Skipped'],
                datasets: [{
                    data: [PASSED_COUNT, FAILED_COUNT, SKIPPED_COUNT],
                    backgroundColor: ['#28a745', '#dc3545', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Test Status Distribution'
                    }
                }
            }
        });
        
        // Pass rate over time (placeholder)
        const passRateCtx = document.getElementById('passRateChart').getContext('2d');
        new Chart(passRateCtx, {
            type: 'line',
            data: {
                labels: ['Previous', 'Current'],
                datasets: [{
                    label: 'Pass Rate %',
                    data: [85, PASS_RATE],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Pass Rate Trend'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    </script>
</body>
</html>
EOF
}

# Main execution
main() {
    log "${CYAN}========================================${NC}"
    log "${CYAN}    Feature Test Suite Runner${NC}"
    log "${CYAN}========================================${NC}"
    log ""
    log "Timestamp: ${TIMESTAMP}"
    log "Parallel Jobs: ${PARALLEL_JOBS}"
    log ""
    
    # Discover features
    IFS=' ' read -r -a features <<< "$(discover_features)"
    TOTAL_FEATURES=${#features[@]}
    
    if [ "$TOTAL_FEATURES" -eq 0 ]; then
        log "${YELLOW}No features found to test${NC}"
        exit 0
    fi
    
    log "Found ${TOTAL_FEATURES} features to test"
    log ""
    
    # Run tests
    if [ "$PARALLEL_JOBS" -eq 1 ]; then
        # Sequential execution
        for feature in "${features[@]}"; do
            result=$(run_feature_test "$feature")
            case $result in
                passed) ((PASSED_FEATURES++)) ;;
                failed) ((FAILED_FEATURES++)) ;;
                skipped) ((SKIPPED_FEATURES++)) ;;
            esac
        done
    else
        # Parallel execution
        export -f run_feature_test log
        export RED GREEN YELLOW BLUE CYAN NC REPORT_DIR TIMESTAMP
        
        # Run tests in parallel and collect results
        printf "%s\n" "${features[@]}" | \
        xargs -P "$PARALLEL_JOBS" -I {} bash -c 'run_feature_test "$@"' _ {} | \
        while read -r result; do
            case $result in
                passed) ((PASSED_FEATURES++)) ;;
                failed) ((FAILED_FEATURES++)) ;;
                skipped) ((SKIPPED_FEATURES++)) ;;
            esac
        done
    fi
    
    # Calculate pass rate
    if [ "$TOTAL_FEATURES" -gt 0 ]; then
        PASS_RATE=$(( (PASSED_FEATURES * 100) / TOTAL_FEATURES ))
    else
        PASS_RATE=0
    fi
    
    # Generate summary JSON
    cat > "$SUMMARY_FILE" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "summary": {
        "total": ${TOTAL_FEATURES},
        "passed": ${PASSED_FEATURES},
        "failed": ${FAILED_FEATURES},
        "skipped": ${SKIPPED_FEATURES},
        "passRate": ${PASS_RATE}
    },
    "features": [
$(for feature in "${features[@]}"; do
    if [ -f "${REPORT_DIR}/${feature}-${TIMESTAMP}.log" ]; then
        echo "        {\"name\": \"${feature}\", \"status\": \"completed\"},"
    fi
done | sed '$ s/,$//')
    ]
}
EOF
    
    # Generate HTML report
    generate_html_report
    
    # Update placeholders in HTML
    sed -i.bak \
        -e "s/TOTAL_COUNT/${TOTAL_FEATURES}/g" \
        -e "s/PASSED_COUNT/${PASSED_FEATURES}/g" \
        -e "s/FAILED_COUNT/${FAILED_FEATURES}/g" \
        -e "s/SKIPPED_COUNT/${SKIPPED_FEATURES}/g" \
        -e "s/PASS_RATE/${PASS_RATE}/g" \
        -e "s/TIMESTAMP_VALUE/${TIMESTAMP}/g" \
        "$HTML_REPORT"
    rm "${HTML_REPORT}.bak"
    
    # Display summary
    log ""
    log "${CYAN}========================================${NC}"
    log "${CYAN}    Test Summary${NC}"
    log "${CYAN}========================================${NC}"
    log ""
    log "Total Features: ${TOTAL_FEATURES}"
    log "${GREEN}Passed: ${PASSED_FEATURES}${NC}"
    log "${RED}Failed: ${FAILED_FEATURES}${NC}"
    log "${YELLOW}Skipped: ${SKIPPED_FEATURES}${NC}"
    log ""
    log "Pass Rate: ${PASS_RATE}%"
    log ""
    log "Reports generated:"
    log "  - Summary: ${SUMMARY_FILE}"
    log "  - HTML Report: ${HTML_REPORT}"
    log ""
    
    # Exit with appropriate code
    if [ "$FAILED_FEATURES" -gt 0 ]; then
        log "${RED}❌ Some features failed!${NC}"
        exit 1
    else
        log "${GREEN}✅ All features passed!${NC}"
        exit 0
    fi
}

# Run main function
main "$@"