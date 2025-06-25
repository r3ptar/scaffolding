# TUI Agent Manager - Installation & Troubleshooting Guide

**Version**: 2.0 (Production Ready)  
**Sprint**: #2 Completion  
**Last Updated**: 2025-06-25

## 🎯 Overview

The TUI Agent Manager is a production-ready terminal interface for managing multi-agent workflows with human-in-the-loop oversight. This guide covers installation, troubleshooting, and optimization.

## 📋 Prerequisites

### Required
- **Python 3.6+** (tested with 3.8-3.11)
- **Unix-like terminal** (macOS, Linux, WSL on Windows)
- **Terminal with curses support** (most modern terminals)

### Optional but Recommended
- **Modern terminal emulator** (iTerm2, Alacritty, Gnome Terminal)
- **Unicode font support** for status icons
- **True color support** (24-bit color) for best experience

## 🚀 Quick Installation

### Method 1: Direct Copy (Recommended)
```bash
# From your project root
cp -r /path/to/scaffolding/docs/scaffolding/tui ./docs/

# Make scripts executable
chmod +x docs/tui/agent-manager-v2.py
chmod +x docs/tui/core/tui_engine.py
chmod +x docs/tui/tests/test_framework.py

# Test installation
python3 docs/tui/agent-manager-v2.py --test
```

### Method 2: Symlink (For Development)
```bash
# Create symlink for easier updates
ln -s /path/to/scaffolding/docs/scaffolding/tui ./docs/tui

# Test
python3 docs/tui/agent-manager-v2.py --debug
```

## 🧪 Testing Your Installation

### 1. Terminal Compatibility Check
```bash
python3 -c "
import curses
try:
    stdscr = curses.initscr()
    height, width = stdscr.getmaxyx()
    colors = curses.has_colors()
    curses.endwin()
    print(f'✅ Terminal compatible: {width}x{height}, colors: {colors}')
except Exception as e:
    print(f'❌ Terminal issue: {e}')
"
```

### 2. Component Testing
```bash
# Test TUI engine
python3 docs/tui/core/tui_engine.py

# Test file parser
python3 docs/tui/data/file_parser.py

# Test UI components
python3 docs/tui/ui/components.py

# Run test suite
python3 docs/tui/tests/test_framework.py
```

### 3. Integration Testing
```bash
# Test with real data (if available)
python3 docs/tui/agent-manager-v2.py --debug

# Test without data (graceful degradation)
cd /tmp && python3 /path/to/tui/agent-manager-v2.py
```

## 🎮 Usage

### Basic Commands
```bash
# Launch agent manager
python3 docs/tui/agent-manager-v2.py

# Launch with debug logging
python3 docs/tui/agent-manager-v2.py --debug

# Check terminal compatibility first
python3 docs/tui/agent-manager-v2.py --test
```

### Keyboard Controls
| Key | Action |
|-----|--------|
| `q` | Quit application |
| `r` | Refresh data |
| `Tab` | Switch between panes |
| `↑↓` / `jk` | Navigate within pane |
| `Enter` | Select item |
| `a` | Approve review item |
| `b` | Block review item |
| `r` | Request revision |
| `d` | Defer item |
| `?` / `h` | Show help |

### Pane Navigation
- **Agents Pane** (left): View all agents and their status
- **Tasks Pane** (center): View selected agent's current task
- **Review Pane** (right): View items needing human review
- **Details Pane** (bottom): Detailed information and actions

## 🔧 Configuration

### Environment Variables
```bash
# Optional configuration
export TUI_REFRESH_INTERVAL=10    # Seconds between data refreshes
export TUI_DEBUG=1                # Enable debug logging
export TUI_LOG_FILE="tui.log"     # Log file location
```

### Project Structure Requirements
```
your-project/
├── docs/
│   ├── human-review/
│   │   ├── quick-approve.sh     # Required for review actions
│   │   └── human-review.md      # Review queue file
│   └── sprints/
│       └── current-sprint.md    # Sprint information
├── handoff-*.md                 # Agent handoff files
└── docs/tui/                   # TUI system (this installation)
```

### Creating Mock Data for Testing
```bash
# Create test handoff files
cat > handoff-20250625_143000.md << 'EOF'
# Enhanced Context Handoff - 2025-06-25 14:30:00

## 📋 Task Summary
**Description**: Testing TUI interface integration
**Priority**: medium
**Confidence**: high
**Handoff Reason**: testing

## 📁 Working Context
**Directory**: /test/project
**Branch**: main
EOF

# Create test review file
mkdir -p docs/sprints
cat > docs/sprints/human-review.md << 'EOF'
# Human Review Queue - Sprint #2

**Last Updated**: 2025-06-25 14:30:22
**Review Status**: 🟡 Needs Attention

## 🚨 CRITICAL (Review Immediately)
**[No critical items] OR:**

## 🟡 HIGH PRIORITY (Daily Review)
- **[test-agent]** - TUI integration testing
  - **Confidence**: 🟢
  - **Deadline**: 2025-06-26

## 🟢 MEDIUM PRIORITY (Weekly Batch Review)
- **[agent-1]** - Documentation updates
  - **Type**: improvement
EOF
```

## 🐛 Troubleshooting

### Common Issues

#### "ImportError: No module named 'curses'"
**Windows Users:**
```bash
# Install windows-curses
pip install windows-curses

# Or use WSL (recommended)
wsl --install
```

#### "Terminal too small" Error
```bash
# Check terminal size
echo "Terminal size: $(tput cols)x$(tput lines)"

# Minimum supported: 80x24
# Recommended: 120x30 or larger
```

#### TUI Crashes on Startup
```bash
# Run with debug mode
python3 docs/tui/agent-manager-v2.py --debug

# Check logs
tail -f tui_engine.log

# Test terminal compatibility
python3 docs/tui/core/tui_engine.py
```

#### "Permission denied" on Scripts
```bash
# Fix permissions
chmod +x docs/human-review/*.sh
chmod +x docs/tui/*.py
```

#### No Data Displayed
```bash
# Check file patterns
ls handoff-*.md
ls docs/sprints/human-review.md

# Test file parser
python3 docs/tui/data/file_parser.py

# Verify file formats match expected patterns
```

#### Review Actions Don't Work
```bash
# Check human-review script exists
ls docs/human-review/quick-approve.sh

# Test script manually
./docs/human-review/quick-approve.sh --status

# Check script permissions
chmod +x docs/human-review/quick-approve.sh
```

### Performance Issues

#### Slow Refresh
```bash
# Reduce refresh frequency
export TUI_REFRESH_INTERVAL=30

# Check file system performance
time ls handoff-*.md

# Monitor file parsing performance
python3 docs/tui/tests/test_framework.py
```

#### High CPU Usage
```bash
# Check for infinite loops in debug mode
python3 docs/tui/agent-manager-v2.py --debug

# Monitor with top/htop
top -p $(pgrep -f agent-manager)

# Disable real-time refresh if needed
# (manual refresh with 'r' key only)
```

### Display Issues

#### Garbled Characters
```bash
# Check locale settings
echo $LANG
echo $LC_ALL

# Set UTF-8 locale
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
```

#### Missing Icons/Colors
```bash
# Test unicode support
python3 -c "print('🟢🟡🔴✅⚠️🚨')"

# Test color support
python3 -c "
import curses
curses.wrapper(lambda x: print('Colors:', curses.has_colors()))
"

# Use ASCII fallback if needed
export TUI_ASCII_ONLY=1
```

#### Layout Issues
```bash
# Check terminal size
resize

# Test different terminal sizes
# Minimum: 80x24
# Recommended: 120x30+
```

## 📊 Performance Optimization

### For Large Projects
```bash
# Limit handoff file scanning
export TUI_MAX_HANDOFFS=50

# Increase cache timeout
export TUI_CACHE_TIMEOUT=60

# Use file watching instead of polling
# (automatic in most systems)
```

### For Remote/SSH Sessions
```bash
# Reduce refresh frequency
export TUI_REFRESH_INTERVAL=30

# Disable unicode if terminal doesn't support
export TUI_ASCII_ONLY=1

# Use screen/tmux for session persistence
screen -S agent-manager python3 docs/tui/agent-manager-v2.py
```

## 🔬 Advanced Testing

### Load Testing
```bash
# Create many handoff files for testing
for i in {1..100}; do
  cp handoff-test.md "handoff-$(date +%s)_$i.md"
done

# Test performance
time python3 docs/tui/data/file_parser.py

# Test TUI with load
python3 docs/tui/agent-manager-v2.py --debug
```

### Cross-Platform Testing
```bash
# Test on different systems
# macOS: Should work out of box
# Linux: Should work with most terminals
# Windows: Requires WSL or windows-curses

# Test different terminals
# iTerm2, Terminal.app, Alacritty, Gnome Terminal, etc.
```

### Integration Testing
```bash
# Test with actual human-review workflow
./docs/human-review/update-review-queue.sh --medium test-agent "Test item"
python3 docs/tui/agent-manager-v2.py

# Test approval workflow
# 1. Launch TUI
# 2. Navigate to review pane
# 3. Press 'a' to approve
# 4. Verify script execution
```

## 📚 API Reference

### File Parser API
```python
from data.file_parser import FileParser

parser = FileParser(debug=True)
state = parser.parse_project_state()

# Access agents
for agent_id, agent in state.agents.items():
    print(f"{agent_id}: {agent.status}")

# Access review items
for item in state.review_items:
    print(f"{item.priority}: {item.description}")
```

### TUI Engine API
```python
from core.tui_engine import TUIEngine

engine = TUIEngine(debug=True)
engine.set_draw_handler(my_draw_function)
engine.set_input_handler(my_input_function)
exit_code = engine.run()
```

### UI Components API
```python
from ui.components import create_agent_manager_ui

layout_manager, components = create_agent_manager_ui()
layout_manager.update_layout(width, height)
layout_manager.draw_all(stdscr, terminal_info)
```

## 🔐 Security Considerations

### File Access
- TUI reads handoff and review files in current directory
- No network access or external commands (except human-review scripts)
- Scripts run with user permissions only

### Input Validation
- All file parsing includes error handling
- Malformed files won't crash the application
- User input is validated before script execution

### Logging
- Debug logs may contain file paths and content
- Logs stored locally only
- No sensitive data logged in normal mode

## 📈 Monitoring

### Built-in Metrics
```bash
# Parser statistics available via API
python3 -c "
from data.file_parser import FileParser
parser = FileParser()
stats = parser.get_parse_statistics()
print(stats)
"
```

### Health Checks
```bash
# Basic health check
python3 docs/tui/agent-manager-v2.py --test

# Detailed diagnostics
python3 docs/tui/tests/test_framework.py

# Performance benchmarks
python3 -c "
from tests.test_framework import benchmark_tui_performance
print(benchmark_tui_performance())
"
```

## 🆘 Getting Help

### Debug Information
When reporting issues, include:
```bash
# System info
uname -a
python3 --version
echo $TERM

# Terminal info
echo "Size: $(tput cols)x$(tput lines)"
python3 -c "import curses; print('Curses available')"

# TUI logs
cat tui_engine.log

# File structure
ls -la handoff-*.md docs/sprints/ docs/human-review/
```

### Support Checklist
1. ✅ Read this troubleshooting guide
2. ✅ Run compatibility tests
3. ✅ Check file permissions and structure
4. ✅ Try debug mode
5. ✅ Gather debug information above

---

## 🎉 Installation Complete!

Your TUI Agent Manager is ready for production use. The system provides:

- **Robust Error Handling** - Graceful degradation and recovery
- **Cross-Platform Support** - Works on macOS, Linux, WSL
- **Real-Time Updates** - Automatic refresh of agent and review data
- **Full Integration** - Connects with existing human-review scripts
- **Production Ready** - Comprehensive testing and validation

**Quick Start:**
```bash
python3 docs/tui/agent-manager-v2.py
```

**Need help?** Check the troubleshooting section above or run with `--debug` for detailed logging.

**Enjoy your optimized multi-agent workflow management! 🚀**