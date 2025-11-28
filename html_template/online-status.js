// Online Status Tracking System

// Update user's online status
function resolveProfileImage(userLike) {
    const u = userLike || {};
    let img = u.image || null;
    try {
        if (u.role === 'admin') {
            const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            const ap = adminProfiles[u.id];
            img = ap && ap.image ? ap.image : img;
        } else if (u.role === 'student') {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const s = students.find(x => x.id === u.id || x.username === u.username || x.email === u.email || x.name === u.name);
            img = s && s.profilePhoto ? s.profilePhoto : img;
        } else if (u.role === 'parent') {
            const parents = JSON.parse(localStorage.getItem('parents') || '[]');
            const p = parents.find(x => x.id === u.id || x.username === u.username || x.email === u.email || x.name === u.name);
            img = p && p.profilePhoto ? p.profilePhoto : img;
        }
        if (!img) {
            const savedUsers = JSON.parse(localStorage.getItem('users') || '{}');
            const defaultRoleUser = savedUsers[u.role];
            if (defaultRoleUser && defaultRoleUser.image) {
                img = defaultRoleUser.image;
            }
        }
    } catch(_) {}
    return img || null;
}

function updateOnlineStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '{}');
    const img = resolveProfileImage(currentUser);
    onlineUsers[currentUser.username] = {
        id: currentUser.id || null,
        username: currentUser.username,
        name: currentUser.name,
        role: currentUser.role,
        image: img,
        lastActivity: Date.now(),
        status: 'online'
    };
    localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
}

// Mark user as offline
function markUserOffline() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '{}');
    
    if (onlineUsers[currentUser.username]) {
        onlineUsers[currentUser.username].status = 'offline';
        onlineUsers[currentUser.username].lastActivity = Date.now();
        localStorage.setItem('onlineUsers', JSON.stringify(onlineUsers));
    }
}

// Get online users count
function getOnlineUsersCount() {
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '{}');
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    let count = 0;
    Object.values(onlineUsers).forEach(user => {
        if (user.lastActivity > fiveMinutesAgo) {
            count++;
        }
    });
    
    return count;
}

// Get online users list
function getOnlineUsersList() {
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '{}');
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const onlineList = [];
    Object.values(onlineUsers).forEach(user => {
        if (user.lastActivity > fiveMinutesAgo && user.username !== currentUser?.username) {
            user.image = user.image || resolveProfileImage(user);
            onlineList.push(user);
        }
    });
    return onlineList;
}

// Initialize online status tracking
function initOnlineStatusTracking() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Update status immediately
    updateOnlineStatus();
    
    // Update status every 30 seconds
    setInterval(updateOnlineStatus, 30000);
    
    // Update status on user activity
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
            updateOnlineStatus();
        }, { passive: true, once: false });
    });
    
    // Mark as offline when page is closed
    window.addEventListener('beforeunload', markUserOffline);
    
    // Handle visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            markUserOffline();
        } else {
            updateOnlineStatus();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip on login and landing pages
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'landing.html') {
        return;
    }
    
    initOnlineStatusTracking();
});

// Export functions for use in other scripts
window.updateOnlineStatus = updateOnlineStatus;
window.getOnlineUsersCount = getOnlineUsersCount;
window.getOnlineUsersList = getOnlineUsersList;
window.isUserOnline = function(username) {
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '{}');
    const userStatus = onlineUsers[username];
    
    if (!userStatus) return false;
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return userStatus.lastActivity > fiveMinutesAgo;
};
