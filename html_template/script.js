// Removed hardcoded localhost port redirect to allow running on any dev port
// This avoids breaking the app when the server runs on a different port (e.g., 8003)

// User authentication and role management
const users = {
    admin: { 
        username: 'admin', 
        password: 'admin123', 
        role: 'admin',
        name: 'Master Admin',
        image: null
    },
    student: { 
        username: 'student', 
        password: 'student123', 
        role: 'student',
        name: 'John Doe',
        image: null
    },
    parent: { 
        username: 'parent', 
        password: 'parent123', 
        role: 'parent',
        name: 'Parent User',
        image: null
    }
};

// Check authentication on protected pages
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    
    // Role-based page access control
    const pageAccess = {
        'admin-dashboard.html': ['admin'],
        'student-management.html': ['admin'],
        'attendance.html': ['admin'],
        'settings.html': ['admin'],
        'class-schedule.html': ['admin', 'student', 'parent'],
        'student-dashboard.html': ['student'],
        'parent-dashboard.html': ['parent']
    };
    
    if (pageAccess[currentPage] && !pageAccess[currentPage].includes(currentUser.role)) {
        alert('Access denied! You do not have permission to view this page.');
        // Redirect to appropriate dashboard
        if (currentUser.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (currentUser.role === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (currentUser.role === 'parent') {
            window.location.href = 'parent-dashboard.html';
        }
        return null;
    }
    
    return currentUser;
}

// Initialize page with user info
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip auth check on login and landing pages
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'landing.html') {
        return;
    }
    
    const currentUser = checkAuth();
    if (!currentUser) return;
    
    // Update user info display
    const userInfoElements = document.querySelectorAll('.user-info span');
    userInfoElements.forEach(el => {
        if (el.textContent.includes('Welcome') || el.textContent.includes('Master Admin') || el.textContent.includes('Student') || el.textContent.includes('Parent')) {
            el.textContent = `Welcome, ${currentUser.name}`;
        }
    });
    
    // Update profile sections with user image
    updateProfileDisplay(currentUser);

    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav && currentUser.role !== 'admin') {
        const makeLink = (href, icon, label) => {
            return `
                <a href="${href}" class="nav-item">
                    <span class="icon"><svg width="20" height="20"><use href="${icon}"/></svg></span>
                    <span>${label}</span>
                </a>
            `;
        };
        let html = '';
        if (currentUser.role === 'student') {
            html += makeLink('student-dashboard.html', '#icon-dashboard', 'Dashboard');
            html += makeLink('student-certificates.html', '#icon-certificate', 'My Certificates');
            html += makeLink('student-materials.html', '#icon-book', 'Training Materials');
            html += `
                <a href="messages.html" class="nav-item">
                    <span class="icon"><svg width="20" height="20"><use href="#icon-message"/></svg></span>
                    <span>Messages</span>
                    <span class="message-badge" id="sidebarMessageBadge"></span>
                </a>
            `;
            html += makeLink('class-schedule.html', '#icon-calendar', 'Schedule');
            html += `
                <a href="index.html" class="nav-item logout">
                    <span class="icon"><svg width="20" height="20"><use href="#icon-logout"/></svg></span>
                    <span>Logout</span>
                </a>
            `;
        } else if (currentUser.role === 'parent') {
            html += makeLink('parent-dashboard.html', '#icon-dashboard', 'Dashboard');
            html += `
                <a href="messages.html" class="nav-item">
                    <span class="icon"><svg width="20" height="20"><use href="#icon-message"/></svg></span>
                    <span>Messages</span>
                    <span class="message-badge" id="sidebarMessageBadge"></span>
                </a>
            `;
            html += makeLink('class-schedule.html', '#icon-calendar', 'Schedule');
            html += `
                <a href="index.html" class="nav-item logout">
                    <span class="icon"><svg width="20" height="20"><use href="#icon-logout"/></svg></span>
                    <span>Logout</span>
                </a>
            `;
        }
        sidebarNav.innerHTML = html;
    }

    // Active sidebar item highlight across pages
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-item');
    if (sidebarLinks.length) {
        sidebarLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const target = href.split('/').pop();
            if (target === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Ensure sidebar is always visible (no collapse state)
    document.body.classList.remove('sidebar-open');
    document.body.classList.remove('sidebar-collapsed');
    localStorage.removeItem('sidebarOpenMobile');
    localStorage.removeItem('sidebarCollapsed');
});

// FIXED: Update profile display with user-specific image
function updateProfileDisplay(user) {
    const profileCards = document.querySelectorAll('.profile-card');
    profileCards.forEach(card => {
        const avatar = card.querySelector('.profile-avatar');
        const nameElement = card.querySelector('.profile-info h2');
        
        // Load user-specific profile data for admins
        if (user.role === 'admin' && user.id) {
            const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            const adminProfile = adminProfiles[user.id];
            
            if (adminProfile) {
                if (avatar && adminProfile.image) {
                    avatar.innerHTML = `<img src="${adminProfile.image}" alt="${adminProfile.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
                if (nameElement && adminProfile.name) {
                    nameElement.textContent = adminProfile.name;
                }
            } else {
                // Fallback to user data
                if (avatar && user.image) {
                    avatar.innerHTML = `<img src="${user.image}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
                if (nameElement) {
                    nameElement.textContent = user.name;
                }
            }
        } else {
            // For non-admin users, use regular profile data
            if (avatar && user.image) {
                avatar.innerHTML = `<img src="${user.image}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            }
            if (nameElement) {
                nameElement.textContent = user.name;
            }
        }
    });
}

// Logout handler
document.querySelectorAll('.nav-item.logout').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});

// FIXED: Profile image upload handler - admin-specific
function setupProfileImageUpload() {
    const uploadBtn = document.getElementById('uploadProfileImage');
    const imageInput = document.getElementById('profileImageInput');
    
    if (uploadBtn && imageInput) {
        uploadBtn.addEventListener('click', function() {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                    
                    // FIXED: Store admin profile data separately by user ID
                    if (currentUser.role === 'admin' && currentUser.id) {
                        let adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
                        
                        if (!adminProfiles[currentUser.id]) {
                            adminProfiles[currentUser.id] = {};
                        }
                        
                        adminProfiles[currentUser.id].image = e.target.result;
                        adminProfiles[currentUser.id].name = currentUser.name;
                        adminProfiles[currentUser.id].role = currentUser.role;
                        
                        localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
                        
                        // Update current user session
                        currentUser.image = e.target.result;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    } else {
                        // For non-admin users, use the old method
                        currentUser.image = e.target.result;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        
                        const savedUsers = JSON.parse(localStorage.getItem('users') || '{}');
                        if (!savedUsers[currentUser.role]) {
                            savedUsers[currentUser.role] = {};
                        }
                        savedUsers[currentUser.role].image = e.target.result;
                        savedUsers[currentUser.role].name = currentUser.name;
                        savedUsers[currentUser.role].role = currentUser.role;
                        localStorage.setItem('users', JSON.stringify(savedUsers));
                    }
                    
                    // Update display
                    updateProfileDisplay(currentUser);
                    alert('Profile image updated successfully!');
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select a valid image file (PNG, JPG)');
            }
        });
    }
}

// Initialize profile image upload on page load
document.addEventListener('DOMContentLoaded', setupProfileImageUpload);

// Student Management - Admin only functions
const studentData = [
    { id: 1, name: 'Emma Johnson', age: 12, belt: 'White', class: 'Beginner', email: 'emma@example.com', phone: '555-0101', parent: 'Sarah Johnson', parentContact: '555-0102', joinDate: '2024-01-15' },
    { id: 2, name: 'Liam Smith', age: 14, belt: 'Yellow', class: 'Beginner', email: 'liam@example.com', phone: '555-0103', parent: 'John Smith', parentContact: '555-0104', joinDate: '2024-02-01' },
    { id: 3, name: 'Olivia Brown', age: 13, belt: 'White', class: 'Beginner', email: 'olivia@example.com', phone: '555-0105', parent: 'Emily Brown', parentContact: '555-0106', joinDate: '2024-01-20' },
    { id: 4, name: 'Noah Davis', age: 15, belt: 'Yellow', class: 'Beginner', email: 'noah@example.com', phone: '555-0107', parent: 'Michael Davis', parentContact: '555-0108', joinDate: '2024-03-01' },
    { id: 5, name: 'Ava Wilson', age: 16, belt: 'Green', class: 'Intermediate', email: 'ava@example.com', phone: '555-0109', parent: 'Lisa Wilson', parentContact: '555-0110', joinDate: '2023-09-15' },
    { id: 6, name: 'Ethan Moore', age: 17, belt: 'Blue', class: 'Intermediate', email: 'ethan@example.com', phone: '555-0111', parent: 'David Moore', parentContact: '555-0112', joinDate: '2023-08-01' },
    { id: 7, name: 'Sophia Taylor', age: 18, belt: 'Red', class: 'Advanced', email: 'sophia@example.com', phone: '555-0113', parent: 'Jennifer Taylor', parentContact: '555-0114', joinDate: '2023-01-10' },
    { id: 8, name: 'Mason Anderson', age: 19, belt: 'Black', class: 'Advanced', email: 'mason@example.com', phone: '555-0115', parent: 'Robert Anderson', parentContact: '555-0116', joinDate: '2022-06-01' }
];

// Load students into table
function loadStudents() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        return;
    }
    
    const tbody = document.getElementById('studentList');
    if (!tbody) return;
    
    const savedStudents = JSON.parse(localStorage.getItem('students') || JSON.stringify(studentData));
    
    tbody.innerHTML = savedStudents.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td><span class="badge badge-success">${student.belt}</span></td>
            <td>${student.class}</td>
            <td>${student.joinDate}</td>
            <td>${student.email}</td>
            <td>
                <button class="btn btn-small btn-secondary" onclick="editStudent('${student.id}')">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteStudent('${student.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Edit student - Admin only
window.editStudent = function(id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access denied! Only administrators can edit students.');
        return;
    }
    
    const savedStudents = JSON.parse(localStorage.getItem('students') || JSON.stringify(studentData));
    const student = savedStudents.find(s => s.id === id);
    
    if (student) {
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentAge').value = student.age;
        document.getElementById('studentBelt').value = student.belt;
        document.getElementById('studentClass').value = student.class;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentPhone').value = student.phone;
        document.getElementById('parentName').value = student.parent;
        document.getElementById('parentContact').value = student.parentContact;
        document.getElementById('joinDate').value = student.joinDate;
        
        document.getElementById('modalTitle').textContent = 'Edit Student';
        document.getElementById('studentModal').classList.add('active');
        document.getElementById('studentForm').dataset.editId = id;
    }
};

// Delete student - hardened and consistent across pages
window.deleteStudent = function(id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access denied! Only administrators can delete students.');
        return;
    }

    if (!confirm('Are you sure you want to delete this student? This will remove their account and unlink from parents.')) {
        return;
    }

    // Normalize helper
    const norm = v => (v === undefined || v === null) ? '' : String(v).trim().toLowerCase();
    const targetId = norm(id);
    const getAllStudentKeys = s => {
        const keys = [];
        const u = (s && s.username) ? s.username.trim().toLowerCase() : '';
        const e = (s && s.email) ? s.email.trim().toLowerCase() : '';
        const sid = s && s.id ? String(s.id) : '';
        if (u) keys.push(`u:${u}`);
        if (e) keys.push(`e:${e}`);
        if (sid) keys.push(`id:${sid}`);
        return keys;
    };
    const getBlockedStudents = () => {
        const list = JSON.parse(localStorage.getItem('blockedStudents') || '[]');
        return Array.isArray(list) ? list : [];
    };
    const saveBlockedStudents = list => {
        localStorage.setItem('blockedStudents', JSON.stringify(list));
    };

    // Load current students and resolve identity
    let students = JSON.parse(localStorage.getItem('students') || JSON.stringify(studentData));
    const target = students.find(s => norm(s.id) === targetId) || null;
    const targetUsername = target ? norm(target.username) : '';
    const targetEmail = target ? norm(target.email) : '';

    // Remove only the student with matching id
    students = students.filter(s => norm(s.id) !== targetId);
    localStorage.setItem('students', JSON.stringify(students));

    // Unlink from parents.children
    let parents = JSON.parse(localStorage.getItem('parents') || '[]');
    parents.forEach(parent => {
        if (parent.children) {
            parent.children = parent.children.filter(childId => norm(childId) !== targetId);
        }
    });
    localStorage.setItem('parents', JSON.stringify(parents));

    // Remove matching student account from approvedUsers (role student) by id or exact identity
    let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    approvedUsers = approvedUsers.filter(u => {
        if (u.role !== 'student') return true;
        const matchById = norm(u.id) === targetId;
        const matchByUsername = targetUsername && norm(u.username) === targetUsername;
        const matchByEmail = targetEmail && norm(u.email) === targetEmail;
        return !(matchById || matchByUsername || matchByEmail);
    });
    localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

    // Add id-only key to blocklist to prevent re-sync of this specific student
    const blocked = new Set(getBlockedStudents());
    blocked.add(`id:${String(id)}`);
    saveBlockedStudents(Array.from(blocked));

    // FIXED: Allow re-registration with same credentials (admin-triggered deletion)
    try {
        const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
        const allowEntry = {
            username: targetUsername,
            email: targetEmail,
            role: 'student'
        };
        const exists = allowList.find(e => (e.username && e.username === allowEntry.username) || (e.email && e.email === allowEntry.email));
        if (!exists && (targetUsername || targetEmail)) {
            allowList.push(allowEntry);
            localStorage.setItem('allowReRegister', JSON.stringify(allowList));
        }
    } catch (_) {}

    // Reload list
    if (typeof loadStudents === 'function') {
        loadStudents();
    }

    alert('✅ Student and account deleted successfully!');
};

// Add student modal - Admin only
const addStudentBtn = document.getElementById('addStudentBtn');
if (addStudentBtn) {
    addStudentBtn.addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Access denied! Only administrators can add students.');
            return;
        }
        
        document.getElementById('studentForm').reset();
        document.getElementById('modalTitle').textContent = 'Add New Student';
        document.getElementById('studentModal').classList.add('active');
        delete document.getElementById('studentForm').dataset.editId;
    });
}

// Close modal
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

if (closeModal) {
    closeModal.addEventListener('click', function() {
        document.getElementById('studentModal').classList.remove('active');
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', function() {
        document.getElementById('studentModal').classList.remove('active');
    });
}

// Save student - Admin only
const studentForm = document.getElementById('studentForm');
if (studentForm) {
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') {
            alert('Access denied! Only administrators can save student data.');
            return;
        }
        
        const savedStudents = JSON.parse(localStorage.getItem('students') || JSON.stringify(studentData));
        const editId = this.dataset.editId;
        
        const studentInfo = {
            id: editId ? parseInt(editId) : savedStudents.length > 0 ? Math.max(...savedStudents.map(s => s.id)) + 1 : 1,
            name: document.getElementById('studentName').value,
            age: parseInt(document.getElementById('studentAge').value),
            belt: document.getElementById('studentBelt').value,
            class: document.getElementById('studentClass').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            parent: document.getElementById('parentName').value,
            parentContact: document.getElementById('parentContact').value,
            joinDate: document.getElementById('joinDate').value
        };
        
        if (editId) {
            const index = savedStudents.findIndex(s => s.id === parseInt(editId));
            savedStudents[index] = studentInfo;
        } else {
            savedStudents.push(studentInfo);
        }
        
        localStorage.setItem('students', JSON.stringify(savedStudents));
        document.getElementById('studentModal').classList.remove('active');
        loadStudents();
        alert('Student saved successfully!');
    });
}

// Initialize student list on page load
document.addEventListener('DOMContentLoaded', loadStudents);

// Search functionality
const searchInput = document.getElementById('searchStudent');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#studentList tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Schedule Management - Role-based filtering
function loadScheduleForRole() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'class-schedule.html') return;
    
    // For students and parents, show view-only message
    if (currentUser.role === 'student' || currentUser.role === 'parent') {
        const pageHeader = document.querySelector('.page-header h1');
        if (pageHeader) {
            pageHeader.innerHTML = currentUser.role === 'student' ? 
                '📅 My Class Schedule' : 
                '📅 Children\'s Class Schedule';
        }
        
        // Add view-only notice
        const mainContent = document.querySelector('.main-content');
        const existingNotice = document.getElementById('viewOnlyNotice');
        if (!existingNotice && mainContent) {
            const notice = document.createElement('div');
            notice.id = 'viewOnlyNotice';
            notice.className = 'card';
            notice.style.marginBottom = '20px';
            notice.innerHTML = `
                <div class="card-body" style="text-align: center; padding: 15px;">
                    <p style="color: var(--text-secondary); margin: 0;">
                        📋 <strong>View Only:</strong> This schedule is managed by the administrator. 
                        Contact your instructor for any schedule changes.
                    </p>
                </div>
            `;
            mainContent.insertBefore(notice, mainContent.children[1]);
        }
    }
}

// Initialize schedule role-based display
document.addEventListener('DOMContentLoaded', loadScheduleForRole);

// Attendance Management - Admin only
function initializeAttendanceManagement() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'attendance.html' && currentUser && currentUser.role !== 'admin') {
        alert('Access denied! Only administrators can access attendance management.');
        window.location.href = currentUser.role === 'student' ? 'student-dashboard.html' : 'parent-dashboard.html';
    }
}

document.addEventListener('DOMContentLoaded', initializeAttendanceManagement);
