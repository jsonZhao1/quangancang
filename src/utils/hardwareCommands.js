/**
 * 首页“设备体感”硬件指令配置。
 *
 * 页面只保存业务标识 softNumber，例如 falling、hotWindLeft。
 * 真正发送到硬件时，会通过这里把业务标识转换成串口协议里的 byte/value。
 *
 * 控制帧由 hardwareSerial.js 统一组装：
 * - frame[0]  = 0xAF：控制帧帧头
 * - frame[1]  = 0x0B：控制命令类型
 * - frame[31] = 0xBF：控制帧帧尾
 * - 中间字节按本文件配置写入具体硬件动作和档位
 */
export const HARDWARE_COMMAND_OPTIONS = [
  { label: '坠物打击', value: 'falling', commands: [{ byte: 2, value: 0x01 }] },
  { label: '横向打击', value: 'horizontal', commands: [{ byte: 3, value: 0x01 }] },
  { label: '左侧热风', value: 'hotWindLeft', commands: [{ byte: 4, value: 0x01 }] },
  { label: '右侧热风', value: 'hotWindRight', commands: [{ byte: 4, value: 0x02 }] },
  { label: '左右热风', value: 'hotWindBoth', commands: [{ byte: 4, value: 0x03 }] },
  { label: '左侧水雾', value: 'waterMistLeft', commands: [{ byte: 5, value: 0x01 }] },
  { label: '右侧水雾', value: 'waterMistRight', commands: [{ byte: 5, value: 0x02 }] },
  { label: '左右水雾', value: 'waterMistBoth', commands: [{ byte: 5, value: 0x03 }] },
  { label: '左侧烟熏气味', value: 'smokeLeft', commands: [{ byte: 6, value: 0x01 }] },
  { label: '右侧烟熏气味', value: 'smokeRight', commands: [{ byte: 6, value: 0x02 }] },
  { label: '左右烟熏气味', value: 'smokeBoth', commands: [{ byte: 6, value: 0x03 }] },
  { label: '左侧冷风', value: 'coldWindLeft', commands: [{ byte: 7, value: 0x01 }] },
  { label: '右侧冷风', value: 'coldWindRight', commands: [{ byte: 7, value: 0x02 }] },
  { label: '左右冷风', value: 'coldWindBoth', commands: [{ byte: 7, value: 0x03 }] },
  { label: '左侧火焰', value: 'fireLeft', commands: [{ byte: 8, value: 0x01 }] },
  { label: '右侧火焰', value: 'fireRight', commands: [{ byte: 8, value: 0x02 }] },
  { label: '左右火焰', value: 'fireBoth', commands: [{ byte: 8, value: 0x03 }] },
  { label: '齿轮伤害', value: 'gearHurt', byte: 9, minLevel: 1, maxLevel: 3 },
  { label: '皮带机伤害', value: 'beltHurt', byte: 10, minLevel: 1, maxLevel: 3 },
  { label: '挤压伤害', value: 'crushHurt', byte: 11, minLevel: 1, maxLevel: 3 },
  { label: '触电伤害', value: 'electricHurt', byte: 12, minLevel: 1, maxLevel: 5 },
  {
    label: '电缸坠落效果',
    value: 'dianGangFall',
    type: 'dianGang',
    effect: 'fall',
    upTimeMs: 1000,
    downTimeMs: 120,
    minLengthCm: 1,
    maxLengthCm: 9
  },
  {
    label: '电缸晃动效果',
    value: 'dianGangShake',
    type: 'dianGang',
    effect: 'shake',
    stepTimeMs: 300,
    stopLevelCm: 3,
    stopLevelTimeMs: 1200,
    stopDownTimeMs: 1200,
    stopConfirmTimeMs: 300,
    rounds: 1,
    minLengthCm: 1,
    maxLengthCm: 9
  }
]

/**
 * 兼容旧数据。
 *
 * 早期数据可能把每个档位保存成独立 softNumber，例如 gearHurtLevel1。
 * 现在档位由 hardwareLevel 单独控制，所以旧值统一映射回同一个硬件动作。
 */
const LEGACY_COMMAND_VALUE_MAP = {
  dianGang: 'dianGangFall',
  gearHurtLevel1: 'gearHurt',
  gearHurtLevel2: 'gearHurt',
  gearHurtLevel3: 'gearHurt',
  beltHurtLevel1: 'beltHurt',
  beltHurtLevel2: 'beltHurt',
  beltHurtLevel3: 'beltHurt',
  crushHurtLevel1: 'crushHurt',
  crushHurtLevel2: 'crushHurt',
  crushHurtLevel3: 'crushHurt',
  electricHurtLevel1: 'electricHurt',
  electricHurtLevel2: 'electricHurt',
  electricHurtLevel3: 'electricHurt',
  electricHurtLevel4: 'electricHurt',
  electricHurtLevel5: 'electricHurt'
}

export function getHardwareCommand(value) {
  const commandValue = LEGACY_COMMAND_VALUE_MAP[value] || value
  return HARDWARE_COMMAND_OPTIONS.find(item => item.value === commandValue)
}

/**
 * 生成启动指令。
 *
 * 普通开关类硬件使用 commands 数组，直接写固定 value。
 * 档位类硬件使用 byte + minLevel/maxLevel，根据当前档位写入 1、2、3...。
 */
export function buildHardwareCommands(command, level = 1) {
  if (!command) {
    return []
  }

  if (command.commands) {
    return command.commands
  }

  const currentLevel = Math.min(command.maxLevel, Math.max(command.minLevel, Number(level) || command.minLevel))
  return [{ byte: command.byte, value: currentLevel }]
}

/**
 * 生成停止指令。
 *
 * 硬件协议里约定对应控制字节写 0x00 表示关闭。
 */
export function buildHardwareStopCommands(command) {
  if (!command) {
    return []
  }

  if (command.commands) {
    return command.commands.map(item => ({
      byte: item.byte,
      value: 0x00
    }))
  }

  return [{ byte: command.byte, value: 0x00 }]
}

export function isLevelHardwareCommand(command) {
  return Boolean(command && command.byte !== undefined && command.maxLevel)
}
