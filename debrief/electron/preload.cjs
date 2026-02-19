const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: (options) => ipcRenderer.invoke('dialog:openFiles', options),
})
