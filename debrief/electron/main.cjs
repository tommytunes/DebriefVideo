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
      width: 1600,
      height: 1000,
      title: 'Sailing Debrief',
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false
      },
    })

    if (!app.isPackaged) {
      win.loadURL('http://localhost:5173')
      win.webContents.openDevTools()
    } else {
      win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
  }

  ipcMain.handle('dialog:openFiles', async (_event, accept, multiple) => {
    const extensions = Object.values(accept || {}).flat().map(e => e.replace(/^\./, ''));
    const filters = extensions.length ? [{ name: 'Files', extensions }] : [];
    const properties = multiple ? ['openFile'] : ['openFile', 'multiSelections'];
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: properties,
      filters,
    })
    if (canceled) return []

    return filePaths.map(filePath => ({
      name: path.basename(filePath),
      lastModified: fs.statSync(filePath).mtimeMs,
      path: filePath,
    }))
  })

  ipcMain.handle('fs:readFileHead', async (_event, filePath, bytes) => {
    const stat = fs.statSync(filePath);
    const size = Math.min(bytes, stat.size);
    const buf = Buffer.alloc(size);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, size, 0);
    fs.closeSync(fd);
    return { buffer: buf, size: stat.size, start: 0 };
  })

  ipcMain.handle('fs:readFileSlice', async (_event, filePath, start, length) => {
    const stat = await fs.promises.stat(filePath);
    const safeStart = Math.max(0, Math.min(start, stat.size));
    const safeLength = Math.max(0, Math.min(length, stat.size - safeStart));
    const buf = Buffer.alloc(safeLength);
    const fd = await fs.promises.open(filePath, 'r');
    await fd.read(buf, 0, safeLength, safeStart);
    await fd.close();
    return { buffer: buf, size: stat.size, start: safeStart };
  })

  ipcMain.handle('fs:readFileBuffer', async (_event, filePath) => {
     return fs.promises.readFile(filePath);
  })



  app.on('before-quit', () => {
    app.isQuitting = true
  })

  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
