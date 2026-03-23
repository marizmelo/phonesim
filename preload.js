const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('phoneSim', {
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  closeApp: () => ipcRenderer.send('close-app')
});
