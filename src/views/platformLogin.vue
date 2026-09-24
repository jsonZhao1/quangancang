<template>
  <div id="index" class="platform-login">
    <img class="platform-login__bg" :src="backgroundImg" alt="">
    <img
      v-click-sound
      class="platform-login__close"
      :src="closeImg"
      alt=""
      @click="closeApplication"
    >

    <img class="platform-login__title" :src="titleImg" alt="">

    <div class="platform-login__panel">
      <img class="platform-login__frame" :src="frameImg" alt="">
      <button
        v-click-sound
        class="platform-login__entry platform-login__entry--admin"
        type="button"
        aria-label="管理员"
        @mouseenter="adminActive = true"
        @mouseleave="adminActive = false"
        @click="goAdmin"
      >
        <img :src="adminActive ? adminActiveImg : adminImg" alt="管理员">
      </button>
      <button
        v-click-sound
        class="platform-login__entry platform-login__entry--worker"
        type="button"
        aria-label="工人版"
        @mouseenter="workerActive = true"
        @mouseleave="workerActive = false"
        @click="goWorker"
      >
        <img :src="workerActive ? workerActiveImg : workerImg" alt="工人版">
      </button>
    </div>

    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="activationDialogShowClose"
      :visible.sync="dialogVisible"
      append-to-body
      title="激活设备"
      top="30vh"
      width="30%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="demo-ruleForm" label-width="80px">
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="ruleForm.projectName" />
        </el-form-item>
        <el-form-item label="注册码" prop="registerCode">
          <div style="display: flex">
            <el-input v-model="ruleForm.registerCode" style="flex: 1" />
            <el-button type="primary" @click="getZhuCeMa">获取注册码</el-button>
          </div>
        </el-form-item>
        <el-form-item label="激活码" prop="activeCode">
          <el-input v-model="ruleForm.activeCode" type="textarea" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeApplication">退出</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui'
import backgroundImg from '@/assets/pingtai-img/登录/背景.png'
import frameImg from '@/assets/pingtai-img/登录/框.png'
import titleImg from '@/assets/pingtai-img/登录/全感舱管理平台.png'
import adminImg from '@/assets/pingtai-img/登录/管理员.png'
import adminActiveImg from '@/assets/pingtai-img/登录/管理员02.png'
import workerImg from '@/assets/pingtai-img/登录/工人版.png'
import workerActiveImg from '@/assets/pingtai-img/登录/工人版02.png'
import closeImg from '@/assets/images/close.png'

const PLATFORM_ROLE_KEY = 'platformRole'
const PLATFORM_ROLES = {
  admin: 'admin',
  worker: 'worker'
}
const { ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')
const store = new Store()

export default {
  name: 'PlatformLogin',
  data() {
    return {
      backgroundImg,
      frameImg,
      titleImg,
      adminImg,
      adminActiveImg,
      workerImg,
      workerActiveImg,
      closeImg,
      adminActive: false,
      workerActive: false,
      dialogVisible: false,
      activationDialogShowClose: (store.get('config') || {}).activationDialogShowClose !== false,
      ruleForm: {
        registerCode: null,
        activeCode: null,
        projectName: null
      },
      rules: {
        projectName: [
          { required: true, message: '请填写项目名称', trigger: 'blur' }
        ],
        registerCode: [
          { required: true, message: '请获取注册码', trigger: 'blur' }
        ],
        activeCode: [
          { required: true, message: '请填写激活码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.isActivation()
  },
  methods: {
    closeApplication() {
      ipcRenderer.send('close-window-request')
    },
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
    isActivation() {
      const activateData = store.get('activateData')

      if (!activateData) {
        this.dialogVisible = true
        return
      }

      this.ruleForm = {
        registerCode: activateData.registerCode || null,
        activeCode: activateData.activeCode || null,
        projectName: activateData.projectName || null
      }
      this.dialogVisible = false
    },
    getZhuCeMa() {
      this.ruleForm.registerCode = ''
      ipcRenderer.removeAllListeners('send_registerCode_data')
      ipcRenderer.once('send_registerCode_data', (event, data) => {
        const newData = new TextDecoder().decode(data)
        const errorMessage = this.getActivationErrorMessage(newData)
        if (errorMessage) {
          Message({ message: errorMessage, type: 'warning' })
          return
        }
        this.ruleForm.registerCode = newData.split('&')[1] || ''
      })
      ipcRenderer.send('get_registerCode_data', 'registrationCode&12321')
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          ipcRenderer.removeAllListeners('send_activate_data')
          ipcRenderer.once('send_activate_data', (event, data) => {
            const newData = new TextDecoder().decode(data)
            const errorMessage = this.getActivationErrorMessage(newData)
            if (errorMessage) {
              Message({ message: errorMessage, type: 'warning' })
              return
            }
            if (this.isActivationSuccess(newData)) {
              this.dialogVisible = false
              store.set('activateData', this.ruleForm)
              const newData2 = newData.split('&')[1] || newData
              Message({
                message: newData2,
                type: 'success'
              })
            } else {
              Message({ message: '激活失败', type: 'warning' })
            }
          })
          ipcRenderer.send('get_activate_data', `Unityactivation&${this.ruleForm.activeCode}+${this.ruleForm.projectName}`)
        }
      })
    },
    goAdmin() {
      this.adminActive = true
      localStorage.setItem(PLATFORM_ROLE_KEY, PLATFORM_ROLES.admin)
      this.$router.push('/home')
    },
    goWorker() {
      this.workerActive = true
      localStorage.setItem(PLATFORM_ROLE_KEY, PLATFORM_ROLES.worker)
      this.$router.push('/home')
    }
  }
}
</script>

<style lang="scss" scoped>
.platform-login {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  user-select: none;
}

.platform-login__bg {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.platform-login__panel {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1013px;
  height: 615px;
  transform: translate(-50%, -50%);
}

.platform-login__close {
  position: absolute;
  top: 10px;
  right: 30px;
  width: 84px;
  height: 101px;
  cursor: pointer;
  z-index: 2;
}

.platform-login__title {
  position: absolute;
  top: 54px;
  left: 50%;
  display: block;
  width: 685px;
  height: 165px;
  transform: translateX(-50%);
  z-index: 2;
}

.platform-login__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.platform-login__entry {
  position: absolute;
  left: 50%;
  width: 590px;
  height: 195px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transform: translateX(-50%);

  img {
    display: block;
    width: 100%;
    height: 100%;
  }
}

.platform-login__entry--admin {
  top: 83px;
}

.platform-login__entry--worker {
  top: 331px;
}
</style>
