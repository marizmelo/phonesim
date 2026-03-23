const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('phoneSim', {
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  closeApp: () => ipcRenderer.send('close-app'),
  getPosition: () => ipcRenderer.sendSync('get-position'),
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  onRefresh: (callback) => ipcRenderer.on('refresh-webview', callback)
});
