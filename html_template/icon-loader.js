// Animated Icons Loader using Lottie Web
// Source: https://animatedicons.co/ (Free Minimalistic icons)
// Drop downloaded Lottie JSON files into ./assets/icons/ and map below.

(function() {
  const iconMap = {
    // Sidebar
    dashboard: './assets/icons/dashboard.json',
    certificates: './assets/icons/trophy.json',
    materials: './assets/icons/book.json',
    messages: './assets/icons/chat.json',
    schedule: './assets/icons/calendar.json',
    logout: './assets/icons/logout.json',
    settings: './assets/icons/settings.json',
    students: './assets/icons/users.json',
    parents: './assets/icons/family.json',
    registrations: './assets/icons/clipboard.json',
    attendance: './assets/icons/check.json',

    // Student stats
    attendanceRate: './assets/icons/check.json',
    trainingMaterialsStat: './assets/icons/book.json',
    certificatesStat: './assets/icons/trophy.json',
    nextBeltTest: './assets/icons/target.json',
    classesThisMonth: './assets/icons/calendar.json',
    trainingHours: './assets/icons/timer.json',

    // Announcements
    announcements: './assets/icons/megaphone.json'
  };

  async function initAnimatedIcons() {
    const items = document.querySelectorAll('[data-icon]');
    const checkAndLoad = async (el) => {
      const key = el.getAttribute('data-icon');
      const path = iconMap[key];
      const overrideSrc = el.getAttribute('data-src');
      const finalPath = overrideSrc || path;
      const fb = el.getAttribute('data-fallback');

      // If lottie or mapping is absent, show fallback immediately
      if (!finalPath || !window.lottie) {
        if (fb) el.textContent = fb;
        return;
      }

      // Prepare container
      const container = document.createElement('div');
      container.style.width = el.getAttribute('data-size') || '24px';
      container.style.height = el.getAttribute('data-size') || '24px';
      container.style.display = 'inline-block';
      container.style.verticalAlign = 'middle';
      el.innerHTML = '';
      el.appendChild(container);

      // Verify the JSON exists before attempting to load
      try {
        const res = await fetch(finalPath, { method: 'HEAD' });
        if (!res.ok) {
          // Restore fallback if asset missing
          el.removeChild(container);
          if (fb) el.textContent = fb;
          return;
        }
      } catch (_) {
        el.removeChild(container);
        if (fb) el.textContent = fb;
        return;
      }

      try {
        const anim = window.lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: finalPath
        });
        // If lottie fails to parse data, ensure emoji fallback
        if (anim && typeof anim.addEventListener === 'function') {
          anim.addEventListener('data_failed', () => {
            el.innerHTML = '';
            if (fb) el.textContent = fb;
          });
        }
      } catch (e) {
        el.innerHTML = '';
        if (fb) el.textContent = fb;
      }
    };

    items.forEach(el => {
      checkAndLoad(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimatedIcons);
  } else {
    initAnimatedIcons();
  }
})();