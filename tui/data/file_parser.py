#!/usr/bin/env python3
"""
File Parser - Reliable parsing with comprehensive validation
Agent 3 deliverable: Robust data integration for TUI components

Key features:
- Handoff file parsing with error recovery
- Review queue parsing with format validation
- Real-time file monitoring
- Data caching for performance
- Comprehensive error handling
"""

import os
import re
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib
import glob

@dataclass
class AgentInfo:
    """Structured agent information"""
    agent_id: str
    status: str = "unknown"  # active, blocked, completed, idle
    confidence: str = "medium"  # high, medium, low
    current_task: str = "No active task"
    last_update: Optional[datetime] = None
    files_owned: List[str] = None
    blockers: List[str] = None
    handoff_file: Optional[str] = None
    priority: str = "medium"
    
    def __post_init__(self):
        if self.files_owned is None:
            self.files_owned = []
        if self.blockers is None:
            self.blockers = []

@dataclass
class ReviewItem:
    """Structured review queue item"""
    agent_id: str
    description: str
    priority: str = "medium"  # critical, high, medium
    timestamp: Optional[datetime] = None
    confidence: str = "medium"
    item_type: str = "unknown"  # feature, improvement, optimization, etc.
    files: List[str] = None
    blockers: List[str] = None
    deadline: Optional[datetime] = None
    
    def __post_init__(self):
        if self.files is None:
            self.files = []
        if self.blockers is None:
            self.blockers = []
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class ProjectState:
    """Overall project state information"""
    agents: Dict[str, AgentInfo]
    review_items: List[ReviewItem]
    last_refresh: datetime
    sprint_info: Dict[str, Any]
    file_hashes: Dict[str, str]  # For change detection
    
    def __post_init__(self):
        if not self.agents:
            self.agents = {}
        if not self.review_items:
            self.review_items = []
        if not self.sprint_info:
            self.sprint_info = {}
        if not self.file_hashes:
            self.file_hashes = {}

class FileParseError(Exception):
    """Custom exception for file parsing errors"""
    pass

class FileParser:
    """
    Robust file parser with comprehensive error handling and validation.
    
    Handles:
    - Handoff file parsing with multiple format support
    - Review queue parsing with error recovery
    - Sprint file integration
    - File change detection and caching
    - Real-time data updates
    """
    
    def __init__(self, debug: bool = False):
        self.debug = debug
        self.logger = self._setup_logging()
        self.cached_data: Optional[ProjectState] = None
        self.cache_timeout = timedelta(seconds=30)  # 30 second cache
        
        # File patterns
        self.handoff_pattern = "handoff-*.md"
        self.review_file = "docs/sprints/human-review.md"
        self.sprint_file = "docs/sprints/current-sprint.md"
        
        # Parsing statistics
        self.parse_stats = {
            'handoff_files_parsed': 0,
            'handoff_files_errors': 0,
            'review_items_parsed': 0,
            'cache_hits': 0,
            'cache_misses': 0
        }
        
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for file parser"""
        logger = logging.getLogger(__name__)
        if not logger.handlers:
            level = logging.DEBUG if self.debug else logging.WARNING
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - FileParser - %(levelname)s - %(message)s')
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            logger.setLevel(level)
        return logger
        
    def _calculate_file_hash(self, filepath: str) -> str:
        """Calculate hash of file for change detection"""
        try:
            with open(filepath, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception:
            return ""
            
    def _has_file_changed(self, filepath: str, cached_hash: str) -> bool:
        """Check if file has changed since last parse"""
        current_hash = self._calculate_file_hash(filepath)
        return current_hash != cached_hash
        
    def _parse_datetime(self, date_str: str) -> Optional[datetime]:
        """Parse datetime from various string formats"""
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%Y-%m-%dT%H:%M:%S",
            "%Y%m%d_%H%M%S",
            "%a %b %d %H:%M:%S %Z %Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
                
        self.logger.warning(f"Could not parse datetime: {date_str}")
        return None
        
    def _extract_agent_from_filename(self, filename: str) -> str:
        """Extract agent ID from handoff filename"""
        # Try to extract from handoff filename pattern
        match = re.search(r'handoff-(\d+)_(\d+)', filename)
        if match:
            return f"handoff-{match.group(1)}_{match.group(2)}"
            
        # Fallback to filename
        return os.path.basename(filename).replace('.md', '')
        
    def _parse_handoff_file(self, filepath: str) -> Optional[AgentInfo]:
        """Parse a handoff file and extract agent information"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract agent ID
            agent_id = self._extract_agent_from_filename(filepath)
            
            # Initialize agent info
            agent = AgentInfo(agent_id=agent_id, handoff_file=filepath)
            
            # Extract task description
            task_match = re.search(r'\*\*Description\*\*:\s*(.+)', content)
            if task_match:
                agent.current_task = task_match.group(1).strip()
            else:
                # Try alternative formats
                summary_match = re.search(r'## 📋 Task Summary\n\*\*Description\*\*:\s*(.+)', content)
                if summary_match:
                    agent.current_task = summary_match.group(1).strip()
                else:
                    # Extract from title or first meaningful line
                    lines = content.split('\n')
                    for line in lines[1:10]:  # Check first 10 lines
                        if line.strip() and not line.startswith('#') and not line.startswith('**'):
                            agent.current_task = line.strip()[:100]  # Limit length
                            break
                            
            # Extract confidence level
            confidence_match = re.search(r'\*\*Confidence\*\*:\s*(\w+)', content)
            if confidence_match:
                agent.confidence = confidence_match.group(1).lower()
                
            # Extract priority
            priority_match = re.search(r'\*\*Priority\*\*:\s*(\w+)', content)
            if priority_match:
                agent.priority = priority_match.group(1).lower()
                
            # Extract handoff reason to determine status
            reason_match = re.search(r'\*\*Handoff Reason\*\*:\s*(\w+)', content)
            if reason_match:
                reason = reason_match.group(1).lower()
                if reason in ['blocked', 'blocking']:
                    agent.status = "blocked"
                elif reason in ['completed', 'done', 'finished']:
                    agent.status = "completed"
                else:
                    agent.status = "active"
                    
            # Extract blockers
            if "## 🚨 Blockers" in content:
                blocker_section = content.split("## 🚨 Blockers")[1].split("##")[0]
                agent.blockers = [
                    line.strip().lstrip('- ').strip() 
                    for line in blocker_section.split('\n') 
                    if line.strip() and line.strip().startswith(('-', '*'))
                ]
                if agent.blockers:
                    agent.status = "blocked"
                    
            # Extract file modification time as last update
            try:
                mtime = os.path.getmtime(filepath)
                agent.last_update = datetime.fromtimestamp(mtime)
            except Exception:
                agent.last_update = datetime.now()
                
            self.parse_stats['handoff_files_parsed'] += 1
            self.logger.debug(f"Parsed handoff file: {filepath} -> {agent.agent_id}")
            
            return agent
            
        except Exception as e:
            self.parse_stats['handoff_files_errors'] += 1
            self.logger.error(f"Error parsing handoff file {filepath}: {e}")
            return None
            
    def _parse_review_file(self, filepath: str) -> List[ReviewItem]:
        """Parse the human review queue file"""
        review_items = []
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Parse each priority section
            sections = {
                'critical': ('🚨 CRITICAL', '🟡 HIGH PRIORITY'),
                'high': ('🟡 HIGH PRIORITY', '🟢 MEDIUM PRIORITY'),
                'medium': ('🟢 MEDIUM PRIORITY', '📊')
            }
            
            for priority, (start_marker, end_marker) in sections.items():
                if start_marker in content:
                    # Extract section content
                    start_idx = content.find(start_marker)
                    if end_marker in content[start_idx:]:
                        end_idx = content.find(end_marker, start_idx)
                        section_content = content[start_idx:end_idx]
                    else:
                        section_content = content[start_idx:]
                        
                    # Parse items in this section
                    items = self._parse_review_section(section_content, priority)
                    review_items.extend(items)
                    
            self.logger.debug(f"Parsed {len(review_items)} review items from {filepath}")
            
        except Exception as e:
            self.logger.error(f"Error parsing review file {filepath}: {e}")
            
        return review_items
        
    def _parse_review_section(self, section_content: str, priority: str) -> List[ReviewItem]:
        """Parse a specific priority section of the review file"""
        items = []
        
        # Pattern to match review items
        item_pattern = r'- \*\*\[([^\]]+)\]\*\* - (.+?)(?=\n  -|\n\n|\n- \*\*|\Z)'
        
        matches = re.finditer(item_pattern, section_content, re.DOTALL)
        
        for match in matches:
            try:
                agent_id = match.group(1).strip()
                description_block = match.group(2).strip()
                
                # Extract main description (first line)
                description_lines = description_block.split('\n')
                description = description_lines[0].strip()
                
                # Remove any blocking information from description
                if " - **BLOCKING**" in description:
                    description = description.split(" - **BLOCKING**")[0].strip()
                    
                # Create review item
                item = ReviewItem(
                    agent_id=agent_id,
                    description=description,
                    priority=priority
                )
                
                # Parse additional details from the block
                for line in description_lines[1:]:
                    line = line.strip()
                    if line.startswith('- **'):
                        # Parse structured fields
                        if '**Confidence**:' in line:
                            conf_match = re.search(r'\*\*Confidence\*\*:\s*(\S+)', line)
                            if conf_match:
                                item.confidence = conf_match.group(1).strip()
                                
                        elif '**Type**:' in line:
                            type_match = re.search(r'\*\*Type\*\*:\s*(\w+)', line)
                            if type_match:
                                item.item_type = type_match.group(1).strip()
                                
                        elif '**Added**:' in line:
                            date_match = re.search(r'\*\*Added\*\*:\s*(.+)', line)
                            if date_match:
                                item.timestamp = self._parse_datetime(date_match.group(1))
                                
                        elif '**Deadline**:' in line:
                            deadline_match = re.search(r'\*\*Deadline\*\*:\s*(.+)', line)
                            if deadline_match:
                                item.deadline = self._parse_datetime(deadline_match.group(1))
                                
                        elif '**Files**:' in line:
                            files_match = re.search(r'\*\*Files\*\*:\s*(.+)', line)
                            if files_match:
                                files_str = files_match.group(1)
                                item.files = [f.strip() for f in files_str.split(',') if f.strip()]
                                
                items.append(item)
                self.parse_stats['review_items_parsed'] += 1
                
            except Exception as e:
                self.logger.warning(f"Error parsing review item: {e}")
                continue
                
        return items
        
    def _parse_sprint_file(self, filepath: str) -> Dict[str, Any]:
        """Parse sprint information file"""
        sprint_info = {}
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract sprint metadata
            title_match = re.search(r'# Sprint #(\d+): (.+?) - (.+?) to (.+)', content)
            if title_match:
                sprint_info.update({
                    'sprint_number': int(title_match.group(1)),
                    'sprint_name': title_match.group(2),
                    'start_date': title_match.group(3),
                    'end_date': title_match.group(4)
                })
                
            # Extract agent file ownership
            if "## 🗂️ File Ownership" in content:
                ownership_section = content.split("## 🗂️ File Ownership")[1].split("##")[0]
                agents_files = {}
                
                for line in ownership_section.split('\n'):
                    match = re.search(r'- \*\*Agent (\d+)\*\*: `([^`]+)`', line)
                    if match:
                        agent_id = f"agent-{match.group(1)}"
                        files = [f.strip() for f in match.group(2).split(',')]
                        agents_files[agent_id] = files
                        
                sprint_info['agent_files'] = agents_files
                
            # Extract sprint health
            health_match = re.search(r'## 📊 Sprint Health: (.+)', content)
            if health_match:
                sprint_info['health'] = health_match.group(1).strip()
                
            # Extract completion percentage
            completion_match = re.search(r'\*\*Completed\*\*: (\d+)/(\d+) tasks \((\d+)%\)', content)
            if completion_match:
                sprint_info.update({
                    'completed_tasks': int(completion_match.group(1)),
                    'total_tasks': int(completion_match.group(2)),
                    'completion_percentage': int(completion_match.group(3))
                })
                
        except Exception as e:
            self.logger.error(f"Error parsing sprint file {filepath}: {e}")
            
        return sprint_info
        
    def _discover_handoff_files(self) -> List[str]:
        """Discover all handoff files in the current directory"""
        try:
            # Get all handoff files, sorted by modification time (newest first)
            handoff_files = glob.glob(self.handoff_pattern)
            handoff_files.sort(key=os.path.getmtime, reverse=True)
            return handoff_files
        except Exception as e:
            self.logger.error(f"Error discovering handoff files: {e}")
            return []
            
    def _should_refresh_cache(self) -> bool:
        """Check if cache should be refreshed"""
        if not self.cached_data:
            return True
            
        # Check cache timeout
        if datetime.now() - self.cached_data.last_refresh > self.cache_timeout:
            return True
            
        # Check if any tracked files have changed
        for filepath, cached_hash in self.cached_data.file_hashes.items():
            if os.path.exists(filepath) and self._has_file_changed(filepath, cached_hash):
                self.logger.debug(f"File changed: {filepath}")
                return True
                
        return False
        
    def parse_project_state(self, force_refresh: bool = False) -> ProjectState:
        """
        Parse complete project state from all available files.
        
        Args:
            force_refresh: Force refresh even if cache is valid
            
        Returns:
            ProjectState object with all parsed data
        """
        
        # Check if we can use cached data
        if not force_refresh and not self._should_refresh_cache():
            self.parse_stats['cache_hits'] += 1
            return self.cached_data
            
        self.parse_stats['cache_misses'] += 1
        self.logger.debug("Refreshing project state from files")
        
        # Initialize new project state
        project_state = ProjectState(
            agents={},
            review_items=[],
            last_refresh=datetime.now(),
            sprint_info={},
            file_hashes={}
        )
        
        # Parse handoff files
        handoff_files = self._discover_handoff_files()
        for handoff_file in handoff_files:
            agent_info = self._parse_handoff_file(handoff_file)
            if agent_info:
                # Only keep the most recent handoff per agent
                if agent_info.agent_id not in project_state.agents:
                    project_state.agents[agent_info.agent_id] = agent_info
                    project_state.file_hashes[handoff_file] = self._calculate_file_hash(handoff_file)
                    
        # Parse review queue
        if os.path.exists(self.review_file):
            project_state.review_items = self._parse_review_file(self.review_file)
            project_state.file_hashes[self.review_file] = self._calculate_file_hash(self.review_file)
            
        # Parse sprint information
        if os.path.exists(self.sprint_file):
            project_state.sprint_info = self._parse_sprint_file(self.sprint_file)
            project_state.file_hashes[self.sprint_file] = self._calculate_file_hash(self.sprint_file)
            
            # Merge sprint agent assignments with handoff data
            if 'agent_files' in project_state.sprint_info:
                for agent_id, files in project_state.sprint_info['agent_files'].items():
                    if agent_id not in project_state.agents:
                        # Create agent entry for sprint-assigned agents without handoffs
                        project_state.agents[agent_id] = AgentInfo(
                            agent_id=agent_id,
                            status="idle",
                            current_task="No recent activity",
                            files_owned=files
                        )
                    else:
                        # Update existing agent with file ownership
                        project_state.agents[agent_id].files_owned = files
                        
        # Cache the result
        self.cached_data = project_state
        
        self.logger.info(f"Parsed project state: {len(project_state.agents)} agents, "
                        f"{len(project_state.review_items)} review items")
        
        return project_state
        
    def get_agent_by_id(self, agent_id: str) -> Optional[AgentInfo]:
        """Get specific agent information"""
        project_state = self.parse_project_state()
        return project_state.agents.get(agent_id)
        
    def get_agents_by_status(self, status: str) -> List[AgentInfo]:
        """Get all agents with specific status"""
        project_state = self.parse_project_state()
        return [agent for agent in project_state.agents.values() if agent.status == status]
        
    def get_review_items_by_priority(self, priority: str) -> List[ReviewItem]:
        """Get review items by priority level"""
        project_state = self.parse_project_state()
        return [item for item in project_state.review_items if item.priority == priority]
        
    def get_stale_agents(self, hours: int = 2) -> List[AgentInfo]:
        """Get agents with no activity for specified hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        project_state = self.parse_project_state()
        
        return [
            agent for agent in project_state.agents.values()
            if agent.last_update and agent.last_update < cutoff
        ]
        
    def get_parse_statistics(self) -> Dict[str, Any]:
        """Get parsing statistics for monitoring"""
        return {
            **self.parse_stats,
            'cache_hit_rate': (
                self.parse_stats['cache_hits'] / 
                max(1, self.parse_stats['cache_hits'] + self.parse_stats['cache_misses'])
            ),
            'error_rate': (
                self.parse_stats['handoff_files_errors'] / 
                max(1, self.parse_stats['handoff_files_parsed'] + self.parse_stats['handoff_files_errors'])
            )
        }
        
    def invalidate_cache(self):
        """Force cache invalidation"""
        self.cached_data = None
        self.logger.debug("Cache invalidated")

# Convenience functions for common operations
def get_current_project_state() -> ProjectState:
    """Get current project state using default parser"""
    parser = FileParser()
    return parser.parse_project_state()

def monitor_file_changes(callback: callable, interval: int = 5):
    """Monitor files for changes and call callback when updated"""
    parser = FileParser()
    last_hashes = {}
    
    while True:
        try:
            current_state = parser.parse_project_state()
            
            # Check for changes
            if current_state.file_hashes != last_hashes:
                callback(current_state)
                last_hashes = current_state.file_hashes.copy()
                
            time.sleep(interval)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            logging.error(f"Error in file monitoring: {e}")
            time.sleep(interval)

if __name__ == "__main__":
    # Test the file parser
    print("Testing File Parser...")
    
    parser = FileParser(debug=True)
    
    try:
        project_state = parser.parse_project_state()
        
        print(f"\n=== Project State ===")
        print(f"Agents: {len(project_state.agents)}")
        print(f"Review Items: {len(project_state.review_items)}")
        print(f"Last Refresh: {project_state.last_refresh}")
        
        print(f"\n=== Agents ===")
        for agent_id, agent in project_state.agents.items():
            print(f"{agent_id}: {agent.status} - {agent.current_task[:50]}...")
            
        print(f"\n=== Review Items ===")
        for item in project_state.review_items[:5]:  # Show first 5
            print(f"{item.priority}: {item.agent_id} - {item.description[:50]}...")
            
        print(f"\n=== Statistics ===")
        stats = parser.get_parse_statistics()
        for key, value in stats.items():
            print(f"{key}: {value}")
            
    except Exception as e:
        print(f"Error testing file parser: {e}")
        import traceback
        traceback.print_exc()