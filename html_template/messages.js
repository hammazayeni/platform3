// Messages System - Admin-specific private messaging with multi-admin support
let currentConversation = null;

// Generate unique admin ID if not exists
function ensureAdminId(user) {
    if (user.role === 'admin' && !user.adminId) {
        const isDefaultAdmin = user.username === 'admin';
        user.adminId = isDefaultAdmin
            ? 'admin_default'
            : (user.id || `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        let approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const userIndex = approvedUsers.findIndex(u => u.username === user.username && u.role === 'admin');
        if (userIndex !== -1) {
            approvedUsers[userIndex].adminId = user.adminId;
            localStorage.setItem('approvedUsers', JSON.stringify(approvedUsers));
        }
    }
    return user;
}

// Initialize messages page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'messages.html') return;
    
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Ensure admin has unique ID
    currentUser = ensureAdminId(currentUser);
    
    // Set dashboard link based on role
    const dashboardLink = document.getElementById('dashboardLink');
    if (dashboardLink) {
        if (currentUser.role === 'admin') {
            dashboardLink.href = 'admin-dashboard.html';
        } else if (currentUser.role === 'student') {
            dashboardLink.href = 'student-dashboard.html';
        } else if (currentUser.role === 'parent') {
            dashboardLink.href = 'parent-dashboard.html';
        }
    }
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav && currentUser.role === 'student') {
        sidebarNav.innerHTML = `
            <a href="student-dashboard.html" class="nav-item">
                <span class="icon"><svg width="20" height="20"><use href="#icon-dashboard"/></svg></span>
                <span>Dashboard</span>
            </a>
            <a href="student-certificates.html" class="nav-item">
                <span class="icon"><svg width="20" height="20"><use href="#icon-certificate"/></svg></span>
                <span>My Certificates</span>
            </a>
            <a href="student-materials.html" class="nav-item">
                <span class="icon"><svg width="20" height="20"><use href="#icon-book"/></svg></span>
                <span>Training Materials</span>
            </a>
            <a href="messages.html" class="nav-item active">
                <span class="icon"><svg width="20" height="20"><use href="#icon-message"/></svg></span>
                <span>Messages</span>
                <span class="message-badge" id="sidebarMessageBadge"></span>
            </a>
            <a href="class-schedule.html" class="nav-item">
                <span class="icon"><svg width="20" height="20"><use href="#icon-calendar"/></svg></span>
                <span>Schedule</span>
            </a>
            <a href="index.html" class="nav-item logout">
                <span class="icon"><svg width="20" height="20"><use href="#icon-logout"/></svg></span>
                <span>Logout</span>
            </a>
        `;
    }
    
    // Update user name
    document.getElementById('currentUserName').textContent = `Welcome, ${currentUser.name}`;
    
    // Load conversations
    loadConversations();
    
    // Setup event listeners
    setupMessageEventListeners();
    
    // Refresh conversations every 5 seconds
    setInterval(loadConversations, 5000);
});

// Load conversations list
function loadConversations() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const conversations = getConversationsForUser(currentUser);
    const conversationsList = document.getElementById('conversationsList');
    
    if (conversations.length === 0) {
        conversationsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <div style="font-size: 48px; margin-bottom: 15px;">💬</div>
                <p>No conversations yet</p>
                <p style="font-size: 13px;">Start a new conversation to get started</p>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = conversations.map(conv => {
        const otherUser = conv.otherUser;
        const lastMessage = conv.lastMessage;
        const unreadCount = conv.unreadCount;
        const isOnline = isUserOnline(otherUser.username);
        
        return `
            <div class="conversation-item ${currentConversation && currentConversation.id === conv.id ? 'active' : ''}" 
                 data-conversation-id="${conv.id}" 
                 onclick="selectConversation('${conv.id}')">
                <div class="conversation-avatar-wrapper">
                    <div class="conversation-avatar">${otherUser.avatar || '👤'}</div>
                    <div class="online-indicator-small ${isOnline ? '' : 'offline'}"></div>
                </div>
                <div class="conversation-details">
                    <h4>${otherUser.name}${otherUser.role === 'admin' ? ' (Admin)' : ''}</h4>
                    <p>${lastMessage ? lastMessage.text.substring(0, 30) + (lastMessage.text.length > 30 ? '...' : '') : 'No messages yet'}</p>
                </div>
                <div class="conversation-meta">
                    <span class="conversation-time">${lastMessage ? formatMessageTime(lastMessage.timestamp) : ''}</span>
                    ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Get conversations for current user (ADMIN-SPECIFIC: each admin sees only their conversations)
function getConversationsForUser(currentUser) {
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const conversationsMap = new Map();
    
    allMessages.forEach(msg => {
        let isValidConversation = false;
        let otherUsername, conversationId;
        
        if (currentUser.role === 'admin') {
            // Admin sees only conversations where they are specifically involved (by adminId)
            const myAdminId = currentUser.adminId;
            
            if (msg.from === currentUser.username && msg.fromAdminId === myAdminId) {
                // Message sent by this specific admin
                otherUsername = msg.to;
                conversationId = `${myAdminId}_${msg.to}`;
                isValidConversation = true;
            } else if (msg.to === currentUser.username && msg.toAdminId === myAdminId) {
                // Message sent to this specific admin
                otherUsername = msg.from;
                conversationId = `${myAdminId}_${msg.from}`;
                isValidConversation = true;
            }
        } else {
            // Non-admin users can see conversations with any admin
            const otherUser = msg.from === currentUser.username ? getUserByUsername(msg.to) : getUserByUsername(msg.from);
            
            if (otherUser && otherUser.role === 'admin') {
                if (msg.from === currentUser.username) {
                    otherUsername = msg.to;
                    // Use the specific admin's ID in conversation ID
                    const adminId = msg.toAdminId || 'admin_default';
                    conversationId = `${currentUser.username}_${adminId}`;
                    isValidConversation = true;
                } else if (msg.to === currentUser.username) {
                    otherUsername = msg.from;
                    // Use the specific admin's ID in conversation ID
                    const adminId = msg.fromAdminId || 'admin_default';
                    conversationId = `${currentUser.username}_${adminId}`;
                    isValidConversation = true;
                }
            }
        }
        
        if (!isValidConversation) return;
        
        if (!conversationsMap.has(conversationId)) {
            const otherUser = getUserByUsername(otherUsername);
            conversationsMap.set(conversationId, {
                id: conversationId,
                otherUser: otherUser,
                messages: [],
                lastMessage: null,
                unreadCount: 0
            });
        }
        
        const conv = conversationsMap.get(conversationId);
        conv.messages.push(msg);
        conv.lastMessage = msg;
        
        if (msg.to === currentUser.username && !msg.read) {
            // For admin, also check if message is specifically for them
            if (currentUser.role === 'admin') {
                if (msg.toAdminId === currentUser.adminId) {
                    conv.unreadCount++;
                }
            } else {
                conv.unreadCount++;
            }
        }
    });
    
    const conversations = Array.from(conversationsMap.values());
    conversations.sort((a, b) => {
        const timeA = a.lastMessage ? a.lastMessage.timestamp : 0;
        const timeB = b.lastMessage ? b.lastMessage.timestamp : 0;
        return timeB - timeA;
    });
    
    return conversations;
}

// Select a conversation
window.selectConversation = function(conversationId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const conversations = getConversationsForUser(currentUser);
    currentConversation = conversations.find(c => c.id === conversationId);
    
    if (!currentConversation) return;
    
    // Mark messages as read
    markMessagesAsRead(currentConversation);
    
    // Update UI
    document.querySelector('.no-conversation-selected')?.remove();
    document.getElementById('messagesFooter').style.display = 'block';
    
    // Update header
    const otherUser = currentConversation.otherUser;
    const isOnline = isUserOnline(otherUser.username);
    
    document.getElementById('conversationName').textContent = otherUser.name + (otherUser.role === 'admin' ? ' (Admin)' : '');
    const statusEl = document.getElementById('conversationStatus');
    statusEl.textContent = isOnline ? 'Online' : 'Offline';
    statusEl.className = `online-status ${isOnline ? '' : 'offline'}`;
    
    // Load messages
    loadMessages(currentConversation);
    
    // Update conversations list
    loadConversations();
    
    // Update message badge
    updateMessageBadge();
};

// Load messages for conversation
function loadMessages(conversation) {
    const messagesBody = document.getElementById('messagesBody');
    const messages = conversation.messages;
    
    if (messages.length === 0) {
        messagesBody.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const groupedMessages = groupMessagesByDate(messages);
    
    messagesBody.innerHTML = Object.keys(groupedMessages).map(date => {
        return `
            <div class="message-date-divider">
                <span>${date}</span>
            </div>
            ${groupedMessages[date].map(msg => {
                const isSent = msg.from === currentUser.username;
                return `
                    <div class="message-bubble ${isSent ? 'sent' : 'received'}">
                        <div class="message-content">${escapeHtml(msg.text)}</div>
                        <div class="message-time">${formatMessageTime(msg.timestamp)}</div>
                    </div>
                `;
            }).join('')}
        `;
    }).join('');
    
    // Scroll to bottom
    messagesBody.scrollTop = messagesBody.scrollHeight;
}

// Group messages by date
function groupMessagesByDate(messages) {
    const grouped = {};
    
    messages.forEach(msg => {
        const date = new Date(msg.timestamp);
        const dateKey = formatMessageDate(date);
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(msg);
    });
    
    return grouped;
}

// Format message date
function formatMessageDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Format message time
function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

// Setup event listeners
function setupMessageEventListeners() {
    // Send message form
    const messageForm = document.getElementById('messageForm');
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // New conversation button
    const newConversationBtn = document.getElementById('newConversationBtn');
    if (newConversationBtn) {
        newConversationBtn.addEventListener('click', openNewConversationModal);
    }
    
    // Close modal
    const closeBtn = document.getElementById('closeNewConversation');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNewConversationModal);
    }
    
    const cancelBtn = document.getElementById('cancelNewConversation');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeNewConversationModal);
    }
    
    // Send first message
    const sendFirstMessageBtn = document.getElementById('sendFirstMessage');
    if (sendFirstMessageBtn) {
        sendFirstMessageBtn.addEventListener('click', sendFirstMessage);
    }
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const text = messageInput.value.trim();
    
    if (!text || !currentConversation) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const otherUser = currentConversation.otherUser;
    
    const message = {
        id: Date.now().toString(),
        from: currentUser.username,
        to: otherUser.username,
        text: text,
        timestamp: Date.now(),
        read: false
    };
    
    // Add admin-specific fields
    if (currentUser.role === 'admin') {
        message.fromAdminId = currentUser.adminId;
    }
    if (otherUser.role === 'admin') {
        message.toAdminId = otherUser.adminId;
    }
    
    // Save message
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('messages', JSON.stringify(allMessages));
    
    // Clear input
    messageInput.value = '';
    
    // Reload conversation
    selectConversation(currentConversation.id);
}

// Open new conversation modal
function openNewConversationModal() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const recipientSelect = document.getElementById('recipientSelect');
    
    // Get available users
    const availableUsers = getAvailableUsersForMessaging(currentUser);
    
    if (availableUsers.length === 0) {
        alert('No users available to message. Please contact your administrator.');
        return;
    }
    
    recipientSelect.innerHTML = '<option value="">Choose a recipient...</option>' +
        availableUsers.map(user => {
            const userIdentifier = user.role === 'admin' ? `${user.username}|${user.adminId}` : user.username;
            return `<option value="${userIdentifier}">${user.name} (${user.role})</option>`;
        }).join('');
    
    document.getElementById('newConversationModal').classList.add('active');
}

// Close new conversation modal
function closeNewConversationModal() {
    document.getElementById('newConversationModal').classList.remove('active');
    document.getElementById('firstMessage').value = '';
    document.getElementById('recipientSelect').value = '';
}

// Send first message
function sendFirstMessage() {
    const recipientValue = document.getElementById('recipientSelect').value;
    const text = document.getElementById('firstMessage').value.trim();
    
    if (!recipientValue || !text) {
        alert('Please select a recipient and enter a message');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Parse recipient (format: username or username|adminId for admins)
    const [recipientUsername, recipientAdminId] = recipientValue.split('|');
    
    const message = {
        id: Date.now().toString(),
        from: currentUser.username,
        to: recipientUsername,
        text: text,
        timestamp: Date.now(),
        read: false
    };
    
    // Add admin-specific fields
    if (currentUser.role === 'admin') {
        message.fromAdminId = currentUser.adminId;
    }
    if (recipientAdminId) {
        message.toAdminId = recipientAdminId;
    }
    
    // Save message
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('messages', JSON.stringify(allMessages));
    
    // Close modal
    closeNewConversationModal();
    
    // Reload conversations
    loadConversations();
    
    // Select the new conversation
    const conversationId = currentUser.role === 'admin' ? 
        `${currentUser.adminId}_${recipientUsername}` : 
        `${currentUser.username}_${recipientAdminId || 'admin_default'}`;
    setTimeout(() => selectConversation(conversationId), 100);
}

// Get available users for messaging (ADMIN-SPECIFIC: show all users for admin, show all admins for users)
function getAvailableUsersForMessaging(currentUser) {
    const users = [];
    
    if (currentUser.role === 'admin') {
        // Admin can message all users
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        const parents = JSON.parse(localStorage.getItem('parents') || '[]');
        
        // Add default users
        const defaultUsers = [
            { username: 'student', name: 'John Doe', role: 'student', avatar: '👤' },
            { username: 'parent', name: 'Parent User', role: 'parent', avatar: '👨‍👩‍👧' }
        ];
        
        defaultUsers.forEach(user => {
            if (user.username !== currentUser.username) {
                users.push(user);
            }
        });
        
        // Add approved users
        approvedUsers.forEach(user => {
            if (user.username !== currentUser.username && user.role !== 'admin') {
                users.push({
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    avatar: user.role === 'student' ? '👤' : '👨‍👩‍👧'
                });
            }
        });
        
        // Add parents
        parents.forEach(parent => {
            if (parent.username !== currentUser.username && !users.find(u => u.username === parent.username)) {
                users.push({
                    username: parent.username,
                    name: parent.name,
                    role: 'parent',
                    avatar: '👨‍👩‍👧'
                });
            }
        });
    } else {
        // Non-admin users can message any admin
        const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
        
        // Add default admin
        users.push({
            username: 'admin',
            name: 'Master Admin',
            role: 'admin',
            avatar: '👨‍🏫',
            adminId: 'admin_default'
        });
        
        // Add all other admins from approved users
        approvedUsers.forEach(user => {
            if (user.role === 'admin' && user.username !== 'admin') {
                users.push({
                    username: user.username,
                    name: user.name,
                    role: 'admin',
                    avatar: '👨‍🏫',
                    adminId: user.adminId || `admin_${user.username}`
                });
            }
        });
    }
    
    return users;
}

// Get user by username
function getUserByUsername(username) {
    const savedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    const parents = JSON.parse(localStorage.getItem('parents') || '[]');
    
    const defaultUsers = {
        'admin': { username: 'admin', name: 'Master Admin', role: 'admin', avatar: '👨‍🏫', adminId: 'admin_default' },
        'student': { username: 'student', name: 'John Doe', role: 'student', avatar: '👤' },
        'parent': { username: 'parent', name: 'Parent User', role: 'parent', avatar: '👨‍👩‍👧' }
    };
    
    // Check default users first
    let user = defaultUsers[username];
    
    // Check approved users
    if (!user) {
        const approvedUser = approvedUsers.find(u => u.username === username);
        if (approvedUser) {
            user = {
                username: approvedUser.username,
                name: approvedUser.name,
                role: approvedUser.role,
                avatar: approvedUser.role === 'student' ? '👤' : (approvedUser.role === 'admin' ? '👨‍🏫' : '👨‍👩‍👧'),
                adminId: approvedUser.adminId
            };
        }
    }
    
    // Check parents
    if (!user) {
        const parent = parents.find(p => p.username === username);
        if (parent) {
            user = {
                username: parent.username,
                name: parent.name,
                role: 'parent',
                avatar: '👨‍👩‍👧'
            };
        }
    }
    
    // Fallback
    if (!user) {
        user = { username: username, name: username, role: 'user', avatar: '👤' };
    }
    
    // Override with saved data
    Object.keys(savedUsers).forEach(role => {
        if (savedUsers[role].username === username || role === username) {
            user.name = savedUsers[role].name || user.name;
            if (savedUsers[role].image) {
                user.image = savedUsers[role].image;
            }
        }
    });
    
    return user;
}

// Mark messages as read
function markMessagesAsRead(conversation) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    let updated = false;
    allMessages.forEach(msg => {
        if (msg.to === currentUser.username && 
            msg.from === conversation.otherUser.username && 
            !msg.read) {
            // For admin, also check if message is specifically for them
            if (currentUser.role === 'admin') {
                if (msg.toAdminId === currentUser.adminId) {
                    msg.read = true;
                    updated = true;
                }
            } else {
                msg.read = true;
                updated = true;
            }
        }
    });
    
    if (updated) {
        localStorage.setItem('messages', JSON.stringify(allMessages));
    }
}

// Check if user is online
function isUserOnline(username) {
    const onlineUsers = JSON.parse(localStorage.getItem('onlineUsers') || '{}');
    const userStatus = onlineUsers[username];
    
    if (!userStatus) return false;
    
    // Consider user online if last activity was within 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return userStatus.lastActivity > fiveMinutesAgo;
}

// Update message badge
function updateMessageBadge() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const conversations = getConversationsForUser(currentUser);
    
    let totalUnread = 0;
    conversations.forEach(conv => {
        totalUnread += conv.unreadCount;
    });
    
    const badge = document.getElementById('sidebarMessageBadge');
    if (badge) {
        badge.textContent = totalUnread > 0 ? totalUnread : '';
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Update message badge on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'messages.html') {
        updateMessageBadge();
        setInterval(updateMessageBadge, 5000);
    }
});
