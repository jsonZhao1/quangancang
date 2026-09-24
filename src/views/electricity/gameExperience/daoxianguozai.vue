<script>
import showMessage from '../../../utils/message'
import { SerialPort } from 'serialport'
const Store = window.require('electron-store')
const stores = new Store()
const config = stores.get('config')
export default {
  name: 'index',
  data() {
    return {
      form: {
        current: '15A',
        timer: 5
      },
      type: false,
      timer: null,
      port:null,
      showPopup:false,
      countdown:null,
      remainingSeconds:5,
      isShow:false
    }
  },
  beforeDestroy() {
    // clearTimeout(this.timer)
    this.clearCountdown()
    if (this.port) {
      this.port.write('7', (err) => {
        if (err) {
          return console.log('Error on write: ', err.message)
        } else {
          this.port.close()
        }
        console.log('message written')
      })
    }
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
    start() {

      this.connectSerialPort('Q')
      this.getData().then(res=>{
        if(res.includes('N')){
          this.isShow=true
          console.log('结束')
          return      // if (this.type) {
          //   showMessage({
          //     message: '请先结束体验，在开始',
          //     type: 'warning',
          //     duration:1000
          //   })
          //   return
          // }
        }else{
          this.connectSerialPort('6')
          this.showPopup = true
          this.remainingSeconds = this.form.timer
          this.countdown = setInterval(() => {
            if (this.remainingSeconds > 0) {
              this.remainingSeconds--
            } else {
              this.clearCountdown()
              this.connectSerialPort('7')
              this.showPopup = false
              showMessage({
                message: '结束体验',
                type: 'warning',
                duration:1000
              })
            }
          }, 1000)
        }
      })
    },
    finish() {
      if (!this.type) {
        showMessage({
          message: '请先开始体验，在结束',
          type: 'warning',
          duration:1000
        })
        return
      }
      this.connectSerialPort('7')
    },
    connectSerialPort(data) {
        this.port.write(data, (err) => {
          if (err) {
            return console.log('Error on write: ', err.message)
          } else {

          }
        })
    },
    getTimer() {
      this.timer = setTimeout(() => {
        console.log('ok')
        if (this.port) {
          this.type = !this.type
          this.port.write('7', (err) => {
            if (err) {
              return console.log('Error on write: ', err.message)
            } else {
              console.log('message written')
              clearTimeout(this.timer)
              showMessage({
                message: '结束体验',
                type: 'warning',
                duration:1000
              })
            }
          })
        } else {
          console.log('0')
        }
      }, this.form.timer * 1000)
    },

    remove() {
      if (this.form.timer == 5) {
        showMessage({
          message: '时间不能小于5秒',
          type: 'warning',
          duration:1000
        })
        return
      }
      this.form.timer = this.form.timer - 5
    },
    add() {
      if (this.form.timer == 15) {
        showMessage({
          message: '时间不能超过15秒',
          type: 'warning',
          duration:1000
        })
        return
      }
      this.form.timer = this.form.timer + 5
    },
    getData(){
      let str
      return new Promise((resolve, reject) => {
        this.port.on('data', function(obj) {
          const buf = Buffer.from(obj, 'utf8')
          const str = buf.toString('utf8')
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
  <div class="study-container" id="index" ref="appRef">
    <img src="../../../assets/images/daodianguozai-title.png" alt=""
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px"
    >
    <img src="../../../assets/images/fanhui.png" alt=""
         style="position: absolute;top: 0px;right: 30px" @click="$router.back()"
    >
    <!--    <el-header class="study-header" style="height: 80px;width:100%;display: flex;align-items: center;justify-content: space-between">-->
    <!--    <div class="study-back" @click="gotoBack"></div>-->
    <!--    <div class="exam-back-right" @click="screenFullToggle()"></div>-->
    <!--    </el-header>-->
    <div class="study-main" >
      <div class="identifier-img" >
        <div style="display: flex;justify-content: space-evenly;margin-top: 100px" v-show="!showPopup">
          <div class="left" @click="start"  ></div>
<!--          <div class="right" @click="finish"></div>-->
        </div>
        <div style="margin: 100px auto 100px;width: 1040px;padding: 0 50px 0 20px" v-show="!showPopup">
          <el-form ref="form" :model="form" label-width="200px">
            <el-form-item label="电流值:" style="margin-bottom: 70px">
              <el-input v-model="form.current" style="height: 72px" disabled></el-input>
            </el-form-item>
            <el-form-item label="时间/秒:" style="margin-bottom: 70px">
              <div style="display: flex;width: 100%;align-items: center">
                <el-input v-model.number="form.timer" style="height: 72px;flex:1" disabled></el-input>
                <div class="add" @click="add"></div>
                <div class="remove" @click="remove"></div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <div v-if="showPopup" class="popup-container">
      <div class="countdown-num">
        {{ remainingSeconds}}
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
  background: url("../../../assets/images/bg2.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  //background-size: 100% auto;
  //padding-top: 120px;
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

.left:active {
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

.add {
  background: url("../../../assets/images/add1.png");
  width: 73px;
  height: 72px;
}

.remove {
  background: url("../../../assets/images/remove1.png");
  width: 73px;
  height: 72px;

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
.popup-container {
  width: 409px;
  height: 409px;
  margin-top: 70px;
  background-size: 100% 100%;
  background: url("../../../assets/images/tuoyuan.png") no-repeat;
  position: absolute;
  line-height: 409px;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  text-align: center;
}
.countdown-num {
  font-size: 100px;
  font-family: AlibabaPuHuiTi_2_85_Bold,serif ;
  color: rgba(255, 249, 185, 1);
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
