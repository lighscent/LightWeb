const { app, BrowserWindow, Menu, shell } = require('electron');
const axios = require('axios')

let window;


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
}

app.whenReady().then(createWindow)

function checkVersion() {
    const localVersion = require('../package.json').version
    axios.get('https://raw.githubusercontent.com/light2k4/LightWeb/master/package.json')
        .then(response => {
            const remoteVersion = response.data.version;
            if (localVersion !== remoteVersion) {
                dialog.showMessageBox(win, {
                    type: 'info',
                    title: 'Mise à jour disponible',
                    message: `Une nouvelle version est disponible : ${remoteVersion}. Veuillez mettre à jour votre application.`
                });
            }
        })
        .catch(error => console.error('Erreur lors de la vérification de la version:', error));
}


const RowMenu = [
    {
        label: 'Options',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click() {
                    window.reload();
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
        label: '?',
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

const menu = Menu.buildFromTemplate(RowMenu)
Menu.setApplicationMenu(menu)