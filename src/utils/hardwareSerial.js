const { SerialPort } = window.require('serialport')
const Store = window.require('electron-store')
const store = new Store()

let port = null
let receiveBuffer = Buffer.alloc(0)

function formatFrame(frame) {
  return Array.from(frame).map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}

function getConfig() {
  return store.get('config') || {}
}

/**
 * 获取串口连接。
 *
 * 串口号来自 cfgApp.json，应用启动时 globalCfg.js 会把它写入 electron-store 的 config。
 * 这里采用单例复用，避免每次点击硬件都重复打开 COM 口。
 */
function getPort() {
  const config = getConfig()

  if (!config.com) {
    return Promise.reject(new Error('未配置串口号'))
  }

  if (port && port.isOpen) {
    return Promise.resolve(port)
  }

  return new Promise((resolve, reject) => {
    port = new SerialPort({
      path: config.com,
      dataBits: 8,
      stopBits: 1,
      baudRate: Number(config.baudRate) || 9600,
      autoOpen: false
    })

    port.on('data', handleReceive)
    port.on('error', err => {
      console.log('硬件串口异常：', err.message)
    })

    port.open(err => {
      if (err) {
        reject(err)
        return
      }
      console.log('硬件串口已打开：', config.com)
      resolve(port)
    })
  })
}

/**
 * 处理硬件状态上报。
 *
 * 硬件可能分多次返回数据，所以先追加到 receiveBuffer。
 * 当前协议约定状态帧长度为 32 字节：
 * - frame[0]  = 0xDE：状态帧帧头
 * - frame[31] = 0xED：状态帧帧尾
 */
function handleReceive(chunk) {
  console.log('硬件串口收到原始数据：', formatFrame(chunk))
  receiveBuffer = Buffer.concat([receiveBuffer, chunk])

  while (receiveBuffer.length >= 32) {
    const start = receiveBuffer.indexOf(0xDE)

    if (start === -1) {
      receiveBuffer = Buffer.alloc(0)
      return
    }

    if (start > 0) {
      receiveBuffer = receiveBuffer.slice(start)
    }

    if (receiveBuffer.length < 32) {
      return
    }

    const frame = receiveBuffer.slice(0, 32)
    receiveBuffer = receiveBuffer.slice(32)

    if (frame[31] === 0xED) {
      console.log('硬件状态帧：', formatFrame(frame))
      console.log('硬件状态解析结果：', parseStatusFrame(frame))
    } else {
      console.log('硬件状态帧格式无效：', formatFrame(frame))
    }
  }
}

/**
 * 把状态帧里的字节位转换成业务字段，便于排查硬件实时状态。
 */
function parseStatusFrame(frame) {
  return {
    falling: frame[2],
    horizontal: frame[3],
    hotWind: frame[4],
    waterMist: frame[5],
    smoke: frame[6],
    coldWind: frame[7],
    fire: frame[8],
    gearHurt: frame[9],
    beltHurt: frame[10],
    crushHurt: frame[11],
    electricHurt: frame[12],
    footHit: frame[13],
    fireButton: frame[14]
  }
}

/**
 * 构造控制帧。
 *
 * commands 的每一项形如 { byte, value }：
 * - byte：写入控制帧的字节下标
 * - value：写入该字节的控制值，0x00 通常表示关闭
 */
function buildControlFrame(commands = []) {
  const frame = Buffer.alloc(32, 0x00)

  frame[0] = 0xAF
  frame[1] = 0x0B
  frame[31] = 0xBF

  commands.forEach(command => {
    frame[command.byte] = command.value
  })

  return frame
}

function sendControl(commands = []) {
  return getPort().then(currentPort => {
    const frame = buildControlFrame(commands)
    console.log('发送硬件控制指令：', formatFrame(frame), commands)

    return new Promise((resolve, reject) => {
      currentPort.write(frame, err => {
        if (err) {
          reject(err)
          return
        }
        currentPort.drain(drainErr => {
          if (drainErr) {
            reject(drainErr)
            return
          }
          resolve(frame)
        })
      })
    })
  })
}

/**
 * 主动查询硬件状态。
 *
 * 查询帧和控制帧同样是 32 字节，区别是 frame[1] = 0x0C。
 */
function sendQuery() {
  return getPort().then(currentPort => {
    const frame = Buffer.alloc(32, 0x00)
    frame[0] = 0xAF
    frame[1] = 0x0C
    frame[31] = 0xBF
    console.log('发送硬件状态查询指令：', formatFrame(frame))

    return new Promise((resolve, reject) => {
      currentPort.write(frame, err => {
        if (err) {
          reject(err)
          return
        }
        resolve(frame)
      })
    })
  })
}

function close() {
  if (port && port.isOpen) {
    console.log('关闭硬件串口')
    port.close()
  }
  port = null
  receiveBuffer = Buffer.alloc(0)
}

function closeSerialPort() {
  const currentPort = port
  port = null
  receiveBuffer = Buffer.alloc(0)

  if (!currentPort || !currentPort.isOpen) {
    return Promise.resolve()
  }

  console.log('closing hardware serial port')

  return new Promise(resolve => {
    currentPort.close(err => {
      if (err) {
        console.log('hardware serial port close failed:', err.message)
        resolve()
        return
      }

      console.log('hardware serial port closed')
      resolve()
    })
  })
}

export default {
  close: closeSerialPort,
  closeLegacy: close,
  sendControl,
  sendQuery
}
