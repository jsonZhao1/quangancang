import { db } from '@/dexie'

const { remote } = window.require('electron')
const fs = window.require('fs')
const path = window.require('path')
const Store = window.require('electron-store')

const store = new Store()
const TABLE_NAMES = ['education', 'videoData', 'topicData', 'scoreData', 'psd', 'Software']
const FILE_FIELDS = {
  Software: ['imgUrl'],
  videoData: ['imgUrl', 'videoUrl']
}
const FILE_TOKEN_PREFIX = '__CONFIG_FILE__/'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDate(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('') + '-' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('')
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function safeFileName(fileName) {
  return String(fileName || 'file')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
}

function isCopyableLocalFile(filePath) {
  return typeof filePath === 'string' &&
    filePath &&
    !filePath.startsWith(FILE_TOKEN_PREFIX) &&
    !/^https?:\/\//i.test(filePath) &&
    !/^data:/i.test(filePath) &&
    fs.existsSync(filePath) &&
    fs.statSync(filePath).isFile()
}

function getConfigFilePath() {
  return path.join(remote.app.getPath('userData'), 'cfgApp.json')
}

function writeAppConfigFile(config) {
  if (!config || typeof config !== 'object') {
    return
  }

  const configFilePath = getConfigFilePath()
  ensureDir(path.dirname(configFilePath))
  fs.writeFileSync(configFilePath, JSON.stringify(config), 'utf-8')
}

async function readDatabase() {
  const data = {}

  for (const tableName of TABLE_NAMES) {
    data[tableName] = await db.table(tableName).toArray()
  }

  return data
}

function copyReferencedFiles(data, exportFilesDir) {
  const copiedFileMap = new Map()
  const files = []
  const missingFiles = []

  Object.keys(FILE_FIELDS).forEach(tableName => {
    const records = data[tableName] || []

    records.forEach((record, recordIndex) => {
      FILE_FIELDS[tableName].forEach(fieldName => {
        const sourcePath = record[fieldName]

        if (!sourcePath) {
          return
        }

        if (!isCopyableLocalFile(sourcePath)) {
          if (typeof sourcePath === 'string' && !/^https?:\/\//i.test(sourcePath) && !/^data:/i.test(sourcePath)) {
            missingFiles.push({ tableName, fieldName, sourcePath })
          }
          return
        }

        if (!copiedFileMap.has(sourcePath)) {
          const ext = path.extname(sourcePath)
          const baseName = safeFileName(path.basename(sourcePath, ext))
          const relativePath = `${tableName}_${record.id || recordIndex}_${fieldName}_${baseName}${ext}`
          const targetPath = path.join(exportFilesDir, relativePath)

          fs.copyFileSync(sourcePath, targetPath)
          copiedFileMap.set(sourcePath, relativePath)
          files.push({
            token: `${FILE_TOKEN_PREFIX}${relativePath}`,
            relativePath,
            originalPath: sourcePath
          })
        }

        record[fieldName] = `${FILE_TOKEN_PREFIX}${copiedFileMap.get(sourcePath)}`
      })
    })
  })

  return { files, missingFiles }
}

function restoreFileTokens(data, manifestDir, importFilesDir) {
  const fileTokenMap = new Map()
  const copiedFiles = []

  Object.keys(FILE_FIELDS).forEach(tableName => {
    const records = data[tableName] || []

    records.forEach(record => {
      FILE_FIELDS[tableName].forEach(fieldName => {
        const value = record[fieldName]

        if (typeof value !== 'string' || !value.startsWith(FILE_TOKEN_PREFIX)) {
          return
        }

        const relativePath = value.slice(FILE_TOKEN_PREFIX.length)
        const sourcePath = path.join(manifestDir, 'files', relativePath)

        if (!fs.existsSync(sourcePath)) {
          record[fieldName] = ''
          return
        }

        if (!fileTokenMap.has(value)) {
          const targetPath = path.join(importFilesDir, relativePath)
          ensureDir(path.dirname(targetPath))
          fs.copyFileSync(sourcePath, targetPath)
          fileTokenMap.set(value, targetPath)
          copiedFiles.push(targetPath)
        }

        record[fieldName] = fileTokenMap.get(value)
      })
    })
  })

  return copiedFiles
}

export async function exportConfigPackage() {
  const result = await remote.dialog.showOpenDialog({
    title: '选择配置导出位置',
    properties: ['openDirectory', 'createDirectory']
  })

  if (result.canceled || !result.filePaths.length) {
    return null
  }

  const exportDir = path.join(result.filePaths[0], `config-export-${formatDate(new Date())}`)
  const exportFilesDir = path.join(exportDir, 'files')

  ensureDir(exportFilesDir)

  const data = await readDatabase()
  const { files, missingFiles } = copyReferencedFiles(data, exportFilesDir)
  const manifest = {
    schemaVersion: 1,
    appName: 'guanlipingtai',
    exportedAt: new Date().toISOString(),
    data,
    store: {
      config: store.get('config') || null,
      activateData: store.get('activateData') || null,
      topTypeVisibleValues: store.get('topTypeVisibleValues') || null
    },
    files,
    missingFiles
  }
  const manifestPath = path.join(exportDir, 'manifest.json')

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

  return {
    exportDir,
    manifestPath,
    tableCount: TABLE_NAMES.reduce((total, tableName) => total + (data[tableName] || []).length, 0),
    fileCount: files.length,
    missingFileCount: missingFiles.length
  }
}

export async function importConfigPackage() {
  const result = await remote.dialog.showOpenDialog({
    title: '选择配置包 manifest.json',
    filters: [{ name: '配置包', extensions: ['json'] }],
    properties: ['openFile']
  })

  if (result.canceled || !result.filePaths.length) {
    return null
  }

  const manifestPath = result.filePaths[0]
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

  if (!manifest || manifest.schemaVersion !== 1 || manifest.appName !== 'guanlipingtai' || !manifest.data) {
    throw new Error('配置包格式不正确')
  }

  const data = JSON.parse(JSON.stringify(manifest.data))
  const importFilesDir = path.join(remote.app.getPath('userData'), 'config-assets', `import-${formatDate(new Date())}`)
  const copiedFiles = restoreFileTokens(data, path.dirname(manifestPath), importFilesDir)

  await db.transaction('rw', ...TABLE_NAMES.map(tableName => db.table(tableName)), async() => {
    for (const tableName of TABLE_NAMES) {
      await db.table(tableName).clear()
      if (Array.isArray(data[tableName]) && data[tableName].length) {
        await db.table(tableName).bulkPut(data[tableName])
      }
    }
  })

  if (manifest.store && manifest.store.config) {
    store.set('config', manifest.store.config)
    writeAppConfigFile(manifest.store.config)
  }

  if (manifest.store && manifest.store.activateData) {
    store.set('activateData', manifest.store.activateData)
  }

  if (manifest.store) {
    const topTypeVisibleValues = manifest.store.topTypeVisibleValues ||
      (manifest.store.config && manifest.store.config.topTypeVisibleValues)

    if (topTypeVisibleValues) {
      store.set('topTypeVisibleValues', topTypeVisibleValues)
    } else {
      store.delete('topTypeVisibleValues')
    }
  }

  return {
    manifestPath,
    tableCount: TABLE_NAMES.reduce((total, tableName) => total + ((data[tableName] || []).length), 0),
    fileCount: copiedFiles.length
  }
}
