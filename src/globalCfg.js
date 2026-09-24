const path = require('path')
const fs = require('fs')
const { app } = require('electron')
const Store = require('electron-store')
const store = new Store()

function getWritableConfigPath() {
  return path.join(app.getPath('userData'), 'cfgApp.json')
}

function getResourceConfigPaths() {
  const configPaths = []

  if (process.resourcesPath) {
    configPaths.push(path.join(process.resourcesPath, 'cfgApp.json'))
  }

  configPaths.push(path.join(app.getAppPath(), 'cfgApp.json'))
  configPaths.push(path.join(app.getAppPath(), '../cfgApp.json'))

  return Array.from(new Set(configPaths))
}

function readConfigFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null
  }

  try {
    const json = fs.readFileSync(filePath, { encoding: 'utf-8' }).toString()
    return JSON.parse(json)
  } catch (error) {
    console.error(`Failed to read config file: ${filePath}`, error)
    return null
  }
}

function writeConfigFile(filePath, config) {
  const dirPath = path.dirname(filePath)

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  fs.writeFileSync(filePath, JSON.stringify(config), 'utf-8')
}
// 默认配置

// module.exports = cfg
function cfg() {
  let cfg = {
    http: 'http://192.168.1.188:8090',
    com: 'COM5',
    device_sn: 'E8-9C-25-A5-67-EB10',
    dianGangIp: '192.168.15.201',
    dianGangPort: 7408,
    dianGangLocalPort: 8410,
    dianGangProtocol: 'udp',
    dianGangTimeMs: 1000,
    dianGangMinLengthCm: 1,
    dianGangMaxLengthCm: 9,
    dianGangShakeLowLengthCm: 3,
    dianGangShakeHighLengthCm: 5,
    dianGangShakeStepTimeMs: 300,
    activationIp: '',
    activationLocalPort: 8002,
    activationRemotePort: 8001,
    activationTimeoutMs: 5000,
    activationDialogShowClose: false
  }
  const cfgPath = getWritableConfigPath()
  const resourceConfig = getResourceConfigPaths()
    .map(readConfigFile)
    .find(Boolean)
  const savedConfig = resourceConfig || readConfigFile(cfgPath)

  if (savedConfig) {
    cfg = {
      ...cfg,
      ...savedConfig
    }
  } else {
    // Write runtime config to a user-writable directory.
    writeConfigFile(cfgPath, cfg)
  }
  if (!fs.existsSync(cfgPath)) {
    writeConfigFile(cfgPath, cfg)
  }
  store.set('config', cfg)
}

export default cfg
