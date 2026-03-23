function initBrowser() {
  const urlInput = document.getElementById('url-input');
  const goBtn = document.getElementById('url-go');
  const webview = document.getElementById('browser-webview');

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
  }

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loadURL();
      urlInput.blur();
    }
  });

  goBtn.addEventListener('click', loadURL);

  webview.addEventListener('did-navigate', (e) => {
    urlInput.value = e.url;
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    if (e.isMainFrame) {
      urlInput.value = e.url;
    }
  });
}
