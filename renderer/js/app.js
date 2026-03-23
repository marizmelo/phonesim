// View navigation
const views = {};
let currentView = 'homescreen';

function navigateTo(viewName) {
  const target = views[viewName];
  const current = views[currentView];
  if (!target || viewName === currentView) return;

  // Remove all active/animation classes
  Object.values(views).forEach(v => {
    v.classList.remove('active', 'slide-in', 'slide-out');
  });

  target.classList.add('active', 'slide-in');
  target.addEventListener('animationend', () => {
    target.classList.remove('slide-in');
  }, { once: true });

  currentView = viewName;
}

function navigateBack() {
  navigateTo('homescreen');
}

// Apply phone design
function applyDesign(designKey) {
  const design = PHONE_DESIGNS[designKey];
  if (!design) return;

  const frame = document.getElementById('phone-frame');

  // Update CSS custom properties
  frame.style.setProperty('--frame-width', design.frameWidth + 'px');
  frame.style.setProperty('--frame-height', design.frameHeight + 'px');
  frame.style.setProperty('--frame-radius', design.frameRadius + 'px');
  frame.style.setProperty('--screen-radius', design.screenRadius + 'px');
  frame.style.setProperty('--bezel-width', design.bezelWidth + 'px');
  frame.style.setProperty('--frame-color', design.frameColor);

  // Update wallpaper
  const wallpaper = document.getElementById('homescreen-wallpaper');
  if (wallpaper) {
    wallpaper.style.background = design.wallpaper;
  }

  // Toggle OS class
  if (design.os === 'android') {
    document.body.classList.add('android');
  } else {
    document.body.classList.remove('android');
  }

  // Resize electron window
  if (window.phoneSim) {
    window.phoneSim.resizeWindow(design.width, design.height);
  }

  // Save preference
  localStorage.setItem('phoneDesign', designKey);

  // Update status bar time format
  updateStatusBarTime();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Cache views
  views.homescreen = document.getElementById('view-homescreen');
  views.settings = document.getElementById('view-settings');
  views.browser = document.getElementById('view-browser');

  // Init sub-modules
  initHomescreen();
  initSettings();
  initBrowser();

  // Back buttons
  document.querySelectorAll('.back-btn[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.back);
    });
  });

  // Close button
  document.getElementById('close-btn').addEventListener('click', () => {
    if (window.phoneSim) {
      window.phoneSim.closeApp();
    }
  });

  // Android nav buttons
  document.getElementById('nav-home').addEventListener('click', () => {
    navigateTo('homescreen');
  });

  document.getElementById('nav-back').addEventListener('click', () => {
    if (currentView === 'browser') {
      const webview = document.getElementById('browser-webview');
      if (webview.canGoBack()) {
        webview.goBack();
        return;
      }
    }
    navigateBack();
  });

  // Load saved design
  const savedDesign = localStorage.getItem('phoneDesign') || 'iphone';
  applyDesign(savedDesign);

  // Show homescreen
  navigateTo('homescreen');
});
