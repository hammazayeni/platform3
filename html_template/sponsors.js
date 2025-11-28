// Sponsors Section - Auto-inject into all pages
(function() {
    'use strict';
    
    const sponsorsHTML = `
        <div class="dashboard-sponsors sponsors-section">
            <div class="sponsors-header">
                <h3>🤝 Our Sponsors & Partners</h3>
                <p>Supporting excellence in martial arts</p>
            </div>
            <div class="sponsors-grid">
                <div class="sponsor-logo">
                    <img src="./DIAMOND GYM B.png" alt="Diamond Gym" onerror="this.style.display='none'" />
                </div>
                <div class="sponsor-logo">
                    <img src="./taekwondo-cartoon-logo-world-taekwondo-yellow-text-line-wing-area-png-clipart.jpg" alt="World Taekwondo" onerror="this.style.display='none'" />
                </div>
                <div class="sponsor-logo">
                    <img src="./the_korea_taekwondo_kukkiwon-converted.png" alt="Kukkiwon" onerror="this.style.display='none'" />
                </div>
                <div class="sponsor-logo">
                    <img src="./IMG_4026.jpg" alt="Sponsor" onerror="this.style.display='none'" />
                </div>
                <div class="sponsor-logo">
                    <img src="./Elite Sportive - 1.png" alt="Elite Sportive Sbeitla" onerror="this.style.display='none'" />
                </div>
            </div>
        </div>
    `;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectSponsors);
    } else {
        injectSponsors();
    }
    
    function injectSponsors() {
        // Check if we're on a dashboard page
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;
        
        // Check if sponsors section already exists
        if (document.querySelector('.dashboard-sponsors')) return;
        
        // Inject sponsors section at the end of main content
        const sponsorsDiv = document.createElement('div');
        sponsorsDiv.innerHTML = sponsorsHTML;
        mainContent.appendChild(sponsorsDiv.firstElementChild);
        
        // Inject sponsors CSS if not already loaded
        if (!document.querySelector('link[href*="sponsors.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './sponsors.css';
            document.head.appendChild(link);
        }
    }
})();