// Profile Image Synchronization System
// Ensures profile images are synced across login, dashboards, and management pages

/**
 * Get user profile image from appropriate storage location
 * @param {Object} user - User object with role, username, email, id
 * @returns {string|null} - Base64 image data or null
 */
function getUserProfileImage(user) {
    if (!user) return null;
    
    try {
        if (user.role === 'admin') {
            // Admin images stored in adminProfiles by ID
            const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            const adminProfile = adminProfiles[user.id];
            return adminProfile?.image || user.image || null;
        } else if (user.role === 'student') {
            // Student images stored in students array
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const studentData = students.find(s => 
                s.id === user.id || 
                s.username === user.username || 
                s.email === user.email
            );
            return studentData?.profilePhoto || user.image || null;
        } else if (user.role === 'parent') {
            // Parent images stored in parents array
            const parents = JSON.parse(localStorage.getItem('parents') || '[]');
            const parentData = parents.find(p => 
                p.id === user.id || 
                p.username === user.username || 
                p.email === user.email
            );
            return parentData?.profilePhoto || user.image || null;
        }
    } catch (e) {
        console.error('Error getting user profile image:', e);
    }
    
    return null;
}

/**
 * Update profile image display on any page
 * @param {Object} user - Current user object
 * @param {string} avatarElementId - ID of avatar element to update
 */
function updateProfileImageDisplay(user, avatarElementId = null) {
    if (!user) return;
    
    const profileImage = getUserProfileImage(user);
    
    // Find avatar elements to update
    const avatarSelectors = [
        avatarElementId,
        'studentAvatar',
        'parentAvatar',
        'adminAvatar',
        '.profile-avatar',
        '.profile-photo'
    ].filter(Boolean);
    
    avatarSelectors.forEach(selector => {
        const element = selector.startsWith('.') || selector.startsWith('#') 
            ? document.querySelector(selector)
            : document.getElementById(selector);
            
        if (element) {
            if (profileImage) {
                element.innerHTML = `<img src="${profileImage}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                // Show default emoji based on role
                const defaultEmoji = user.role === 'admin' ? '👨‍🏫' : 
                                   user.role === 'student' ? '👤' : 
                                   '👨‍👩‍👧';
                element.innerHTML = defaultEmoji;
            }
        }
    });
}

/**
 * Sync profile image when user data is updated
 * Call this after admin updates student/parent profile
 */
function syncProfileImageToCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const updatedImage = getUserProfileImage(currentUser);
    if (updatedImage && updatedImage !== currentUser.image) {
        currentUser.image = updatedImage;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateProfileImageDisplay(currentUser);
    }
}

// Auto-sync on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        syncProfileImageToCurrentUser();
        updateProfileImageDisplay(currentUser);
    }
});

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.getUserProfileImage = getUserProfileImage;
    window.updateProfileImageDisplay = updateProfileImageDisplay;
    window.syncProfileImageToCurrentUser = syncProfileImageToCurrentUser;
}