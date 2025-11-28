/**
 * Icon Replacement Utility
 * Automatically replaces emoji icons with animated SVG icons
 */

// Icon mapping: emoji → SVG icon ID
const iconMap = {
    '🥋': 'icon-taekwondo',
    '⚡': 'icon-taekwondo',
    '📊': 'icon-dashboard',
    '👥': 'icon-users',
    '👨‍👩‍👧': 'icon-family',
    '👨‍🏫': 'icon-users',
    '👤': 'icon-taekwondo',
    '📝': 'icon-register',
    '💬': 'icon-message',
    '✅': 'icon-check',
    '📅': 'icon-calendar',
    '⚙️': 'icon-settings',
    '🚪': 'icon-logout',
    '🏆': 'icon-trophy',
    '📚': 'icon-book',
    '🎓': 'icon-certificate',
    '📢': 'icon-announcement',
    '🟢': 'icon-online',
    '🔄': 'icon-refresh',
    '➕': 'icon-add',
    '🗑️': 'icon-delete',
    '✏️': 'icon-edit',
    '⭐': 'icon-star',
    '📹': 'icon-book',
    '📄': 'icon-certificate',
    '📖': 'icon-book',
    '📎': 'icon-register',
    '🎯': 'icon-trophy'
};

// Color mapping for different contexts (restore original scheme)
const contextColors = {
    'sidebar': 'icon-white',
    'nav': 'icon-primary',
    'stat': 'icon-gradient',
    'feature': 'icon-primary',
    'button': 'icon-white',
    'default': 'icon-primary'
};

/**
 * Replace emoji with SVG icon
 * @param {string} emoji - The emoji to replace
 * @param {string} context - The context (sidebar, nav, stat, etc.)
 * @param {string} size - Icon size (xs, sm, md, lg, xl, 2xl, 3xl)
 * @returns {string} - HTML string for the SVG icon
 */
function replaceEmojiWithIcon(emoji, context = 'default', size = 'md') {
    const iconId = iconMap[emoji];
    if (!iconId) return emoji; // Return original if no mapping found
    
    const colorClass = contextColors[context] || contextColors['default'];
    const animationClass = iconId.replace('icon-', 'icon-');
    
    return `<span class="animated-icon ${animationClass} icon-${size}">
        <svg class="${colorClass}"><use href="#${iconId}"/></svg>
    </span>`;
}

/**
 * Initialize icon replacement on page load
 */
function initIconReplacement() {
    // Load SVG icons library if not already loaded
    if (!document.querySelector('svg[style*="display: none"]')) {
        fetch('icons-library.html')
            .then(response => response.text())
            .then(data => {
                const div = document.createElement('div');
                div.innerHTML = data;
                document.body.insertBefore(div.firstChild, document.body.firstChild);
                performReplacement();
            })
            .catch(err => console.error('Failed to load icons library:', err));
    } else {
        performReplacement();
    }
}

/**
 * Perform the actual replacement
 */
function performReplacement() {
    // Replace icons in navigation
    replaceInContext('.nav-item .icon', 'sidebar', 'md');
    replaceInContext('.nav-logo', 'nav', '2xl');
    replaceInContext('.footer-logo', 'sidebar', '2xl');
    
    // Replace icons in stats
    replaceInContext('.stat-icon', 'stat', 'xl');
    
    // Replace icons in features
    replaceInContext('.feature-icon', 'feature', '3xl');
    replaceInContext('.card-icon', 'feature', 'xl');
    
    // Replace icons in activity/class items
    replaceInContext('.activity-icon', 'default', 'lg');
    
    // Replace profile avatars (keep as is, they're custom)
    // Replace button icons
    replaceInContext('.btn .icon', 'button', 'sm');
}

/**
 * Replace icons in a specific context
 */
function replaceInContext(selector, context, size) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        const emoji = el.textContent.trim();
        if (iconMap[emoji]) {
            el.innerHTML = replaceEmojiWithIcon(emoji, context, size);
            el.classList.add('icon-replaced');
        }
    });
}

/**
 * Manual replacement function for dynamic content
 */
window.replaceIconInElement = function(element, emoji, context = 'default', size = 'md') {
    if (element && iconMap[emoji]) {
        element.innerHTML = replaceEmojiWithIcon(emoji, context, size);
        element.classList.add('icon-replaced');
    }
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIconReplacement);
} else {
    initIconReplacement();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { replaceEmojiWithIcon, iconMap };
}