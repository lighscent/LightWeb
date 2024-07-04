const { app, BrowserWindow, Menu, shell, dialog, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const fetch = require('cross-fetch');

let windowApp;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

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

// autoUpdater.on('update-available', (info) => {
//     windowApp.showMessageBox({
//         type: 'info',
//         title: 'Update available',
//         message: 'A new version of LightWeb is available. Do you want to download it?',
//         buttons: ['Yes', 'No']
//     }).then((buttonIndex) => {
//         if (buttonIndex.response === 0) {
//             autoUpdater.downloadUpdate();
//         } else {
//             windowApp.showMessageBox({
//                 type: 'info',
//                 title: 'Update available',
//                 message: 'The update will not be downloaded. You can download it manually on the Github page.'
//             });
//         }
//     });
// })

// // maybe dont show this
// autoUpdater.on('update-not-available', (info) => {
//     windowApp.showMessageBox({
//         type: 'info',
//         title: 'No update available',
//         message: 'No new version of LightWeb is available.'
//     });
// });

// autoUpdater.on('update-downloaded', (info) => {
//     windowApp.showMessageBox({
//         type: 'info',
//         title: 'Update downloaded',
//         message: 'The update has been downloaded. Do you want to install it now?',
//         buttons: ['Yes', 'No']
//     }).then((buttonIndex) => {
//         if (buttonIndex.response === 0) {
//             autoUpdater.quitAndInstall();
//         }
//     });
// });

// autoUpdater.on('error', (error) => {
//     console.error(error);
//     windowApp.showMessageBox({
//         type: 'error',
//         title: 'Error',
//         message: 'An error occurred while updating. Please try again.'
//     });
// });

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(RowMenu);
    Menu.setApplicationMenu(menu);

    createWindow();

    autoUpdater.checkForUpdates();
});


process.on('uncaughtException', (error) => {
    console.error(error);
    dialog.showMessageBox(win, {
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue. Veuillez réessayer.'
    });
});