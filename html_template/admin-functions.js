// Admin-specific functions for dashboard with enhanced attendance calculation

// Load attendance calculator
const attendanceCalculatorScript = document.createElement('script');
attendanceCalculatorScript.src = './attendance-calculator.js';
document.head.appendChild(attendanceCalculatorScript);

// FIXED: Load profile image - admin-specific
function loadProfileImage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.role !== 'admin') return;
    
    // Load admin-specific profile data
    const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
    const adminProfile = adminProfiles[currentUser.id];
    
    if (adminProfile && adminProfile.image) {
        document.getElementById('adminAvatar').innerHTML = `<img src="${adminProfile.image}" alt="Admin" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    
    if (adminProfile && adminProfile.name) {
        document.getElementById('adminName').textContent = adminProfile.name;
    } else if (currentUser.name) {
        document.getElementById('adminName').textContent = currentUser.name;
    }
}

// FIXED: Profile image upload - admin-specific
document.getElementById('uploadProfileImage')?.addEventListener('click', function() {
    document.getElementById('profileImageInput').click();
});

document.getElementById('profileImageInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!currentUser || currentUser.role !== 'admin') return;
            
            // Store admin-specific profile data
            let adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            
            if (!adminProfiles[currentUser.id]) {
                adminProfiles[currentUser.id] = {};
            }
            
            adminProfiles[currentUser.id].image = imageData;
            adminProfiles[currentUser.id].name = currentUser.name;
            adminProfiles[currentUser.id].role = currentUser.role;
            
            localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
            
            // Update current user session
            currentUser.image = imageData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            document.getElementById('adminAvatar').innerHTML = `<img src="${imageData}" alt="Admin" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            
            alert('✅ Profile image updated successfully!');
        };
        reader.readAsDataURL(file);
    }
});

// Load online users
function loadOnlineUsers() {
    const onlineUsers = window.getOnlineUsersList ? window.getOnlineUsersList() : [];
    const container = document.getElementById('onlineUsersList');
    const countEl = document.getElementById('onlineCount');
    
    if (!container || !countEl) return;
    
    countEl.textContent = onlineUsers.length;
    
    if (onlineUsers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No other users online</p>';
        return;
    }
    
    container.innerHTML = onlineUsers.map(user => {
        const roleEmoji = {
            'admin': '👨‍🏫',
            'student': '👤',
            'parent': '👨‍👩‍👧'
        };
        
        return `
            <div class="online-user-item">
                <div class="online-user-avatar">
                    ${roleEmoji[user.role] || '👤'}
                    <div class="online-indicator-dot"></div>
                </div>
                <div class="online-user-info">
                    <h4>${user.name}</h4>
                    <p>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Update statistics with REAL attendance rate
function updateStatistics() {
    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const registrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    const pending = registrations.filter(r => r.status === 'pending').length;
    
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalParentsEl = document.getElementById('totalParents');
    const pendingRegEl = document.getElementById('pendingRegistrations');
    const attendanceRateEl = document.getElementById('attendanceRate');
    
    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (totalParentsEl) totalParentsEl.textContent = parents.length;
    if (pendingRegEl) pendingRegEl.textContent = pending;
    
    // Calculate REAL attendance rate
    if (attendanceRateEl) {
        // Wait for attendance calculator to load
        setTimeout(() => {
            if (typeof calculateOverallAttendanceRate === 'function') {
                const realRate = calculateOverallAttendanceRate();
                attendanceRateEl.textContent = realRate + '%';
            } else {
                attendanceRateEl.textContent = '0%';
            }
        }, 100);
    }
    
    const badge = document.getElementById('pendingBadge');
    if (badge) {
        badge.textContent = pending > 0 ? pending : '';
    }
}

// Manual dashboard refresh to re-run key loaders
function refreshDashboard() {
    updateStatistics();
    loadOnlineUsers();
    loadPostedAnnouncements();
    loadUploadedMaterials();
    loadUploadedCertificates();
    loadUploadedSchedules();
}

// Announcement form toggle
document.getElementById('toggleAnnouncementForm')?.addEventListener('click', function() {
    const container = document.getElementById('announcementFormContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('cancelAnnouncement')?.addEventListener('click', function() {
    document.getElementById('announcementFormContainer').style.display = 'none';
    document.getElementById('announcementForm').reset();
    document.getElementById('imagePreview').classList.remove('active');
});

// Image preview
document.getElementById('announcementImage')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.src = e.target.result;
            preview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }
});

// Announcement form submission
document.getElementById('announcementForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access denied! Only administrators can post announcements.');
        return;
    }
    
    const title = document.getElementById('announcementTitle').value;
    const description = document.getElementById('announcementDescription').value;
    const imageFile = document.getElementById('announcementImage').files[0];
    
    let announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    
    const announcement = {
        id: Date.now(),
        title: title,
        description: description,
        date: new Date().toLocaleDateString(),
        image: null
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            announcement.image = e.target.result;
            announcements.unshift(announcement);
            localStorage.setItem('announcements', JSON.stringify(announcements));
            alert('✅ Announcement posted successfully!');
            document.getElementById('announcementForm').reset();
            document.getElementById('announcementFormContainer').style.display = 'none';
            document.getElementById('imagePreview').classList.remove('active');
            loadPostedAnnouncements();
        };
        reader.readAsDataURL(imageFile);
    } else {
        announcements.unshift(announcement);
        localStorage.setItem('announcements', JSON.stringify(announcements));
        alert('✅ Announcement posted successfully!');
        document.getElementById('announcementForm').reset();
        document.getElementById('announcementFormContainer').style.display = 'none';
        loadPostedAnnouncements();
    }
});

// Load and display posted announcements with delete buttons and clickable images
function loadPostedAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const container = document.getElementById('postedAnnouncementsList');
    
    if (!container) return;
    
    if (announcements.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No announcements posted yet</p>';
        return;
    }
    
    container.innerHTML = announcements.map(announcement => `
        <div class="announcement-card" data-id="${announcement.id}">
            <div class="announcement-header">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <span class="announcement-icon">📢</span>
                    <h3 class="announcement-title">${announcement.title}</h3>
                </div>
                <button class="btn btn-danger btn-small" onclick="deleteAnnouncement(${announcement.id})">🗑️ Delete</button>
            </div>
            ${announcement.image ? `<img src="${announcement.image}" alt="${announcement.title}" class="announcement-image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin: 15px 0; cursor: pointer;" onclick="window.open('${announcement.image}', '_blank')" title="Click to view full size">` : ''}
            <p class="announcement-description">${announcement.description}</p>
            <p class="announcement-date">📅 ${announcement.date}</p>
        </div>
    `).join('');
}

// Delete announcement
window.deleteAnnouncement = function(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) {
        return;
    }
    
    let announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    announcements = announcements.filter(a => a.id !== id);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    alert('✅ Announcement deleted successfully!');
    loadPostedAnnouncements();
};

// Training Materials Management
document.getElementById('toggleMaterialForm')?.addEventListener('click', function() {
    const container = document.getElementById('materialFormContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('cancelMaterial')?.addEventListener('click', function() {
    document.getElementById('materialFormContainer').style.display = 'none';
    document.getElementById('materialForm').reset();
});

document.getElementById('materialForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('materialTitle').value;
    const description = document.getElementById('materialDescription').value;
    const type = document.getElementById('materialType').value;
    const file = document.getElementById('materialFile').files[0];
    
    if (!file) {
        alert('Please select a file to upload');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        let materials = JSON.parse(localStorage.getItem('trainingMaterials') || '[]');
        
        const material = {
            id: Date.now(),
            title: title,
            description: description,
            type: type,
            fileName: file.name,
            fileData: e.target.result,
            uploadDate: new Date().toLocaleDateString()
        };
        
        materials.unshift(material);
        localStorage.setItem('trainingMaterials', JSON.stringify(materials));
        
        alert('✅ Training material uploaded successfully!');
        document.getElementById('materialForm').reset();
        document.getElementById('materialFormContainer').style.display = 'none';
        loadUploadedMaterials();
    };
    reader.readAsDataURL(file);
});

function loadUploadedMaterials() {
    const materials = JSON.parse(localStorage.getItem('trainingMaterials') || '[]');
    const container = document.getElementById('uploadedMaterialsList');
    
    if (!container) return;
    
    if (materials.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No materials uploaded yet</p>';
        return;
    }
    
    const typeIcons = {
        'video': '📹',
        'pdf': '📄',
        'guide': '📖',
        'other': '📎'
    };
    
    container.innerHTML = materials.map(material => `
        <div class="material-item">
            <span class="material-icon">${typeIcons[material.type] || '📎'}</span>
            <div class="material-info">
                <h4>${material.title}</h4>
                <p>${material.description}</p>
                <p style="font-size: 12px; color: var(--text-secondary);">Uploaded: ${material.uploadDate} • File: ${material.fileName}</p>
            </div>
            <button class="btn btn-danger btn-small" onclick="deleteMaterial(${material.id})">🗑️ Delete</button>
        </div>
    `).join('');
}

window.deleteMaterial = function(id) {
    if (!confirm('Are you sure you want to delete this training material?')) {
        return;
    }
    
    let materials = JSON.parse(localStorage.getItem('trainingMaterials') || '[]');
    materials = materials.filter(m => m.id !== id);
    localStorage.setItem('trainingMaterials', JSON.stringify(materials));
    
    alert('✅ Training material deleted successfully!');
    loadUploadedMaterials();
};

// Certificate Management
document.getElementById('toggleCertificateForm')?.addEventListener('click', function() {
    const container = document.getElementById('certificateFormContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
    loadStudentsForCertificate();
});

document.getElementById('cancelCertificate')?.addEventListener('click', function() {
    document.getElementById('certificateFormContainer').style.display = 'none';
    document.getElementById('certificateForm').reset();
});

// FIXED: Load students for certificate dropdown
function loadStudentsForCertificate() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const select = document.getElementById('certificateStudent');
    
    if (!select) {
        console.error('Certificate student dropdown not found!');
        return;
    }
    
    console.log('Loading students for certificate. Total students:', students.length);
    
    // Clear existing options
    select.innerHTML = '<option value="">Select a student</option>';
    
    if (students.length === 0) {
        console.warn('No students found in localStorage');
        select.innerHTML += '<option value="" disabled>No students available - Add students first</option>';
        return;
    }
    
    // Add each student as an option
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} - ${student.beltRank || 'White'} Belt`;
        select.appendChild(option);
    });
    
    console.log('Certificate student dropdown populated with', students.length, 'students');
}

document.getElementById('certificateForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('certificateStudent').value;
    const title = document.getElementById('certificateTitle').value;
    const file = document.getElementById('certificateFile').files[0];
    
    if (!studentId || !file) {
        alert('⚠️ Please select a student and a certificate file');
        return;
    }
    
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
        alert('⚠️ Selected student not found!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        let certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
        
        const certificate = {
            id: Date.now(),
            studentId: studentId,
            studentName: student.name,
            title: title,
            fileName: file.name,
            fileData: e.target.result,
            uploadDate: new Date().toLocaleDateString()
        };
        
        certificates.unshift(certificate);
        localStorage.setItem('certificates', JSON.stringify(certificates));
        
        console.log('Certificate saved:', certificate);
        alert(`✅ Certificate uploaded successfully for ${student.name}!`);
        document.getElementById('certificateForm').reset();
        document.getElementById('certificateFormContainer').style.display = 'none';
        loadUploadedCertificates();
    };
    reader.readAsDataURL(file);
});

function loadUploadedCertificates() {
    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    const container = document.getElementById('uploadedCertificatesList');
    
    if (!container) return;
    
    if (certificates.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No certificates uploaded yet</p>';
        return;
    }
    
    container.innerHTML = certificates.map(cert => `
        <div class="material-item">
            <span class="material-icon">🎓</span>
            <div class="material-info">
                <h4>${cert.title}</h4>
                <p>Student: ${cert.studentName}</p>
                <p style="font-size: 12px; color: var(--text-secondary);">Uploaded: ${cert.uploadDate} • File: ${cert.fileName}</p>
            </div>
            <button class="btn btn-danger btn-small" onclick="deleteCertificate(${cert.id})">🗑️ Delete</button>
        </div>
    `).join('');
}

window.deleteCertificate = function(id) {
    if (!confirm('Are you sure you want to delete this certificate?')) {
        return;
    }
    
    let certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    certificates = certificates.filter(c => c.id !== id);
    localStorage.setItem('certificates', JSON.stringify(certificates));
    
    alert('✅ Certificate deleted successfully!');
    loadUploadedCertificates();
};

// Schedule Management - ENHANCED WITH EDIT FUNCTIONALITY
let editingScheduleId = null;

document.getElementById('toggleScheduleForm')?.addEventListener('click', function() {
    const container = document.getElementById('scheduleFormContainer');
    editingScheduleId = null;
    document.getElementById('scheduleFormTitle').textContent = 'Upload New Schedule';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleFile').required = true;
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('cancelSchedule')?.addEventListener('click', function() {
    document.getElementById('scheduleFormContainer').style.display = 'none';
    document.getElementById('scheduleForm').reset();
    editingScheduleId = null;
});

// Edit schedule function
window.editSchedule = function(id) {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const schedule = schedules.find(s => s.id === id);
    
    if (!schedule) {
        alert('Schedule not found');
        return;
    }
    
    editingScheduleId = id;
    document.getElementById('scheduleFormTitle').textContent = 'Edit Schedule';
    document.getElementById('scheduleTitle').value = schedule.title;
    document.getElementById('scheduleDescription').value = schedule.description;
    document.getElementById('scheduleFile').required = false; // Make file optional when editing
    document.getElementById('scheduleFormContainer').style.display = 'block';
    
    // Scroll to form
    document.getElementById('scheduleFormContainer').scrollIntoView({ behavior: 'smooth' });
};

document.getElementById('scheduleForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('scheduleTitle').value;
    const description = document.getElementById('scheduleDescription').value;
    const file = document.getElementById('scheduleFile').files[0];
    
    if (editingScheduleId) {
        // Update existing schedule
        let schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
        const index = schedules.findIndex(s => s.id === editingScheduleId);
        
        if (index === -1) {
            alert('Schedule not found');
            return;
        }
        
        if (file) {
            // If new file is uploaded, update with new file
            const reader = new FileReader();
            reader.onload = function(e) {
                schedules[index] = {
                    ...schedules[index],
                    title: title,
                    description: description,
                    fileName: file.name,
                    fileData: e.target.result,
                    uploadDate: new Date().toLocaleDateString()
                };
                
                localStorage.setItem('schedules', JSON.stringify(schedules));
                alert('✅ Schedule updated successfully!');
                document.getElementById('scheduleForm').reset();
                document.getElementById('scheduleFormContainer').style.display = 'none';
                editingScheduleId = null;
                loadUploadedSchedules();
            };
            reader.readAsDataURL(file);
        } else {
            // Update without changing file
            schedules[index] = {
                ...schedules[index],
                title: title,
                description: description
            };
            
            localStorage.setItem('schedules', JSON.stringify(schedules));
            alert('✅ Schedule updated successfully!');
            document.getElementById('scheduleForm').reset();
            document.getElementById('scheduleFormContainer').style.display = 'none';
            editingScheduleId = null;
            loadUploadedSchedules();
        }
    } else {
        // Create new schedule
        if (!file) {
            alert('Please select a schedule file to upload');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            let schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
            
            const schedule = {
                id: Date.now(),
                title: title,
                description: description,
                fileName: file.name,
                fileData: e.target.result,
                uploadDate: new Date().toLocaleDateString()
            };
            
            schedules.unshift(schedule);
            localStorage.setItem('schedules', JSON.stringify(schedules));
            
            alert('✅ Schedule uploaded successfully!');
            document.getElementById('scheduleForm').reset();
            document.getElementById('scheduleFormContainer').style.display = 'none';
            loadUploadedSchedules();
        };
        reader.readAsDataURL(file);
    }
});

function loadUploadedSchedules() {
    const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const container = document.getElementById('uploadedSchedulesList');
    
    if (!container) return;
    
    if (schedules.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No schedules uploaded yet</p>';
        return;
    }
    
    container.innerHTML = schedules.map(schedule => `
        <div class="material-item">
            <span class="material-icon">📅</span>
            <div class="material-info">
                <h4>${schedule.title}</h4>
                <p>${schedule.description}</p>
                <p style="font-size: 12px; color: var(--text-secondary);">Uploaded: ${schedule.uploadDate} • File: ${schedule.fileName}</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary btn-small" onclick="editSchedule(${schedule.id})">✏️ Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteSchedule(${schedule.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

window.deleteSchedule = function(id) {
    if (!confirm('Are you sure you want to delete this schedule?')) {
        return;
    }
    
    let schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    schedules = schedules.filter(s => s.id !== id);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    alert('✅ Schedule deleted successfully!');
    loadUploadedSchedules();
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfileImage();
    updateStatistics();
    loadPostedAnnouncements();
    loadUploadedMaterials();
    loadUploadedCertificates();
    loadUploadedSchedules();
    setTimeout(loadOnlineUsers, 500);
    setInterval(loadOnlineUsers, 5000);
    setInterval(updateStatistics, 5000);
    // Refresh button
    document.getElementById('refreshDashboard')?.addEventListener('click', function() {
        refreshDashboard();
    });
});
