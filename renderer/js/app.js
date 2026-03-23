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
  if (typeof exitPWAMode === 'function') exitPWAMode();
  navigateTo('homescreen');
}

// Apply phone design
function applyDesign(designKey) {
  const design = PHONE_DESIGNS[designKey];
  if (!design) return;

  const frame = document.getElementById('phone-frame');
  const sizeKey = localStorage.getItem('phoneSize') || 'medium';
  const scale = PHONE_SIZES[sizeKey]?.scale || 1.0;

  // Update CSS custom properties with scale
  frame.style.setProperty('--frame-width', Math.round(design.frameWidth * scale) + 'px');
  frame.style.setProperty('--frame-height', Math.round(design.frameHeight * scale) + 'px');
  frame.style.setProperty('--frame-radius', Math.round(design.frameRadius * scale) + 'px');
  frame.style.setProperty('--screen-radius', Math.round(design.screenRadius * scale) + 'px');
  frame.style.setProperty('--bezel-width', Math.round(design.bezelWidth * scale) + 'px');
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
    window.phoneSim.resizeWindow(
      Math.round(design.width * scale),
      Math.round(design.height * scale)
    );
  }

  // Save preference
  localStorage.setItem('phoneDesign', designKey);

  // Update status bar time format
  updateStatusBarTime();
}

// Apply display size
function applySize(sizeKey) {
  localStorage.setItem('phoneSize', sizeKey);
  const currentDesign = localStorage.getItem('phoneDesign') || 'iphone';
  applyDesign(currentDesign);
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
      if (typeof exitPWAMode === 'function') exitPWAMode();
      navigateTo(btn.dataset.back);
    });
  });

  // Drag zone - manual window dragging
  const dragZone = document.getElementById('drag-zone');
  let dragging = false;
  let dragStartX, dragStartY;

  dragZone.addEventListener('mousedown', (e) => {
    dragging = true;
    const [winX, winY] = window.phoneSim.getPosition();
    dragStartX = e.screenX - winX;
    dragStartY = e.screenY - winY;
    dragZone.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    window.phoneSim.moveWindow(e.screenX - dragStartX, e.screenY - dragStartY);
  });

  window.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      dragZone.style.cursor = 'grab';
    }
  });

  // iOS home indicator — tap to go home
  document.getElementById('home-indicator').addEventListener('click', () => {
    if (typeof exitPWAMode === 'function') exitPWAMode();
    navigateTo('homescreen');
  });

  // Android nav buttons
  document.getElementById('nav-home').addEventListener('click', () => {
    if (typeof exitPWAMode === 'function') exitPWAMode();
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

  // Cmd/Ctrl+R to refresh webview when browser/PWA is active
  if (window.phoneSim?.onRefresh) {
    window.phoneSim.onRefresh(() => {
      if (currentView === 'browser') {
        document.getElementById('browser-webview').reload();
      }
    });
  }

  // Load saved design
  const savedDesign = localStorage.getItem('phoneDesign') || 'iphone';
  applyDesign(savedDesign);

  // Show homescreen
  navigateTo('homescreen');
});
