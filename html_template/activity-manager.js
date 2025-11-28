// Activity Manager - Handles Recent Activity with Admin Control

// Activity types with icons
const ACTIVITY_TYPES = {
    STUDENT_ENROLLED: { icon: '👤', label: 'New student enrolled' },
    ATTENDANCE_MARKED: { icon: '✅', label: 'Attendance marked' },
    BELT_PROMOTION: { icon: '🏆', label: 'Belt promotion' },
    CLASS_COMPLETED: { icon: '📚', label: 'Class completed' },
    CERTIFICATE_ISSUED: { icon: '🎓', label: 'Certificate issued' },
    ANNOUNCEMENT_POSTED: { icon: '📢', label: 'Announcement posted' },
    CUSTOM: { icon: '📝', label: 'Custom activity' }
};

// Log an activity
function logActivity(type, description, metadata = {}) {
    const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    
    const activity = {
        id: Date.now(),
        type: type,
        icon: ACTIVITY_TYPES[type]?.icon || '📝',
        description: description,
        timestamp: new Date().toISOString(),
        metadata: metadata
    };
    
    activities.unshift(activity);
    
    // Keep only last 50 activities
    if (activities.length > 50) {
        activities.splice(50);
    }
    
    localStorage.setItem('recentActivities', JSON.stringify(activities));
    return activity;
}

// Get formatted time ago
function getTimeAgo(timestamp) {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return activityTime.toLocaleDateString();
}

// Load activities for display
function loadRecentActivities(containerId = 'activityList', limit = 10) {
    const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="activity-item">
                <span class="activity-icon">📋</span>
                <div class="activity-content">
                    <p style="color: var(--text-secondary);">No recent activities</p>
                </div>
            </div>
        `;
        return;
    }
    
    const displayActivities = activities.slice(0, limit);
    
    container.innerHTML = displayActivities.map(activity => `
        <div class="activity-item" data-id="${activity.id}">
            <span class="activity-icon">${activity.icon}</span>
            <div class="activity-content">
                <p>${activity.description}</p>
                <span class="activity-time">${getTimeAgo(activity.timestamp)}</span>
            </div>
            ${isAdmin() ? `<button class="btn-icon-small" onclick="deleteActivity(${activity.id})" title="Delete activity">🗑️</button>` : ''}
        </div>
    `).join('');
}

// Check if current user is admin
function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return currentUser && currentUser.role === 'admin';
}

// Delete activity
window.deleteActivity = function(id) {
    if (!confirm('Delete this activity?')) return;
    
    let activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    activities = activities.filter(a => a.id !== id);
    localStorage.setItem('recentActivities', JSON.stringify(activities));
    
    loadRecentActivities();
};

// Add custom activity (admin only)
window.addCustomActivity = function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Only admins can add activities');
        return;
    }
    
    const description = prompt('Enter activity description:');
    if (!description) return;
    
    logActivity('CUSTOM', description);
    loadRecentActivities();
    alert('✅ Activity added successfully!');
};

// Auto-log system events
function setupActivityListeners() {
    // Listen for student enrollment
    window.addEventListener('studentEnrolled', (e) => {
        logActivity('STUDENT_ENROLLED', `New student enrolled: ${e.detail.name}`);
    });
    
    // Listen for attendance marking
    window.addEventListener('attendanceMarked', (e) => {
        logActivity('ATTENDANCE_MARKED', `Attendance marked: ${e.detail.className}`);
    });
    
    // Listen for belt promotions
    window.addEventListener('beltPromotion', (e) => {
        logActivity('BELT_PROMOTION', `Belt promotion: ${e.detail.studentName} to ${e.detail.newBelt}`);
    });
    
    // Listen for certificate issuance
    window.addEventListener('certificateIssued', (e) => {
        logActivity('CERTIFICATE_ISSUED', `Certificate issued: ${e.detail.title} for ${e.detail.studentName}`);
    });
    
    // Listen for announcements
    window.addEventListener('announcementPosted', (e) => {
        logActivity('ANNOUNCEMENT_POSTED', `Announcement posted: ${e.detail.title}`);
    });
}

// Initialize activity manager
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', setupActivityListeners);
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.logActivity = logActivity;
    window.loadRecentActivities = loadRecentActivities;
    window.getTimeAgo = getTimeAgo;
}