const { app, BrowserWindow, Menu, shell, dialog, session } = require('electron');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');
const fetch = require('cross-fetch');
const axios = require('axios');
const path = require('path');


let win;

async function clearCache() {
    const ses = win.webContents.session;
    await ses.clearCache();
    await ses.clearStorageData();
    console.log('Cache and storage data cleared');
}

async function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const customUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    win.webContents.setUserAgent(customUserAgent);


    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInSession(session.defaultSession);
      });

    await clearCache();

    win.loadURL('https://google.com');
    checkVersion();

    win.on('close', async() => {
        // clear data
        win.webContents.session.clearCache();
    });
}

app.whenReady().then(async() => {
    createWindow();
});

function checkVersion() {
    const localVersion = require('../package.json').version;
    console.log(localVersion);
    axios.get('https://raw.githubusercontent.com/light2k4/LightWeb/master/package.json')
        .then(response => {
            const remoteVersion = response.data.version;
            if (localVersion !== remoteVersion) {
                console.log('New version available');
                dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Mise à jour disponible',
                    message: `Une nouvelle version est disponible : ${remoteVersion}. \nVeuillez mettre à jour votre application pour bénéficier des dernières nouveautés/patchs.`
                });
            }
        })
        .catch(error => console.error('Erreur lors de la vérification de la version:', error));
}

const RowMenu = [
    {
        label: '↩️', // Back
        click() {
            win.webContents.goBack();
        }
    },
    {
        label: '🏠', // Home
        click() {
            win.loadURL('https://google.com');
        }
    },
    {
        label: '↪️', // Forward
        click() {
            win.webContents.goForward();
        }
    },
    {
        label: '|'
    },
    {
        label: '⚙️', // Settings
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click() {
                    win.reload();
                }
            },
            {
                label: 'Upgrade',
                click() {
                    shell.openExternal('https://github.com/light2k4/LightWeb/releases/latest/');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: '❓', // Help
        submenu: [
            {
                label: 'Discord',
                click() {
                    shell.openExternal('https://discord.gg/Acdp4B6KUv');
                }
            },
            {
                label: 'Github',
                click() {
                    shell.openExternal('https://github.com/light2k4');
                }
            }
        ]
    }
];

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(RowMenu);
    Menu.setApplicationMenu(menu);
});
