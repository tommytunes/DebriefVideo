const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  function createWindow() {
    const { nativeImage } = require('electron');
    const icon = nativeImage.createFromPath(path.join(__dirname, '../build/DebriefIcon.png'));
    const win = new BrowserWindow({
      icon,
      width: 1400,
      height: 900,
      title: 'Sailing Debrief',
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })

    if (!app.isPackaged) {
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
  }

  ipcMain.handle('dialog:openFiles', async (_event, options) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: options.filters ?? [],
    })
    if (canceled) return []

    return filePaths.map(filePath => ({
      name: path.basename(filePath),
      lastModified: fs.statSync(filePath).mtimeMs,
      buffer: fs.readFileSync(filePath),
    }))
  })

  app.on('before-quit', () => {
    app.isQuitting = true
  })

  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
