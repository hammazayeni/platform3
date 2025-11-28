// Parent Dashboard Profile Image Handler
// Ensures parent profile image is loaded and displayed correctly

function loadParentProfileWithImage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'parent') return;
    
    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
    
    // Find parent data by multiple identifiers
    const parentData = parents.find(p => 
        p.id === currentUser.id || 
        p.username === currentUser.username || 
        p.email === currentUser.email
    );
    
    if (parentData) {
        // Update profile information
        const parentNameEl = document.getElementById('parentName');
        const parentFullNameEl = document.getElementById('parentFullName');
        const memberSinceEl = document.getElementById('memberSince');
        const childrenListEl = document.getElementById('childrenList');
        
        if (parentNameEl) parentNameEl.textContent = `Welcome, ${parentData.name}`;
        if (parentFullNameEl) parentFullNameEl.textContent = parentData.name;
        
        if (memberSinceEl && parentData.joinDate) {
            memberSinceEl.textContent = new Date(parentData.joinDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        // Load children information
        if (childrenListEl && parentData.children && parentData.children.length > 0) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const childrenHTML = parentData.children.map(childId => {
                const child = students.find(s => s.id === childId);
                if (!child) return '';
                
                const childPhotoHTML = child.profilePhoto 
                    ? `<img src="${child.profilePhoto}" alt="${child.name}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 8px;">`
                    : '👤';
                
                return `<div class="child-item" style="padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                    ${childPhotoHTML} <strong>${child.name}</strong> - ${child.beltRank || 'White'} Belt
                </div>`;
            }).join('');
            
            childrenListEl.innerHTML = `<p><strong>Children:</strong></p>${childrenHTML}`;
        }
        
        // Update profile image
        const parentAvatarEl = document.getElementById('parentAvatar');
        if (parentAvatarEl) {
            if (parentData.profilePhoto) {
                parentAvatarEl.innerHTML = `<img src="${parentData.profilePhoto}" alt="${parentData.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                parentAvatarEl.innerHTML = '👨‍👩‍👧';
            }
        }
        
        // Update currentUser with latest profile photo
        if (parentData.profilePhoto && parentData.profilePhoto !== currentUser.image) {
            currentUser.image = parentData.profilePhoto;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadParentProfileWithImage);
} else {
    loadParentProfileWithImage();
}

// Refresh profile image every 5 seconds to catch admin updates
setInterval(loadParentProfileWithImage, 5000);