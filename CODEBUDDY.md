# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

A Vue 3 + TypeScript lottery/draw application with a number wheel animation. Participants can be added, imported, and randomly selected via an animated rolling number display.

## Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test           # Watch mode
npm run test:run   # Single run
npm run test:ui    # UI mode
```

## Architecture

### Technology Stack
- **Vue 3** - Frontend framework with Composition API
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Vitest** - Testing framework

### Directory Structure
```
src/
├── main.ts              # App entry point
├── App.vue             # Root component, orchestrates all child components
├── types/index.ts      # TypeScript interfaces (Participant, HistoryRecord, Settings)
├── components/
│   ├── Wheel.vue       # Animated number wheel component
│   ├── ParticipantList.vue  # Participant management (add/delete/import/export)
│   ├── Settings.vue    # Lottery settings panel
│   └── History.vue     # Draw history display
└── composables/
    ├── useLottery.ts   # Core lottery logic (participants, draw, history)
    └── useStorage.ts   # localStorage persistence for participants and history
```

### Data Flow

1. **App.vue** serves as the main container, importing the `useLottery` composable
2. **useLottery.ts** handles all business logic:
   - Participant management (add, delete, import, export)
   - Random winner selection
   - History tracking
   - Settings management
3. **useStorage.ts** wraps localStorage for persistence across sessions
4. **Wheel.vue** handles the visual animation - receives the winner number and animates the scroll

### Key Patterns

- **Composable functions** - All state and logic are in `composables/` directory
- **Props/Events** - Components communicate via Vue 3 props and emit
- **localStorage** - Data persists via `useStorage` composable
- **TypeScript interfaces** - All data structures defined in `src/types/index.ts`

### Testing

Tests are located in `tests/` directory:
- `useLottery.test.ts` - Tests for lottery logic composable
- `index.test.ts` - General tests
- `types.test.ts` - Type tests

### Development Workflow

Before starting any work, create tasks in `TASKS.md`:

1. **Create tasks** - List all work items using the format:
   - `- [ ] **任务 N**: 任务描述`

2. **Claim tasks** - Mark tasks as in-progress using Task tools:
   - Use `TaskCreate` to create tasks
   - Use `TaskUpdate` to update status (`pending` → `in_progress` → `completed`)

3. **Update TASKS.md** - After completing each task, update the file:
   - Mark completed: `- [x] **任务 N**: 描述`
   - Add fix record with date, file locations, problem, and solution

Example format (see TASKS.md for complete structure):
```markdown
## 任务列表

- [ ] **任务 1**: 任务描述
- [x] **任务 2**: 已完成任务

---

## 修复记录

### 2026-02-24

#### 任务 1: 修复描述
- **位置**: `src/file.vue:行号`
- **问题**: 问题描述
- **修复**: 修复方案
```
