// Student Dashboard Profile Image Handler
// Ensures student profile image is loaded and displayed correctly

function loadStudentProfileWithImage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') return;
    
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Find student data by multiple identifiers
    const studentData = students.find(s => 
        s.id === currentUser.id || 
        s.username === currentUser.username || 
        s.email === currentUser.email
    );
    
    if (studentData) {
        // Update profile information
        const studentNameEl = document.getElementById('studentName');
        const studentFullNameEl = document.getElementById('studentFullName');
        const studentBeltRankEl = document.getElementById('studentBeltRank');
        const studentClassEl = document.getElementById('studentClass');
        const memberSinceEl = document.getElementById('memberSince');
        const currentBeltEl = document.getElementById('currentBelt');
        const nextBeltEl = document.getElementById('nextBelt');
        const beltProgressEl = document.getElementById('beltProgress');
        
        if (studentNameEl) studentNameEl.textContent = `Welcome, ${studentData.name}`;
        if (studentFullNameEl) studentFullNameEl.textContent = studentData.name;
        if (studentBeltRankEl) studentBeltRankEl.textContent = studentData.beltRank || 'White Belt';
        if (studentClassEl) studentClassEl.textContent = studentData.class || 'Beginner';
        if (currentBeltEl) currentBeltEl.textContent = studentData.beltRank || 'White Belt';
        
        if (memberSinceEl && studentData.joinDate) {
            memberSinceEl.textContent = new Date(studentData.joinDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
        
        // Calculate next belt
        const beltProgression = ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black'];
        const currentBeltIndex = beltProgression.indexOf(studentData.beltRank || 'White');
        const nextBeltName = currentBeltIndex < beltProgression.length - 1 ? 
            beltProgression[currentBeltIndex + 1] + ' Belt' : 
            'Black Belt (Achieved!)';
        if (nextBeltEl) nextBeltEl.textContent = nextBeltName;
        
        // Set progress (example: 60%)
        if (beltProgressEl) beltProgressEl.style.width = '60%';
        
        // Update profile image
        const studentAvatarEl = document.getElementById('studentAvatar');
        if (studentAvatarEl) {
            if (studentData.profilePhoto) {
                studentAvatarEl.innerHTML = `<img src="${studentData.profilePhoto}" alt="${studentData.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            } else {
                studentAvatarEl.innerHTML = '👤';
            }
        }
        
        // Update currentUser with latest profile photo
        if (studentData.profilePhoto && studentData.profilePhoto !== currentUser.image) {
            currentUser.image = studentData.profilePhoto;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
}

// Load on page ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStudentProfileWithImage);
} else {
    loadStudentProfileWithImage();
}

// Refresh profile image every 5 seconds to catch admin updates
setInterval(loadStudentProfileWithImage, 5000);