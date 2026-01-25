// Pomodoro Timer State
let timerState = {
    workTime: 25,
    restTime: 5,
    currentTime: 25 * 60, // in seconds
    isRunning: false,
    isWorkMode: true,
    intervalId: null,
    startTimestamp: null,  // When timer started
    endTimestamp: null,    // When timer should end
    lastTickTimestamp: null // For tracking task time
};

// Task Management State
let tasks = [];
let completedTasks = [];
let activeTaskId = null;

// ==================== TIMER FUNCTIONS ====================

function adjustTime(type, change) {
    if (timerState.isRunning) return; // Don't allow changes while running

    if (type === 'work') {
        timerState.workTime = Math.min(60, Math.max(10, timerState.workTime + change));
        document.getElementById('work-time-display').textContent = timerState.workTime;
        if (timerState.isWorkMode) {
            timerState.currentTime = timerState.workTime * 60;
            updateTimerDisplay();
        }
    } else {
        timerState.restTime = Math.min(60, Math.max(10, timerState.restTime + change));
        document.getElementById('rest-time-display').textContent = timerState.restTime;
        if (!timerState.isWorkMode) {
            timerState.currentTime = timerState.restTime * 60;
            updateTimerDisplay();
        }
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerState.currentTime / 60);
    const seconds = timerState.currentTime % 60;
    document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
}

function toggleTimer() {
    if (timerState.isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    timerState.isRunning = true;
    document.getElementById('timer-start-btn').textContent = 'Pause';

    // Set timestamps for accurate background tracking
    const now = Date.now();
    timerState.startTimestamp = now;
    timerState.endTimestamp = now + (timerState.currentTime * 1000);
    timerState.lastTickTimestamp = now;

    timerState.intervalId = setInterval(() => {
        const now = Date.now();
        const remainingMs = timerState.endTimestamp - now;
        const elapsedSinceLastTick = Math.floor((now - timerState.lastTickTimestamp) / 1000);

        // Track time for active task (based on actual elapsed time)
        if (activeTaskId !== null && elapsedSinceLastTick > 0) {
            const task = tasks.find(t => t.id === activeTaskId);
            if (task && timerState.isWorkMode) {
                task.timeSpent += elapsedSinceLastTick;
                updateTaskDisplay(task);
                saveTasks();
            }
        }
        timerState.lastTickTimestamp = now;

        if (remainingMs <= 0) {
            // Timer completed
            timerState.currentTime = 0;
            updateTimerDisplay();
            playNotificationSound();
            switchTimerMode();
        } else {
            timerState.currentTime = Math.ceil(remainingMs / 1000);
            updateTimerDisplay();
        }
    }, 250); // Check more frequently for better accuracy
}

function pauseTimer() {
    timerState.isRunning = false;
    document.getElementById('timer-start-btn').textContent = 'Start';

    if (timerState.intervalId) {
        clearInterval(timerState.intervalId);
        timerState.intervalId = null;
    }

    // Save remaining time accurately when pausing
    if (timerState.endTimestamp) {
        const remainingMs = timerState.endTimestamp - Date.now();
        timerState.currentTime = Math.max(0, Math.ceil(remainingMs / 1000));
    }

    timerState.startTimestamp = null;
    timerState.endTimestamp = null;
    timerState.lastTickTimestamp = null;
}

function resetTimer() {
    pauseTimer();
    timerState.isWorkMode = true;
    timerState.currentTime = timerState.workTime * 60;
    updateTimerDisplay();
    updateTimerModeDisplay();
}

function switchTimerMode() {
    timerState.isWorkMode = !timerState.isWorkMode;

    if (timerState.isWorkMode) {
        timerState.currentTime = timerState.workTime * 60;
    } else {
        timerState.currentTime = timerState.restTime * 60;
    }

    updateTimerDisplay();
    updateTimerModeDisplay();
}

function updateTimerModeDisplay() {
    const modeElement = document.getElementById('timer-mode');
    if (timerState.isWorkMode) {
        modeElement.textContent = 'Work Time';
        modeElement.className = 'timer-mode work';
    } else {
        modeElement.textContent = 'Rest Time';
        modeElement.className = 'timer-mode rest';
    }
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ==================== TASK MENU FUNCTIONS ====================

function openAddTaskMenu() {
    document.getElementById('add-task-menu').classList.add('open');
}

function closeAddTaskMenu() {
    document.getElementById('add-task-menu').classList.remove('open');
    clearTaskForm();
}

function clearTaskForm() {
    document.getElementById('task-name').value = '';
    document.getElementById('task-due-date').value = '';
    document.getElementById('task-priority').value = '';
    document.getElementById('task-notes').value = '';
}

function addTaskToList() {
    const name = document.getElementById('task-name').value.trim();
    const dueDate = document.getElementById('task-due-date').value.trim();
    const priority = parseInt(document.getElementById('task-priority').value) || 999;
    const notes = document.getElementById('task-notes').value.trim();

    if (!name) {
        alert('Please enter a task name.');
        return;
    }

    // Validate date format if provided
    if (dueDate && !isValidDateFormat(dueDate)) {
        alert('Please enter date in MM/DD/YYYY format.');
        return;
    }

    const task = {
        id: Date.now(),
        name: name,
        dueDate: dueDate,
        priority: priority,
        notes: notes,
        timeSpent: 0, // in seconds
        isActive: false
    };

    tasks.push(task);
    sortTasksByPriority();
    renderTaskList();
    closeAddTaskMenu();
    saveTasks();
}

function isValidDateFormat(dateString) {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    return regex.test(dateString);
}

// ==================== TASK LIST FUNCTIONS ====================

function sortTasksByPriority() {
    tasks.sort((a, b) => a.priority - b.priority);
}

function renderTaskList() {
    const taskListElement = document.getElementById('task-list');

    if (tasks.length === 0) {
        taskListElement.innerHTML = `
            <div class="empty-state">
                <p>No tasks yet. Click "+ Add Task" to get started!</p>
            </div>
        `;
        return;
    }

    taskListElement.innerHTML = tasks.map(task => createTaskHTML(task)).join('');
}

function createTaskHTML(task) {
    const isActive = task.id === activeTaskId;
    const buttonText = isActive && timerState.isRunning ? 'Pause Task' : 'Start Task';
    const buttonClass = isActive && timerState.isRunning ? 'task-btn start-task-btn paused' : 'task-btn start-task-btn';
    const timeSpentDisplay = formatTimeSpent(task.timeSpent);

    return `
        <div class="task-box ${isActive ? 'active' : ''}" id="task-${task.id}">
            <div class="task-priority-badge">Priority ${task.priority}</div>
            <div class="task-name">${escapeHTML(task.name)}</div>
            ${task.dueDate ? `<div class="task-due-date">${escapeHTML(task.dueDate)}</div>` : ''}
            ${task.notes ? `<div class="task-notes">${escapeHTML(task.notes)}</div>` : ''}
            <div class="task-time-spent">Time spent: ${timeSpentDisplay}</div>
            <div class="task-actions">
                <button class="${buttonClass}" onclick="toggleTaskTimer(${task.id})">
                    ${buttonText}
                </button>
                <button class="task-btn complete-task-btn" onclick="completeTask(${task.id})">
                    Complete Task
                </button>
            </div>
        </div>
    `;
}

function updateTaskDisplay(task) {
    const taskElement = document.getElementById(`task-${task.id}`);
    if (taskElement) {
        const timeSpentElement = taskElement.querySelector('.task-time-spent');
        if (timeSpentElement) {
            timeSpentElement.textContent = `Time spent: ${formatTimeSpent(task.timeSpent)}`;
        }
    }
}

function formatTimeSpent(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== TASK ACTIONS ====================

function toggleTaskTimer(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (activeTaskId === taskId && timerState.isRunning) {
        // Pause the current task
        pauseTimer();
        updateCurrentTaskDisplay();
        renderTaskList();
    } else {
        // Start this task
        // If another task is active, pause it first
        if (activeTaskId !== taskId && timerState.isRunning) {
            pauseTimer();
        }

        activeTaskId = taskId;
        task.isActive = true;

        // Reset timer to work mode if starting fresh
        if (!timerState.isRunning) {
            timerState.isWorkMode = true;
            timerState.currentTime = timerState.workTime * 60;
            updateTimerDisplay();
            updateTimerModeDisplay();
        }

        startTimer();
        updateCurrentTaskDisplay();
        renderTaskList();
    }

    saveTasks();
}

function completeTask(taskId) {
    // Stop timer if this task is active
    if (activeTaskId === taskId) {
        pauseTimer();
        activeTaskId = null;
        updateCurrentTaskDisplay();
    }

    // Find the task
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];

    // Add completion timestamp and move to completed tasks
    task.completedAt = Date.now();
    completedTasks.unshift(task); // Add to beginning (newest first)

    // Remove task from active list
    tasks.splice(taskIndex, 1);

    // Re-render the list
    renderTaskList();
    saveTasks();
}

function updateCurrentTaskDisplay() {
    const displayElement = document.getElementById('current-task-display');

    if (activeTaskId !== null) {
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) {
            displayElement.textContent = `Working on: ${task.name}`;
            displayElement.classList.add('active');
        }
    } else {
        displayElement.textContent = 'No task selected';
        displayElement.classList.remove('active');
    }
}

// ==================== COMPLETED TASKS ====================

function openCompletedTasks() {
    renderCompletedTasksList();
    document.getElementById('completed-tasks-modal').classList.add('open');
}

function closeCompletedTasks() {
    document.getElementById('completed-tasks-modal').classList.remove('open');
}

function renderCompletedTasksList() {
    const listElement = document.getElementById('completed-tasks-list');

    if (completedTasks.length === 0) {
        listElement.innerHTML = `
            <div class="completed-empty-state">
                <p>No completed tasks yet. Keep growing!</p>
            </div>
        `;
        return;
    }

    listElement.innerHTML = completedTasks.map(task => createCompletedTaskHTML(task)).join('');
}

function createCompletedTaskHTML(task) {
    const timeSpentDisplay = formatTimeSpent(task.timeSpent);
    const completedDate = formatCompletedDate(task.completedAt);

    return `
        <div class="completed-task-item">
            <div class="completed-task-name">${escapeHTML(task.name)}</div>
            <div class="completed-task-details">
                <span class="completed-task-time">Time spent: ${timeSpentDisplay}</span>
                <span class="completed-task-date">Completed: ${completedDate}</span>
                ${task.dueDate ? `<span>Due: ${escapeHTML(task.dueDate)}</span>` : ''}
            </div>
        </div>
    `;
}

function formatCompletedDate(timestamp) {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${month}/${day}/${year} at ${displayHours}:${minutes} ${ampm}`;
}

// ==================== LOCAL STORAGE ====================

function saveTasks() {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
    localStorage.setItem('pomodoro-completed-tasks', JSON.stringify(completedTasks));
    localStorage.setItem('pomodoro-active-task', activeTaskId);
}

function loadTasks() {
    const savedTasks = localStorage.getItem('pomodoro-tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        sortTasksByPriority();
    }

    const savedCompletedTasks = localStorage.getItem('pomodoro-completed-tasks');
    if (savedCompletedTasks) {
        completedTasks = JSON.parse(savedCompletedTasks);
    }

    const savedActiveTask = localStorage.getItem('pomodoro-active-task');
    if (savedActiveTask && savedActiveTask !== 'null') {
        activeTaskId = parseInt(savedActiveTask);
        // Verify the task still exists
        if (!tasks.find(t => t.id === activeTaskId)) {
            activeTaskId = null;
        }
    }
}

// ==================== INITIALIZATION ====================

function init() {
    loadTasks();
    renderTaskList();
    updateTimerDisplay();
    updateTimerModeDisplay();
    updateCurrentTaskDisplay();

    // Initialize timer display values
    document.getElementById('work-time-display').textContent = timerState.workTime;
    document.getElementById('rest-time-display').textContent = timerState.restTime;
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
