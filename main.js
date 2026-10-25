const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

app.name = 'OFLIM';

let mainWindow;

function createWindow() {
  const isMac = process.platform === 'darwin';

  if (isMac && app.dock) {
    try {
      app.dock.setIcon(path.join(__dirname, 'build', 'icon.icns'));
    } catch (e) {
      console.warn('Could not set dock icon:', e);
    }
  }

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'OFLIM — Silver Bromide B&W Film Lab',
    backgroundColor: '#08080a',
    titleBarStyle: 'hidden',
    ...(isMac ? {
      trafficLightPosition: { x: 18, y: 18 }
    } : {
      titleBarOverlay: {
        color: '#0f0f13',
        symbolColor: '#f4f4ee',
        height: 48
      }
    }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    icon: path.join(__dirname, 'assets', 'AppIcon.icns')
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen-change', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('window:fullscreen-change', false);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 2) {
      console.error(`[RENDERER ERROR] ${message} (${sourceId}:${line})`);
    } else {
      console.log(`[RENDERER LOG] ${message}`);
    }
  });

  mainWindow.loadFile('index.html');

  buildMenu();
}

function buildMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: 'OFLIM',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open from Files...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'openFile')
        },
        {
          label: 'Export Photo...',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'exportPhoto')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'undo')
        },
        {
          label: 'Redo',
          accelerator: isMac ? 'Shift+CmdOrCtrl+Z' : 'CmdOrCtrl+Y',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'redo')
        },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Photo',
      submenu: [
        {
          label: 'Next Emulsion Preset',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'nextFilter')
        },
        {
          label: 'Previous Emulsion Preset',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'prevFilter')
        },
        { type: 'separator' },
        {
          label: 'Toggle Split View',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'toggleSplit')
        },
        {
          label: 'Toggle Compare',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'toggleCompare')
        },
        {
          label: 'Reset Adjustments',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.webContents.send('menu:action', 'resetAdjustments')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Photo for B&W Silver Bromide Processing',
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif', 'bmp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (canceled || filePaths.length === 0) {
    return null;
  }

  const filePath = filePaths[0];
  const fileBuffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  let mimeType = 'image/jpeg';
  if (ext === 'png') mimeType = 'image/png';
  else if (ext === 'webp') mimeType = 'image/webp';
  else if (ext === 'tiff' || ext === 'tif') mimeType = 'image/tiff';

  const base64 = fileBuffer.toString('base64');
  return {
    filePath,
    fileName: path.basename(filePath),
    dataUrl: `data:${mimeType};base64,${base64}`
  };
});

ipcMain.handle('dialog:saveFile', async (event, { defaultName, dataUrl }) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Processed Photo',
    defaultPath: defaultName || 'OFLIM_Processed.jpg',
    filters: [
      { name: 'JPEG Image', extensions: ['jpg', 'jpeg'] },
      { name: 'PNG Image', extensions: ['png'] }
    ]
  });

  if (canceled || !filePath) {
    return { success: false };
  }

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  await fs.promises.writeFile(filePath, buffer);

  return { success: true, filePath };
});

ipcMain.handle('window:isFullScreen', () => mainWindow ? mainWindow.isFullScreen() : false);

app.whenReady().then(() => {
  createWindow();

  if (process.argv.includes('--test')) {
    console.log('[TEST] OFLIM Electron window created successfully. Exiting test.');
    setTimeout(() => {
      app.quit();
    }, 1500);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
