// --- Browser History ---
function getBrowserHistory() {
  try {
    return JSON.parse(localStorage.getItem('browserHistory') || '[]');
  } catch (e) {
    return [];
  }
}

function addToHistory(url, title) {
  if (!url || url === 'about:blank') return;
  const history = getBrowserHistory();
  // Remove existing entry for this URL
  const filtered = history.filter(h => h.url !== url);
  // Add to front
  filtered.unshift({ url, title: title || url, timestamp: Date.now() });
  // Keep max 200 entries
  if (filtered.length > 200) filtered.length = 200;
  localStorage.setItem('browserHistory', JSON.stringify(filtered));
}

function removeFromHistory(url) {
  const history = getBrowserHistory().filter(h => h.url !== url);
  localStorage.setItem('browserHistory', JSON.stringify(history));
}

function initBrowser() {
  const urlInput = document.getElementById('url-input');
  const goBtn = document.getElementById('url-go');
  const webview = document.getElementById('browser-webview');
  const pwaBanner = document.getElementById('pwa-banner');
  const pwaIcon = document.getElementById('pwa-icon');
  const pwaName = document.getElementById('pwa-name');
  const pwaUrl = document.getElementById('pwa-url');
  const pwaAddBtn = document.getElementById('pwa-add-btn');
  const pwaDismissBtn = document.getElementById('pwa-dismiss-btn');
  const suggestions = document.getElementById('url-suggestions');

  let currentPWA = null;
  let selectedIndex = -1;

  function loadURL() {
    let url = urlInput.value.trim();
    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
    }
    webview.src = url;
    urlInput.value = url;
    hideSuggestions();
    hidePWABanner();
  }

  // --- Autocomplete ---
  function showSuggestions(query) {
    if (!query) { hideSuggestions(); return; }
    const q = query.toLowerCase();
    const history = getBrowserHistory();
    const matches = history.filter(h => {
      return h.url.toLowerCase().includes(q) || (h.title && h.title.toLowerCase().includes(q));
    }).slice(0, 6);

    if (matches.length === 0) { hideSuggestions(); return; }

    selectedIndex = -1;
    suggestions.innerHTML = matches.map((h, i) => {
      const highlightedTitle = highlightMatch(h.title || '', query);
      const displayUrl = h.url.replace(/^https?:\/\//, '');
      return `
        <div class="suggestion-item" data-index="${i}" data-url="${escapeHtml(h.url)}">
          <div class="suggestion-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div class="suggestion-text">
            <div class="suggestion-title">${highlightedTitle}</div>
            <div class="suggestion-url">${escapeHtml(displayUrl)}</div>
          </div>
          <button class="suggestion-delete" data-delete-url="${escapeHtml(h.url)}" title="Remove">&times;</button>
        </div>
      `;
    }).join('');
    suggestions.classList.add('active');
  }

  function hideSuggestions() {
    suggestions.classList.remove('active');
    suggestions.innerHTML = '';
    selectedIndex = -1;
  }

  function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escapeHtml(text);
    const before = escapeHtml(text.slice(0, idx));
    const match = escapeHtml(text.slice(idx, idx + query.length));
    const after = escapeHtml(text.slice(idx + query.length));
    return `${before}<mark>${match}</mark>${after}`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Input events for autocomplete
  urlInput.addEventListener('input', () => {
    showSuggestions(urlInput.value.trim());
  });

  urlInput.addEventListener('focus', () => {
    if (urlInput.value.trim()) {
      showSuggestions(urlInput.value.trim());
    }
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#url-bar')) {
      hideSuggestions();
    }
  });

  // Click a suggestion
  suggestions.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.suggestion-delete');
    if (deleteBtn) {
      e.stopPropagation();
      const url = deleteBtn.dataset.deleteUrl;
      removeFromHistory(url);
      showSuggestions(urlInput.value.trim());
      return;
    }
    const item = e.target.closest('.suggestion-item');
    if (item) {
      urlInput.value = item.dataset.url;
      hideSuggestions();
      loadURL();
    }
  });

  urlInput.addEventListener('keydown', (e) => {
    const items = suggestions.querySelectorAll('.suggestion-item');
    if (suggestions.classList.contains('active') && items.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items);
        return;
      }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        urlInput.value = items[selectedIndex].dataset.url;
        hideSuggestions();
        loadURL();
        urlInput.blur();
        return;
      }
    }
    if (e.key === 'Enter') {
      hideSuggestions();
      loadURL();
      urlInput.blur();
    }
    if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  function updateSelection(items) {
    items.forEach((el, i) => {
      el.classList.toggle('selected', i === selectedIndex);
    });
    if (selectedIndex >= 0) {
      urlInput.value = items[selectedIndex].dataset.url;
    }
  }

  goBtn.addEventListener('click', () => { hideSuggestions(); loadURL(); });

  document.getElementById('url-refresh').addEventListener('click', () => {
    webview.reload();
  });

  // Save history on navigation
  webview.addEventListener('did-navigate', (e) => {
    urlInput.value = e.url;
    hidePWABanner();
    // Get page title for history
    webview.executeJavaScript('document.title').then(title => {
      addToHistory(e.url, title);
    }).catch(() => {
      addToHistory(e.url, '');
    });
    detectPWA();
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    if (e.isMainFrame) {
      urlInput.value = e.url;
      webview.executeJavaScript('document.title').then(title => {
        addToHistory(e.url, title);
      }).catch(() => {});
    }
  });

  // PWA Detection
  async function detectPWA() {
    try {
      // Wait a moment for the page to finish loading
      await new Promise(r => setTimeout(r, 1500));

      const result = await webview.executeJavaScript(`
        (function() {
          const link = document.querySelector('link[rel="manifest"]');
          if (!link) return null;

          let manifestUrl = link.href;

          // Also grab fallback info from the page
          const title = document.title;
          let icon = '';
          const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
          const icon192 = document.querySelector('link[rel="icon"][sizes="192x192"]');
          const iconLarge = document.querySelector('link[rel="icon"][sizes="128x128"]');
          const iconAny = document.querySelector('link[rel="icon"]');

          if (appleTouchIcon) icon = appleTouchIcon.href;
          else if (icon192) icon = icon192.href;
          else if (iconLarge) icon = iconLarge.href;
          else if (iconAny) icon = iconAny.href;

          return {
            manifestUrl: manifestUrl,
            pageTitle: title,
            pageIcon: icon,
            pageUrl: window.location.origin
          };
        })()
      `);

      if (!result) return;

      // Try to fetch the manifest
      let manifest = null;
      try {
        manifest = await webview.executeJavaScript(`
          fetch('${result.manifestUrl}')
            .then(r => r.json())
            .catch(() => null)
        `);
      } catch (e) {
        // Manifest fetch failed, use page info
      }

      let appName = result.pageTitle;
      let appIcon = result.pageIcon;
      let startUrl = result.pageUrl;

      if (manifest) {
        if (manifest.name) appName = manifest.name;
        else if (manifest.short_name) appName = manifest.short_name;

        if (manifest.start_url) {
          try {
            startUrl = new URL(manifest.start_url, result.pageUrl).href;
          } catch (e) {
            startUrl = result.pageUrl;
          }
        }

        // Pick best icon from manifest
        if (manifest.icons && manifest.icons.length > 0) {
          const sorted = [...manifest.icons].sort((a, b) => {
            const sizeA = a.sizes ? parseInt(a.sizes.split('x')[0]) : 0;
            const sizeB = b.sizes ? parseInt(b.sizes.split('x')[0]) : 0;
            return sizeB - sizeA;
          });
          // Prefer 192px or closest
          const best = sorted.find(i => {
            const s = i.sizes ? parseInt(i.sizes.split('x')[0]) : 0;
            return s >= 128 && s <= 512;
          }) || sorted[0];
          try {
            appIcon = new URL(best.src, result.pageUrl).href;
          } catch (e) {}
        }
      }

      // Don't show if no icon found at all - get favicon as last resort
      if (!appIcon) {
        try {
          appIcon = await webview.executeJavaScript(`
            (function() {
              const link = document.querySelector('link[rel*="icon"]');
              return link ? link.href : (window.location.origin + '/favicon.ico');
            })()
          `);
        } catch (e) {
          appIcon = result.pageUrl + '/favicon.ico';
        }
      }

      // Check if already installed
      const installed = getInstalledPWAs();
      if (installed.find(p => p.startUrl === startUrl)) return;

      // Show the banner
      currentPWA = {
        name: appName,
        shortName: manifest?.short_name || appName,
        icon: appIcon,
        startUrl: startUrl,
        url: result.pageUrl
      };

      pwaIcon.src = appIcon;
      pwaIcon.onerror = () => { pwaIcon.src = ''; };
      pwaName.textContent = manifest?.short_name || appName;
      pwaUrl.textContent = new URL(startUrl).hostname;
      pwaBanner.classList.remove('hidden');

    } catch (e) {
      // Detection failed silently
      console.log('PWA detection error:', e);
    }
  }

  function hidePWABanner() {
    pwaBanner.classList.add('hidden');
    currentPWA = null;
  }

  // Add to Home Screen
  pwaAddBtn.addEventListener('click', () => {
    if (!currentPWA) return;

    const installed = getInstalledPWAs();
    installed.push(currentPWA);
    localStorage.setItem('installedPWAs', JSON.stringify(installed));

    hidePWABanner();
    renderPWAApps();
  });

  pwaDismissBtn.addEventListener('click', () => {
    hidePWABanner();
  });
}

// Shared PWA storage functions
function getInstalledPWAs() {
  try {
    return JSON.parse(localStorage.getItem('installedPWAs') || '[]');
  } catch (e) {
    return [];
  }
}

function removePWA(startUrl) {
  const installed = getInstalledPWAs().filter(p => p.startUrl !== startUrl);
  localStorage.setItem('installedPWAs', JSON.stringify(installed));
  renderPWAApps();
}

function renderPWAApps() {
  const grid = document.getElementById('app-grid');
  grid.innerHTML = '';

  const installed = getInstalledPWAs();
  installed.forEach(pwa => {
    const icon = document.createElement('div');
    icon.className = 'app-icon';
    icon.dataset.pwaUrl = pwa.startUrl;
    icon.style.position = 'relative';

    icon.innerHTML = `
      <button class="pwa-remove-btn" title="Remove">&minus;</button>
      <img class="pwa-icon-image" src="${pwa.icon}" alt="${pwa.shortName || pwa.name}" onerror="this.style.background='linear-gradient(145deg,#636366,#48484a)'; this.style.padding='14px'; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221.5%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%223%22/><circle cx=%2212%22 cy=%2212%22 r=%224%22/></svg>'">
      <span class="app-label">${pwa.shortName || pwa.name}</span>
    `;

    // Long press to toggle edit mode
    let pressTimer;
    let didLongPress = false;

    icon.addEventListener('mousedown', () => {
      didLongPress = false;
      pressTimer = setTimeout(() => {
        didLongPress = true;
        grid.classList.toggle('app-grid-editing');
      }, 600);
    });

    icon.addEventListener('mouseup', () => clearTimeout(pressTimer));
    icon.addEventListener('mouseleave', () => clearTimeout(pressTimer));

    // Tap to launch (suppressed after long press)
    icon.addEventListener('click', (e) => {
      if (didLongPress) { didLongPress = false; return; }
      if (e.target.classList.contains('pwa-remove-btn')) return;
      if (grid.classList.contains('app-grid-editing')) return;
      launchPWA(pwa.startUrl);
    });

    // Remove button
    icon.querySelector('.pwa-remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      removePWA(pwa.startUrl);
    });

    grid.appendChild(icon);
  });
}

let isPWAMode = false;

function launchPWA(url) {
  const webview = document.getElementById('browser-webview');
  const urlInput = document.getElementById('url-input');
  webview.src = url;
  urlInput.value = url;
  isPWAMode = true;
  document.getElementById('browser-header').style.display = 'none';
  document.getElementById('pwa-banner').classList.add('hidden');
  navigateTo('browser');
}

function exitPWAMode() {
  isPWAMode = false;
  document.getElementById('browser-header').style.display = '';
}
