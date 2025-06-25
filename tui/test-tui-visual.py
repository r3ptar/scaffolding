#!/usr/bin/env python3
"""
Visual mockup of TUI interface
Shows what the interface would look like in a terminal
"""

def create_border(width, height, title=""):
    """Create a bordered box with optional title"""
    lines = []
    
    # Top border
    if title:
        title_line = f"┌─ {title} " + "─" * (width - len(title) - 5) + "┐"
    else:
        title_line = "┌" + "─" * (width - 2) + "┐"
    lines.append(title_line)
    
    # Middle lines
    for _ in range(height - 2):
        lines.append("│" + " " * (width - 2) + "│")
    
    # Bottom border
    lines.append("└" + "─" * (width - 2) + "┘")
    
    return lines

def place_text(lines, y, x, text, max_width=None):
    """Place text in the box at specific coordinates"""
    if max_width and len(text) > max_width:
        text = text[:max_width-3] + "..."
    
    if y < len(lines) and x < len(lines[y]) - len(text):
        line = lines[y]
        lines[y] = line[:x] + text + line[x + len(text):]

def create_tui_mockup():
    """Create a visual representation of the TUI"""
    
    # Terminal dimensions
    width = 120
    height = 40
    
    # Create main screen
    screen = [" " * width for _ in range(height)]
    
    # Header
    header = "Agent Manager TUI - Human-in-Loop Control System"
    screen[0] = header.center(width, "═")
    
    # Status bar
    status = "[A]pprove  [R]eject  [Tab] Switch Pane  [Q]uit  [H]elp"
    screen[1] = " " * 2 + status + " " * (width - len(status) - 2)
    
    # Create panes
    # Agent List (left)
    agent_pane = create_border(40, 22, "Agents [5 active]")
    place_text(agent_pane, 2, 2, "→ Agent-1 [ACTIVE] 🟢 High")
    place_text(agent_pane, 3, 2, "  ├─ Task: Implement TUI system")
    place_text(agent_pane, 4, 2, "  └─ Files: 3 owned")
    place_text(agent_pane, 6, 2, "  Agent-2 [BLOCKED] 🟡 Medium")
    place_text(agent_pane, 7, 2, "  ├─ Task: Testing components")
    place_text(agent_pane, 8, 2, "  └─ Blocker: Waiting for Agent-1")
    place_text(agent_pane, 10, 2, "  Agent-3 [COMPLETED] 🟢 High")
    place_text(agent_pane, 11, 2, "  └─ Task: Documentation update")
    
    # Task Details (middle)
    task_pane = create_border(40, 22, "Task Details")
    place_text(task_pane, 2, 2, "Agent: Agent-1")
    place_text(task_pane, 3, 2, "Status: ACTIVE")
    place_text(task_pane, 4, 2, "Confidence: 🟢 High")
    place_text(task_pane, 6, 2, "Current Task:")
    place_text(task_pane, 7, 2, "Implement TUI system with curses")
    place_text(task_pane, 9, 2, "Files Owned:")
    place_text(task_pane, 10, 2, "• tui/agent-manager.py")
    place_text(task_pane, 11, 2, "• tui/core/tui_engine.py")
    place_text(task_pane, 12, 2, "• tui/ui/components.py")
    place_text(task_pane, 14, 2, "Last Update: 2 mins ago")
    place_text(task_pane, 16, 2, "Progress: 75% complete")
    place_text(task_pane, 17, 2, "████████████████████░░░░░")
    
    # Review Queue (right)
    review_pane = create_border(40, 22, "Review Queue [3 pending]")
    place_text(review_pane, 2, 2, "→ [CRITICAL] Agent-4 needs approval")
    place_text(review_pane, 3, 2, "  Database migration ready")
    place_text(review_pane, 4, 2, "  Action: APPROVE / REJECT")
    place_text(review_pane, 6, 2, "  [HIGH] Agent-2 requests review")
    place_text(review_pane, 7, 2, "  API endpoint implementation")
    place_text(review_pane, 9, 2, "  [MEDIUM] Agent-5 handoff ready")
    place_text(review_pane, 10, 2, "  Context preservation needed")
    
    # Details pane (bottom)
    details_pane = create_border(120, 12, "Detailed View")
    place_text(details_pane, 2, 2, "Selected: Agent-1 - Implement TUI system")
    place_text(details_pane, 4, 2, "Description: Creating a terminal user interface for managing multi-agent workflows.")
    place_text(details_pane, 5, 2, "The system provides real-time visibility into agent status, task progress, and")
    place_text(details_pane, 6, 2, "enables human-in-loop decision making for critical operations.")
    place_text(details_pane, 8, 2, "Recent Activity:")
    place_text(details_pane, 9, 2, "• 14:32 - Created core TUI engine with error handling")
    place_text(details_pane, 10, 2, "• 14:45 - Implemented component system for modular UI")
    
    # Place panes on screen
    for i, line in enumerate(agent_pane):
        screen[i + 3] = line + task_pane[i] + review_pane[i]
    
    for i, line in enumerate(details_pane):
        screen[i + 26] = line
    
    # Footer
    footer = f"Context: 45% | Agents: 5 | Queue: 3 | Uptime: 2h 15m"
    screen[38] = "─" * width
    screen[39] = footer.center(width)
    
    return screen

def main():
    print("\n" + "="*50)
    print("TUI VISUAL MOCKUP - This is what you'd see in a terminal:")
    print("="*50 + "\n")
    
    mockup = create_tui_mockup()
    for line in mockup:
        print(line)
    
    print("\n" + "="*50)
    print("KEY FEATURES DEMONSTRATED:")
    print("="*50)
    print("1. Three-pane layout: Agents | Tasks | Review Queue")
    print("2. Details pane at bottom for expanded information")
    print("3. Color-coded confidence levels (🟢🟡🔴)")
    print("4. Real-time status tracking")
    print("5. Keyboard navigation with shortcuts")
    print("6. Human-in-loop approval workflow")
    print("\nTo run the actual TUI: python3 agent-manager.py")

if __name__ == "__main__":
    main()