// Class Manager - Handles Daily Classes and Weekly Schedule with Admin Control

// Get today's classes
function getTodayClasses() {
    const classes = JSON.parse(localStorage.getItem('dailyClasses') || '[]');
    const today = new Date().toDateString();
    return classes.filter(c => new Date(c.date).toDateString() === today);
}

// Get all daily classes
function getAllDailyClasses() {
    return JSON.parse(localStorage.getItem('dailyClasses') || '[]');
}

// Add or update daily class
function saveDailyClass(classData) {
    let classes = JSON.parse(localStorage.getItem('dailyClasses') || '[]');
    
    if (classData.id) {
        // Update existing
        const index = classes.findIndex(c => c.id === classData.id);
        if (index !== -1) {
            classes[index] = classData;
        }
    } else {
        // Add new
        classData.id = Date.now();
        classData.createdAt = new Date().toISOString();
        classes.push(classData);
    }
    
    localStorage.setItem('dailyClasses', JSON.stringify(classes));
    return classData;
}

// Delete daily class
function deleteDailyClass(id) {
    let classes = JSON.parse(localStorage.getItem('dailyClasses') || '[]');
    classes = classes.filter(c => c.id !== id);
    localStorage.setItem('dailyClasses', JSON.stringify(classes));
}

// Load today's classes for display
function loadTodayClasses(containerId = 'upcomingClasses') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const todayClasses = getTodayClasses();
    
    if (todayClasses.length === 0) {
        container.innerHTML = `
            <div class="class-item">
                <div class="class-info">
                    <p style="text-align: center; color: var(--text-secondary);">No classes scheduled for today</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort by time
    todayClasses.sort((a, b) => a.time.localeCompare(b.time));
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    container.innerHTML = todayClasses.map(classItem => `
        <div class="class-item" data-id="${classItem.id}">
            <div class="class-time">⏰ ${classItem.time}</div>
            <div class="class-info">
                <h4>${classItem.name}</h4>
                <p>${classItem.beltLevels} • ${classItem.studentCount} students</p>
                ${classItem.instructor ? `<p style="font-size: 12px; color: var(--text-secondary);">Instructor: ${classItem.instructor}</p>` : ''}
            </div>
            ${isAdmin ? `
                <div style="display: flex; gap: 5px; margin-left: auto;">
                    <button class="btn-icon-small" onclick="editDailyClass(${classItem.id})" title="Edit class">✏️</button>
                    <button class="btn-icon-small" onclick="deleteDailyClassUI(${classItem.id})" title="Delete class">🗑️</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Weekly schedule functions
function getWeeklySchedule() {
    return JSON.parse(localStorage.getItem('weeklySchedule') || '[]');
}

function saveWeeklyScheduleEntry(entry) {
    let schedule = JSON.parse(localStorage.getItem('weeklySchedule') || '[]');
    
    if (entry.id) {
        const index = schedule.findIndex(s => s.id === entry.id);
        if (index !== -1) {
            schedule[index] = entry;
        }
    } else {
        entry.id = Date.now();
        entry.createdAt = new Date().toISOString();
        schedule.push(entry);
    }
    
    localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
    return entry;
}

function deleteWeeklyScheduleEntry(id) {
    let schedule = JSON.parse(localStorage.getItem('weeklySchedule') || '[]');
    schedule = schedule.filter(s => s.id !== id);
    localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
}

// Load weekly schedule for display
function loadWeeklySchedule(containerId = 'weeklyScheduleContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const schedule = getWeeklySchedule();
    
    if (schedule.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No weekly schedule set</p>';
        return;
    }
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const scheduleByDay = {};
    
    days.forEach(day => {
        scheduleByDay[day] = schedule.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
    });
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = currentUser && currentUser.role === 'admin';
    
    container.innerHTML = days.map(day => {
        const dayClasses = scheduleByDay[day];
        
        return `
            <div class="schedule-day-section">
                <h3 class="schedule-day-header">${day}</h3>
                ${dayClasses.length === 0 ? 
                    '<p style="color: var(--text-secondary); padding: 10px;">No classes</p>' :
                    dayClasses.map(classItem => `
                        <div class="schedule-class-item">
                            <div class="schedule-time">${classItem.time}</div>
                            <div class="schedule-info">
                                <h4>${classItem.className}</h4>
                                <p>${classItem.beltLevels}</p>
                                
                            </div>
                            ${isAdmin ? `
                                <div style="display: flex; gap: 5px;">
                                    <button class="btn-icon-small" onclick="editWeeklySchedule(${classItem.id})">✏️</button>
                                    <button class="btn-icon-small" onclick="deleteWeeklyScheduleUI(${classItem.id})">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')
                }
            </div>
        `;
    }).join('');
}

// UI functions for admin
window.editDailyClass = function(id) {
    const classes = getAllDailyClasses();
    const classItem = classes.find(c => c.id === id);
    if (!classItem) return;
    
    document.getElementById('dailyClassId').value = classItem.id;
    document.getElementById('dailyClassName').value = classItem.name;
    document.getElementById('dailyClassTime').value = classItem.time;
    document.getElementById('dailyClassDate').value = classItem.date;
    document.getElementById('dailyClassBeltLevels').value = classItem.beltLevels;
    document.getElementById('dailyClassStudentCount').value = classItem.studentCount;
    document.getElementById('dailyClassInstructor').value = classItem.instructor || '';
    
    document.getElementById('dailyClassFormTitle').textContent = 'Edit Daily Class';
    document.getElementById('dailyClassFormContainer').style.display = 'block';
    document.getElementById('dailyClassFormContainer').scrollIntoView({ behavior: 'smooth' });
};

window.deleteDailyClassUI = function(id) {
    if (!confirm('Delete this class?')) return;
    
    deleteDailyClass(id);
    loadTodayClasses();
    alert('✅ Class deleted successfully!');
};

window.editWeeklySchedule = function(id) {
    const schedule = getWeeklySchedule();
    const entry = schedule.find(s => s.id === id);
    if (!entry) return;
    
    document.getElementById('weeklyScheduleId').value = entry.id;
    document.getElementById('weeklyScheduleDay').value = entry.day;
    document.getElementById('weeklyScheduleTime').value = entry.time;
    document.getElementById('weeklyScheduleClassName').value = entry.className;
    document.getElementById('weeklyScheduleBeltLevels').value = entry.beltLevels;
    // Instructor info removed from UI
    
    document.getElementById('weeklyScheduleFormTitle').textContent = 'Edit Weekly Schedule Entry';
    document.getElementById('weeklyScheduleFormContainer').style.display = 'block';
    document.getElementById('weeklyScheduleFormContainer').scrollIntoView({ behavior: 'smooth' });
};

window.deleteWeeklyScheduleUI = function(id) {
    if (!confirm('Delete this schedule entry?')) return;
    
    deleteWeeklyScheduleEntry(id);
    loadWeeklySchedule();
    alert('✅ Schedule entry deleted successfully!');
};

// Export functions
if (typeof window !== 'undefined') {
    window.getTodayClasses = getTodayClasses;
    window.saveDailyClass = saveDailyClass;
    window.deleteDailyClass = deleteDailyClass;
    window.loadTodayClasses = loadTodayClasses;
    window.getWeeklySchedule = getWeeklySchedule;
    window.saveWeeklyScheduleEntry = saveWeeklyScheduleEntry;
    window.deleteWeeklyScheduleEntry = deleteWeeklyScheduleEntry;
    window.loadWeeklySchedule = loadWeeklySchedule;
}