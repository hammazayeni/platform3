// Check if user is admin
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'admin') {
    alert('Access denied! Only administrators can view this page.');
    window.location.href = 'index.html';
}

let editingUserId = null;
let editingUserRole = null;
let currentFilter = 'all';
let profilePhotoData = null;

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
                reader.onload = function(e) {
                    profilePhotoData = e.target.result;
                    photoPreview.innerHTML = `<img src="${profilePhotoData}" alt="Profile Photo">`;
                };
                reader.readAsDataURL(file);
            } else {
                alert('⚠️ Please select a valid image file (PNG, JPG)');
            }
        });
    }
});

// Load all users
function loadUsers() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    
    // Add default admin
    const allUsers = [
        {
            id: 'admin-default',
            name: 'Master Admin',
            role: 'admin',
            email: 'admin@tkdacademy.com',
            username: 'admin',
            phone: 'N/A',
            isDefault: true,
            profilePhoto: null
        }
    ];
    
    // Add students with their profile photos
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
            password: student.password,
            profilePhoto: student.profilePhoto || null
        });
    });
    
    // Add parents with their profile photos
    parents.forEach(parent => {
        allUsers.push({
            id: parent.id,
            name: parent.name,
            role: 'parent',
            email: parent.email,
            username: parent.username,
            phone: parent.phone,
            children: parent.children,
            password: parent.password,
            profilePhoto: parent.profilePhoto || null
        });
    });
    
    // Add other approved admin users
    approvedUsers.forEach(user => {
        if (user.role === 'admin' && user.id !== 'admin-default') {
            // Load admin profile photo
            const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            const adminProfile = adminProfiles[user.id];
            
            allUsers.push({
                id: user.id || Date.now().toString(),
                name: user.name,
                role: 'admin',
                email: user.email,
                username: user.username,
                phone: user.phone,
                password: user.password,
                profilePhoto: adminProfile ? adminProfile.image : null
            });
        }
    });
    
    displayUsers(allUsers);
}

// Display users in table
function displayUsers(users) {
    const userList = document.getElementById('userList');
    
    // Filter users based on current filter
    let filteredUsers = users;
    if (currentFilter !== 'all') {
        filteredUsers = users.filter(u => u.role === currentFilter);
    }
    
    if (filteredUsers.length === 0) {
        userList.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">No users found</td></tr>';
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
        
        // Display profile photo or placeholder
        const photoHTML = user.profilePhoto 
            ? `<img src="${user.profilePhoto}" alt="${user.name}" class="user-photo">`
            : `<div class="user-photo-placeholder">${roleIcon[user.role]}</div>`;
        
        return `
            <tr>
                <td>${photoHTML}</td>
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
        loadUsers();
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
    
    // Update preview icon based on role
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
    profilePhotoData = null;
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('userForm').reset();
    document.getElementById('studentFields').style.display = 'none';
    document.getElementById('userPassword').required = true;
    document.getElementById('photoPreview').innerHTML = '👤';
    document.getElementById('userModal').classList.add('active');
});

// Close modal
document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('userModal').classList.remove('active');
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    document.getElementById('userModal').classList.remove('active');
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
        
        // Load admin profile photo
        if (user) {
            const adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
            const adminProfile = adminProfiles[id];
            if (adminProfile && adminProfile.image) {
                user.profilePhoto = adminProfile.image;
            }
        }
    }
    
    if (!user) {
        // Fallback resolution: try mapping via approvedUsers by id then locate in canonical store
        try {
            const norm = v => (v === undefined || v === null) ? '' : String(v).trim().toLowerCase();
            if (role === 'student') {
                const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
                const au = approvedUsers.find(u => String(u.id) === String(id) && u.role === 'student');
                if (au) {
                    const students = JSON.parse(localStorage.getItem('students') || '[]');
                    const targetUser = norm(au.username);
                    const targetEmail = norm(au.email);
                    user = students.find(s => norm(s.username) === targetUser || norm(s.email) === targetEmail) || null;
                }
            } else if (role === 'parent') {
                const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
                const au = approvedUsers.find(u => String(u.id) === String(id) && u.role === 'parent');
                if (au) {
                    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
                    const targetUser = norm(au.username);
                    const targetEmail = norm(au.email);
                    user = parents.find(p => norm(p.username) === targetUser || norm(p.email) === targetEmail) || null;
                }
            }
        } catch (_) {}
        if (!user) {
            alert('❌ User not found!');
            return;
        }
    }
    
    editingUserId = id;
    editingUserRole = role;
    profilePhotoData = user.profilePhoto || null;
    
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
    if (profilePhotoData) {
        photoPreview.innerHTML = `<img src="${profilePhotoData}" alt="Profile Photo">`;
    } else {
        const roleIcon = {'admin': '👨‍🏫', 'student': '👤', 'parent': '👨‍👩‍👧'};
        photoPreview.innerHTML = roleIcon[role] || '👤';
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

// Delete user (same as before, keeping existing logic)
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

        const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
        const allowEntry = { username: targetUsername, email: targetEmail, role: 'student' };
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

        const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
        const allowEntry = { username: targetUsername, email: targetEmail, role: 'parent' };
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

        let adminProfiles = JSON.parse(localStorage.getItem('adminProfiles') || '{}');
        if (adminProfiles[id]) {
            delete adminProfiles[id];
            localStorage.setItem('adminProfiles', JSON.stringify(adminProfiles));
        }

        const allowList = JSON.parse(localStorage.getItem('allowReRegister') || '[]');
        const allowEntry = { username: targetUsername, email: targetEmail, role: 'admin' };
        const exists = allowList.find(e => (e.username && e.username === allowEntry.username) || (e.email && e.email === allowEntry.email));
        if (!exists && (targetUsername || targetEmail)) {
            allowList.push(allowEntry);
            localStorage.setItem('allowReRegister', JSON.stringify(allowList));
        }
    }
    
    alert('✅ User deleted successfully!');
    loadUsers();
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
    
    // Check for duplicates
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
        
        // Sync to approved users
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
        
        // Sync to approved users
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
    loadUsers();
});

// Search functionality
document.getElementById('searchUser').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#userList tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Update pending badge
function updatePendingBadge() {
    const registrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    const pending = registrations.filter(r => r.status === 'pending').length;
    const badge = document.getElementById('pendingBadge');
    if (badge) {
        badge.textContent = pending > 0 ? pending : '';
    }
}

// Load users on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    updatePendingBadge();
});
