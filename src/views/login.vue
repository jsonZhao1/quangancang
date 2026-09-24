<template>
  <div id="index" ref="appRef" class="login-page">
    <!-- <img v-click-sound src="@/assets/images/后台.png"
         style="width: 86px;height: 101px;position: absolute;right: 140px;top: 43px" @click="goSys"
    /> -->
    <img v-click-sound src="@/assets/images/close.png"
         style="width: 86px;height: 101px;position: absolute;right: 40px;top: 43px" @click="close"
    />
    <!-- 此处图片用于当视屏加载失败时的替换背景图片 -->
    <img  class="login-background" src="../assets/login-img/背景02.png"/>
    <div class="login-content">
      <!-- <img class="loginType-icon" src="@/assets/images/账号.png" alt="" v-if="!loginType" @click="changeLoginType('2')" v-click-sound>
      <img class="loginType-icon" src="@/assets/images/erweima.png" alt="" v-if="loginType" @click="changeLoginType('1')" v-click-sound> -->
      <!-- 此处内容放置中间登录模块 -->
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form" v-if="loginType">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            class="username-input"
            auto-complete="off"
            placeholder=""
            size="large"
            type="text"
          >
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            class="password-input"
            auto-complete="off"
            placeholder=""
            size="large"
            type="password"
            @keyup.enter="handleLogin"
          >
          </el-input>
        </el-form-item>
        <!-- <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住账号密码</el-checkbox> -->
        <el-form-item style="width:100%;">
          <div v-click-sound class="btn" @click.prevent="handleLogin"></div>
        </el-form-item>
        <!-- <el-form-item style="width:100%;display: flex;align-items: center;justify-content: center" >
          <img src="../assets/images/youke.png" style="width: 123px;height: 24px" @click="handleTouristLogin" v-click-sound/>
        </el-form-item> -->
      </el-form>
      <!-- <div v-if="!loginType" style="position: absolute;left: 50%;transform: translateX(-50%);top: 150px;text-align: center">
                <canvas ref="canvasRef"></canvas>
        <div class="qrcode-error-mask" v-if="!qrCodeStatus">
        </div>
        <p class="err-cont" v-if="!qrCodeStatus">二维码已失效</p>
        <div class="refresh-btn" v-if="!qrCodeStatus" @click="refresh" v-click-sound>刷新</div>
        <p/>
        <span class="login-tip">使用微信小程序扫一扫登录</span>
      </div> -->
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogVisible"
      append-to-body
      title="激活设备"
      top="30vh"
      width="30%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="demo-ruleForm" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="ruleForm.projectName"></el-input>
        </el-form-item>
        <el-form-item label="注册码" prop="registerCode">
          <div style="display: flex">
            <el-input v-model="ruleForm.registerCode" style="flex: 1"></el-input>
            <el-button type="primary" @click="getZhuCeMa">获取注册码</el-button>
          </div>
        </el-form-item>
        <el-form-item label="激活码" prop="activeCode">
          <el-input v-model="ruleForm.activeCode" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="close">退出</el-button>
    <el-button type="primary" @click="submitForm">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
import drawMixin from '../utils/drawMixin'
import {validUsername} from '@/utils/validate'
import {
  getLoginStatus,
  appStart,
  getQrCode,
  getheartbeat, touristLogin,AppQuit,logout
} from '@/api/login'
import QRCode from 'qrcode'
import {Message} from 'element-ui'
import { setToken,removeToken } from '@/utils/auth'
const {ipcRenderer} = window.require('electron')
const Store = window.require('electron-store')
const store = new Store()
export default {
  mixins: [drawMixin],
  name: 'Login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value) {
        if (value.length < 6) {
          callback(new Error('密码不能小于6位数'))
        } else {
          callback()
        }
      } else {
        callback(new Error('请填写密码'))
      }
    }
    return {
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        device_sn:this.global.device_sn
      },
      loginRules: {
        username: [{required: true, trigger: 'blur', message: '请填写账号'}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}]
      },
      rules: {
        projectName: [
          {required: true, message: '请填写项目名称', trigger: 'blur'}
        ],
        registerCode: [
          {required: true, message: '请获取注册码', trigger: 'blur'}
        ],
        activeCode: [
          {required: true, message: '请填写激活码', trigger: 'blur'}
        ]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      activeName: 'first',
      qrCodeStatus: true,
      qrCodeData: null,
      dialogVisible: false,
      ruleForm: {
        registerCode: null,
        activeCode: null,
        projectName: null
      },
      vedioCanPlay: false,
      heartbeatIntervalId:null,
      intervalId:null,
      loginType: true
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getCookie()
    this.isActivation()
    clearInterval(this.heartbeatIntervalId)
  },
  mounted() {
  },
  activated() {
  },
  methods: {
    getActivationErrorMessage(data) {
      if (this.isActivationSuccess(data)) {
        return ''
      }
      if (data.indexOf('Message&') !== 0) {
        return ''
      }
      const message = data.split('&').slice(1).join('&')
      if (message === 'activation udp timeout') {
        return '\u6fc0\u6d3b\u901a\u4fe1\u8d85\u65f6\uff0c\u8bf7\u786e\u8ba4UE4\u6388\u6743\u7a0b\u5e8f\u5df2\u542f\u52a8\uff0c\u7aef\u53e38001/8002\u548cIP\u914d\u7f6e\u6b63\u786e'
      }
      if (message === 'activation request pending') {
        return '\u4e0a\u4e00\u6761\u6fc0\u6d3b\u8bf7\u6c42\u8fd8\u672a\u8fd4\u56de\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5'
      }
      return message || '\u6fc0\u6d3b\u901a\u4fe1\u5f02\u5e38'
    },
    isActivationSuccess(data) {
      return data.indexOf('\u6fc0\u6d3b\u6210\u529f') !== -1
    },
    init() {
      this.qrCodeStatus = true
      getQrCode().then(res => {
        console.log(res.data)
        this.qrCodeData = res.data
        this.generateQRCode()
      })
    },
    generateQRCode(){
      const canvas = this.$refs.canvasRef;
      console.log(canvas)
      const text = this.qrCodeData.linkUrl; // 要生成二维码的文本
      QRCode.toCanvas(canvas, text, { // 调用qrcode库的toCanvas方法生成二维码
        width: 300,
        height: 300
      }, (error) => {
        if (error) {
          console.error(error);
        }
      });
    },
    changeLoginType(type) {
      let cfgData = store.get('cfgData')
      if (type === '1') {
        this.loginType = false
        this.init()
        if (this.qrCodeStatus) {
          this.intervalId = setInterval(() => {
            getLoginStatus({ deviceSn:this.global.device_sn,qrCode: this.qrCodeData.qrCode }).then(res => {
              if(res.code ===203){
                this.qrCodeStatus = false
                clearInterval(this.intervalId);
              }
              if (res.code === 200) {
                clearInterval(this.intervalId)
                this.loginAppStart(res.data)
                setToken(res.data.token)
              }
            })
          }, 1000) // 5000毫秒，即5秒
        }
      } else {
        this.loginType = true
        clearInterval(this.intervalId)
      }
    },
    async refresh (){
      await this.init()
      this.qrCodeStatus = true
      if (this.qrCodeStatus) {
        this.intervalId = setInterval(() => {
          getLoginStatus({ deviceSn:this.global.device_sn,qrCode: this.qrCodeData.qrCode }).then(res => {
            if(res.code ===203){
              this.qrCodeStatus = false
              clearInterval(this.intervalId);
            }
            if (res.code === 200) {
              clearInterval(this.intervalId)
              this.loginAppStart(res.data)
              setToken(res.data.token)
            }
          })
        }, 1000) // 5000毫秒，即5秒
      }
    },
    canplay() {
      this.vedioCanPlay = true
    },
    isActivation() {
      const activateData = store.get('activateData')

      if (!activateData) {
        this.dialogVisible = false
        return
      }

      this.ruleForm = {
        registerCode: activateData.registerCode || null,
        activeCode: activateData.activeCode || null,
        projectName: activateData.projectName || null
      }

      const loading = this.$loading({
        lock: true,
        text: '查询本机设备中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      ipcRenderer.removeAllListeners('send_activate_data')
      ipcRenderer.once('send_activate_data', (event, data) => {
        const newData = new TextDecoder().decode(data)
        const errorMessage = this.getActivationErrorMessage(newData)
        if (errorMessage) {
          Message({ message: errorMessage, type: 'warning' })
          this.dialogVisible = false
          loading.close()
          return
        }
        if (this.isActivationSuccess(newData)) {
          store.set('activateData', activateData)
        }
        this.dialogVisible = false
        loading.close()
      })
      ipcRenderer.send('get_activate_data', `Unityactivation&${activateData.activeCode}+${activateData.projectName}`)
    },
    getZhuCeMa() {
      this.ruleForm.registerCode = ''
      ipcRenderer.send('get_registerCode_data', 'registrationCode&12321')
      ipcRenderer.on('send_registerCode_data', (event, data) => {
        // 在这里你可以更新界面显示服务端返回的数据
        let newData = new TextDecoder().decode(data)
        const errorMessage = this.getActivationErrorMessage(newData)
        if (errorMessage) {
          Message({ message: errorMessage, type: 'warning' })
          return
        }
        this.ruleForm.registerCode = newData.split('&')[1]
        console.log(this.ruleForm.registerCode)
        // 更新界面或执行其他操作
      })
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          ipcRenderer.removeAllListeners('send_activate_data')
          ipcRenderer.on('send_activate_data', (event, data) => {
            let newData = new TextDecoder().decode(data)
            const errorMessage = this.getActivationErrorMessage(newData)
            if (errorMessage) {
              Message({ message: errorMessage, type: 'warning' })
              return
            }
            if (this.isActivationSuccess(newData)) {
              this.dialogVisible = false
              store.set('activateData', this.ruleForm)
              this.dialogVisible2 = false
              let newData2 = newData.split('&')[1] || newData
              Message({
                message: newData2,
                type: 'success'
              })
            } else {
              Message({message: '激活失败', type: 'warning'})
            }
          })
          ipcRenderer.send('get_activate_data', `Unityactivation&${this.ruleForm.activeCode}+${this.ruleForm.projectName}`)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getCookie() {
      const username = localStorage.getItem('username')
      const password = localStorage.getItem('password')
      const rememberMe = localStorage.getItem('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : password,
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      }
    },
    handleLogin() {
      console.log(' this.global', this.global);

      this.$refs.loginRef.validate(valid => {
        if (valid) {
          if (this.loginForm.rememberMe) {
            localStorage.setItem('username', this.loginForm.username)
            localStorage.setItem('password', this.loginForm.password)
            localStorage.setItem('rememberMe', this.loginForm.rememberMe)
          } else {
            // 否则移除
            localStorage.removeItem('username')
            localStorage.removeItem('password')
            localStorage.removeItem('rememberMe')
          }
          this.loginForm.device_sn = this.global.device_sn
          this.$store.dispatch('Login', this.loginForm).then((res) => {
            console.log(res)
            this.loginAppStart(res)

          }).catch(() => {
          })
        } else {
          return false
        }
      })
    },
    handleTouristLogin(){
      touristLogin({device_sn:this.global.device_sn}).then(res=>{
        this.$store.commit('SET_NAME', res.data.realname)
        console.log('游客',this.$store.state.user.name)
        this.loginAppStart(res.data)
      })
    },
    loginAppStart(data){
      // appStart({device_sn:this.global.device_sn,goodsNum:data.goodsList[0].list[0].goodsNum,userId:data.userId}).then(res=>{
      //   localStorage.setItem('userLogId', res.data.goods_use_log_id)
      //   this.$EventBus.$emit('startHeartbeat', res.data.user_device_id);
      //   this.$router.push('/home')
      // })
      this.$router.push('/home')
    },
    close() {
      ipcRenderer.send('close-window-request')
    },
    goSys(){
      ipcRenderer.send('go-to-sys')
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #ffffff;
}

.login-form {
  border-radius: 6px;
  //background: #ffffff;
  width: 409px;
  //padding: 25px 25px 5px 25px;
  margin-top: 123px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .el-input {
    height: 40px;

    input {
      height: 40px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}


.login-page {
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: left top;
  overflow: hidden;
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

//根据需求自行修改这个类名的样式，其他样式必须添加
.login-content {
  width: 533px;
  height: 624px;
  z-index: 2;
  position: absolute;
  top: 50%;
  left: 82%;
  transform: translate(-50%, -50%);
  border-width: 0px;
  background: url("../assets/login-img/智慧云管理平台登录框.png");
  background-size: 100%;
  background-repeat: no-repeat;
  //background-size: 100% auto;
  background-position: center;
  //display: flex;
  //justify-content: center;
  //align-items: center;
}
.loginType-icon {
  position: absolute;
  top: 55px;
  right: 20px;
}
.videoContainer {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -100;
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

.fillWidth {
  width: 100%;
}

.btn {
  width: 340px;
  height: 61px;
  background: url("../assets/login-img/登录按钮.png");
  background-size: 100%;
  background-repeat: no-repeat;
  //background-size: 100% auto;
  background-position: center;
  margin: 30px auto 0;
}

::v-deep .login-content .login-form .el-input {
  height: 61px;
  width: 340px;
  display: block;
  margin: 0 auto;
}

::v-deep .login-content .login-form .el-form-item {
  margin-bottom: 40px;
}

::v-deep .login-content .el-form-item__error {
  left: 35px;
}

::v-deep .login-content .el-input__inner {
  height: 61px;
  line-height: 61px;
  font-size: 22px;
  padding-left: 70px;
  color: #999ca1;
  background-color: transparent;
  border: none;
}

::v-deep .login-content .username-input .el-input__inner {
  background: url("../assets/login-img/账号.png") no-repeat center;
  background-size: 100% 100%;
}

::v-deep .login-content .username-input .el-input__inner:focus {
  background: url("../assets/login-img/账号-选择状态.png") no-repeat center;
  background-size: 100% 100%;
}

::v-deep .login-content .password-input .el-input__inner {
  background: url("../assets/login-img/密码.png") no-repeat center;
  margin-top: 20px;
  background-size: 100% 100%;
}

::v-deep .login-content .password-input .el-input__inner:focus {
  background: url("../assets/login-img/密码-选择状态.png") no-repeat center;
  background-size: 100% 100%;
  margin-top: 20px;
}

::v-deep .login-content .login-form .input-icon {
  height: 52px;
}

::v-deep .login-content .el-input__prefix, .el-input__suffix {

}

::v-deep .login-content .el-checkbox {
  color: #5FCECC;
  font-size: 20px;
}

::v-deep .login-content .el-checkbox__label {
  font-size: 20px;
}

::v-deep .login-content .el-checkbox__inner {
  width: 20px;
  height: 20px;
  background-color: #084E4F;
  border: 2px solid #37B1AF;
  //
}

::v-deep .login-content .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #084E4F;
  border: 2px solid #37B1AF;
}

::v-deep .login-content .el-checkbox__input.is-focus .el-checkbox__inner {
  border-color: #37B1AF;
}

::v-deep .login-content .el-checkbox__inner::after {
  height: 10px;
  left: 6px;
  top: 2px;
}

::v-deep .login-content .el-checkbox__input.is-checked + .el-checkbox__label {
  color: #5FCECC;
}
.qrCode {
  width: 280px;
  height: 280px;
}

.qrcode-error-mask {
  display: block;
  position: absolute;
  width: 300px;
  background: #000;
  filter: alpha(opacity=60);
  -moz-opacity: .6;
  opacity: .6;
  height: 300px;
  left: 0px;
  z-index: 9;
  top: 0;
  text-align: center;
  line-height: 100px;
}

.err-cont {
  position: absolute;
  //left: 50px;
  top: 100px;
  width: 100%;
  z-index: 19;
  font-weight: 700;
  color: #ffffff;
}

.refresh-btn {
  background: #e4393c;
  width: 80px;
  height: 30px;
  position: absolute;
  top: 155px;
  left: 110px;
  line-height: 30px;
  opacity: 1;
  z-index: 19;
  color: #fbfbfb;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
}
</style>
