function initHomescreen() {
  const appIcons = document.querySelectorAll('.app-icon');
  appIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const appName = icon.dataset.app;
      if (appName) {
        navigateTo(appName);
      }
    });
  });
}
