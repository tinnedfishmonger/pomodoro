# Productivity Web App Brief

## Overview

A web-based productivity application combining a Pomodoro timer with an integrated to-do list. The app helps users manage their time and tasks using the Pomodoro Technique while tracking time spent on individual tasks.

---

## Features

### 1. Pomodoro Timer (Left Panel)

**Location:** Left side of the web page

**Visual Design:**
- Tomato illustration as the central visual element
- Clean, minimal interface with clear time display

**Timer Controls:**

| Setting | Range | Increment | Default |
|---------|-------|-----------|---------|
| Work Time | 10–60 minutes | 5 minutes | 25 minutes |
| Rest Time | 10–60 minutes | 5 minutes | 5 minutes |

**Functionality:**
- Start/Pause/Reset controls
- Visual countdown display
- Audio notification when timer completes
- Automatic transition between work and rest periods
- Clear indication of current mode (working vs. resting)

---

### 2. To-Do List (Right Panel)

**Location:** Right side of the web page

**Functionality:**

- **Add Tasks:** Text input to create new tasks
- **Task List:** Scrollable list of all tasks
- **Start Task:** Select a task to begin working on it
  - Selected task becomes visually highlighted
  - Links the task to the Pomodoro timer
- **Complete Task:** Mark tasks as finished
- **Time Tracking:** Display total Pomodoro time spent on each completed task

**Task States:**
1. **Pending** – Task created, not yet started
2. **Active** – Currently being worked on (linked to timer)
3. **Completed** – Task finished, shows total time spent

---

## User Flow

1. User adds tasks to the to-do list
2. User selects a task to "start" working on it
3. User adjusts work/rest times on the Pomodoro timer as needed
4. User starts the timer and works on the selected task
5. Timer counts down; rest period begins automatically after work period
6. User can run multiple Pomodoro cycles on the same task
7. When finished, user marks the task complete
8. Completed task displays total accumulated time from all Pomodoro sessions

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│                        Header                                │
├────────────────────────┬────────────────────────────────────┤
│                        │                                    │
│    🍅 TOMATO           │         TO-DO LIST                 │
│    ILLUSTRATION        │                                    │
│                        │  ┌────────────────────────────┐   │
│      25:00             │  │ + Add new task...          │   │
│                        │  └────────────────────────────┘   │
│   Work: [10-60 min]    │                                    │
│   Rest: [10-60 min]    │  □ Task 1                         │
│                        │  ■ Task 2 (active) ← currently    │
│   [Start] [Reset]      │  ✓ Task 3 - 45 min               │
│                        │  □ Task 4                         │
│                        │                                    │
├────────────────────────┴────────────────────────────────────┤
│                        Footer                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Requirements

- **Platform:** Web browser (responsive design)
- **Frontend:** HTML, CSS, JavaScript (or framework of choice)
- **Storage:** Local storage for persisting tasks and timer preferences
- **No backend required** for MVP

---

## Success Criteria

- Timer accurately counts down and transitions between work/rest
- Work and rest durations are adjustable within specified ranges
- Tasks can be created, started, and completed
- Time is tracked and displayed for completed tasks
- Tomato illustration is prominently displayed with the timer
