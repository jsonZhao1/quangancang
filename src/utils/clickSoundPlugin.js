// 定义插件对象
const clickSoundPlugin = {}
import successVideo from '../assets/success.mp3'
import { registerRemoteKeyElement } from './remoteKeyControl'
// 插件的安装方法
clickSoundPlugin.install = function(Vue, options) {
  // 注册一个全局自定义指令
  Vue.directive('click-sound', {
    // 当绑定的元素插入到 DOM 中时调用
    inserted(el) {
      registerRemoteKeyElement(el)
      // 获取配置中的音乐文件路径，默认为 'click-sound.mp3'
      const soundPath = options && options.soundPath ? options.soundPath : successVideo

      // 添加点击事件处理逻辑
      el.addEventListener('click', () => {
        // 播放点击音乐
        const audio = new Audio(soundPath)
        audio.play()
      })
    }
  })
}

export default clickSoundPlugin
