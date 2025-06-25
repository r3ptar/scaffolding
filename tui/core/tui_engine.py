#!/usr/bin/env python3
"""
TUI Engine - Robust curses wrapper with comprehensive error handling
Agent 1 deliverable: Production-ready foundation for terminal interface

Key features:
- Signal handling for terminal resize
- Graceful error recovery
- Cross-platform compatibility
- State preservation during refresh
- Comprehensive logging
"""

import curses
import signal
import sys
import traceback
import logging
from typing import Callable, Optional, Dict, Any
from dataclasses import dataclass
from enum import Enum

class TUIError(Exception):
    """Base exception for TUI-related errors"""
    pass

class TUIState(Enum):
    """TUI application states"""
    INITIALIZING = "initializing"
    RUNNING = "running"
    RESIZING = "resizing"
    ERROR = "error"
    SHUTTING_DOWN = "shutting_down"

@dataclass
class TerminalInfo:
    """Terminal environment information"""
    height: int
    width: int
    colors_supported: bool
    unicode_supported: bool
    platform: str
    term_type: str

class TUIEngine:
    """
    Robust TUI engine with comprehensive error handling and cross-platform support.
    
    Handles:
    - Terminal initialization and cleanup
    - Signal handling (resize, interrupt)
    - Error recovery and graceful degradation
    - State management
    - Event loop with proper error boundaries
    """
    
    def __init__(self, debug: bool = False):
        self.debug = debug
        self.state = TUIState.INITIALIZING
        self.stdscr: Optional[curses.window] = None
        self.terminal_info: Optional[TerminalInfo] = None
        self.resize_pending = False
        self.shutdown_requested = False
        self.error_count = 0
        self.max_errors = 5
        
        # Event handlers
        self.draw_handler: Optional[Callable] = None
        self.input_handler: Optional[Callable] = None
        self.resize_handler: Optional[Callable] = None
        self.error_handler: Optional[Callable] = None
        
        # State preservation
        self.preserved_state: Dict[str, Any] = {}
        
        # Setup logging
        self._setup_logging()
        
    def _setup_logging(self):
        """Configure logging for TUI operations"""
        log_level = logging.DEBUG if self.debug else logging.WARNING
        logging.basicConfig(
            filename='tui_engine.log',
            level=log_level,
            format='%(asctime)s - %(levelname)s - %(message)s',
            filemode='a'
        )
        self.logger = logging.getLogger(__name__)
        
    def _signal_handler(self, signum, frame):
        """Handle system signals"""
        if signum == signal.SIGWINCH:
            self.resize_pending = True
            self.logger.debug("Terminal resize signal received")
        elif signum in (signal.SIGINT, signal.SIGTERM):
            self.shutdown_requested = True
            self.logger.info(f"Shutdown signal {signum} received")
            
    def _detect_terminal_capabilities(self) -> TerminalInfo:
        """Detect terminal capabilities and limitations"""
        try:
            height, width = self.stdscr.getmaxyx()
            
            # Test color support
            colors_supported = curses.has_colors() and curses.can_change_color()
            
            # Test unicode support (basic test)
            unicode_supported = True
            try:
                self.stdscr.addstr(0, 0, "✓")
                self.stdscr.refresh()
            except (UnicodeEncodeError, curses.error):
                unicode_supported = False
                
            # Get platform and terminal type
            import os
            platform = os.name
            term_type = os.environ.get('TERM', 'unknown')
            
            return TerminalInfo(
                height=height,
                width=width,
                colors_supported=colors_supported,
                unicode_supported=unicode_supported,
                platform=platform,
                term_type=term_type
            )
            
        except Exception as e:
            self.logger.error(f"Failed to detect terminal capabilities: {e}")
            # Return minimal safe defaults
            return TerminalInfo(
                height=24, width=80, colors_supported=False,
                unicode_supported=False, platform="unknown", term_type="unknown"
            )
            
    def _initialize_curses(self):
        """Initialize curses with comprehensive error handling"""
        try:
            # Initialize curses
            self.stdscr = curses.initscr()
            
            # Configure curses behavior
            curses.noecho()         # Don't echo keys
            curses.cbreak()         # React to keys without Enter
            curses.curs_set(0)      # Hide cursor
            self.stdscr.keypad(True)  # Enable special keys
            self.stdscr.timeout(100)  # Non-blocking input with 100ms timeout
            
            # Initialize colors if supported
            if curses.has_colors():
                curses.start_color()
                curses.use_default_colors()
                
                # Define color pairs
                curses.init_pair(1, curses.COLOR_RED, -1)     # Error
                curses.init_pair(2, curses.COLOR_GREEN, -1)   # Success
                curses.init_pair(3, curses.COLOR_YELLOW, -1)  # Warning
                curses.init_pair(4, curses.COLOR_BLUE, -1)    # Info
                curses.init_pair(5, curses.COLOR_CYAN, -1)    # Highlight
                curses.init_pair(6, curses.COLOR_MAGENTA, -1) # Special
                
            # Detect terminal capabilities
            self.terminal_info = self._detect_terminal_capabilities()
            
            self.logger.info(f"Terminal initialized: {self.terminal_info}")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize curses: {e}")
            self._cleanup_curses()
            raise TUIError(f"Terminal initialization failed: {e}")
            
    def _cleanup_curses(self):
        """Safely cleanup curses state"""
        try:
            if self.stdscr:
                self.stdscr.keypad(False)
                curses.curs_set(1)  # Restore cursor
                curses.echo()       # Restore echo
                curses.nocbreak()   # Restore normal input
                curses.endwin()     # End curses
                self.stdscr = None
                self.logger.debug("Curses cleanup completed")
        except Exception as e:
            self.logger.warning(f"Error during curses cleanup: {e}")
            
    def _handle_resize(self):
        """Handle terminal resize events"""
        try:
            # Get new terminal size
            self.stdscr.clear()
            curses.resizeterm(*self.stdscr.getmaxyx())
            
            # Update terminal info
            old_info = self.terminal_info
            self.terminal_info = self._detect_terminal_capabilities()
            
            self.logger.info(f"Terminal resized: {old_info.width}x{old_info.height} → "
                           f"{self.terminal_info.width}x{self.terminal_info.height}")
            
            # Call resize handler if registered
            if self.resize_handler:
                self.resize_handler(old_info, self.terminal_info)
                
            self.resize_pending = False
            
        except Exception as e:
            self.logger.error(f"Error handling resize: {e}")
            self.resize_pending = False
            
    def _safe_draw(self):
        """Safely execute draw handler with error boundaries"""
        try:
            if self.draw_handler and self.stdscr:
                self.draw_handler(self.stdscr, self.terminal_info)
                self.stdscr.refresh()
                
        except curses.error as e:
            self.logger.warning(f"Curses drawing error: {e}")
            # Try to recover by clearing and redrawing
            try:
                self.stdscr.clear()
                if self.draw_handler:
                    self.draw_handler(self.stdscr, self.terminal_info)
                    self.stdscr.refresh()
            except:
                self.error_count += 1
                
        except Exception as e:
            self.logger.error(f"Error in draw handler: {e}")
            self.error_count += 1
            if self.error_handler:
                self.error_handler(e)
                
    def _safe_input(self):
        """Safely handle input with error boundaries"""
        try:
            if not self.stdscr:
                return None
                
            key = self.stdscr.getch()
            
            if key != -1 and self.input_handler:  # -1 means no input (timeout)
                result = self.input_handler(key)
                return result
                
        except curses.error:
            # Timeout or other curses error - not critical
            pass
        except Exception as e:
            self.logger.error(f"Error in input handler: {e}")
            self.error_count += 1
            if self.error_handler:
                self.error_handler(e)
                
        return None
        
    def set_draw_handler(self, handler: Callable):
        """Set the main drawing function"""
        self.draw_handler = handler
        
    def set_input_handler(self, handler: Callable):
        """Set the input handling function"""
        self.input_handler = handler
        
    def set_resize_handler(self, handler: Callable):
        """Set the resize handling function"""
        self.resize_handler = handler
        
    def set_error_handler(self, handler: Callable):
        """Set the error handling function"""
        self.error_handler = handler
        
    def preserve_state(self, key: str, value: Any):
        """Preserve state that should survive resize/refresh"""
        self.preserved_state[key] = value
        
    def get_preserved_state(self, key: str, default: Any = None) -> Any:
        """Retrieve preserved state"""
        return self.preserved_state.get(key, default)
        
    def get_color_pair(self, color_name: str) -> int:
        """Get color pair number for named color"""
        color_map = {
            'error': 1, 'red': 1,
            'success': 2, 'green': 2,
            'warning': 3, 'yellow': 3,
            'info': 4, 'blue': 4,
            'highlight': 5, 'cyan': 5,
            'special': 6, 'magenta': 6
        }
        return curses.color_pair(color_map.get(color_name.lower(), 0))
        
    def safe_addstr(self, y: int, x: int, text: str, attr: int = 0, max_width: Optional[int] = None):
        """Safely add string to screen with bounds checking"""
        try:
            if not self.stdscr or not self.terminal_info:
                return False
                
            # Check bounds
            if y < 0 or y >= self.terminal_info.height:
                return False
            if x < 0 or x >= self.terminal_info.width:
                return False
                
            # Truncate text if necessary
            available_width = self.terminal_info.width - x
            if max_width:
                available_width = min(available_width, max_width)
                
            if len(text) > available_width:
                text = text[:available_width-1] + "…" if available_width > 0 else ""
                
            if text:  # Only draw if there's text to draw
                self.stdscr.addstr(y, x, text, attr)
                
            return True
            
        except curses.error:
            return False
        except Exception as e:
            self.logger.warning(f"Error in safe_addstr: {e}")
            return False
            
    def run(self) -> int:
        """
        Main event loop with comprehensive error handling
        Returns exit code (0 = success, >0 = error)
        """
        exit_code = 0
        
        try:
            # Install signal handlers
            signal.signal(signal.SIGWINCH, self._signal_handler)
            signal.signal(signal.SIGINT, self._signal_handler)
            signal.signal(signal.SIGTERM, self._signal_handler)
            
            # Initialize curses
            self._initialize_curses()
            self.state = TUIState.RUNNING
            
            self.logger.info("TUI engine started successfully")
            
            # Main event loop
            while not self.shutdown_requested and self.error_count < self.max_errors:
                try:
                    # Handle resize if pending
                    if self.resize_pending:
                        self.state = TUIState.RESIZING
                        self._handle_resize()
                        self.state = TUIState.RUNNING
                        
                    # Draw interface
                    self._safe_draw()
                    
                    # Handle input
                    input_result = self._safe_input()
                    
                    # Check for quit command
                    if input_result == "quit":
                        break
                        
                except KeyboardInterrupt:
                    self.logger.info("Keyboard interrupt received")
                    break
                    
                except Exception as e:
                    self.logger.error(f"Error in main loop: {e}")
                    self.error_count += 1
                    if self.error_handler:
                        self.error_handler(e)
                        
            # Check exit conditions
            if self.error_count >= self.max_errors:
                self.logger.error(f"Too many errors ({self.error_count}), shutting down")
                exit_code = 1
                
        except TUIError as e:
            self.logger.error(f"TUI initialization failed: {e}")
            print(f"Terminal interface failed to start: {e}", file=sys.stderr)
            exit_code = 1
            
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}")
            print(f"Unexpected error: {e}", file=sys.stderr)
            traceback.print_exc()
            exit_code = 2
            
        finally:
            self.state = TUIState.SHUTTING_DOWN
            self._cleanup_curses()
            self.logger.info(f"TUI engine shutdown complete (exit code: {exit_code})")
            
        return exit_code

# Utility functions for common TUI operations
def get_terminal_size():
    """Get current terminal size safely"""
    try:
        import shutil
        return shutil.get_terminal_size()
    except:
        return (80, 24)  # Safe defaults

def test_terminal_compatibility():
    """Test if terminal supports TUI operations"""
    try:
        # Test basic curses functionality
        stdscr = curses.initscr()
        height, width = stdscr.getmaxyx()
        colors = curses.has_colors()
        curses.endwin()
        
        return {
            'supported': True,
            'size': (width, height),
            'colors': colors,
            'unicode': True  # Assume true for now
        }
    except Exception as e:
        return {
            'supported': False,
            'error': str(e),
            'fallback_available': True
        }

if __name__ == "__main__":
    # Basic test of TUI engine
    def test_draw(stdscr, terminal_info):
        stdscr.clear()
        stdscr.addstr(0, 0, f"Terminal: {terminal_info.width}x{terminal_info.height}")
        stdscr.addstr(1, 0, f"Colors: {terminal_info.colors_supported}")
        stdscr.addstr(2, 0, f"Unicode: {terminal_info.unicode_supported}")
        stdscr.addstr(4, 0, "Press 'q' to quit, 'r' to resize test")
        
    def test_input(key):
        if key == ord('q'):
            return "quit"
        elif key == ord('r'):
            import os
            os.kill(os.getpid(), signal.SIGWINCH)
            
    engine = TUIEngine(debug=True)
    engine.set_draw_handler(test_draw)
    engine.set_input_handler(test_input)
    
    print("Testing TUI engine... Press 'q' to quit")
    exit_code = engine.run()
    print(f"TUI test completed with exit code: {exit_code}")
    sys.exit(exit_code)