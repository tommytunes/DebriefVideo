const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: (accept) => ipcRenderer.invoke('dialog:openFiles', accept),
  readFileHead: (filePath, bytes) => ipcRenderer.invoke('fs:readFileHead', filePath, bytes),
  readFileSlice: (filePath, start, length) => ipcRenderer.invoke('fs:readFileSlice', filePath, start, length),
  readFileBuffer: (filePath) => ipcRenderer.invoke('fs:readFileBuffer', filePath),
})
