const { app, BrowserWindow, Menu, shell, dialog, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const fetch = require('cross-fetch');

let windowApp;

async function clearCache() {
    const ses = windowApp.webContents.session;
    await ses.clearCache();
    await ses.clearStorageData();
    console.log('Cache and storage data cleared');
}

async function createWindow() {
    windowApp = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    });

    await clearCache();

    const customUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    windowApp.webContents.setUserAgent(customUserAgent);

    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInSession(session.defaultSession);
    });

    windowApp.loadURL('https://google.com');

    windowApp.on('close', async () => {
        windowApp.webContents.session.clearCache();
    });
}

const RowMenu = [
    { label: '↩️', click() { windowApp.webContents.goBack() } },
    { label: '🏠', click() { windowApp.loadURL('https://google.com') } },
    { label: '↪️', click() { windowApp.webContents.goForward() } },
    { label: '|' },
    {
        label: '⚙️',
        submenu: [
            { label: 'Reload', accelerator: 'CmdOrCtrl+R', click() { windowApp.reload() } },
            { label: 'Upgrade', click() { shell.openExternal('https://github.com/light2k4/LightWeb/releases/latest/') } },
            { type: 'separator' },
            { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click() { app.quit() } }
        ]
    },
    {
        label: '❓', // Help
        submenu: [
            { label: 'Discord', click() { shell.openExternal('https://discord.gg/Acdp4B6KUv') } },
            { label: 'Github', click() { shell.openExternal('https://github.com/light2k4') } }
        ]
    }
];

autoUpdater.on('update-available', (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Update'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version is being downloaded.'
    };
    dialog.showMessageBox(dialogOpts, (response) => {

    })
});


autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall();
    });
});



app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(RowMenu);
    Menu.setApplicationMenu(menu);

    createWindow();

    autoUpdater.checkForUpdatesAndNotify();
});


process.on('uncaughtException', (error) => {
    console.error(error);
    dialog.showMessageBox(win, {
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue. Veuillez réessayer.'
    });
});