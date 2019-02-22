const {dialog} = require('electron')
const {autoUpdater} = require('electron-updater')

let updaterMenuItem

function sendStatusToWindow(text) {
  global.win.webContents.send('message', text)
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.')
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.')
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded')
})

const onManualUpdateError = (error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
}

const onManualUpdateAvailable = () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate()
    }
    else {
      finishManualUpdate()
    }
  })
}

const onManualUpdateNotAvailable = () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  })
  finishManualUpdate()
}

const onManualUpdateDownloaded = () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will be quit for update...'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall())
  })
}

const addManualUpdateEvents = () => {
  autoUpdater.on('error', onManualUpdateError)
  autoUpdater.on('update-available', onManualUpdateAvailable)
  autoUpdater.on('update-not-available', onManualUpdateNotAvailable)
  autoUpdater.on('update-downloaded', onManualUpdateDownloaded)
}

const removeManualUpdateEvents = () => {
  autoUpdater.removeListener('error', onManualUpdateError)
  autoUpdater.removeListener('update-available', onManualUpdateAvailable)
  autoUpdater.removeListener('update-not-available', onManualUpdateNotAvailable)
  autoUpdater.removeListener('update-downloaded', onManualUpdateDownloaded)
}

const finishManualUpdate = () => {
  removeManualUpdateEvents()
  autoUpdater.autoDownload = true
  updaterMenuItem.enabled = true
  updaterMenuItem = null
}

const checkForUpdates = (menuItem) => {
  addManualUpdateEvents()
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdates()
  updaterMenuItem = menuItem
  updaterMenuItem.enabled = false
}

const updateIfAvailable = () => {
  autoUpdater.checkForUpdatesAndNotify()
}

module.exports = {
  checkForUpdates,
  updateIfAvailable
}
