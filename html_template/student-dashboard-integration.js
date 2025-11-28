// Student Dashboard Integration with Class Management
// This script enhances the student dashboard with real-time class data

// Load class manager
const classManagerScript = document.createElement('script');
classManagerScript.src = './class-manager.js';
document.head.appendChild(classManagerScript);

// Load activity manager
const activityManagerScript = document.createElement('script');
activityManagerScript.src = './activity-manager.js';
document.head.appendChild(activityManagerScript);

// Override the loadUpcomingClasses function for students
function loadUpcomingClassesForStudent() {
    const container = document.getElementById('upcomingClasses');
    if (!container) return;
    
    // Wait for class manager to load
    setTimeout(() => {
        if (typeof getTodayClasses === 'function') {
            const todayClasses = getTodayClasses();
            
            if (todayClasses.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No upcoming classes scheduled</p>';
                return;
            }
            
            // Sort by time
            todayClasses.sort((a, b) => a.time.localeCompare(b.time));
            
            container.innerHTML = todayClasses.map(classItem => `
                <div class="class-item">
                    <div class="class-time">⏰ ${classItem.time}</div>
                    <div class="class-info">
                        <h4>${classItem.name}</h4>
                        <p>${classItem.beltLevels} • ${classItem.studentCount} students</p>
                        ${classItem.instructor ? `<p style="font-size: 12px; color: var(--text-secondary);">Instructor: ${classItem.instructor}</p>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            // Fallback to schedules if class manager not loaded
            const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
            
            if (schedules.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No upcoming classes scheduled</p>';
                return;
            }
            
            container.innerHTML = schedules.map(schedule => `
                <div class="class-item">
                    <div class="class-time">📅 ${schedule.uploadDate}</div>
                    <div class="class-info">
                        <h4>${schedule.title}</h4>
                        <p>${schedule.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }, 300);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        loadUpcomingClassesForStudent();
        // Refresh every 30 seconds
        setInterval(loadUpcomingClassesForStudent, 30000);
    });
} else {
    loadUpcomingClassesForStudent();
    setInterval(loadUpcomingClassesForStudent, 30000);
}