const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const axios = require('axios')

let win;


function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
        }
    });

    win.loadURL('https://google.com')
    checkVersion();

    win.on('close', () => {
        win.webContents.session.clearCache(() => { });
        console.log('Cache cleared')
        win.webContents.session.clearStorageData(() => { });
        console.log('Storage cleared');
    })

}

app.whenReady().then(() => {
    createWindow();
});

function checkVersion() {
    const localVersion = require('./version.json').version
    console.log(localVersion)
    axios.get('https://raw.githubusercontent.com/light2k4/LightWeb/master/src/version.json')
        .then(response => {
            const remoteVersion = response.data.version;
            if (localVersion !== remoteVersion) {
                console.log('New version available')
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
            win.webContents.goBack()
        }
    },
    {
        label: '🏠', // Home
        click() {
            win.loadURL('https://google.com')
        }
    },
    {
        label: '↪️', // Forward
        click() {
            win.webContents.goForward()
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
                    window.reload();
                }
            },
            {
                label: 'Upgrade',
                click() {
                    shell.openExternal('https://github.com/light2k4/LightWeb/releases/latest/')
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
                    shell.openExternal('https://github.com/light2k4')
                }
            }
        ]
    }
];

app.whenReady().then(() => {
    const menu = Menu.buildFromTemplate(RowMenu);
    Menu.setApplicationMenu(menu);
});