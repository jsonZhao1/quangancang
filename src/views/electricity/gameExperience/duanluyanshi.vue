<script>
import { SerialPort } from 'serialport'

const Store = window.require('electron-store')
const stores = new Store()
const config = stores.get('config')
export default {
  name: 'index',
  data() {
    return {
      // 1开始，2进行中，3结束
      type: 1,
      remainingSeconds:3,
      countdown:null,
      remainingImg:require(`../../../assets/images/countdown3.png`),
      port:null,
      isShow:false
    }
  },
  beforeDestroy() {
    this.clearCountdown()
    this.port.close()
  },
  mounted() {

  },
  created() {
    SerialPort.list().then((ports) => {
      if(ports.length ===0){
        return
      }
      this.port = new SerialPort({
        path: config.com,
        dataBits: 8, // 数据位
        stopBits: 1, // 停止位
        baudRate: 9600 // 波特率
      })
      this.port.on('error', function(err) {
        console.log('Error: ', err.message)
      })
    })
  },
  methods: {
    startCountdown() {
      this.connectSerialPort('Q')
      this.getData().then(res =>{
        if(res.includes('N')){
          this.isShow=true
          console.log('结束')
        }else{
          this.connectSerialPort('8')
          this.type = 2
          this.remainingSeconds = 3
          this.countdown = setInterval(() => {
            if (this.remainingSeconds > 0) {
              this.remainingSeconds--
              this.remainingImg = require(`../../../assets/images/countdown${this.remainingSeconds}.png`)
            } else {
              this.clearCountdown()
              this.connectSerialPort('9')
              this.type = 3
            }
          }, 1000)
        }
      })

    },
    connectSerialPort(data) {
      if (this.port) {
        this.port.write(data, (err) => {
          if (err) {
            return console.log('Error on write: ', err.message)
          } else {

          }
        })

      }
    },
    getData(){
      let str
      return new Promise((resolve, reject) => {
        this.port.on('data', function(obj) {
          const buf = Buffer.from(obj, 'utf8')
          str = buf.toString('utf8')
          console.info('data', str)
          resolve(str)
        })
      })
    },
    clearCountdown() {
      clearInterval(this.countdown)
    }
  }

}
</script>

<template>
  <div id="index" ref="appRef" class="study-container">
    <img class="login-background" src="../../../assets/images/bg2.png"/>
    <img alt="" src="../../../assets/images/duanluyanshi-title.png"
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px"
    >
    <img v-click-sound alt="" src="../../../assets/images/fanhui.png"
         style="position: absolute;top: 0px;right: 30px" @click="$router.back()" v-if="type===1"
    >
    <div class="study-main">
      <div v-if="type===2" class="countdown">
        <img alt="" :src="remainingImg">
      </div>
      <div v-else class="introduce">
        <div class="introduce-text" v-if="type===1">
          <span style="color: #ffffff">短路演示时， 演示装置真实通电， 且会产生电火花， 演示过程中， </span>
          <span style="color: #FF6B6B">严禁打开防护罩， 严禁通过肢体直接触摸演示装置</span>
        </div>
        <div v-if="type===3" class="introduce-text">
          <span style="color: #FFAF68">本次短路演示结束！在进行下次短路演示前，请更换短路演示耗材，否则无法进行演示！</span>
        </div>
        <div class="start-btn" @click="startCountdown" v-if="type===1 && !isShow" v-click-sound></div>
        <div class="confirm-btn" @click="type=1" v-if="type===3" v-click-sound></div>
      </div>
    </div>
    <div class="prompt" v-if="isShow">
      请检查急停按钮和演示柜门后，再进行体验！
      <img alt="" src="../../../assets/images/datikaohe-queren.png"
           style="position: absolute;left: 50%;transform: translateX(-50%);bottom: 40px" @click="isShow=false"
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.study-container {
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: left top;
  overflow: hidden;
  //background: url("../../../assets/images/bg2.png");
  //background-size: 100% 100%;
  //background-repeat: no-repeat;
  //background-size: 100% auto;
  //padding-top: 120px;
}

.login-background {
  width: 100%;
  display: block;
  position: fixed;
  top: 0;
  height: 100%;
  left: 0;
  z-index: -99;
}


.study-main {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.introduce {
  width: 1225px;
  height: 653px;
  background: url("../../../assets/images/introduce-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
}

.introduce-text {
  font-size: 35px;
  padding: 160px 200px 0px;
  line-height: 55px;
}

.start-btn {
  width: 392px;
  height: 106px;
  background: url("../../../assets/images/开始演示.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
}

.start-btn:active {
  opacity: 0.8;
}

.countdown{
  width: 900px;
  height: 653px;
  background: url("../../../assets/images/演示倒计时界面.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  img{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
}
.confirm-btn{
  width: 392px;
  height: 106px;
  background: url("../../../assets/images/确认.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
}
.prompt{
  background: url("../../../assets/images/提醒框.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 635px;
  height: 349px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  font-size: 36px;
  padding: 100px 50px;
  line-height: 50px;
  color: #FF6B6B
}
</style>
