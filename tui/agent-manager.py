#!/usr/bin/env python3
"""
Agent Manager TUI - Terminal interface for human-in-loop agent management
Inspired by ranger file manager, optimized for multi-agent workflow oversight

Usage: python3 agent-manager.py
Dependencies: Standard Python 3.6+ (no external dependencies)
"""

import curses
import os
import sys
import json
import time
import glob
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import re

class AgentStatus:
    """Represents the current status of an agent"""
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.status = "unknown"  # active, blocked, completed, idle
        self.confidence = "medium"  # high, medium, low
        self.current_task = "No active task"
        self.last_update = None
        self.files_owned = []
        self.blockers = []
        self.handoff_ready = False
        
    @classmethod
    def from_handoff_file(cls, handoff_file: str) -> 'AgentStatus':
        """Create AgentStatus from handoff file content"""
        agent = cls("unknown")
        try:
            with open(handoff_file, 'r') as f:
                content = f.read()
                
            # Extract agent info from handoff
            if match := re.search(r'handoff-(\d+_\d+)', handoff_file):
                agent.agent_id = f"handoff-{match.group(1)}"
                
            # Extract task description
            if match := re.search(r'\*\*Description\*\*: (.+)', content):
                agent.current_task = match.group(1).strip()
                
            # Extract confidence
            if match := re.search(r'\*\*Confidence\*\*: (\w+)', content):
                agent.confidence = match.group(1).lower()
                
            # Extract priority/status
            if match := re.search(r'\*\*Priority\*\*: (\w+)', content):
                priority = match.group(1).lower()
                agent.status = "blocked" if priority == "critical" else "active"
                
            # Extract blockers
            if "## 🚨 Blockers" in content:
                agent.status = "blocked"
                blocker_section = content.split("## 🚨 Blockers")[1].split("##")[0]
                agent.blockers = [line.strip() for line in blocker_section.split('\n') if line.strip()]
                
            # Set last update time from file modification
            agent.last_update = datetime.fromtimestamp(os.path.getmtime(handoff_file))
            
        except Exception as e:
            print(f"Error parsing handoff file {handoff_file}: {e}", file=sys.stderr)
            
        return agent

class ReviewItem:
    """Represents an item in the human review queue"""
    def __init__(self, agent_id: str, description: str, priority: str = "medium"):
        self.agent_id = agent_id
        self.description = description
        self.priority = priority  # critical, high, medium
        self.timestamp = datetime.now()
        self.files = []
        self.blockers = []
        
    @property
    def priority_icon(self) -> str:
        return {"critical": "🚨", "high": "🟡", "medium": "🟢"}.get(self.priority, "🟢")

class AgentManager:
    """Main TUI application for agent management"""
    
    def __init__(self):
        self.agents: Dict[str, AgentStatus] = {}
        self.review_items: List[ReviewItem] = []
        self.current_pane = 0  # 0=agents, 1=tasks, 2=review
        self.selected_agent = 0
        self.selected_review = 0
        self.status_message = "Agent Manager Ready"
        self.last_refresh = datetime.now()
        
        # Paths
        self.handoff_pattern = "handoff-*.md"
        self.review_file = "docs/sprints/human-review.md"
        self.decisions_dir = ".decisions"
        
        # Ensure decisions directory exists
        os.makedirs(self.decisions_dir, exist_ok=True)
        
    def discover_agents(self):
        """Discover agents from handoff files and sprint assignments"""
        self.agents.clear()
        
        # Discover from handoff files
        handoff_files = glob.glob(self.handoff_pattern)
        for handoff_file in sorted(handoff_files, key=os.path.getmtime, reverse=True):
            agent = AgentStatus.from_handoff_file(handoff_file)
            if agent.agent_id not in self.agents:
                self.agents[agent.agent_id] = agent
                
        # Discover from sprint file if available
        if os.path.exists("docs/sprints/current-sprint.md"):
            try:
                with open("docs/sprints/current-sprint.md", 'r') as f:
                    content = f.read()
                    
                # Extract agent assignments
                if "## 🗂️ File Ownership" in content:
                    ownership_section = content.split("## 🗂️ File Ownership")[1].split("##")[0]
                    for line in ownership_section.split('\n'):
                        if match := re.search(r'\*\*Agent (\d+)\*\*: `([^`]+)`', line):
                            agent_id = f"agent-{match.group(1)}"
                            files = match.group(2)
                            
                            if agent_id not in self.agents:
                                self.agents[agent_id] = AgentStatus(agent_id)
                            
                            self.agents[agent_id].files_owned = [f.strip() for f in files.split(',')]
                            
                            # Determine status from recent activity
                            if agent_id not in [a.agent_id for a in self.agents.values() if a.last_update]:
                                self.agents[agent_id].status = "idle"
                                self.agents[agent_id].current_task = "No recent activity"
                                
            except Exception as e:
                self.status_message = f"Error reading sprint file: {e}"
                
        # If no agents found, create default set
        if not self.agents:
            for i in range(1, 7):
                agent_id = f"agent-{i}"
                self.agents[agent_id] = AgentStatus(agent_id)
                self.agents[agent_id].status = "idle"
                self.agents[agent_id].current_task = "No active tasks"
                
    def load_review_queue(self):
        """Load items from human review queue"""
        self.review_items.clear()
        
        if not os.path.exists(self.review_file):
            return
            
        try:
            with open(self.review_file, 'r') as f:
                content = f.read()
                
            # Parse each priority section
            for priority, section_marker in [
                ("critical", "🚨 CRITICAL"),
                ("high", "🟡 HIGH PRIORITY"),
                ("medium", "🟢 MEDIUM PRIORITY")
            ]:
                if section_marker in content:
                    section = content.split(section_marker)[1].split("##")[0]
                    for line in section.split('\n'):
                        if match := re.search(r'- \*\*\[([^\]]+)\]\*\* - (.+)', line):
                            agent_id = match.group(1)
                            description = match.group(2)
                            
                            item = ReviewItem(agent_id, description, priority)
                            self.review_items.append(item)
                            
        except Exception as e:
            self.status_message = f"Error loading review queue: {e}"
            
    def get_agent_status_summary(self) -> Dict[str, int]:
        """Get summary of agent statuses"""
        summary = {"active": 0, "blocked": 0, "completed": 0, "idle": 0}
        for agent in self.agents.values():
            summary[agent.status] = summary.get(agent.status, 0) + 1
        return summary
        
    def get_stale_agents(self, hours: int = 2) -> List[AgentStatus]:
        """Get agents with no activity for specified hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        return [agent for agent in self.agents.values() 
                if agent.last_update and agent.last_update < cutoff]
                
    def approve_agent_request(self, agent_id: str, decision: str, reason: str = ""):
        """Approve/block an agent request"""
        try:
            decision_file = os.path.join(self.decisions_dir, f"{agent_id}-decision")
            with open(decision_file, 'w') as f:
                f.write(f"DECISION: {decision}\n")
                f.write(f"REASON: {reason}\n")
                f.write(f"TIMESTAMP: {datetime.now().isoformat()}\n")
                f.write(f"STATUS: active\n")
                
            # Remove from review queue by calling quick-approve script
            if os.path.exists("docs/scaffolding/human-review/quick-approve.sh"):
                subprocess.run([
                    "docs/scaffolding/human-review/quick-approve.sh",
                    agent_id, decision, reason
                ], capture_output=True)
                
            self.status_message = f"✅ {decision.title()} decision recorded for {agent_id}"
            return True
            
        except Exception as e:
            self.status_message = f"❌ Error recording decision: {e}"
            return False
            
    def refresh_data(self):
        """Refresh all data from files"""
        self.discover_agents()
        self.load_review_queue()
        self.last_refresh = datetime.now()
        self.status_message = f"Refreshed at {self.last_refresh.strftime('%H:%M:%S')}"
        
    def draw_header(self, stdscr, height: int, width: int):
        """Draw the header with title and status"""
        title = "🤖 Agent Manager - Human-in-Loop Control Interface"
        status_summary = self.get_agent_status_summary()
        
        # Title line
        stdscr.addstr(0, 0, title[:width-1], curses.A_BOLD)
        
        # Status line
        status_line = f"Active: {status_summary['active']} | Blocked: {status_summary['blocked']} | " \
                     f"Review Items: {len(self.review_items)} | Last Refresh: {self.last_refresh.strftime('%H:%M:%S')}"
        stdscr.addstr(1, 0, status_line[:width-1])
        
        # Separator
        stdscr.addstr(2, 0, "─" * width)
        
    def draw_agents_pane(self, stdscr, start_y: int, height: int, width: int, is_active: bool):
        """Draw the agents list pane"""
        title = "┌─ Agents ─" + ("─" * (width - 11)) + "┐"
        if is_active:
            stdscr.addstr(start_y, 0, title, curses.A_REVERSE)
        else:
            stdscr.addstr(start_y, 0, title)
            
        y = start_y + 1
        
        agents_list = list(self.agents.values())
        for i, agent in enumerate(agents_list[:height-2]):
            status_icon = {
                "active": "🟢",
                "blocked": "🔴", 
                "completed": "✅",
                "idle": "⚪"
            }.get(agent.status, "❓")
            
            confidence_icon = {
                "high": "🟢",
                "medium": "🟡", 
                "low": "🔴"
            }.get(agent.confidence, "🟡")
            
            line = f"{status_icon} {agent.agent_id:<10} {confidence_icon}"
            
            if is_active and i == self.selected_agent:
                stdscr.addstr(y + i, 0, line[:width-1], curses.A_REVERSE)
            else:
                stdscr.addstr(y + i, 0, line[:width-1])
                
    def draw_tasks_pane(self, stdscr, start_y: int, height: int, width: int, is_active: bool):
        """Draw the current tasks pane"""
        title = "┌─ Current Tasks ─" + ("─" * (width - 18)) + "┐"
        if is_active:
            stdscr.addstr(start_y, 0, title, curses.A_REVERSE)
        else:
            stdscr.addstr(start_y, 0, title)
            
        y = start_y + 1
        
        agents_list = list(self.agents.values())
        if agents_list and self.selected_agent < len(agents_list):
            selected_agent = agents_list[self.selected_agent]
            
            # Show selected agent's current task
            task_lines = [
                f"Agent: {selected_agent.agent_id}",
                f"Status: {selected_agent.status}",
                f"Task: {selected_agent.current_task[:width-10]}",
                f"Confidence: {selected_agent.confidence}",
                ""
            ]
            
            if selected_agent.last_update:
                time_ago = datetime.now() - selected_agent.last_update
                task_lines.append(f"Last Update: {time_ago.seconds//3600}h {(time_ago.seconds//60)%60}m ago")
            else:
                task_lines.append("Last Update: Unknown")
                
            if selected_agent.files_owned:
                task_lines.append("Files Owned:")
                for file_path in selected_agent.files_owned[:3]:
                    task_lines.append(f"  {file_path}")
                    
            if selected_agent.blockers:
                task_lines.append("Blockers:")
                for blocker in selected_agent.blockers[:2]:
                    task_lines.append(f"  {blocker[:width-5]}")
                    
            for i, line in enumerate(task_lines[:height-2]):
                stdscr.addstr(y + i, 0, line[:width-1])
                
    def draw_review_pane(self, stdscr, start_y: int, height: int, width: int, is_active: bool):
        """Draw the review queue pane"""
        title = "┌─ Review Queue ─" + ("─" * (width - 17)) + "┐"
        if is_active:
            stdscr.addstr(start_y, 0, title, curses.A_REVERSE)
        else:
            stdscr.addstr(start_y, 0, title)
            
        y = start_y + 1
        
        # Sort review items by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2}
        sorted_items = sorted(self.review_items, key=lambda x: priority_order.get(x.priority, 3))
        
        for i, item in enumerate(sorted_items[:height-2]):
            line = f"{item.priority_icon} {item.agent_id}: {item.description[:width-15]}"
            
            if is_active and i == self.selected_review:
                stdscr.addstr(y + i, 0, line[:width-1], curses.A_REVERSE)
            else:
                stdscr.addstr(y + i, 0, line[:width-1])
                
    def draw_details_pane(self, stdscr, start_y: int, height: int, width: int):
        """Draw the details pane at the bottom"""
        title = "┌─ Details ─" + ("─" * (width - 12)) + "┐"
        stdscr.addstr(start_y, 0, title)
        
        y = start_y + 1
        
        if self.current_pane == 2 and self.review_items:  # Review pane active
            priority_order = {"critical": 0, "high": 1, "medium": 2}
            sorted_items = sorted(self.review_items, key=lambda x: priority_order.get(x.priority, 3))
            
            if self.selected_review < len(sorted_items):
                item = sorted_items[self.selected_review]
                details = [
                    f"Agent: {item.agent_id}",
                    f"Priority: {item.priority}",
                    f"Description: {item.description}",
                    f"Timestamp: {item.timestamp.strftime('%Y-%m-%d %H:%M:%S')}",
                    "",
                    "Actions: [a]pprove [b]lock [r]evision [d]efer [Enter] details"
                ]
                
                for i, line in enumerate(details[:height-2]):
                    stdscr.addstr(y + i, 0, line[:width-1])
                    
        elif self.current_pane == 0 and self.agents:  # Agents pane active
            agents_list = list(self.agents.values())
            if self.selected_agent < len(agents_list):
                agent = agents_list[self.selected_agent]
                details = [
                    f"Agent: {agent.agent_id}",
                    f"Status: {agent.status}",
                    f"Current Task: {agent.current_task}",
                    f"Confidence: {agent.confidence}",
                    "",
                    "Actions: [h]andoff [t]ask [Enter] details [Tab] switch panes"
                ]
                
                for i, line in enumerate(details[:height-2]):
                    stdscr.addstr(y + i, 0, line[:width-1])
        else:
            stdscr.addstr(y, 0, "No details available")
            stdscr.addstr(y + 2, 0, "Navigation: [Tab] switch panes [q] quit [r] refresh")
            
    def draw_footer(self, stdscr, start_y: int, width: int):
        """Draw the footer with status message and controls"""
        controls = "[q]uit [r]efresh [Tab] switch [h]elp"
        stdscr.addstr(start_y, 0, "─" * width)
        stdscr.addstr(start_y + 1, 0, f"Status: {self.status_message}"[:width-1])
        stdscr.addstr(start_y + 2, 0, controls[:width-1], curses.A_DIM)
        
    def handle_input(self, key: int) -> bool:
        """Handle keyboard input. Returns False to quit."""
        
        # Global shortcuts
        if key == ord('q'):
            return False
        elif key == ord('r'):
            self.refresh_data()
        elif key == 9:  # Tab
            self.current_pane = (self.current_pane + 1) % 3
        elif key == ord('?') or key == ord('h'):
            self.show_help()
            
        # Pane-specific shortcuts
        elif self.current_pane == 0:  # Agents pane
            if key == curses.KEY_UP or key == ord('k'):
                self.selected_agent = max(0, self.selected_agent - 1)
            elif key == curses.KEY_DOWN or key == ord('j'):
                self.selected_agent = min(len(self.agents) - 1, self.selected_agent + 1)
                
        elif self.current_pane == 2:  # Review pane
            if key == curses.KEY_UP or key == ord('k'):
                self.selected_review = max(0, self.selected_review - 1)
            elif key == curses.KEY_DOWN or key == ord('j'):
                self.selected_review = min(len(self.review_items) - 1, self.selected_review + 1)
            elif key == ord('a'):
                self.approve_current_item("approved", "Approved via TUI")
            elif key == ord('b'):
                self.approve_current_item("blocked", "Blocked via TUI - needs review")
            elif key == ord('r'):
                self.approve_current_item("needs-revision", "Revision requested via TUI")
            elif key == ord('d'):
                self.approve_current_item("deferred", "Deferred via TUI")
                
        return True
        
    def approve_current_item(self, decision: str, reason: str):
        """Approve the currently selected review item"""
        if not self.review_items:
            return
            
        priority_order = {"critical": 0, "high": 1, "medium": 2}
        sorted_items = sorted(self.review_items, key=lambda x: priority_order.get(x.priority, 3))
        
        if self.selected_review < len(sorted_items):
            item = sorted_items[self.selected_review]
            if self.approve_agent_request(item.agent_id, decision, reason):
                # Refresh to update display
                self.load_review_queue()
                # Adjust selection if needed
                if self.selected_review >= len(self.review_items):
                    self.selected_review = max(0, len(self.review_items) - 1)
                    
    def show_help(self):
        """Show help screen (placeholder)"""
        self.status_message = "Help: q=quit, r=refresh, Tab=switch panes, arrows=navigate, a/b/r/d=approve/block/revision/defer"
        
    def run(self, stdscr):
        """Main TUI loop"""
        # Initialize curses
        curses.curs_set(0)  # Hide cursor
        stdscr.timeout(1000)  # 1 second timeout for getch
        
        # Initial data load
        self.refresh_data()
        
        while True:
            # Get screen dimensions
            height, width = stdscr.getmaxyx()
            stdscr.clear()
            
            # Calculate pane dimensions
            header_height = 3
            footer_height = 3
            available_height = height - header_height - footer_height
            
            pane_height = available_height // 2
            details_height = available_height - pane_height
            
            pane_width = width // 3
            
            # Draw all components
            self.draw_header(stdscr, height, width)
            
            # Top row panes
            self.draw_agents_pane(stdscr, header_height, pane_height, pane_width, self.current_pane == 0)
            self.draw_tasks_pane(stdscr, header_height, pane_height, pane_width, self.current_pane == 1)
            self.draw_review_pane(stdscr, header_height, pane_height, pane_width, self.current_pane == 2)
            
            # Details pane
            details_start = header_height + pane_height
            self.draw_details_pane(stdscr, details_start, details_height, width)
            
            # Footer
            footer_start = height - footer_height
            self.draw_footer(stdscr, footer_start, width)
            
            stdscr.refresh()
            
            # Handle input
            key = stdscr.getch()
            if key != -1:  # Key was pressed
                if not self.handle_input(key):
                    break
                    
            # Auto-refresh every minute
            if datetime.now() - self.last_refresh > timedelta(minutes=1):
                self.refresh_data()

def main():
    """Main entry point"""
    try:
        manager = AgentManager()
        curses.wrapper(manager.run)
    except KeyboardInterrupt:
        print("\nAgent Manager terminated by user")
    except Exception as e:
        print(f"Error running Agent Manager: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()