const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  isFullScreen: () => ipcRenderer.invoke('window:isFullScreen'),
  onFullScreenChange: (callback) => {
    ipcRenderer.on('window:fullscreen-change', (event, isFullScreen) => callback(isFullScreen));
  },
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultName, dataUrl) => ipcRenderer.invoke('dialog:saveFile', { defaultName, dataUrl }),
  onMenuAction: (callback) => {
    ipcRenderer.on('menu:action', (event, action) => callback(action));
  }
});
