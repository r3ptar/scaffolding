#!/usr/bin/env python3
"""
Production Agent Manager TUI - Complete integration of all components
Sprint 2 deliverable: Fully functional, tested terminal interface

Key features:
- Robust error handling and recovery
- Real-time data updates
- Complete keyboard navigation
- Integration with human-review scripts
- Production-ready reliability
"""

import sys
import os
import signal
import subprocess
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Add all modules to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from core.tui_engine import TUIEngine, TUIError
from ui.components import create_agent_manager_ui, PaneType
from data.file_parser import FileParser, ProjectState
import curses

class AgentManagerApp:
    """
    Complete Agent Manager application with all functionality integrated.
    
    Features:
    - Real-time agent and review queue monitoring
    - Keyboard navigation and control
    - Integration with human-review scripts
    - Automatic refresh and error recovery
    - Production-ready error handling
    """
    
    def __init__(self, debug: bool = False):
        self.debug = debug
        self.tui_engine = TUIEngine(debug=debug)
        self.file_parser = FileParser(debug=debug)
        self.layout_manager = None
        self.components = None
        self.last_data_refresh = datetime.now()
        self.refresh_interval = timedelta(seconds=10)  # Refresh every 10 seconds
        self.current_state: Optional[ProjectState] = None
        
        # Status tracking
        self.status_message = "Agent Manager Ready"
        self.error_count = 0
        self.last_action = "startup"
        
        # Create UI components
        self._initialize_ui()
        
        # Set up TUI engine handlers
        self._setup_handlers()
        
    def _initialize_ui(self):
        """Initialize UI components"""
        try:
            self.layout_manager, self.components = create_agent_manager_ui()
            self.tui_engine.logger.info("UI components initialized successfully")
        except Exception as e:
            raise TUIError(f"Failed to initialize UI: {e}")
            
    def _setup_handlers(self):
        """Setup TUI engine event handlers"""
        self.tui_engine.set_draw_handler(self._draw_interface)
        self.tui_engine.set_input_handler(self._handle_input)
        self.tui_engine.set_resize_handler(self._handle_resize)
        self.tui_engine.set_error_handler(self._handle_error)
        
    def _refresh_data(self, force: bool = False):
        """Refresh data from files"""
        try:
            # Check if refresh is needed
            if not force and datetime.now() - self.last_data_refresh < self.refresh_interval:
                return
                
            # Parse current project state
            self.current_state = self.file_parser.parse_project_state(force_refresh=force)
            
            # Update UI components with new data
            if self.current_state:
                # Update agents list
                agents_list = list(self.current_state.agents.values())
                self.components[PaneType.AGENTS].set_agents(agents_list)
                
                # Update review queue
                self.components[PaneType.REVIEW].set_review_items(self.current_state.review_items)
                
                # Update task details for selected agent
                selected_agent = self.components[PaneType.AGENTS].get_selected_agent()
                self.components[PaneType.TASKS].set_selected_agent(selected_agent)
                
                # Update details pane based on current focus
                self._update_details_pane()
                
            self.last_data_refresh = datetime.now()
            self.status_message = f"Data refreshed at {self.last_data_refresh.strftime('%H:%M:%S')}"
            
        except Exception as e:
            self.error_count += 1
            self.status_message = f"Error refreshing data: {e}"
            self.tui_engine.logger.error(f"Data refresh error: {e}")
            
    def _update_details_pane(self):
        """Update details pane content based on current focus"""
        try:
            details_lines = []
            
            if self.layout_manager.focused_pane == PaneType.AGENTS:
                # Show selected agent details
                selected_agent = self.components[PaneType.AGENTS].get_selected_agent()
                if selected_agent:
                    details_lines = self._format_agent_details(selected_agent)
                else:
                    details_lines = ["No agent selected"]
                    
            elif self.layout_manager.focused_pane == PaneType.REVIEW:
                # Show selected review item details
                selected_item = self.components[PaneType.REVIEW].get_selected_item()
                if selected_item:
                    details_lines = self._format_review_details(selected_item)
                else:
                    details_lines = ["No review item selected"]
                    
            else:
                # Show general information
                details_lines = self._format_general_details()
                
            self.components[PaneType.DETAILS].set_content(details_lines)
            
        except Exception as e:
            self.tui_engine.logger.error(f"Error updating details pane: {e}")
            
    def _format_agent_details(self, agent) -> list:
        """Format agent details for display"""
        lines = [
            f"Agent: {agent.agent_id}",
            f"Status: {agent.status}",
            f"Confidence: {agent.confidence}",
            f"Priority: {agent.priority}",
            "",
            "Current Task:",
            f"  {agent.current_task}",
            ""
        ]
        
        if agent.last_update:
            time_ago = datetime.now() - agent.last_update
            hours = time_ago.seconds // 3600
            minutes = (time_ago.seconds // 60) % 60
            lines.append(f"Last Update: {hours}h {minutes}m ago")
        else:
            lines.append("Last Update: Unknown")
            
        lines.append("")
        
        if agent.files_owned:
            lines.append("Files Owned:")
            for file_path in agent.files_owned:
                lines.append(f"  {file_path}")
            lines.append("")
            
        if agent.blockers:
            lines.append("Blockers:")
            for blocker in agent.blockers:
                lines.append(f"  • {blocker}")
            lines.append("")
            
        if agent.handoff_file:
            lines.append(f"Handoff File: {agent.handoff_file}")
            
        # Add action hints
        lines.extend([
            "",
            "Actions:",
            "  [Enter] View handoff file",
            "  [h] Create new handoff",
            "  [t] Update task status"
        ])
        
        return lines
        
    def _format_review_details(self, item) -> list:
        """Format review item details for display"""
        lines = [
            f"Agent: {item.agent_id}",
            f"Priority: {item.priority}",
            f"Type: {item.item_type}",
            f"Confidence: {item.confidence}",
            "",
            "Description:",
            f"  {item.description}",
            ""
        ]
        
        if item.timestamp:
            lines.append(f"Added: {item.timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
            
        if item.deadline:
            lines.append(f"Deadline: {item.deadline.strftime('%Y-%m-%d %H:%M:%S')}")
            
        if item.files:
            lines.append("")
            lines.append("Related Files:")
            for file_path in item.files:
                lines.append(f"  {file_path}")
                
        if item.blockers:
            lines.append("")
            lines.append("Blocking:")
            for blocker in item.blockers:
                lines.append(f"  {blocker}")
                
        # Add action hints
        lines.extend([
            "",
            "Actions:",
            "  [a] Approve",
            "  [b] Block",
            "  [r] Request revision",
            "  [d] Defer"
        ])
        
        return lines
        
    def _format_general_details(self) -> list:
        """Format general project details"""
        lines = [
            "Agent Manager Overview",
            "",
        ]
        
        if self.current_state:
            lines.extend([
                f"Total Agents: {len(self.current_state.agents)}",
                f"Review Items: {len(self.current_state.review_items)}",
                f"Last Refresh: {self.current_state.last_refresh.strftime('%H:%M:%S')}",
                ""
            ])
            
            # Agent status summary
            status_counts = {}
            for agent in self.current_state.agents.values():
                status_counts[agent.status] = status_counts.get(agent.status, 0) + 1
                
            lines.append("Agent Status Summary:")
            for status, count in status_counts.items():
                lines.append(f"  {status}: {count}")
                
            lines.append("")
            
            # Review priority summary
            priority_counts = {}
            for item in self.current_state.review_items:
                priority_counts[item.priority] = priority_counts.get(item.priority, 0) + 1
                
            lines.append("Review Queue Summary:")
            for priority, count in priority_counts.items():
                lines.append(f"  {priority}: {count}")
                
        # Add general controls
        lines.extend([
            "",
            "General Controls:",
            "  [Tab] Switch panes",
            "  [r] Refresh data",
            "  [q] Quit",
            "  [?] Help"
        ])
        
        return lines
        
    def _execute_human_review_action(self, action: str, agent_id: str, reason: str = ""):
        """Execute human review action using scripts"""
        try:
            script_path = "docs/human-review/quick-approve.sh"
            
            if not os.path.exists(script_path):
                # Try relative path
                script_path = "../human-review/quick-approve.sh"
                
            if not os.path.exists(script_path):
                self.status_message = "Error: Human review script not found"
                return False
                
            # Execute the approval script
            cmd = [script_path, agent_id, action]
            if reason:
                cmd.append(reason)
                
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                self.status_message = f"✅ {action.title()} action completed for {agent_id}"
                # Force data refresh to show changes
                self._refresh_data(force=True)
                return True
            else:
                self.status_message = f"❌ Error executing {action}: {result.stderr}"
                return False
                
        except subprocess.TimeoutExpired:
            self.status_message = "❌ Timeout executing human review action"
            return False
        except Exception as e:
            self.status_message = f"❌ Error: {e}"
            return False
            
    def _handle_review_action(self, action: str):
        """Handle review queue actions"""
        selected_item = self.components[PaneType.REVIEW].get_selected_item()
        if not selected_item:
            self.status_message = "No review item selected"
            return
            
        reason_map = {
            "approve": "Approved via TUI",
            "block": "Blocked via TUI - needs review",
            "revision": "Revision requested via TUI",
            "defer": "Deferred via TUI"
        }
        
        reason = reason_map.get(action, f"Action: {action}")
        
        if self._execute_human_review_action(action, selected_item.agent_id, reason):
            self.last_action = f"{action} {selected_item.agent_id}"
        else:
            self.last_action = f"failed {action}"
            
    def _draw_interface(self, stdscr, terminal_info):
        """Main drawing function for TUI engine"""
        try:
            # Refresh data if needed
            self._refresh_data()
            
            # Update layout for current terminal size
            self.layout_manager.update_layout(terminal_info.width, terminal_info.height)
            
            # Draw all components
            self.layout_manager.draw_all(stdscr, terminal_info)
            
            # Draw status message
            status_y = terminal_info.height - 1
            status_text = f"Status: {self.status_message} | Last: {self.last_action}"
            self.tui_engine.safe_addstr(status_y, 0, status_text, max_width=terminal_info.width)
            
        except Exception as e:
            self.tui_engine.logger.error(f"Draw error: {e}")
            # Try to display error on screen
            try:
                stdscr.clear()
                stdscr.addstr(0, 0, f"Display Error: {e}")
                stdscr.addstr(1, 0, "Press 'q' to quit or 'r' to retry")
            except:
                pass
                
    def _handle_input(self, key: int):
        """Handle keyboard input"""
        try:
            # Global shortcuts
            if key == ord('q'):
                return "quit"
            elif key == ord('r'):
                self._refresh_data(force=True)
                self.last_action = "refresh"
            elif key == 9:  # Tab
                self.layout_manager.cycle_focus()
                self._update_details_pane()
                self.last_action = "switch pane"
            elif key == ord('?') or key == ord('h'):
                self.status_message = "Help: q=quit, r=refresh, Tab=switch, ↑↓=navigate, a/b/r/d=review actions"
                self.last_action = "help"
                
            # Pane-specific shortcuts
            else:
                action = self.layout_manager.handle_key(key)
                
                if action == "select_agent":
                    # Update task details when agent is selected
                    selected_agent = self.components[PaneType.AGENTS].get_selected_agent()
                    self.components[PaneType.TASKS].set_selected_agent(selected_agent)
                    self._update_details_pane()
                    self.last_action = f"selected {selected_agent.agent_id if selected_agent else 'none'}"
                    
                elif action in ["approve_item", "block_item", "revision_item", "defer_item"]:
                    action_name = action.replace("_item", "")
                    self._handle_review_action(action_name)
                    
                elif action == "select_item":
                    # Update details for selected review item
                    self._update_details_pane()
                    selected_item = self.components[PaneType.REVIEW].get_selected_item()
                    self.last_action = f"selected review {selected_item.agent_id if selected_item else 'none'}"
                    
                # Update details pane when navigation changes
                if key in [curses.KEY_UP, curses.KEY_DOWN, ord('j'), ord('k')]:
                    self._update_details_pane()
                    
        except Exception as e:
            self.tui_engine.logger.error(f"Input handling error: {e}")
            self.status_message = f"Input error: {e}"
            
        return None
        
    def _handle_resize(self, old_info, new_info):
        """Handle terminal resize"""
        try:
            self.layout_manager.update_layout(new_info.width, new_info.height)
            self.status_message = f"Resized to {new_info.width}x{new_info.height}"
            self.last_action = "resize"
        except Exception as e:
            self.tui_engine.logger.error(f"Resize handling error: {e}")
            
    def _handle_error(self, error):
        """Handle errors from TUI engine"""
        self.error_count += 1
        self.status_message = f"Error #{self.error_count}: {error}"
        self.last_action = "error"
        
    def run(self) -> int:
        """Run the agent manager application"""
        try:
            # Initial data load
            self._refresh_data(force=True)
            
            # Run TUI engine
            return self.tui_engine.run()
            
        except Exception as e:
            print(f"Failed to start Agent Manager: {e}", file=sys.stderr)
            return 1

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Agent Manager TUI - Human-in-Loop Control Interface")
    parser.add_argument("--debug", action="store_true", help="Enable debug logging")
    parser.add_argument("--test", action="store_true", help="Run in test mode with mock data")
    
    args = parser.parse_args()
    
    if args.test:
        print("Test mode not implemented yet")
        return 1
        
    try:
        print("Starting Agent Manager TUI...")
        print("Terminal interface for multi-agent workflow management")
        print("Press 'q' to quit, '?' for help")
        print()
        
        # Check terminal compatibility
        from core.tui_engine import test_terminal_compatibility
        compat = test_terminal_compatibility()
        
        if not compat['supported']:
            print(f"Terminal compatibility issue: {compat.get('error', 'Unknown error')}")
            print("The TUI may not work properly in this terminal.")
            
            response = input("Continue anyway? [y/N]: ")
            if response.lower() != 'y':
                return 1
                
        app = AgentManagerApp(debug=args.debug)
        return app.run()
        
    except KeyboardInterrupt:
        print("\nAgent Manager terminated by user")
        return 0
    except Exception as e:
        print(f"Error starting Agent Manager: {e}", file=sys.stderr)
        if args.debug:
            import traceback
            traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())