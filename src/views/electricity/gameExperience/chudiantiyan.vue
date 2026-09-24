<script>
import { debounce } from '../../../utils/index'
import { SerialPort } from 'serialport'
const Store = window.require('electron-store')
const stores = new Store()
const config = stores.get('config')
// import particlesJson from './particles.json'
export default {
  name: 'index',
  data() {
    return {
      form: {
        current: '0.05mA',
        position: '1'
      },
      port: null,
      dataArry: [
        { position: '1', current: '0.05mA' },
        { position: '2', current: '0.116mA' },
        { position: '3', current: '0.135mA' },
        { position: '4', current: '0.157mA' },
        { position: '5', current: '0.184mA' },
        { position: '6', current: '0.204mA' },
        { position: '7', current: '0.22mA' },
        { position: '8', current: '0.237mA' },
        { position: '9', current: '0.256mA' },
        { position: '10', current: '0.285mA' },
        { position: '11', current: '0.3mA' },
        { position: '12', current: '0.323mA' },
        { position: '13', current: '0.346mA' },
        { position: '14', current: '0.357mA' },
        { position: '15', current: '0.4mA' }
      ],
      index: 0,
      type: false,
      timeout: 60000,
      timer: null,
      bgType: false,
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer)
    if (this.port) {
      this.port.write('4', (err) => {
        if (err) {
          return console.log('Error on write: ', err.message)
        } else {
          this.port.close()
        }
        console.log('message written')
      })
    }
  },
  mounted() {
    // console.log(particlesJson)
    // particlesJS('index', particlesJson, function() {
    //   console.log('callback - particles.js config loaded')
    // })
  },
  created() {
    let path
    SerialPort.list().then(
      (ports) => {
        if(ports.length ===0){
          return
        }
        ports.forEach(item => {
          if (item.friendlyName.includes('CH340') || item.friendlyName.includes('CH343')) {
            console.log(item)
            path = item.path
          }
        })
        if (path) {
          this.port = new SerialPort({
            path: config.com,
            dataBits: 8, // 数据位
            stopBits: 1, // 停止位
            baudRate: 9600 // 波特率
          })
        }
        console.log(ports, '+++')
      }
    )
    this.resetTimer()
  },
  methods: {
    resetTimer() {
      clearTimeout(this.timer) // 清除计时器
      this.timer = setTimeout(() => {
        if (this.type) {
          this.port.write('4', (err) => {
            if (err) {
              return console.log('Error on write: ', err.message)
            } else {
              console.log('message written')
              this.form= {
                  current: '0.05mA',
                  position: '1'
              }
              this.index = 0
            }
            console.log('message written')
          })
          this.type = !this.type
          // alert('您已经很长时间没有操作了，请注意休息！')
        }
        // console.log('23')
        // alert('您已经很长时间没有操作了，请注意休息！')
        this.timer = null // 将计时器变量设为 null
      }, this.timeout)
    },
    start() {
      if (this.type) {
        this.showMessage({
          message: '请先结束体验，在开始',
          type: 'warning',
          duration: 1000
        })
        return
      }
      // this.bgType = true
      this.resetTimer()
      this.connectSerialPort('1', this.dataArry[0].current, this.dataArry[0].position, 0)
    },
    finish() {
      if (!this.type) {
        this.showMessage({
          message: '请先开始体验，在结束',
          type: 'warning',
          duration: 1000
        })
        return
      }
      this.showMessage({
          message: '体验已结束',
          type: 'success',
          duration: 1000
        })
      // this.bgType = false
      this.resetTimer()
      this.connectSerialPort('4', this.dataArry[0].current, this.dataArry[0].position, 0)
    },
    connectSerialPort(data, current, position, index) {
      if (this.port) {
        this.type = !this.type
        this.port.write(data, (err) => {
          if (err) {
            return console.log('Error on write: ', err.message)
          } else {
            console.log('message written')
            this.form.current = current
            this.form.position = position
            this.index = index
          }
          console.log('message written')
        })
        this.port.on('error', function(err) {
          console.log('Error: ', err.message)
        })

        this.port.on('data', function(data) {
          console.info('data', data)
        })
      } else {
        // alert('请检查设备是否连接')
        this.showMessage({
          message: '请检查设备是否连接',
          type: 'warning',
          duration: 1000
        })
        // this.$message({
        //   message: '请检查设备是否连接',
        //   type: 'warning'
        // })
      }
    },
    add: debounce(function() {
      let that = this
      if (!that.type) {
        that.showMessage({
          message: '请先开始体验',
          type: 'warning',
          duration: 1000
        })
        return
      }
      if (that.index == 14) {
        that.showMessage({
          message: '已经是最高挡位',
          type: 'warning',
          duration: 1000
        })
      } else {
        that.resetTimer()
        that.index++
        console.log(that.index)
        this.port.write('2', (err) => {
          if (err) {
            return console.log('Error on write: ', err.message)
          } else {
            console.log('message written', that.dataArry[this.index].current)
            that.form.current = this.dataArry[that.index].current
            that.form.position = this.dataArry[that.index].position
          }
          console.log('message written')
        })
        that.port.on('error', function(err) {
          console.log('Error: ', err.message)
        })

        that.port.on('data', function(data) {
          console.info('data', data)
        })
      }
    }, 500),
    remove: debounce(function() {
      if (!this.type) {
        this.showMessage({
          message: '请先开始体验',
          type: 'warning',
          duration: 1000
        })
        return
      }
      if (this.index == 0) {
        this.showMessage({
          message: '已经是低挡位',
          type: 'warning',
          duration: 1000
        })
      } else {
        this.resetTimer()
        this.index--
        this.port.write('3', (err) => {
          if (err) {
            return console.log('Error on write: ', err.message)
          } else {
            console.log('message written')
            this.form.current = this.dataArry[this.index].current
            this.form.position = this.dataArry[this.index].position
          }
          console.log('message written')
        })
        this.port.on('error', function(err) {
          console.log('Error: ', err.message)
        })

        this.port.on('data', function(data) {
          console.info('data', data)
        })
      }
    }, 500)
  }

}
</script>

<template>
  <div class="study-container" id="index" ref="appRef">
    <img v-if="!bgType" class="login-background" src="../../../assets/images/bg2.png"/>
    <img src="../../../assets/images/chudiantiyan-title.png" alt=""
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px"
    >
    <img src="../../../assets/images/fanhui.png" alt="" v-click-sound
         style="position: absolute;top: 0px;right: 30px" @click="$router.back()"
    >
    <!--    <el-header class="study-header" style="height: 80px;width:100%;display: flex;align-items: center;justify-content: space-between">-->
    <!--    <div class="study-back" @click="gotoBack"></div>-->
    <!--    <div class="exam-back-right" @click="screenFullToggle()"></div>-->
    <!--    </el-header>-->
    <div class="study-main">
      <div class="identifier-img">
        <div style="display: flex;justify-content: space-evenly;margin-top: 100px">
          <div class="left" :class="{'active': type}" @click="start" v-click-sound></div>
          <div class="right" :class="{'disabled': !type}" @click="finish" v-click-sound></div>
        </div>
        <div style="margin: 100px auto 100px;width: 1040px;padding: 0 50px 0 20px">
          <el-form ref="form" :model="form" label-width="200px">
            <el-form-item label="电流值:" style="margin-bottom: 70px">
              <el-input v-model="form.current" style="height: 72px" disabled></el-input>
            </el-form-item>
            <el-form-item label="电流档位:">
              <div style="display: flex;width: 100%;align-items: center">
                <el-input v-model="form.position" style="height: 72px;flex:1" disabled></el-input>
                <div class="add" @click="add" v-click-sound></div>
                <div class="remove" @click="remove" v-click-sound></div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <div class="videoContainer" v-if="bgType">
      <video
        style="width: 100%;height: 100%"
        class="fillWidth"
        playsinline=""
        autoplay=""
        muted=""
        loop=""
      >
        <source src="../../../assets/images/chudian.mp4"
                type="video/mp4"
        />
      </video>
    </div>
    <div class="experience-popup" v-if="type">
      <div class="experience-popup-inner">
        <img class="experience-popup-bg" src="../../../assets/images/提醒框.png" alt="">
        <div class="experience-popup-text">正在体验触电</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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

.videoContainer {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -100;
  top: 0;
}

.videoContainer:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  display: block;
  z-index: -1;
  top: 0;
  left: 0;
  background: rgba(25, 29, 34, 0.65);
}

.study-main {
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.identifier-img {
  width: 1225px;
  height: 653px;
  margin-top: 70px;
  background: url("../../../assets/images/tigantiyan-center-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.left {
  background: url("../../../assets/images/kaishitiyan2.png");
  width: 391px;
  height: 105px;
}

.left:active,
.left.active {
  background: url("../../../assets/images/kaishitiyan1.png");
}

.right:active {
  background: url("../../../assets/images/jieshutiyan1.png");
}

.right {
  background: url("../../../assets/images/jieshutiyan2.png");
  width: 391px;
  height: 105px;
}

.right.disabled {
  filter: grayscale(100%);
}

.add {
  background: url("../../../assets/images/add1.png");
  width: 73px;
  height: 72px;
  margin-left: 20px;
}

.remove {
  background: url("../../../assets/images/remove1.png");
  width: 73px;
  height: 72px;
  margin-left: 20px;
}

.add:active {
  background: url("../../../assets/images/add2.png");
}

.remove:active {
  background: url("../../../assets/images/remove2.png");
}

::v-deep .el-form-item__label {
  font-size: 40px !important;
  color: #FFFFFF;
  height: 72px;
  line-height: 72px;
}

::v-deep .el-input__inner {
  font-size: 40px !important;
  height: 100% !important;
  background-color: #012122;
  border: 2px solid #0D4C4C;
}

::v-deep .el-input.is-disabled .el-input__inner {
  background-color: #012122;
  border: 2px solid #0D4C4C;
}
.experience-popup {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 200px;
  width: 400px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.experience-popup-inner {
  position: relative;
  display: inline-block;
}
.experience-popup-bg {
  display: block;
  width: 100%;
  height: 100%;
}
.experience-popup-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  color: red;
  text-align: center;
  white-space: nowrap;
}
</style>
