const { app, BrowserWindow, Menu, shell } = require('electron');

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
}

app.whenReady().then(createWindow)


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