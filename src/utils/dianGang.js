const dgram = window.require('dgram')
const Store = window.require('electron-store')
const store = new Store()

const DEFAULT_IP = '192.168.15.201'
const DEFAULT_PORT = 7408
const DEFAULT_LOCAL_PORT = 8410
const DEFAULT_TIME_MS = 1000
const DEFAULT_FALL_UP_TIME_MS = 1000
const DEFAULT_FALL_DOWN_TIME_MS = 120
const DEFAULT_SHAKE_STEP_TIME_MS = 300
const DEFAULT_SHAKE_ROUNDS = 1
const DEFAULT_LENGTH_CM = 1
const DEFAULT_MIN_LENGTH_CM = 1
const DEFAULT_MAX_LENGTH_CM = 9

const ELECTRIC_CYLINDER_LEAD_MM = 5
const PULSE_PER_CIRCLE = 10000
const RELATIVE_MOVE_FUNC_CODE = '1401'
const AXIS_FLAG_THREE_AXIS = '0000'
const BROADCAST_ADDRESS = 'FFFFFFFF'
const FIXED_IO_PAYLOAD = '12345678ABCD'
const STOP_FRAME_HEX = '55AA000012010000FFFFFFFF009000010001'
const RESET_FRAME_HEX = '55AA000012010002FFFFFFFF000000010000'

let socket = null
let socketReady = null
let sequence = 1
let targetIp = DEFAULT_IP
let targetPort = DEFAULT_PORT

function getConfig() {
  const config = store.get('config') || {}

  return {
    ip: config.dianGangIp || DEFAULT_IP,
    port: Number(config.dianGangPort) || DEFAULT_PORT,
    localPort: Number(config.dianGangLocalPort) || DEFAULT_LOCAL_PORT,
    timeMs: Number(config.dianGangTimeMs) || DEFAULT_TIME_MS,
    minLengthCm: Number(config.dianGangMinLengthCm) || DEFAULT_MIN_LENGTH_CM,
    maxLengthCm: Number(config.dianGangMaxLengthCm) || DEFAULT_MAX_LENGTH_CM
  }
}

function toHex8(num) {
  const value = Number(num) >>> 0
  return value.toString(16).toUpperCase().padStart(8, '0')
}

function nextSequenceHex() {
  const current = sequence
  sequence += 1
  return toHex8(current)
}

function cmToMm(value) {
  return value * 10
}

function lenToPulse(lengthMm) {
  if (lengthMm === 0) {
    return 0
  }

  return Math.trunc(lengthMm / ELECTRIC_CYLINDER_LEAD_MM) * PULSE_PER_CIRCLE
}

function hexToBuffer(hex) {
  const normalized = String(hex).replace(/\s/g, '')

  if (normalized.length % 2 !== 0) {
    throw new Error(`电缸指令帧长度无效：${normalized}`)
  }

  return Buffer.from(normalized, 'hex')
}

function assertSafeLength(value, name, minLengthCm, maxLengthCm) {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} 必须是整数厘米，当前值：${value}`)
  }

  if (value < minLengthCm || value > maxLengthCm) {
    throw new Error(`${name} 超出安全限制：${value}cm，当前允许范围为 ${minLengthCm} 到 ${maxLengthCm}cm`)
  }
}

function ensureSocket(config) {
  targetIp = config.ip
  targetPort = config.port

  if (socketReady) {
    return socketReady
  }

  socketReady = new Promise((resolve, reject) => {
    socket = dgram.createSocket('udp4')

    socket.once('error', error => {
      socket = null
      socketReady = null
      reject(error)
    })

    socket.once('listening', () => {
      const address = socket.address()
      console.log('电缸 UDP 通信已初始化：', {
        local: `${address.address}:${address.port}`,
        target: `${targetIp}:${targetPort}`
      })
      resolve()
    })

    socket.bind(config.localPort)
  })

  return socketReady
}

function sendRawFrame(frameHex, label) {
  const config = getConfig()
  const frame = hexToBuffer(frameHex)

  return ensureSocket(config).then(() => new Promise((resolve, reject) => {
    console.log(`发送电缸${label} UDP 指令：`, {
      target: `${targetIp}:${targetPort}`,
      frameHex,
      bytes: frame.length
    })

    socket.send(frame, 0, frame.length, targetPort, targetIp, error => {
      if (error) {
        reject(error)
        return
      }

      resolve({
        ok: true,
        protocol: 'udp',
        targetIp,
        targetPort,
        frameHex,
        bytes: frame.length
      })
    })
  }))
}

function buildMoveFrame(timeMs, lengthMm1, lengthMm2, lengthMm3) {
  const currentTimeMs = Math.max(1, Number(timeMs) || 1)
  const frameHex = [
    '55AA0000',
    RELATIVE_MOVE_FUNC_CODE,
    AXIS_FLAG_THREE_AXIS,
    BROADCAST_ADDRESS,
    nextSequenceHex(),
    toHex8(currentTimeMs),
    toHex8(lenToPulse(lengthMm1)),
    toHex8(lenToPulse(lengthMm2)),
    toHex8(lenToPulse(lengthMm3)),
    FIXED_IO_PAYLOAD
  ].join('')

  return frameHex
}

function moveRelativeMs(options = {}) {
  const config = getConfig()
  const timeMs = Number(options.timeMs || config.timeMs)
  const minLengthCm = Number(options.minLengthCm || config.minLengthCm)
  const maxLengthCm = Number(options.maxLengthCm || config.maxLengthCm)
  const lengths = options.lengths || [DEFAULT_LENGTH_CM, DEFAULT_LENGTH_CM, DEFAULT_LENGTH_CM]
  const length1 = Number(lengths[0])
  const length2 = Number(lengths[1])
  const length3 = Number(lengths[2])
  const lengthMm1 = cmToMm(length1)
  const lengthMm2 = cmToMm(length2)
  const lengthMm3 = cmToMm(length3)
  const frameHex = buildMoveFrame(timeMs, lengthMm1, lengthMm2, lengthMm3)

  assertSafeLength(length1, 'length1', minLengthCm, maxLengthCm)
  assertSafeLength(length2, 'length2', minLengthCm, maxLengthCm)
  assertSafeLength(length3, 'length3', minLengthCm, maxLengthCm)

  console.log('准备发送电缸相对运动指令：', {
    timeMs,
    lengthCm1: length1,
    lengthCm2: length2,
    lengthCm3: length3,
    lengthMm1,
    lengthMm2,
    lengthMm3,
    pulse1: lenToPulse(lengthMm1),
    pulse2: lenToPulse(lengthMm2),
    pulse3: lenToPulse(lengthMm3)
  })

  return sendRawFrame(frameHex, '相对运动')
}

function wait(timeMs) {
  return new Promise(resolve => {
    window.setTimeout(resolve, Math.max(1, Number(timeMs) || 1))
  })
}

function runMoveStep(lengths, timeMs, label, options = {}) {
  console.log(`准备执行电缸${label}动作：`, {
    timeMs,
    lengths
  })

  return moveRelativeMs({
    timeMs,
    lengths,
    minLengthCm: options.minLengthCm,
    maxLengthCm: options.maxLengthCm
  }).then(result => wait(timeMs).then(() => result))
}

function fallEffect(options = {}) {
  const lowLengthCm = Number(options.lowLengthCm || DEFAULT_MIN_LENGTH_CM)
  const highLengthCm = Number(options.highLengthCm || DEFAULT_MAX_LENGTH_CM)
  const upTimeMs = Number(options.upTimeMs || DEFAULT_FALL_UP_TIME_MS)
  const downTimeMs = Number(options.downTimeMs || DEFAULT_FALL_DOWN_TIME_MS)
  const safeOptions = {
    minLengthCm: Number(options.minLengthCm || DEFAULT_MIN_LENGTH_CM),
    maxLengthCm: Number(options.maxLengthCm || DEFAULT_MAX_LENGTH_CM)
  }

  console.log('开始执行电缸坠落效果：先升到高位，再快速回到低位', {
    lowLengthCm,
    highLengthCm,
    upTimeMs,
    downTimeMs
  })

  return runMoveStep([highLengthCm, highLengthCm, highLengthCm], upTimeMs, '坠落上升', safeOptions)
    .then(upResult => runMoveStep([lowLengthCm, lowLengthCm, lowLengthCm], downTimeMs, '坠落下落', safeOptions)
      .then(downResult => ({
        ok: true,
        effect: 'fall',
        upResult,
        downResult
      })))
}

function shakeEffect(options = {}) {
  const lowLengthCm = Number(options.lowLengthCm || DEFAULT_MIN_LENGTH_CM)
  const highLengthCm = Number(options.highLengthCm || DEFAULT_MAX_LENGTH_CM)
  const stepTimeMs = Number(options.stepTimeMs || DEFAULT_SHAKE_STEP_TIME_MS)
  const rounds = Math.max(1, Number(options.rounds || DEFAULT_SHAKE_ROUNDS))
  const safeOptions = {
    minLengthCm: Number(options.minLengthCm || DEFAULT_MIN_LENGTH_CM),
    maxLengthCm: Number(options.maxLengthCm || DEFAULT_MAX_LENGTH_CM)
  }
  const roundSteps = [
    [highLengthCm, lowLengthCm, lowLengthCm],
    [lowLengthCm, highLengthCm, lowLengthCm],
    [lowLengthCm, lowLengthCm, highLengthCm]
  ]
  const steps = []

  for (let index = 0; index < rounds; index += 1) {
    steps.push(...roundSteps)
  }
  steps.push([lowLengthCm, lowLengthCm, lowLengthCm])

  console.log('开始执行电缸晃动效果：三个电缸轮流升高，再回到低位', {
    lowLengthCm,
    highLengthCm,
    stepTimeMs,
    rounds,
    stepCount: steps.length
  })

  return steps.reduce((chain, lengths, index) => chain.then(results => runMoveStep(
    lengths,
    stepTimeMs,
    `晃动第 ${index + 1} 步`,
    safeOptions
  ).then(result => {
    results.push(result)
    return results
  })), Promise.resolve([])).then(results => ({
    ok: true,
    effect: 'shake',
    results
  }))
}

function stop() {
  return sendRawFrame(STOP_FRAME_HEX, '急停')
}

function reset() {
  return sendRawFrame(RESET_FRAME_HEX, '复位')
}

function stopAndReset() {
  return stop().then(stopResult => reset().then(resetResult => ({
    ok: true,
    stopResult,
    resetResult
  })))
}

function release() {
  if (socket) {
    socket.close()
  }
  socket = null
  socketReady = null
  return Promise.resolve()
}

export default {
  moveRelativeMs,
  fallEffect,
  shakeEffect,
  stop,
  reset,
  stopAndReset,
  release
}
