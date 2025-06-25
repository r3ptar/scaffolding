#!/usr/bin/env python3
"""
UI Components - Modular terminal interface components
Agent 2 deliverable: Responsive UI system with ranger-style layout

Key features:
- Resizable panes with automatic layout
- Status indicators with color coding
- Scrollable content areas
- Responsive design for various terminal sizes
- Keyboard navigation integration
"""

import curses
import math
from typing import Dict, List, Optional, Tuple, Any, Callable
from dataclasses import dataclass
from enum import Enum
import sys
import os

# Add data module to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.file_parser import AgentInfo, ReviewItem

class PaneType(Enum):
    """Types of UI panes"""
    AGENTS = "agents"
    TASKS = "tasks" 
    REVIEW = "review"
    DETAILS = "details"
    STATUS = "status"

@dataclass
class PaneConfig:
    """Configuration for a UI pane"""
    title: str
    min_width: int = 20
    min_height: int = 5
    preferred_width: int = 40
    preferred_height: int = 15
    scrollable: bool = True
    border: bool = True

@dataclass
class Layout:
    """Terminal layout configuration"""
    total_width: int
    total_height: int
    pane_positions: Dict[PaneType, Tuple[int, int, int, int]]  # (y, x, height, width)
    
class UIComponent:
    """Base class for UI components"""
    
    def __init__(self, pane_type: PaneType, config: PaneConfig):
        self.pane_type = pane_type
        self.config = config
        self.y = 0
        self.x = 0
        self.height = config.preferred_height
        self.width = config.preferred_width
        self.scroll_offset = 0
        self.selected_index = 0
        self.is_focused = False
        self.content_height = 0
        
    def set_dimensions(self, y: int, x: int, height: int, width: int):
        """Set component dimensions"""
        self.y = y
        self.x = x
        self.height = max(height, self.config.min_height)
        self.width = max(width, self.config.min_width)
        
    def set_focus(self, focused: bool):
        """Set focus state"""
        self.is_focused = focused
        
    def scroll_up(self, lines: int = 1):
        """Scroll content up"""
        if self.config.scrollable:
            self.scroll_offset = max(0, self.scroll_offset - lines)
            
    def scroll_down(self, lines: int = 1):
        """Scroll content down"""
        if self.config.scrollable:
            max_scroll = max(0, self.content_height - (self.height - 2))  # -2 for border
            self.scroll_offset = min(max_scroll, self.scroll_offset + lines)
            
    def move_selection(self, delta: int):
        """Move selection cursor"""
        # Override in subclasses
        pass
        
    def get_content_lines(self) -> List[str]:
        """Get content lines for display (override in subclasses)"""
        return []
        
    def handle_key(self, key: int) -> Optional[str]:
        """Handle keyboard input (override in subclasses)"""
        return None
        
    def draw(self, stdscr, terminal_info) -> bool:
        """Draw the component"""
        try:
            # Draw border if enabled
            if self.config.border:
                self._draw_border(stdscr)
                content_y = self.y + 1
                content_x = self.x + 1
                content_height = self.height - 2
                content_width = self.width - 2
            else:
                content_y = self.y
                content_x = self.x
                content_height = self.height
                content_width = self.width
                
            # Draw content
            self._draw_content(stdscr, content_y, content_x, content_height, content_width, terminal_info)
            
            return True
            
        except Exception as e:
            # Log error but don't crash
            return False
            
    def _draw_border(self, stdscr):
        """Draw border around component"""
        try:
            # Determine border style based on focus
            border_attr = curses.A_REVERSE if self.is_focused else curses.A_NORMAL
            
            # Top border with title
            title = f" {self.config.title} "
            if self.is_focused:
                title = f"┌─ {self.config.title} ─"
            else:
                title = f"┌─ {self.config.title} ─"
                
            # Pad title to width
            title_padded = title + "─" * max(0, self.width - len(title) - 1) + "┐"
            if len(title_padded) > self.width:
                title_padded = title_padded[:self.width-1] + "┐"
                
            stdscr.addstr(self.y, self.x, title_padded[:self.width], border_attr)
            
            # Side borders
            for i in range(1, self.height - 1):
                if self.y + i < curses.LINES and self.x < curses.COLS:
                    stdscr.addstr(self.y + i, self.x, "│", border_attr)
                if self.y + i < curses.LINES and self.x + self.width - 1 < curses.COLS:
                    stdscr.addstr(self.y + i, self.x + self.width - 1, "│", border_attr)
                    
            # Bottom border
            if self.y + self.height - 1 < curses.LINES:
                bottom_line = "└" + "─" * (self.width - 2) + "┘"
                stdscr.addstr(self.y + self.height - 1, self.x, bottom_line[:self.width], border_attr)
                
        except curses.error:
            pass  # Ignore drawing errors
            
    def _draw_content(self, stdscr, y: int, x: int, height: int, width: int, terminal_info):
        """Draw component content (override in subclasses)"""
        lines = self.get_content_lines()
        self.content_height = len(lines)
        
        # Calculate visible range
        start_line = self.scroll_offset
        end_line = min(len(lines), start_line + height)
        
        # Draw visible lines
        for i, line_idx in enumerate(range(start_line, end_line)):
            if i >= height:
                break
                
            line = lines[line_idx]
            
            # Truncate line to fit width
            if len(line) > width:
                line = line[:width-1] + "…"
                
            # Highlight selected line
            attr = curses.A_REVERSE if (line_idx == self.selected_index and self.is_focused) else curses.A_NORMAL
            
            try:
                stdscr.addstr(y + i, x, line.ljust(width)[:width], attr)
            except curses.error:
                pass

class AgentListComponent(UIComponent):
    """Component for displaying agent list"""
    
    def __init__(self):
        config = PaneConfig(
            title="Agents",
            min_width=25,
            preferred_width=35,
            scrollable=True
        )
        super().__init__(PaneType.AGENTS, config)
        self.agents: List[AgentInfo] = []
        
    def set_agents(self, agents: List[AgentInfo]):
        """Update agent list"""
        self.agents = agents
        self.selected_index = min(self.selected_index, len(agents) - 1) if agents else 0
        
    def get_selected_agent(self) -> Optional[AgentInfo]:
        """Get currently selected agent"""
        if 0 <= self.selected_index < len(self.agents):
            return self.agents[self.selected_index]
        return None
        
    def move_selection(self, delta: int):
        """Move agent selection"""
        if self.agents:
            self.selected_index = max(0, min(len(self.agents) - 1, self.selected_index + delta))
            
            # Auto-scroll to keep selection visible
            visible_height = self.height - 2  # Account for border
            if self.selected_index < self.scroll_offset:
                self.scroll_offset = self.selected_index
            elif self.selected_index >= self.scroll_offset + visible_height:
                self.scroll_offset = self.selected_index - visible_height + 1
                
    def get_content_lines(self) -> List[str]:
        """Generate agent list content"""
        if not self.agents:
            return ["No agents found"]
            
        lines = []
        for agent in self.agents:
            # Status icon
            status_icon = {
                "active": "🟢",
                "blocked": "🔴",
                "completed": "✅", 
                "idle": "⚪"
            }.get(agent.status, "❓")
            
            # Confidence icon
            confidence_icon = {
                "high": "🟢",
                "medium": "🟡",
                "low": "🔴"
            }.get(agent.confidence, "🟡")
            
            # Format line
            line = f"{status_icon} {agent.agent_id:<12} {confidence_icon}"
            lines.append(line)
            
        return lines
        
    def handle_key(self, key: int) -> Optional[str]:
        """Handle keyboard input for agent list"""
        if key == curses.KEY_UP or key == ord('k'):
            self.move_selection(-1)
        elif key == curses.KEY_DOWN or key == ord('j'):
            self.move_selection(1)
        elif key == ord('\n') or key == ord(' '):
            return "select_agent"
        return None

class TaskDetailsComponent(UIComponent):
    """Component for displaying task details"""
    
    def __init__(self):
        config = PaneConfig(
            title="Current Tasks",
            min_width=30,
            preferred_width=45,
            scrollable=True
        )
        super().__init__(PaneType.TASKS, config)
        self.selected_agent: Optional[AgentInfo] = None
        
    def set_selected_agent(self, agent: Optional[AgentInfo]):
        """Set the agent to display details for"""
        self.selected_agent = agent
        self.scroll_offset = 0
        
    def get_content_lines(self) -> List[str]:
        """Generate task details content"""
        if not self.selected_agent:
            return ["No agent selected"]
            
        agent = self.selected_agent
        lines = []
        
        lines.append(f"Agent: {agent.agent_id}")
        lines.append(f"Status: {agent.status}")
        lines.append("")
        
        # Task description (word wrap)
        task_lines = self._wrap_text(f"Task: {agent.current_task}", self.width - 4)
        lines.extend(task_lines)
        lines.append("")
        
        lines.append(f"Confidence: {agent.confidence}")
        
        if agent.last_update:
            from datetime import datetime
            time_ago = datetime.now() - agent.last_update
            hours = time_ago.seconds // 3600
            minutes = (time_ago.seconds // 60) % 60
            lines.append(f"Last Update: {hours}h {minutes}m ago")
        else:
            lines.append("Last Update: Unknown")
            
        lines.append("")
        
        if agent.files_owned:
            lines.append("Files Owned:")
            for file_path in agent.files_owned[:5]:  # Show first 5
                lines.append(f"  {file_path}")
            if len(agent.files_owned) > 5:
                lines.append(f"  ... and {len(agent.files_owned) - 5} more")
                
        if agent.blockers:
            lines.append("")
            lines.append("Blockers:")
            for blocker in agent.blockers[:3]:  # Show first 3
                blocker_lines = self._wrap_text(f"  • {blocker}", self.width - 4)
                lines.extend(blocker_lines)
                
        return lines
        
    def _wrap_text(self, text: str, width: int) -> List[str]:
        """Wrap text to fit within specified width"""
        if not text:
            return [""]
            
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            if not current_line:
                current_line = word
            elif len(current_line) + 1 + len(word) <= width:
                current_line += " " + word
            else:
                lines.append(current_line)
                current_line = word
                
        if current_line:
            lines.append(current_line)
            
        return lines if lines else [""]

class ReviewQueueComponent(UIComponent):
    """Component for displaying review queue"""
    
    def __init__(self):
        config = PaneConfig(
            title="Review Queue",
            min_width=25,
            preferred_width=40,
            scrollable=True
        )
        super().__init__(PaneType.REVIEW, config)
        self.review_items: List[ReviewItem] = []
        
    def set_review_items(self, items: List[ReviewItem]):
        """Update review items"""
        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2}
        self.review_items = sorted(items, key=lambda x: priority_order.get(x.priority, 3))
        self.selected_index = min(self.selected_index, len(self.review_items) - 1) if self.review_items else 0
        
    def get_selected_item(self) -> Optional[ReviewItem]:
        """Get currently selected review item"""
        if 0 <= self.selected_index < len(self.review_items):
            return self.review_items[self.selected_index]
        return None
        
    def move_selection(self, delta: int):
        """Move review item selection"""
        if self.review_items:
            self.selected_index = max(0, min(len(self.review_items) - 1, self.selected_index + delta))
            
            # Auto-scroll to keep selection visible
            visible_height = self.height - 2
            if self.selected_index < self.scroll_offset:
                self.scroll_offset = self.selected_index
            elif self.selected_index >= self.scroll_offset + visible_height:
                self.scroll_offset = self.selected_index - visible_height + 1
                
    def get_content_lines(self) -> List[str]:
        """Generate review queue content"""
        if not self.review_items:
            return ["No review items"]
            
        lines = []
        for item in self.review_items:
            # Priority icon
            priority_icon = {
                "critical": "🚨",
                "high": "🟡", 
                "medium": "🟢"
            }.get(item.priority, "🟢")
            
            # Format line
            desc = item.description
            max_desc_len = self.width - 20  # Account for icons and agent ID
            if len(desc) > max_desc_len:
                desc = desc[:max_desc_len-1] + "…"
                
            line = f"{priority_icon} {item.agent_id}: {desc}"
            lines.append(line)
            
        return lines
        
    def handle_key(self, key: int) -> Optional[str]:
        """Handle keyboard input for review queue"""
        if key == curses.KEY_UP or key == ord('k'):
            self.move_selection(-1)
        elif key == curses.KEY_DOWN or key == ord('j'):
            self.move_selection(1)
        elif key == ord('a'):
            return "approve_item"
        elif key == ord('b'):
            return "block_item"
        elif key == ord('r'):
            return "revision_item"
        elif key == ord('d'):
            return "defer_item"
        elif key == ord('\n'):
            return "select_item"
        return None

class DetailsComponent(UIComponent):
    """Component for displaying detailed information"""
    
    def __init__(self):
        config = PaneConfig(
            title="Details",
            min_width=40,
            preferred_width=60,
            scrollable=True
        )
        super().__init__(PaneType.DETAILS, config)
        self.content_lines: List[str] = []
        
    def set_content(self, lines: List[str]):
        """Set detail content lines"""
        self.content_lines = lines
        self.scroll_offset = 0
        
    def get_content_lines(self) -> List[str]:
        """Get detail content"""
        return self.content_lines if self.content_lines else ["No details available"]

class LayoutManager:
    """Manages terminal layout and component positioning"""
    
    def __init__(self):
        self.components: Dict[PaneType, UIComponent] = {}
        self.current_layout: Optional[Layout] = None
        self.focused_pane: PaneType = PaneType.AGENTS
        
    def add_component(self, component: UIComponent):
        """Add a component to the layout"""
        self.components[component.pane_type] = component
        
    def calculate_layout(self, terminal_width: int, terminal_height: int) -> Layout:
        """Calculate optimal layout for given terminal size"""
        
        # Reserve space for header and footer
        header_height = 3
        footer_height = 3
        available_height = terminal_height - header_height - footer_height
        available_width = terminal_width
        
        # Three-pane layout: Agents | Tasks | Review
        #                    Details (bottom)
        
        top_pane_height = available_height * 2 // 3
        details_height = available_height - top_pane_height
        
        pane_width = available_width // 3
        
        pane_positions = {
            PaneType.AGENTS: (header_height, 0, top_pane_height, pane_width),
            PaneType.TASKS: (header_height, pane_width, top_pane_height, pane_width),
            PaneType.REVIEW: (header_height, pane_width * 2, top_pane_height, available_width - pane_width * 2),
            PaneType.DETAILS: (header_height + top_pane_height, 0, details_height, available_width)
        }
        
        return Layout(
            total_width=terminal_width,
            total_height=terminal_height,
            pane_positions=pane_positions
        )
        
    def update_layout(self, terminal_width: int, terminal_height: int):
        """Update component layout for new terminal size"""
        self.current_layout = self.calculate_layout(terminal_width, terminal_height)
        
        # Update component dimensions
        for pane_type, component in self.components.items():
            if pane_type in self.current_layout.pane_positions:
                y, x, height, width = self.current_layout.pane_positions[pane_type]
                component.set_dimensions(y, x, height, width)
                
    def set_focus(self, pane_type: PaneType):
        """Set focus to specific pane"""
        # Remove focus from all components
        for component in self.components.values():
            component.set_focus(False)
            
        # Set focus to selected component
        if pane_type in self.components:
            self.components[pane_type].set_focus(True)
            self.focused_pane = pane_type
            
    def cycle_focus(self):
        """Cycle focus to next pane"""
        pane_order = [PaneType.AGENTS, PaneType.TASKS, PaneType.REVIEW, PaneType.DETAILS]
        
        try:
            current_index = pane_order.index(self.focused_pane)
            next_index = (current_index + 1) % len(pane_order)
            self.set_focus(pane_order[next_index])
        except ValueError:
            self.set_focus(PaneType.AGENTS)
            
    def handle_key(self, key: int) -> Optional[str]:
        """Handle keyboard input for focused component"""
        focused_component = self.components.get(self.focused_pane)
        if focused_component:
            return focused_component.handle_key(key)
        return None
        
    def draw_all(self, stdscr, terminal_info):
        """Draw all components"""
        # Clear screen
        stdscr.clear()
        
        # Draw header
        self._draw_header(stdscr, terminal_info)
        
        # Draw all components
        for component in self.components.values():
            component.draw(stdscr, terminal_info)
            
        # Draw footer
        self._draw_footer(stdscr, terminal_info)
        
    def _draw_header(self, stdscr, terminal_info):
        """Draw header with title and status"""
        title = "🤖 Agent Manager - Human-in-Loop Control Interface"
        try:
            stdscr.addstr(0, 0, title[:terminal_info.width-1], curses.A_BOLD)
            
            # Status line with summary
            agent_component = self.components.get(PaneType.AGENTS)
            review_component = self.components.get(PaneType.REVIEW)
            
            active_agents = len(agent_component.agents) if agent_component else 0
            review_items = len(review_component.review_items) if review_component else 0
            
            status_line = f"Agents: {active_agents} | Review Items: {review_items} | Focus: {self.focused_pane.value}"
            stdscr.addstr(1, 0, status_line[:terminal_info.width-1])
            
            # Separator
            stdscr.addstr(2, 0, "─" * terminal_info.width)
            
        except curses.error:
            pass
            
    def _draw_footer(self, stdscr, terminal_info):
        """Draw footer with controls"""
        try:
            footer_y = terminal_info.height - 3
            
            stdscr.addstr(footer_y, 0, "─" * terminal_info.width)
            
            controls = "[q]uit [r]efresh [Tab] switch panes [↑↓] navigate [a]pprove [b]lock"
            stdscr.addstr(footer_y + 1, 0, controls[:terminal_info.width-1], curses.A_DIM)
            
            # Current focus hint
            focus_hint = f"Focus: {self.focused_pane.value} | [h]elp for more commands"
            stdscr.addstr(footer_y + 2, 0, focus_hint[:terminal_info.width-1], curses.A_DIM)
            
        except curses.error:
            pass

# Factory function for creating complete UI
def create_agent_manager_ui() -> Tuple[LayoutManager, Dict[PaneType, UIComponent]]:
    """Create complete agent manager UI with all components"""
    
    layout_manager = LayoutManager()
    
    # Create components
    agent_list = AgentListComponent()
    task_details = TaskDetailsComponent()
    review_queue = ReviewQueueComponent()
    details_pane = DetailsComponent()
    
    # Add to layout
    layout_manager.add_component(agent_list)
    layout_manager.add_component(task_details)
    layout_manager.add_component(review_queue)
    layout_manager.add_component(details_pane)
    
    # Set initial focus
    layout_manager.set_focus(PaneType.AGENTS)
    
    components = {
        PaneType.AGENTS: agent_list,
        PaneType.TASKS: task_details,
        PaneType.REVIEW: review_queue,
        PaneType.DETAILS: details_pane
    }
    
    return layout_manager, components

if __name__ == "__main__":
    # Test UI components
    print("Testing UI Components...")
    
    # Create mock data
    from data.file_parser import AgentInfo, ReviewItem
    from datetime import datetime
    
    mock_agents = [
        AgentInfo("agent-1", "active", "high", "Working on API endpoints", datetime.now()),
        AgentInfo("agent-2", "blocked", "medium", "Waiting for database schema", datetime.now()),
        AgentInfo("agent-3", "completed", "high", "Finished testing framework", datetime.now())
    ]
    
    mock_reviews = [
        ReviewItem("agent-1", "API endpoint approval needed", "high"),
        ReviewItem("agent-2", "Database changes blocked", "critical"),
        ReviewItem("agent-3", "Testing improvements", "medium")
    ]
    
    # Test component creation
    layout_manager, components = create_agent_manager_ui()
    
    # Set mock data
    components[PaneType.AGENTS].set_agents(mock_agents)
    components[PaneType.REVIEW].set_review_items(mock_reviews)
    components[PaneType.TASKS].set_selected_agent(mock_agents[0])
    
    print("UI components created successfully!")
    print(f"Layout manager has {len(layout_manager.components)} components")
    print("Ready for integration with TUI engine")