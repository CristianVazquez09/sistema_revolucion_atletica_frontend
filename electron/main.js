const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    }
  });

  if (process.env.ELECTRON_START_URL) {
    // Modo desarrollo
    win.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Modo producción: cargar index.html generado por Angular
    win.loadFile(path.join(__dirname, '../dist/revolucion-atletica-frontend/browser/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
