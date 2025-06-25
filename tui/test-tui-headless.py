#!/usr/bin/env python3
"""
Headless test for TUI components
Tests functionality without requiring a terminal
"""

import sys
import os
sys.path.append('.')

from data.file_parser import FileParser, AgentInfo, ReviewItem
from ui.components import AgentListComponent, TaskDetailsComponent, ReviewQueueComponent

def test_file_parser():
    """Test file parser functionality"""
    print("Testing File Parser...")
    
    parser = FileParser()
    
    # Test parsing project state
    state = parser.parse_project_state()
    print(f"✓ Parsed project state: {len(state.agents)} agents, {len(state.review_items)} review items")
    
    # Test manual agent creation
    test_agent = AgentInfo(
        agent_id="test-agent-1",
        status="active",
        current_task="Testing TUI components",
        confidence="high"
    )
    
    print(f"✓ Created test agent: {test_agent.agent_id}")
    return True

def test_ui_components():
    """Test UI components"""
    print("\nTesting UI Components...")
    
    # Test creating all components
    components = {
        'AgentList': AgentListComponent(),
        'TaskDetails': TaskDetailsComponent(),
        'ReviewQueue': ReviewQueueComponent()
    }
    
    for name, component in components.items():
        print(f"✓ Created {name} component")
        print(f"  - Type: {component.pane_type}")
        print(f"  - Preferred width: {component.config.preferred_width}")
        print(f"  - Scrollable: {component.config.scrollable}")
    
    # Test data handling
    agent_list = components['AgentList']
    test_agents = [
        AgentInfo(agent_id="agent-1", status="active", current_task="Task 1"),
        AgentInfo(agent_id="agent-2", status="blocked", current_task="Task 2"),
        AgentInfo(agent_id="agent-3", status="completed", current_task="Task 3")
    ]
    
    agent_list.set_agents(test_agents)
    print(f"\n✓ Set {len(test_agents)} agents in AgentList")
    
    # Test selection
    selected = agent_list.get_selected_agent()
    if selected:
        print(f"✓ Selected agent: {selected.agent_id}")
    
    return True

def test_integration():
    """Test component integration"""
    print("\nTesting Integration...")
    
    # Test layout calculations
    from ui.components import LayoutManager, Layout
    
    layout_mgr = LayoutManager()
    layout = layout_mgr.calculate_layout(120, 40)  # Standard terminal size
    
    print(f"✓ Layout calculated for 120x40 terminal")
    print(f"  - Number of panes: {len(layout.pane_positions)}")
    
    for pane_type, bounds in layout.pane_positions.items():
        print(f"  - {pane_type}: y={bounds[0]}, x={bounds[1]}, h={bounds[2]}, w={bounds[3]}")
    
    return True

def main():
    """Run all tests"""
    print("=== TUI Headless Test Suite ===\n")
    
    tests = [
        ("File Parser", test_file_parser),
        ("UI Components", test_ui_components),
        ("Integration", test_integration)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
                print(f"✗ {test_name} test failed")
        except Exception as e:
            failed += 1
            print(f"✗ {test_name} test error: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n=== Test Summary ===")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Total: {len(tests)}")
    
    if failed == 0:
        print("\n✅ All tests passed! TUI components are working correctly.")
        print("\nNext steps:")
        print("1. Run 'python3 agent-manager.py' in a real terminal")
        print("2. Create some handoff files to see them in the UI")
        print("3. Test the review queue functionality")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)