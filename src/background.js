'use strict'

import { app, protocol, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import dgram from 'dgram'
import os from 'os'
import cfg from './globalCfg'
const fs = require('fs')
const path = require('path')

const startupLogPath = process.platform === 'linux' ? '/tmp/vr-manager-startup.log' : null
function writeStartupLog(message, error) {
  if (!startupLogPath) {
    return
  }

  try {
    const errorText = error ? ` ${error.stack || error.message || error}` : ''
    fs.appendFileSync(startupLogPath, `[${new Date().toISOString()}] ${message}${errorText}\n`)
  } catch (logError) {
    console.error('Failed to write startup log:', logError)
  }
}

writeStartupLog('main process loaded')
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-dev-shm-usage')
process.on('uncaughtException', error => writeStartupLog('uncaughtException', error))
process.on('unhandledRejection', error => writeStartupLog('unhandledRejection', error))

cfg()
const Store = require('electron-store')
const store = new Store()
const isDevelopment = process.env.NODE_ENV !== 'production'
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, stream: true }}
])
let win
let childWindow
let root_path
const DEFAULT_ACTIVATION_LOCAL_PORT = 8002
const DEFAULT_ACTIVATION_REMOTE_PORT = 8001
const DEFAULT_ACTIVATION_TIMEOUT_MS = 5000
let activationSocket = null
let activationSocketReady = null
let activationSocketLocalPort = null
let pendingActivationResponse = null
if (process.env.WEBPACK_DEV_SERVER_URL) {
  // Load the url of the dev server if in development mode
  root_path = process.env.WEBPACK_DEV_SERVER_URL
  console.log(root_path)
} else {
  root_path = `file://${__dirname}/index.html`
}

function getLocalIps() {
  const interfaces = os.networkInterfaces()
  const ips = []

  for (const name of Object.keys(interfaces)) {
    const addresses = interfaces[name] || []
    addresses
      .filter(item => item.family === 'IPv4' && !item.internal)
      .forEach(item => ips.push(item.address))
  }

  return Array.from(new Set(ips))
}

function getActivationUdpConfig() {
  const config = store.get('config') || {}

  return {
    targetIps: config.activationIp
      ? [config.activationIp]
      : Array.from(new Set(['127.0.0.1', ...getLocalIps()])),
    localPort: Number(config.activationLocalPort) || DEFAULT_ACTIVATION_LOCAL_PORT,
    remotePort: Number(config.activationRemotePort) || DEFAULT_ACTIVATION_REMOTE_PORT,
    timeoutMs: Number(config.activationTimeoutMs) || DEFAULT_ACTIVATION_TIMEOUT_MS
  }
}

function closeActivationSocket() {
  if (!activationSocket) {
    return
  }

  try {
    activationSocket.close()
  } catch (error) {
    console.error('Activation UDP socket close failed:', error)
  }

  activationSocket = null
  activationSocketReady = null
  activationSocketLocalPort = null
}

function ensureActivationSocket(udpConfig) {
  if (activationSocketReady && activationSocketLocalPort === udpConfig.localPort) {
    return activationSocketReady
  }

  closeActivationSocket()
  activationSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
  activationSocketLocalPort = udpConfig.localPort
  activationSocketReady = new Promise((resolve, reject) => {
    const handleInitialError = error => {
      console.error('Activation UDP bind failed:', error)
      closeActivationSocket()
      reject(error)
    }

    activationSocket.once('error', handleInitialError)
    activationSocket.once('listening', () => {
      activationSocket.removeListener('error', handleInitialError)
      activationSocket.on('error', error => {
        console.error('Activation UDP communication failed:', error)
        if (pendingActivationResponse) {
          pendingActivationResponse.finish(Buffer.from(`Message&${error.message}`))
        }
        closeActivationSocket()
      })
      activationSocket.on('message', data => {
        console.log('Activation UDP response:', data.toString())
        if (pendingActivationResponse) {
          pendingActivationResponse.finish(data)
        }
      })
      resolve()
    })
    activationSocket.bind(udpConfig.localPort)
  })

  return activationSocketReady
}

function sendActivationUdpMessage(event, message, responseChannel) {
  const udpConfig = getActivationUdpConfig()

  if (pendingActivationResponse) {
    event.sender.send(responseChannel, Buffer.from('Message&activation request pending'))
    return
  }

  ensureActivationSocket(udpConfig).then(() => {
    let settled = false

    const finish = data => {
      if (settled) {
        return
      }
      settled = true
      clearTimeout(timer)
      pendingActivationResponse = null
      event.sender.send(responseChannel, data)
    }

    const timer = setTimeout(() => {
      finish(Buffer.from('Message&activation udp timeout'))
    }, udpConfig.timeoutMs)

    pendingActivationResponse = { finish }
    const data = Buffer.from(String(message))
    console.log('Activation UDP send:', {
      message: String(message),
      localPort: udpConfig.localPort,
      remotes: udpConfig.targetIps.map(ip => `${ip}:${udpConfig.remotePort}`)
    })
    udpConfig.targetIps.forEach(ip => {
      activationSocket.send(data, udpConfig.remotePort, ip, error => {
        if (error) {
          console.error('Activation UDP send failed:', error)
        }
      })
    })
  }).catch(error => {
    event.sender.send(responseChannel, Buffer.from(`Message&${error.message}`))
  })
}

async function createWindow() {
  writeStartupLog('create main window')
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 900,
    // frame: false,
    fullscreen: true,
    webPreferences: {
      // preload:'/src/preload',
      // Required for Spectron testing
      // enableRemoteModule: !!process.env.IS_TEST,

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: false,
      webSecurity: false,
      enableRemoteModule: true, // 允许渲染进程使用remote模块
      nodeIntegrationInWorker: true // 在Web工作器中启用了Node集成
      // 允许在子页面(iframe)或子窗口(child window)中集成Node.js
      // nodeIntegrationInSubFrames: true
    }
  })
  win.on('closed', () => writeStartupLog('main window closed'))
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    writeStartupLog(`main window did-fail-load ${errorCode} ${errorDescription} ${validatedURL}`)
  })
  win.webContents.on('render-process-gone', (event, details) => {
    writeStartupLog(`main window render-process-gone ${JSON.stringify(details)}`)
  })
  win.removeMenu()
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/home')
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    const indexPath = path.join(__dirname, 'index.html')
    writeStartupLog(`load main window ${indexPath}`)
    await win.loadURL(`file://${indexPath}#/home`)
    writeStartupLog('main window loaded')
    // Load the index.html when not in development
    // win.loadURL('app://./index.html')
  }
  // win.webContents.openDevTools()
  ipcMain.on('window-close', function() {
    app.exit()
  })
  ipcMain.on('window-min', function() {
    if (win.isFullScreen()) {
      win.setFullScreen(false) // 将窗口退出全屏模式
    } else {
      win.setFullScreen(true)
    }
  })
}

function createChildWindow() {
  writeStartupLog('create child window')
  childWindow = new BrowserWindow({
    parent: win,
    width: 1200,
    height: 900,
    show: false,
    // frame: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
      enableRemoteModule: true, // 允许渲染进程使用remote模块
      nodeIntegrationInWorker: true // 在Web工作器中启用了Node集成
    }
  })
  childWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    writeStartupLog(`child window did-fail-load ${errorCode} ${errorDescription} ${validatedURL}`)
  })
  childWindow.webContents.on('render-process-gone', (event, details) => {
    writeStartupLog(`child window render-process-gone ${JSON.stringify(details)}`)
  })
  // childWindow.webContents.openDevTools()
  childWindow.removeMenu()
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    childWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#' + '/sys/index')
    // if (!process.env.IS_TEST) childWindow.webContents.openDevTools()
  } else {
    writeStartupLog(`load child window ${__dirname}`)
    childWindow.loadURL(`file://${__dirname}/index.html#/sys/index`)
  }

  childWindow.on('closed', () => {
    writeStartupLog('child window closed')
    childWindow = null
  })
}

// 监听渲染进程发送的请求关闭窗口的消息
ipcMain.on('close-window-request', () => {
  app.quit()
})
ipcMain.on('get_activate_data', (event, message) => {
  sendActivationUdpMessage(event, message, 'send_activate_data')
})
ipcMain.on('get_registerCode_data', (event, message) => {
  sendActivationUdpMessage(event, message, 'send_registerCode_data')
})

ipcMain.on('go-to-sys', () => {
  if (childWindow.isVisible()) {
    childWindow.hide()
  } else {
    childWindow.show()
  }
})

ipcMain.on('config-imported', () => {
  BrowserWindow.getAllWindows().forEach(browserWindow => {
    browserWindow.webContents.send('config-imported')
  })
})

app.on('before-quit', async(event) => {
  if (win) {
    win.webContents.send('before-quit', '应用即将退出，请执行清理操作')
  }
})
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // win.send('window-min')
  closeActivationSocket()
  globalShortcut.unregisterAll()
})
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()
  createChildWindow()
  // 注册全局快捷键
  globalShortcut.register('Alt+w', () => {
    if (childWindow.isVisible()) {
      childWindow.hide()
    } else {
      childWindow.show()
    }
  })
  globalShortcut.register('Ctrl+Shift+I', () => {
    const targetWindow = childWindow && childWindow.isFocused() ? childWindow : win
    if (!targetWindow) {
      return
    }

    if (targetWindow.webContents.isDevToolsOpened()) {
      targetWindow.webContents.closeDevTools()
    } else {
      targetWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })
})
app.on('close', async() => {
})
// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
