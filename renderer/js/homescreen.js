function initHomescreen() {
  document.querySelectorAll('.app-icon, .dock-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const appName = icon.dataset.app;
      if (appName) {
        if (appName === 'browser' && typeof exitPWAMode === 'function') exitPWAMode();
        navigateTo(appName);
      }
    });
  });

  // Tap outside grid to exit edit mode
  document.getElementById('view-homescreen').addEventListener('click', (e) => {
    if (!e.target.closest('.app-icon')) {
      document.getElementById('app-grid').classList.remove('app-grid-editing');
    }
  });

  // Render saved PWA apps
  renderPWAApps();
}
