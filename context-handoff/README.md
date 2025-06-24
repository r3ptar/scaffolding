# Simple Context Handoff System

A minimal, working solution for preserving context between Claude sessions.

## 🎯 Philosophy

Instead of building a complex system that doesn't work, we created a simple solution that:
- **Actually works** 100% of the time
- **Takes 30 seconds** to understand
- **Solves the real problem** (context loss between sessions)
- **Has zero dependencies** beyond bash and git

## 📦 Installation

```bash
# From project root
cp docs/scaffolding/context-handoff/*.sh .
chmod +x *.sh
```

That's it. No npm install, no configuration files, no complex setup.

## 🚀 Usage

### Create a Handoff
```bash
./quick-handoff.sh "working on item drop system"
```

Creates `handoff-TIMESTAMP.md` with:
- Current task description
- Complete git status
- Recent commits
- Environment info
- Active services

### Restore Context
```bash
# List available handoffs
./restore-context.sh

# Restore specific handoff
./restore-context.sh handoff-20250622_232240.md
```

## 📋 What Gets Captured

- **Task Description**: What you're working on
- **Git Status**: All modified, deleted, and new files
- **Recent Commits**: Last 3 commits for context
- **Current Branch**: Which branch you're on
- **Environment**: Platform, Node version, working directory
- **Services**: PM2 status if available

## 🔧 Customization

The scripts are simple bash - edit them directly:

- Add more git history: Change `-3` to `-10` in `git log`
- Include docker status: Add `docker ps` to the script
- Capture specific files: Add `cat important-file.txt`

## 💡 Why This Works

1. **Simplicity**: ~50 lines of bash vs 1000+ lines of broken JavaScript
2. **Reliability**: Basic unix commands that always work
3. **Transparency**: You can read and understand the entire system
4. **Speed**: Generates handoffs instantly

## 🆚 What We Didn't Build

We originally created a complex "context management system" with:
- EventEmitter architecture
- Heuristic-based usage detection  
- State preservation engines
- Sprint integration modules
- 21 test cases (12 failing)

**Result**: 57% test pass rate, didn't actually work.

**Lesson**: Start simple. Make it work. Then maybe make it complex (but probably don't).

## 📝 Example Handoff

```markdown
# Context Handoff - Sun Jun 22 23:22:40 PDT 2025

## Current Task
implementing loot drop rates for adventures

## Git Status
M api-gateway/routes/loot.ts
M api-gateway/services/lootService.ts
?? tests/loot/

## Recent Commits
- c62073b feat: complete MCP agent admin interface
- 987915e feat: add MCP agent admin interface docs

## Current Branch
feature/loot-drops

## Environment
- Platform: Darwin
- Node Version: v23.3.0
- Working Directory: /Users/dev/project
```

## 🎉 That's It!

No more documentation needed. The system is simple enough that you already understand it completely.