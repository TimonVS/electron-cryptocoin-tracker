const electron = require('electron')
// Module to control application life.
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const Tray = electron.Tray
const ipc = electron.ipcMain

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Add application menu

let appMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add cryptocurrency',
        click: () => {
          // Notify renderer process about click
          mainWindow.webContents.send('add-cryptocurrency')
        }
      }
    ]
  },
  // Default menu with developer utilities
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  }
]

// OSX requires the first item to be the name of the app
if (process.platform === 'darwin') {
  appMenuTemplate.unshift({
    label: app.getName(),
    submenu: [
      { role: 'quit' }
    ]
  })
}

// Add application menu when the app is initialized
app.on('ready', () => {
  const appMenu = Menu.buildFromTemplate(appMenuTemplate)
  Menu.setApplicationMenu(appMenu)
})

// Add tray menu

let tray = null
let trayMenu = null

// Add tray menu when the app is initialized
app.on('ready', () => {
  const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'

  tray = new Tray(path.join(__dirname, `./assets/${iconName}`))

  tray.on('click', () => {
    tray.popUpContextMenu(trayMenu)
  })
})

// Listen to `update-prices` event from renderer process
ipc.on('update-prices', (event, prices) => {
  let trayMenuTemplate = []
  const cryptocurrencies = Object.keys(prices)
  const currencies = ['EUR', 'USD']

  // Generate all cryptocurrency / currency combinations
  cryptocurrencies.forEach(cryptocurrency => {
    currencies.forEach(currency => {
      trayMenuTemplate.push({
        label: `${cryptocurrency}-${currency}: ${prices[cryptocurrency][currency]}`
      })
    })
  })

  trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
})
