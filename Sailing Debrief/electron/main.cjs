const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

let win;

function forceZoomReset() {
  if (!win || win.isDestroyed()) return;
  win.webContents.setZoomLevel(0);
  win.webContents.setZoomFactor(1);
}

function createWindow() {
  const { nativeImage } = require('electron');
  const icon = nativeImage.createFromPath(path.join(__dirname, '../build/DebriefIcon.png'));
  win = new BrowserWindow({
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

  win.webContents.setVisualZoomLevelLimits(1, 1);

  win.webContents.on('did-finish-load', () => {
    forceZoomReset();
  });

  // HashRouter route changes
  win.webContents.on('did-navigate-in-page', () => {
    forceZoomReset();
  });

  // Extra safety on any full navigation
  win.webContents.on('did-navigate', () => {
    forceZoomReset();
  });

  //win.webContents.openDevTools()
  win.loadFile(path.join(__dirname, '../dist/index.html'))
  createAppMenu()
}

function createAppMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        {label: 'Open Dev Tools', click: () => win.webContents.openDevTools()}
      ]
    },
    {
      label: 'File',
      submenu: [
        { label: 'Save Project', accelerator: 'CmdOrCtrl+S', click: () => win.webContents.send('menu:saveProject') },
        { label: 'Open Project', accelerator: 'CmdOrCtrl+O', click: () => win.webContents.send('menu:loadProject') },
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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

ipcMain.handle('project:save', async (_event, jsonString) => {
  const { canceled, filePath } = await dialog.showSaveDialog(win, { defaultPath: 'project.debrief', filters: [{ name: 'Debrief Project', extensions: ['debrief'] }] });
  if (canceled) return {success: false};
  fs.writeFileSync(filePath, jsonString, 'utf8');
  return {success: true, filePath: filePath};
});

ipcMain.handle('project:load', async (_event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: 'Debrief Project', extensions: ['debrief'] }] });
  if (canceled) return { success: false };
  const json = fs.readFileSync(filePaths[0], 'utf8');
  return { success: true, json, filePath: filePaths[0]}; // unsure for the indexing here
})

ipcMain.handle('fetch', async (_event, url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
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
