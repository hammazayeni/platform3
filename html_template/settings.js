// Check if user is admin
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'admin') {
    alert('Access denied! Only administrators can access settings.');
    window.location.href = 'index.html';
}

let editingUserId = null;
let editingUserRole = null;
let currentFilter = 'all';
let profilePhotoData = null;

// Load all users and update statistics
function loadUsersAndStats() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    
    // Count admins
    const admins = approvedUsers.filter(u => u.role === 'admin');
    
    // Update statistics
    document.getElementById('totalAdmins').textContent = admins.length + 1; // +1 for default admin
    document.getElementById('totalStudentsSettings').textContent = students.length;
    document.getElementById('totalParentsSettings').textContent = parents.length;
    document.getElementById('totalUsers').textContent = admins.length + 1 + students.length + parents.length;
    
    // Build all users array
    const allUsers = [
        {
            id: 'admin-default',
            name: 'Master Admin',
            role: 'admin',
            email: 'admin@tkdacademy.com',
            username: 'admin',
            phone: 'N/A',
            isDefault: true
        }
    ];
    
    // Add students
    students.forEach(student => {
        allUsers.push({
            id: student.id,
            name: student.name,
            role: 'student',
            email: student.email,
            username: student.username || student.email,
            phone: student.phone,
            age: student.age,
            beltRank: student.beltRank,
            class: student.class,
            password: student.password
        });
    });
    
    // Add parents
    parents.forEach(parent => {
        allUsers.push({
            id: parent.id,
            name: parent.name,
            role: 'parent',
            email: parent.email,
            username: parent.username,
            phone: parent.phone,
            children: parent.children,
            password: parent.password
        });
    });
    
    // Add other approved admin users
    approvedUsers.forEach(user => {
        if (user.role === 'admin' && user.id !== 'admin-default') {
            allUsers.push({
                id: user.id || Date.now().toString(),
                name: user.name,
                role: 'admin',
                email: user.email,
                username: user.username,
                phone: user.phone,
                password: user.password
            });
        }
    });
    
    displayUsers(allUsers);
}

// Display users in table
function displayUsers(users) {
    const userList = document.getElementById('userListSettings');
    
    // Filter users based on current filter
    let filteredUsers = users;
    if (currentFilter !== 'all') {
        filteredUsers = users.filter(u => u.role === currentFilter);
    }
    
    if (filteredUsers.length === 0) {
        userList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">No users found</td></tr>';
        return;
    }
    
    userList.innerHTML = filteredUsers.map(user => {
        const roleColor = {
            'admin': 'badge-danger',
            'student': 'badge-success',
            'parent': 'badge-warning'
        };
        
        const roleIcon = {
            'admin': '👨‍🏫',
            'student': '👤',
            'parent': '👨‍👩‍👧'
        };
        
        return `
            <tr>
                <td>${user.name}</td>
                <td><span class="badge ${roleColor[user.role]}">${roleIcon[user.role]} ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
                <td>${user.email}<br><small style="color: var(--text-secondary);">@${user.username}</small></td>
                <td>${user.phone}</td>
                <td><span class="badge badge-success">Active</span></td>
                <td>
                    ${!user.isDefault ? `
                        <button class="btn btn-secondary btn-small" onclick="editUser('${user.id}', '${user.role}')">✏️ Edit</button>
                        <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}', '${user.role}')">🗑️ Delete</button>
                    ` : '<span style="color: var(--text-secondary); font-size: 12px;">System Account</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        loadUsersAndStats();
    });
});

// Show/hide student fields based on role
document.getElementById('userRole').addEventListener('change', function() {
    const studentFields = document.getElementById('studentFields');
    const photoPreview = document.getElementById('photoPreview');
    const roleIcon = {
        'admin': '👨‍🏫',
        'student': '👤',
        'parent': '👨‍👩‍👧'
    };
    if (!profilePhotoData) {
        photoPreview.innerHTML = roleIcon[this.value] || '👤';
    }
    if (this.value === 'student') {
        studentFields.style.display = 'block';
        document.getElementById('userAge').required = true;
        document.getElementById('userBelt').required = true;
        document.getElementById('userClass').required = true;
    } else {
        studentFields.style.display = 'none';
        document.getElementById('userAge').required = false;
        document.getElementById('userBelt').required = false;
        document.getElementById('userClass').required = false;
    }
});

// Add user button
document.getElementById('addUserBtn').addEventListener('click', function() {
    editingUserId = null;
    editingUserRole = null;
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('studentFields').style.display = 'none';
    document.getElementById('userPassword').required = true;
    profilePhotoData = null;
    const photoPreview = document.getElementById('photoPreview');
    if (photoPreview) photoPreview.innerHTML = '👤';
    document.getElementById('userModal').classList.add('active');
});

// Close modal
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('userModal').classList.remove('active');
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    document.getElementById('userModal').classList.remove('active');
});

// Profile photo upload handler
document.addEventListener('DOMContentLoaded', function() {
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const photoPreview = document.getElementById('photoPreview');

    if (uploadPhotoBtn && profilePhotoInput) {
        uploadPhotoBtn.addEventListener('click', function() {
            profilePhotoInput.click();
        });

        profilePhotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    profilePhotoData = ev.target.result;
                    photoPreview.innerHTML = `<img src="${profilePhotoData}" alt="Profile Photo">`;
                };
                reader.readAsDataURL(file);
            } else {
                alert('⚠️ Please select a valid image file (PNG, JPG)');
            }
        });
    }
});

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone format
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Check if username or email already exists
function checkDuplicateUser(username, email, excludeId = null) {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');

    const norm = v => (v === undefined || v === null) ? '' : String(v).trim().toLowerCase();
    const nUser = norm(username);
    const nEmail = norm(email);

    const allUsers = [...students, ...parents, ...approvedUsers];

    // If previously deleted by admin, allow re-registration with same credentials
    const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
    const isAllowed = allowList.some(e => (e.username && norm(e.username) === nUser) || (e.email && norm(e.email) === nEmail));

    const duplicate = allUsers.find(user => {
        if (excludeId && user.id === excludeId) return false;
        const u = norm(user.username);
        const e = norm(user.email);
        return (nUser && u === nUser) || (nEmail && e === nEmail);
    });

    return duplicate && !isAllowed ? duplicate : null;
}

// Edit user
window.editUser = function(id, role) {
    let user = null;
    
    if (role === 'student') {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        user = students.find(s => s.id === id);
    } else if (role === 'parent') {
        const parents = JSON.parse(localStorage.getItem('parents') || '[]');
        user = parents.find(p => p.id === id);
    } else if (role === 'admin') {
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        user = approvedUsers.find(u => u.id === id && u.role === 'admin');
        // Load admin profile photo if present
        if (user) {
            const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            const adminProfile = adminProfiles[id];
            if (adminProfile && adminProfile.image) {
                user.profilePhoto = adminProfile.image;
            }
        }
    }
    
    if (!user) {
        alert('❌ User not found!');
        return;
    }
    
    editingUserId = id;
    editingUserRole = role;
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userRole').value = role;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userUsername').value = user.username || user.email;
    document.getElementById('userPassword').value = user.password || '';
    document.getElementById('userPassword').required = false;
    document.getElementById('userPhone').value = user.phone;
    
    // Display existing profile photo
    const photoPreview = document.getElementById('photoPreview');
    profilePhotoData = user.profilePhoto || null;
    if (photoPreview) {
        if (profilePhotoData) {
            photoPreview.innerHTML = `<img src="${profilePhotoData}" alt="Profile Photo">`;
        } else {
            const roleIcon = {'admin': '👨‍🏫', 'student': '👤', 'parent': '👨‍👩‍👧'};
            photoPreview.innerHTML = roleIcon[role] || '👤';
        }
    }
    
    if (role === 'student') {
        document.getElementById('studentFields').style.display = 'block';
        document.getElementById('userAge').value = user.age || '';
        document.getElementById('userBelt').value = user.beltRank || 'White';
        document.getElementById('userClass').value = user.class || 'Beginner';
    } else {
        document.getElementById('studentFields').style.display = 'none';
    }
    
    document.getElementById('userModal').classList.add('active');
};

// FIXED: Delete user - allow re-registration
window.deleteUser = function(id, role) {
    if (!confirm('⚠️ Are you sure you want to delete this user?\n\nThis action cannot be undone and will:\n- Remove the user account\n- Delete all associated data\n- Unlink from any parent-child relationships')) {
        return;
    }
    
    const norm = v => (v === undefined || v === null) ? '' : String(v).trim().toLowerCase();
    
    if (role === 'student') {
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        const target = students.find(s => String(s.id) === String(id)) || null;
        const targetUsername = target ? norm(target.username) : '';
        const targetEmail = target ? norm(target.email) : '';
        
        students = students.filter(s => String(s.id) !== String(id));
        localStorage.setItem('students', JSON.stringify(students));
        
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        approvedUsers = approvedUsers.filter(u => {
            if (u.role !== 'student') return true;
            const matchesId = String(u.id) === String(id);
            const matchesUsername = targetUsername && norm(u.username) === targetUsername;
            const matchesEmail = targetEmail && norm(u.email) === targetEmail;
            return !(matchesId || matchesUsername || matchesEmail);
        });
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

        // Consume any stale allowReRegister entry that exactly matches the deleted credentials
        try {
            const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
            const filteredAllow = allowList.filter(e => {
                const uMatch = e.username && e.username.trim().toLowerCase() === (targetUsername || '').trim().toLowerCase();
                const eMatch = e.email && e.email.trim().toLowerCase() === (targetEmail || '').trim().toLowerCase();
                return !(uMatch || eMatch);
            });
            localStorage.setItem('allowReRegister', JSON.stringify(filteredAllow));
        } catch (_) {}

        let parents = JSON.parse(localStorage.getItem('parents') || '[]');
        parents.forEach(parent => {
            if (parent.children) {
                parent.children = parent.children.filter(childId => String(childId) !== String(id));
            }
        });
        localStorage.setItem('parents', JSON.stringify(parents));

        const blocked = new Set(JSON.parse(localStorage.getItem('blockedStudents') || '[]'));
        blocked.add(`id:${String(id)}`);
        localStorage.setItem('blockedStudents', JSON.stringify(Array.from(blocked)));

        // FIXED: Allow re-registration
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
        
    } else if (role === 'parent') {
        let parents = JSON.parse(localStorage.getItem('parents') || '[]');
        const targetParent = parents.find(p => String(p.id) === String(id)) || null;
        const targetUsername = targetParent ? norm(targetParent.username) : '';
        const targetEmail = targetParent ? norm(targetParent.email) : '';
        
        parents = parents.filter(p => String(p.id) !== String(id));
        localStorage.setItem('parents', JSON.stringify(parents));
        
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        approvedUsers = approvedUsers.filter(u => !(u.id === id && u.role === 'parent'));
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

        // Consume any stale allowReRegister entry that exactly matches the deleted credentials
        try {
            const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
            const filteredAllow = allowList.filter(e => {
                const uMatch = e.username && e.username.trim().toLowerCase() === (targetUsername || '').trim().toLowerCase();
                const eMatch = e.email && e.email.trim().toLowerCase() === (targetEmail || '').trim().toLowerCase();
                return !(uMatch || eMatch);
            });
            localStorage.setItem('allowReRegister', JSON.stringify(filteredAllow));
        } catch (_) {}

        // Clean up any pending registration entries with same username/email
        try {
            let registrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
            const normReg = v => (v === undefined || v === null) ? '' : String(v).trim().toLowerCase();
            registrations = registrations.filter(r => {
                const u = normReg(r.username);
                const e = normReg(r.email);
                return !((targetUsername && u === targetUsername) || (targetEmail && e === targetEmail));
            });
            localStorage.setItem('pendingRegistrations', JSON.stringify(registrations));
        } catch (_) {}

        // FIXED: Allow re-registration
        const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
        const allowEntry = {
            username: targetUsername,
            email: targetEmail,
            role: 'parent'
        };
        const exists = allowList.find(e => (e.username && e.username === allowEntry.username) || (e.email && e.email === allowEntry.email));
        if (!exists && (targetUsername || targetEmail)) {
            allowList.push(allowEntry);
            localStorage.setItem('allowReRegister', JSON.stringify(allowList));
        }
        
    } else if (role === 'admin') {
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const targetAdmin = approvedUsers.find(u => u.id === id && u.role === 'admin') || null;
        const targetUsername = targetAdmin ? norm(targetAdmin.username) : '';
        const targetEmail = targetAdmin ? norm(targetAdmin.email) : '';
        
        approvedUsers = approvedUsers.filter(u => !(u.id === id && u.role === 'admin'));
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

        // Consume any stale allowReRegister entry that exactly matches the deleted credentials
        try {
            const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
            const filteredAllow = allowList.filter(e => {
                const uMatch = e.username && e.username.trim().toLowerCase() === (targetUsername || '').trim().toLowerCase();
                const eMatch = e.email && e.email.trim().toLowerCase() === (targetEmail || '').trim().toLowerCase();
                return !(uMatch || eMatch);
            });
            localStorage.setItem('allowReRegister', JSON.stringify(filteredAllow));
        } catch (_) {}

        // FIXED: Remove admin-specific profile data
        let adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
        if (adminProfiles[id]) {
            delete adminProfiles[id];
            localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
        }

        // FIXED: Allow re-registration
        const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
        const allowEntry = {
            username: targetUsername,
            email: targetEmail,
            role: 'admin'
        };
        const exists = allowList.find(e => (e.username && e.username === allowEntry.username) || (e.email && e.email === allowEntry.email));
        if (!exists && (targetUsername || targetEmail)) {
            allowList.push(allowEntry);
            localStorage.setItem('allowReRegister', JSON.stringify(allowList));
        }
    }
    
    alert('✅ User deleted successfully!');
    loadUsersAndStats();
};

// Form submission
document.getElementById('userForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const role = document.getElementById('userRole').value;
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    const phone = document.getElementById('userPhone').value.trim();
    
    // Validation
    if (!name || !email || !username || !phone) {
        alert('❌ Please fill in all required fields!');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('❌ Please enter a valid email address!');
        return;
    }
    
    if (!isValidPhone(phone)) {
        alert('❌ Please enter a valid phone number (at least 10 digits)!');
        return;
    }
    
    if (username.length < 3) {
        alert('❌ Username must be at least 3 characters long!');
        return;
    }
    
    if (!editingUserId && password.length < 6) {
        alert('❌ Password must be at least 6 characters long!');
        return;
    }
    
    const duplicate = checkDuplicateUser(username, email, editingUserId);
    if (duplicate) {
        if (duplicate.username === username) {
            alert('❌ Username already exists! Please choose a different username.');
        } else {
            alert('❌ Email already exists! Please use a different email address.');
        }
        return;
    }
    
    if (role === 'student') {
        const age = document.getElementById('userAge').value;
        const beltRank = document.getElementById('userBelt').value;
        const classLevel = document.getElementById('userClass').value;
        
        if (!age || age < 5 || age > 100) {
            alert('❌ Please enter a valid age (5-100)!');
            return;
        }
        
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        
        const studentData = {
            id: editingUserId || Date.now().toString(),
            name,
            email,
            username,
            password: password || (editingUserId ? students.find(s => s.id === editingUserId)?.password : ''),
            phone,
            age: parseInt(age),
            beltRank,
            class: classLevel,
            joinDate: editingUserId ? students.find(s => s.id === editingUserId)?.joinDate : new Date().toISOString().split('T')[0],
            profilePhoto: profilePhotoData
        };
        
        if (editingUserId) {
            const index = students.findIndex(s => s.id === editingUserId);
            if (index !== -1) {
                students[index] = studentData;
            }
        } else {
            students.push(studentData);
        }
        
        localStorage.setItem('students', JSON.stringify(students));
        
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const userIndex = approvedUsers.findIndex(u => u.id === studentData.id);
        if (userIndex !== -1) {
            approvedUsers[userIndex] = { ...studentData, role: 'student' };
        } else {
            approvedUsers.push({ ...studentData, role: 'student' });
        }
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
        
    } else if (role === 'parent') {
        let parents = JSON.parse(localStorage.getItem('parents') || '[]');
        
        const parentData = {
            id: editingUserId || Date.now().toString(),
            name,
            email,
            username,
            password: password || (editingUserId ? parents.find(p => p.id === editingUserId)?.password : ''),
            phone,
            role: 'parent',
            children: editingUserId ? parents.find(p => p.id === editingUserId)?.children || [] : [],
            joinDate: editingUserId ? parents.find(p => p.id === editingUserId)?.joinDate : new Date().toISOString(),
            profilePhoto: profilePhotoData
        };
        
        if (editingUserId) {
            const index = parents.findIndex(p => p.id === editingUserId);
            if (index !== -1) {
                parents[index] = parentData;
            }
        } else {
            parents.push(parentData);
        }
        
        localStorage.setItem('parents', JSON.stringify(parents));
        
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const userIndex = approvedUsers.findIndex(u => u.id === parentData.id);
        if (userIndex !== -1) {
            approvedUsers[userIndex] = { ...parentData, role: 'parent' };
        } else {
            approvedUsers.push({ ...parentData, role: 'parent' });
        }
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
        
    } else if (role === 'admin') {
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        
        const adminData = {
            id: editingUserId || Date.now().toString(),
            name,
            email,
            username,
            password: password || (editingUserId ? approvedUsers.find(u => u.id === editingUserId && u.role === 'admin')?.password : ''),
            phone,
            role: 'admin',
            joinDate: editingUserId ? approvedUsers.find(u => u.id === editingUserId && u.role === 'admin')?.joinDate : new Date().toISOString()
        };
        
        if (editingUserId) {
            const index = approvedUsers.findIndex(u => u.id === editingUserId && u.role === 'admin');
            if (index !== -1) {
                approvedUsers[index] = adminData;
            }
        } else {
            approvedUsers.push(adminData);
        }
        
        localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));

        // Store admin profile photo separately
        if (profilePhotoData) {
            let adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            adminProfiles[adminData.id] = {
                image: profilePhotoData,
                name: adminData.name,
                role: 'admin'
            };
            localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
        }
    }
    
    alert('✅ User saved successfully!');
    document.getElementById('userModal').classList.remove('active');
    profilePhotoData = null;
    loadUsersAndStats();
});

// Search functionality
document.getElementById('searchUserSettings').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#userListSettings tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Academy Settings Form
document.getElementById('academySettingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const academySettings = {
        name: document.getElementById('academyName').value,
        email: document.getElementById('academyEmail').value,
        phone: document.getElementById('academyPhone').value,
        address: document.getElementById('academyAddress').value
    };
    
    localStorage.setItem('academySettings', JSON.stringify(academySettings));
    alert('✅ Academy settings saved successfully!');
});

// Save Preferences
document.getElementById('savePreferences').addEventListener('click', function() {
    const preferences = {
        enableNotifications: document.getElementById('enableNotifications').checked,
        enableAutoRefresh: document.getElementById('enableAutoRefresh').checked,
        refreshInterval: document.getElementById('refreshInterval').value
    };
    
    localStorage.setItem('systemPreferences', JSON.stringify(preferences));
    alert('✅ Preferences saved successfully!');
});

// Export Data
document.getElementById('exportData').addEventListener('click', function() {
    const allData = {
        students: JSON.parse(localStorage.getItem('students') || '[]'),
        parents: JSON.parse(localStorage.getItem('parents') || '[]'),
        approvedUsers: JSON.parse(localStorage.getItem('approvedUsers') || '[]'),
        announcements: JSON.parse(localStorage.getItem('announcements') || '[]'),
        trainingMaterials: JSON.parse(localStorage.getItem('trainingMaterials') || '[]'),
        certificates: JSON.parse(localStorage.getItem('certificates') || '[]'),
        schedules: JSON.parse(localStorage.getItem('schedules') || '[]'),
        academySettings: JSON.parse(localStorage.getItem('academySettings') || '{}'),
        systemPreferences: JSON.parse(localStorage.getItem('systemPreferences') || '{}'),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tkd-academy-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Data exported successfully!');
});

// Import Data
document.getElementById('importData').addEventListener('click', function() {
    document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('⚠️ This will overwrite all current data. Are you sure you want to continue?')) {
                if (data.students) localStorage.setItem('students', JSON.stringify(data.students));
                if (data.parents) localStorage.setItem('parents', JSON.stringify(data.parents));
                if (data.approvedUsers) localStorage.setItem('approvedUsers', JSON.stringify(data.approvedUsers));
                if (data.announcements) localStorage.setItem('announcements', JSON.stringify(data.announcements));
                if (data.trainingMaterials) localStorage.setItem('trainingMaterials', JSON.stringify(data.trainingMaterials));
                if (data.certificates) localStorage.setItem('certificates', JSON.stringify(data.certificates));
                if (data.schedules) localStorage.setItem('schedules', JSON.stringify(data.schedules));
                if (data.academySettings) localStorage.setItem('academySettings', JSON.stringify(data.academySettings));
                if (data.systemPreferences) localStorage.setItem('systemPreferences', JSON.stringify(data.systemPreferences));
                
                alert('✅ Data imported successfully! Reloading page...');
                location.reload();
            }
        } catch (error) {
            alert('❌ Error importing data. Please make sure the file is valid.');
            console.error(error);
        }
    };
    reader.readAsText(file);
});

// Reset System
document.getElementById('resetSystem').addEventListener('click', function() {
    if (confirm('⚠️ WARNING: This will delete ALL data and reset the system to default state.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?')) {
        if (confirm('⚠️ FINAL WARNING: All users, students, parents, announcements, schedules, and settings will be permanently deleted.\n\nType YES in the next prompt to confirm.')) {
            const confirmation = prompt('Type YES to confirm system reset:');
            if (confirmation === 'YES') {
                // Full reset: clear entire localStorage so the app starts fresh
                // This removes all keys, including classes, activities, and seed flags
                try {
                    localStorage.clear();
                } catch (_) {
                    // Fallback in environments where clear() might be restricted
                    const allKeys = Object.keys(localStorage);
                    allKeys.forEach(k => localStorage.removeItem(k));
                }

                alert('✅ System reset complete! Redirecting to login...');
                window.location.href = 'index.html';
            }
        }
    }
});

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsersAndStats();
    
    // Load academy settings
    const academySettings = JSON.parse(localStorage.getItem('academySettings') || '{}');
    if (academySettings.name) document.getElementById('academyName').value = academySettings.name;
    if (academySettings.email) document.getElementById('academyEmail').value = academySettings.email;
    if (academySettings.phone) document.getElementById('academyPhone').value = academySettings.phone;
    if (academySettings.address) document.getElementById('academyAddress').value = academySettings.address;
    
    // Load preferences
    const preferences = JSON.parse(localStorage.getItem('systemPreferences') || '{}');
    if (preferences.enableNotifications !== undefined) {
        document.getElementById('enableNotifications').checked = preferences.enableNotifications;
    }
    if (preferences.enableAutoRefresh !== undefined) {
        document.getElementById('enableAutoRefresh').checked = preferences.enableAutoRefresh;
    }
    if (preferences.refreshInterval) {
        document.getElementById('refreshInterval').value = preferences.refreshInterval;
    }
    
    // Update pending badge
    const registrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    const pending = registrations.filter(r => r.status === 'pending').length;
    const badge = document.getElementById('pendingBadge');
    if (badge) {
        badge.textContent = pending > 0 ? pending : '';
    }
});
