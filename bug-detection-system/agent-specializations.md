# Agent Specialization Guide

**Version**: 1.0.0  
**Last Updated**: June 23, 2025  
**Purpose**: Define specialized expertise areas for multi-agent bug detection

## Agent Expertise Matrix

### 🔐 Authentication Specialist
**Agent ID**: `auth-specialist`
**Primary Focus**: User authentication, security, wallet integration

**Expertise Areas:**
- Authentication & Auth Flow (Primary)
- Security (Secondary)
- Web3 Integration (Secondary)

**Key Detection Patterns:**
- Authentication loops and infinite redirects
- Wallet connection failures
- Session management issues
- Token validation problems
- Permission and access control flaws

**File Targeting Keywords:**
- `auth`, `login`, `signup`, `wallet`, `token`, `session`, `verify`, `authenticate`

### 🏆 Competition Specialist  
**Agent ID**: `competition-specialist`
**Primary Focus**: Competition system functionality

**Expertise Areas:**
- Competition System (Primary)
- API/Backend (Competition-related)
- Notifications (Competition-related)

**Key Detection Patterns:**
- Scoring calculation errors
- Judge assignment and verification issues
- Entry submission failures
- Leaderboard inconsistencies
- Competition state management problems

**File Targeting Keywords:**
- `competition`, `judge`, `entry`, `score`, `leaderboard`, `contest`, `judging`, `scoring`

### 📱 Mobile & UI Specialist
**Agent ID**: `mobile-specialist`
**Primary Focus**: Mobile responsiveness and user interface

**Expertise Areas:**
- Mobile Interface (Primary)
- UI/Navigation (Primary)
- Performance (UI-related)

**Key Detection Patterns:**
- Mobile responsiveness issues
- Touch interaction problems
- Navigation failures
- UI component inconsistencies
- Responsive design breakpoints

**File Targeting Keywords:**
- `mobile`, `responsive`, `touch`, `swipe`, `viewport`, `nav`, `menu`, `button`, `layout`

### ⚡ Performance Specialist
**Agent ID**: `performance-specialist`
**Primary Focus**: Speed optimization and efficiency

**Expertise Areas:**
- Performance (Primary)
- API/Backend (Performance aspects)
- Genetic Mapping (Performance-heavy features)

**Key Detection Patterns:**
- Memory leaks and resource issues
- Inefficient algorithms and operations
- Unnecessary re-renders
- Large bundle sizes
- Slow database queries

**File Targeting Keywords:**
- `performance`, `optimization`, `cache`, `lazy`, `memo`, `useMemo`, `useCallback`, `virtual`

### 🛡️ Security Specialist
**Agent ID**: `security-specialist`
**Primary Focus**: Vulnerability detection and data protection

**Expertise Areas:**
- Security (Primary)
- Authentication & Auth Flow (Security aspects)
- API/Backend (Security aspects)

**Key Detection Patterns:**
- XSS and injection vulnerabilities
- Insecure data handling
- Permission bypass attempts
- Cryptographic implementation flaws
- Input validation failures

**File Targeting Keywords:**
- `security`, `validate`, `sanitize`, `encrypt`, `hash`, `permission`, `authorize`

### 🔧 Integration Specialist
**Agent ID**: `integration-specialist`
**Primary Focus**: System integration and data flow

**Expertise Areas:**
- API/Backend (Primary)
- Web3 Integration (Primary)
- Inventory Management
- Marketplace

**Key Detection Patterns:**
- API integration failures
- Data consistency issues
- External service connection problems
- Blockchain interaction bugs
- Database transaction errors

**File Targeting Keywords:**
- `api`, `route`, `backend`, `server`, `endpoint`, `integration`, `webhook`, `external`

## Agent Configuration Templates

```typescript
export const AGENT_TEMPLATES: AgentConfig[] = [
  {
    id: 'auth-specialist',
    name: 'Authentication Specialist',
    expertise: ['Authentication & Auth Flow', 'Security', 'Web3 Integration'],
    maxConcurrentFiles: 8,
    tokensPerHour: 10000,
    priority: 'high',
    status: 'available'
  },
  {
    id: 'competition-specialist',
    name: 'Competition System Specialist',
    expertise: ['Competition System', 'API/Backend', 'Notifications'],
    maxConcurrentFiles: 6,
    tokensPerHour: 8000,
    priority: 'high',
    status: 'available'
  },
  {
    id: 'mobile-specialist',
    name: 'Mobile & UI Specialist',
    expertise: ['Mobile Interface', 'UI/Navigation', 'Performance'],
    maxConcurrentFiles: 10,
    tokensPerHour: 12000,
    priority: 'medium',
    status: 'available'
  },
  {
    id: 'performance-specialist',
    name: 'Performance & Optimization Specialist',
    expertise: ['Performance', 'API/Backend', 'Genetic Mapping'],
    maxConcurrentFiles: 5,
    tokensPerHour: 7000,
    priority: 'medium',
    status: 'available'
  },
  {
    id: 'security-specialist',
    name: 'Security & Vulnerability Specialist',
    expertise: ['Security', 'Authentication & Auth Flow', 'API/Backend'],
    maxConcurrentFiles: 4,
    tokensPerHour: 6000,
    priority: 'high',
    status: 'available'
  },
  {
    id: 'integration-specialist',
    name: 'Integration & System Specialist',
    expertise: ['API/Backend', 'Web3 Integration', 'Inventory Management', 'Marketplace'],
    maxConcurrentFiles: 7,
    tokensPerHour: 9000,
    priority: 'medium',
    status: 'available'
  }
];
```

## Component-to-Agent Mapping

| Component | Primary Agent | Secondary Agent | Rationale |
|-----------|---------------|-----------------|-----------|
| Authentication & Auth Flow | 🔐 Auth Specialist | 🛡️ Security Specialist | Core auth expertise + security validation |
| Competition System | 🏆 Competition Specialist | 🔧 Integration Specialist | Business logic + API integration |
| Mobile Interface | 📱 Mobile Specialist | ⚡ Performance Specialist | UI expertise + performance optimization |
| Security | 🛡️ Security Specialist | 🔐 Auth Specialist | Security focus + auth context |
| API/Backend | 🔧 Integration Specialist | 🛡️ Security Specialist | Integration + security concerns |
| Performance | ⚡ Performance Specialist | 📱 Mobile Specialist | Speed focus + UI performance |
| Web3 Integration | 🔐 Auth Specialist | 🔧 Integration Specialist | Wallet auth + blockchain integration |