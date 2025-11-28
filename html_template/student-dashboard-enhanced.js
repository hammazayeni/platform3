// Enhanced Student Dashboard with Real Attendance Calculation

// Load attendance calculator
const attendanceCalculatorScript = document.createElement('script');
attendanceCalculatorScript.src = './attendance-calculator.js';
document.head.appendChild(attendanceCalculatorScript);

// Check if user is student
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'student') {
    alert('Access denied! This page is for students only.');
    window.location.href = 'index.html';
}

// Image viewer functions
window.openImageViewer = function(imageSrc) {
    const modal = document.getElementById('imageViewerModal');
    const img = document.getElementById('imageViewerContent');
    modal.classList.add('active');
    img.src = imageSrc;
};

window.closeImageViewer = function() {
    const modal = document.getElementById('imageViewerModal');
    modal.classList.remove('active');
};

// Close modal when clicking outside the image
document.getElementById('imageViewerModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeImageViewer();
    }
});

// Load student profile
function loadStudentProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const savedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    if (currentUser) {
        document.getElementById('studentName').textContent = `Welcome, ${currentUser.name}`;
        document.getElementById('studentFullName').textContent = currentUser.name;
        
        // Find student data
        const studentData = students.find(s => 
            s.username === currentUser.username || 
            s.email === currentUser.email ||
            s.id === currentUser.id
        );
        
        if (studentData) {
            document.getElementById('studentBeltRank').textContent = studentData.beltRank || 'White Belt';
            document.getElementById('studentClass').textContent = studentData.class || 'Beginner';
            document.getElementById('memberSince').textContent = studentData.joinDate ? 
                new Date(studentData.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
                'January 2024';
            document.getElementById('currentBelt').textContent = studentData.beltRank || 'White Belt';
            
            // Calculate next belt
            const beltProgression = ['White', 'Yellow', 'Green', 'Blue', 'Red', 'Black'];
            const currentBeltIndex = beltProgression.indexOf(studentData.beltRank || 'White');
            const nextBeltName = currentBeltIndex < beltProgression.length - 1 ? 
                beltProgression[currentBeltIndex + 1] + ' Belt' : 
                'Black Belt (Achieved!)';
            document.getElementById('nextBelt').textContent = nextBeltName;
            
            // Set progress (example: 60%)
            document.getElementById('beltProgress').style.width = '60%';
            
            // Calculate REAL attendance rate
            setTimeout(() => {
                if (typeof calculateStudentAttendanceRate === 'function') {
                    const attendanceRate = calculateStudentAttendanceRate(studentData.id);
                    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
                    
                    // Get monthly stats
                    if (typeof getMonthlyAttendanceStats === 'function') {
                        const monthlyStats = getMonthlyAttendanceStats(studentData.id);
                        document.getElementById('classesThisMonth').textContent = monthlyStats.classesThisMonth;
                        
                        // Calculate training hours (assuming 1 hour per class)
                        const trainingHours = monthlyStats.attendedThisMonth || 0;
                        document.getElementById('trainingHours').textContent = trainingHours + 'h';
                    }
                } else {
                    document.getElementById('attendanceRate').textContent = '0%';
                }
            }, 200);
            
            // Display profile photo if available
            if (studentData.profilePhoto) {
                document.getElementById('studentAvatar').innerHTML = `<img src="${studentData.profilePhoto}" alt="${studentData.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
        }
        
        if (savedUsers.student && savedUsers.student.image) {
            document.getElementById('studentAvatar').innerHTML = `<img src="${savedUsers.student.image}" alt="Student" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
    }
}

// Load announcements with clickable images
function loadAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const announcementsList = document.getElementById('announcementsList');
    
    if (announcements.length === 0) {
        announcementsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No announcements yet</p>';
        return;
    }
    
    announcementsList.innerHTML = announcements.map(announcement => `
        <div class="announcement-card">
            <div class="announcement-header">
                <span class="announcement-icon">📢</span>
                <h3 class="announcement-title">${announcement.title}</h3>
            </div>
            ${announcement.image ? `<img src="${announcement.image}" alt="${announcement.title}" class="announcement-image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 15px 0;" onclick="openImageViewer('${announcement.image}')" title="Click to view full size">` : ''}
            <p class="announcement-description">${announcement.description}</p>
            <p class="announcement-date">📅 ${announcement.date}</p>
        </div>
    `).join('');
}

// Load student certificates (preview - show max 3)
function loadCertificates() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Find student data
    const studentData = students.find(s => 
        s.username === currentUser.username || 
        s.email === currentUser.email ||
        s.id === currentUser.id
    );
    
    if (!studentData) {
        return;
    }
    
    // Filter certificates for this student
    const myCertificates = certificates.filter(cert => String(cert.studentId) === String(studentData.id));
    
    const certificatesList = document.getElementById('certificatesList');
    const certificatesCount = document.getElementById('certificatesCount');
    
    certificatesCount.textContent = myCertificates.length;
    
    if (myCertificates.length === 0) {
        certificatesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No certificates yet</p>';
        return;
    }
    
    // Show only first 3 certificates
    const previewCerts = myCertificates.slice(0, 3);
    certificatesList.innerHTML = previewCerts.map(cert => `
        <div class="certificate-item" onclick="window.location.href='student-certificates.html'">
            <span class="certificate-icon">🎓</span>
            <div class="certificate-info">
                <h4>${cert.title}</h4>
                <p>Awarded: ${cert.uploadDate}</p>
            </div>
        </div>
    `).join('');
}

// Load training materials (preview - show max 3)
function loadTrainingMaterials() {
    const materials = JSON.parse(localStorage.getItem('trainingMaterials') || '[]');
    const materialsList = document.getElementById('trainingMaterialsList');
    const materialsCount = document.getElementById('materialsCount');
    
    materialsCount.textContent = materials.length;
    
    if (materials.length === 0) {
        materialsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No training materials available</p>';
        return;
    }
    
    const typeIcons = {
        'video': '📹',
        'pdf': '📄',
        'guide': '📖',
        'other': '📎'
    };
    
    // Show only first 3 materials
    const previewMaterials = materials.slice(0, 3);
    materialsList.innerHTML = previewMaterials.map(material => `
        <div class="material-item" onclick="window.location.href='student-materials.html'">
            <span class="material-icon">${typeIcons[material.type] || '📎'}</span>
            <div class="material-info">
                <h4>${material.title}</h4>
                <p>${material.description}</p>
                <p style="font-size: 12px; color: var(--text-secondary);">Uploaded: ${material.uploadDate}</p>
            </div>
        </div>
    `).join('');
}

// Load schedules for upcoming classes
function loadUpcomingClasses() {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const upcomingClasses = document.getElementById('upcomingClasses');
    
    if (schedules.length === 0) {
        upcomingClasses.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No upcoming classes scheduled</p>';
        return;
    }
    
    upcomingClasses.innerHTML = schedules.map(schedule => `
        <div class="class-item">
            <div class="class-time">📅 ${schedule.uploadDate}</div>
            <div class="class-info">
                <h4>${schedule.title}</h4>
                <p>${schedule.description}</p>
            </div>
        </div>
    `).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStudentProfile();
    loadAnnouncements();
    loadCertificates();
    loadTrainingMaterials();
    loadUpcomingClasses();
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadAnnouncements();
        loadCertificates();
        loadTrainingMaterials();
    }, 30000);
});
