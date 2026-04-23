const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: (accept) => ipcRenderer.invoke('dialog:openFiles', accept),
  readFileHead: (filePath, bytes) => ipcRenderer.invoke('fs:readFileHead', filePath, bytes),
  readFileSlice: (filePath, start, length) => ipcRenderer.invoke('fs:readFileSlice', filePath, start, length),
  readFileBuffer: (filePath) => ipcRenderer.invoke('fs:readFileBuffer', filePath),
  fileExists: (filePath) => ipcRenderer.invoke('fs:fileExists', filePath),
  readFileStat: (filePath) => ipcRenderer.invoke('fs:readFileStat', filePath),
  saveProject: (jsonString, filePath) => ipcRenderer.invoke('project:save', jsonString),
  loadProject: () => ipcRenderer.invoke('project:load'),
  onMenuSave: (cb) => ipcRenderer.on('menu:saveProject', cb),
  onMenuLoad: (cb) => ipcRenderer.on('menu:loadProject', cb),
  fetchUrl: (url) => ipcRenderer.invoke('fetch', url)
})
