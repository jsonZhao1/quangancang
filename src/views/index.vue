<template>
  <div class="login-page" id="index" ref="appRef">
    <img
      v-click-sound
      v-remote-key
      class="index-back-button"
      style="width: 97px;height: 93px;position: absolute;right: 30px;top: 10px;cursor: pointer;"
      src="@/assets/pingtai-img/登录/返回.png"
      @click="close"
    >
    <div class="Container">
      <div class="bg">
        <div class="top-title">
          <img style="width: 300px;height: 100px;" src="@/assets/pingtai-img/管理平台.png" alt="">
        </div>

        <div class="content">
          <div v-show="type === 1" class="top-type-tabs">
            <div
              v-for="option in visibleCategoryOptions"
              :key="option.value"
              :class="{ active: topType === option.value }"
              class="top-type-tab"
              v-remote-key
              @focus="changeTopType(option.value)"
              @click="changeTopType(option.value)"
            >
              <span>{{ option.label }}</span>
            </div>
          </div>
          <div class="left">
            <div class="left-top">
              <img style="width: 219px;height: 46px;cursor: pointer;" src="@/assets/pingtai-img/新增.png" alt="" v-remote-key @click="addItem">
            </div>

            <div class="left-content">
              <div class="item" v-for="(item, index) in paginatedSoftwareList" :key="item.id || index"
                :style="{ backgroundImage: `url('${item.imgUrl.replace(/\\/g, '/')}')`, backgroundSize: '100% 100%' }"
                v-remote-key
                @click.self="handleItemClick(item)">
                <!-- <div class="name-tip">{{item.name}}</div> -->
                <div class="edit" @click.stop="edit(item)"></div>
                <div class="del" @click.stop="del(item)"></div>
              </div>
            </div>

            <div class="left-foots" v-if="totalPages > 1">
              <div class="last" v-remote-key @click="prevPage"></div>
              <div class="page-info">{{ currentPage }} / {{ totalPages }}</div>
              <div class="next" v-remote-key @click="nextPage"></div>
            </div>

          </div>
          <div class="right">
            <div :class="{ active: type === 0 }" class="right-button-JC" v-remote-key @focus="changeType(0)" @click="changeType(0)"></div>
            <div :class="{ active: type === 1 }" class="right-button-VR" v-remote-key @focus="changeType(1)" @click="changeType(1)"></div>
            <div
              v-if="currentRole === 'admin'"
              :class="{ active: type === 2 }"
              class="right-button-SB"
              v-remote-key
              @focus="changeType(2)"
              @click="changeType(2)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除弹窗 -->
    <div class="del-dialog" v-show="deldialog">
      <div class="tip">提示</div>
      <div class="center">确定要删除此软件吗？</div>
      <div class="foot">
        <div class="confirm" v-remote-key @click="confirmDel"></div>
        <div class="cancel" v-remote-key @click="deldialog = false"></div>
      </div>
    </div>

    <!-- 新增弹窗 -->
    <div class="add-dialog" v-show="addDialogVisible">
      <div class="tip">
        <div>{{ currentEditId ? '编辑' : '新增' }}</div>
        <img class="add-close" src=".././assets/pingtai-img/CLOSE.png" alt="" v-remote-key @click="closeAdd">
      </div>
      <div class="center">
        <el-form :model="form" :rules="rules" ref="addform" label-width="150px">
          <el-form-item label="软件图标" prop="imgUrl">
            <div class="icon-upload-area">
              <div class="icon-box">
                <img v-if="form.imgUrl" :src="form.imgUrl" alt="">
                <img v-else src=".././assets/pingtai-img/图标位置.png" alt="">
              </div>
              <el-upload class="icon-upload" :action="actionUrl" ref="courseFormImgUpload" :file-list="imgFileList"
                :accept="imgAccept" :auto-upload="false" :show-file-list="false" :on-success="uploadImgSuccess"
                :on-error="uploadImgError" :on-change="imgfileChange">
                <el-button class="upload-btn" type="primary"></el-button>
              </el-upload>
            </div>
          </el-form-item>
          <div style="display: flex;">
            <el-form-item
              :label="type === 2 ? '硬件指令' : '软件编号'"
              prop="softNumber"
              style="margin-right: 20px;"
            >
              <el-select
                v-if="type === 2"
                v-model="form.softNumber"
                class="file-path-input"
                style="width: 250px; height: 74px; display: inline-block;"
                size="small"
                placeholder=""
              >
                <el-option
                  v-for="option in hardwareCommandOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-input
                v-else
                v-model="form.softNumber"
                class="file-path-input"
                style="width: 250px; height: 74px; display: inline-block;"
                size="small"
                placeholder=""
              ></el-input>
            </el-form-item>
            <el-form-item label="软件名称" prop="name">
              <el-input class="file-path-input" style="width: 250px; height: 74px; display: inline-block;"
                v-model="form.name" size="small" placeholder=""></el-input>
            </el-form-item>
          </div>
          <el-form-item
            v-if="type === 1"
            label="分类"
            prop="category"
          >
            <el-select
              v-model="form.category"
              class="file-path-input"
              style="width: 250px; height: 74px; display: inline-block;"
              size="small"
              placeholder=""
            >
              <el-option
                v-for="option in categoryOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="type !== 2"
            label="运行文件"
            prop="runFilePath"
          >
            <el-input class="file-path-input" style="width: 565px; height: 74px; display: inline-block;"
              :disabled="true" v-model="form.runFilePath" size="small" placeholder=""></el-input>
            <el-upload class="run-upload" style="display: inline-block;" :action="actionUrl" ref="runFileUpload"
              :file-list="runFileList" :accept="runFileAccept" :auto-upload="false" :show-file-list="false"
              :on-success="uploadRunFileSuccess" :on-error="uploadRunFileError" :on-change="runFileChange" :limit="1">
              <el-button class="upload-btn" type="primary" style="margin-top: 17px;"></el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <div class="foot">
        <div class="cancel" v-remote-key @click="confirmAdd"></div>
      </div>
    </div>

    <!-- 硬件控制弹窗 -->
    <div
      v-show="hardwareDialogVisible"
      class="hardware-dialog"
    >
      <img
        class="hardware-close"
        src=".././assets/pingtai-img/CLOSE.png"
        alt=""
        v-remote-key
        @click="closeHardwareDialog"
      >
      <div class="tip">
        <div>{{ currentHardwareCommand ? currentHardwareCommand.label : '硬件控制' }}</div>
      </div>
      <div class="center">
        <div class="hardware-control-content">
          <div class="hardware-status">{{ hardwareStatusText }}</div>
          <div
            v-if="isCurrentHardwareLevelCommand"
            class="hardware-level-control"
          >
            <div
              class="hardware-level-btn"
              v-remote-key
              @click="removeHardwareLevel"
            >-</div>
            <div class="hardware-level-value">挡位 {{ hardwareLevel }}</div>
            <div
              class="hardware-level-btn"
              v-remote-key
              @click="addHardwareLevel"
            >+</div>
          </div>
        </div>
      </div>
      <div class="foot">
        <div
          class="start"
          v-remote-key
          @click="startHardware"
        >开始</div>
        <div
          class="stop"
          v-remote-key
          @click="stopHardwareByDialog"
        >结束</div>
      </div>
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

    <!-- 弹窗遮罩 -->
    <div
      v-show="tabSettingsDialogVisible"
      class="tab-settings-dialog"
    >
      <div class="tip">
        <div>显示设置</div>
        <img class="tab-settings-close" src=".././assets/pingtai-img/CLOSE.png" alt="" v-remote-key @click="closeTabSettings">
      </div>
      <div class="center">
        <el-checkbox-group v-model="draftTopTypeVisibleValues" class="tab-settings-list">
          <el-checkbox
            v-for="option in categoryOptions"
            :key="option.value"
            :label="option.value"
            class="tab-settings-item"
            v-remote-key
          >
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="foot">
        <button class="tab-settings-confirm" @click="saveTabSettings"></button>
        <button class="tab-settings-cancel" @click="closeTabSettings"></button>
      </div>
    </div>

    <div class="config-actions">
      <button class="config-action" @click="handleExportConfig">导出配置</button>
      <button class="config-action" @click="handleImportConfig">导入配置</button>
      <button class="config-action" @click="openTabSettings">显示设置</button>
    </div>
    <div class="mask" v-show="deldialog || addDialogVisible || hardwareDialogVisible || tabSettingsDialogVisible"></div>
  </div>
</template>

<script>
import { db } from '@/dexie'
import { Message } from 'element-ui'
import { MessageBox } from 'element-ui'
import dianGang from '@/utils/dianGang'
import hardwareSerial from '@/utils/hardwareSerial'
import { exportConfigPackage, importConfigPackage } from '@/utils/configTransfer'
import {
  HARDWARE_COMMAND_OPTIONS,
  buildHardwareCommands,
  buildHardwareStopCommands,
  getHardwareCommand,
  isLevelHardwareCommand
} from '@/utils/hardwareCommands'

const { ipcRenderer, remote } = window.require('electron')
const fs = window.require('fs')
const path = window.require('path')
const Store = window.require('electron-store')
const store = new Store()
const DEFAULT_TOP_TYPE_VISIBLE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const PLATFORM_ROLE_KEY = 'platformRole'
const PLATFORM_ROLES = ['admin', 'worker']
const DEFAULT_PLATFORM_ROLE = 'worker'
export default {
  name: 'StandaloneManager',
  data() {
    const appConfig = store.get('config') || {}
    const savedTopTypeVisibleValues = store.get('topTypeVisibleValues') || appConfig.topTypeVisibleValues

    return {
      loading: false,
      redirect: undefined,
      currentRole: this.getCurrentRole(),
      dialogVisible: false,
      activationDialogShowClose: (store.get('config') || {}).activationDialogShowClose !== false,
      ruleForm: {
        registerCode: null,
        activeCode: null,
        projectName: null
      },
      form: {
        imgUrl: '',
        runFilePath: '',
        softNumber: '',
        name: '',
        category: 1
      },
      softwareList: [],
      categoryOptions: [
        { label: '高处坠落', value: 1 },
        { label: '物体打击', value: 2 },
        { label: '火灾伤害', value: 3 },
        { label: '触电伤害', value: 4 },
        { label: '起重伤害', value: 5 },
        { label: '坍塌伤害', value: 6 },
        { label: '机械伤害', value: 7 },
        { label: '爆炸伤害', value: 8 },
        { label: '交通伤害', value: 9 },
        { label: '淹溺伤害', value: 10 }
      ],
      hardwareCommandOptions: HARDWARE_COMMAND_OPTIONS,
      hardwareLevel: 1,
      hardwareDialogVisible: false,
      hardwareRunning: false,
      hardwareSwitching: false,
      dianGangShakeStopRequested: false,
      dianGangActionToken: 0,
      currentHardwareItem: null,
      currentHardwareCommand: null,
      currentDelId: null,
      currentEditId: null,
      currentEditStarTimer: null,
      topType: 1,
      topTypeVisibleValues: Array.isArray(savedTopTypeVisibleValues)
        ? savedTopTypeVisibleValues.map(value => Number(value))
        : DEFAULT_TOP_TYPE_VISIBLE_VALUES.slice(),
      draftTopTypeVisibleValues: [],
      tabSettingsDialogVisible: false,
      // 列表类型
      type: 0,
      currentPage: 1,
      pageSize: 18,
      deldialog: false,
      addDialogVisible: false,
      rules: {
        projectName: [
          { required: true, message: '请填写项目名称', trigger: 'blur' }
        ],
        registerCode: [
          { required: true, message: '请获取注册码', trigger: 'blur' }
        ],
        activeCode: [
          { required: true, message: '请填写激活码', trigger: 'blur' }
        ],
        imgUrl: [
          { required: true, message: '封面图片不能为空', trigger: 'blur' }
        ],
        softNumber: [
          { required: true, message: '软件编号不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '软件名称不能为空', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择分类', trigger: 'change' }
        ],
        runFilePath: [
          {
            validator: (rule, value, callback) => {
              if (this.type !== 2 && !value) {
                callback(new Error('运行文件不能为空'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ]
      },
      actionUrl: '',
      imgFileList: [],
      imgAccept: '.png,.jpg,.jpeg',
      runFileList: [],
      runFileAccept: '.exe'
    }
  },
  computed: {
    visibleCategoryOptions() {
      const visibleValueSet = new Set(this.topTypeVisibleValues.map(value => Number(value)))
      const options = this.categoryOptions.filter(option => visibleValueSet.has(option.value))

      return options.length ? options : this.categoryOptions
    },
    filteredSoftwareList() {
      return this.softwareList.filter(item => {
        if (Number(item.type) !== this.type) {
          return false
        }

        if (this.type === 1) {
          return Number(item.category || 1) === this.topType
        }

        return true
      })
    },
    paginatedSoftwareList() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSoftwareList.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredSoftwareList.length / this.pageSize) || 1
    },
    isCurrentHardwareLevelCommand() {
      return isLevelHardwareCommand(this.currentHardwareCommand)
    },
    currentHardwareMaxLevel() {
      if (!this.currentHardwareCommand || !this.currentHardwareCommand.maxLevel) {
        return 1
      }
      return this.currentHardwareCommand.maxLevel
    },
    hardwareStatusText() {
      if (this.hardwareSwitching) {
        return '切换中'
      }
      return this.hardwareRunning ? '运行中' : '未开始'
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
  mounted() {
    this.loadTabSettings()
    this.loadSoftware()
    ipcRenderer.on('config-imported', this.handleConfigImported)
  },
  activated() {

  },
  beforeDestroy() {
    ipcRenderer.removeListener('config-imported', this.handleConfigImported)

    if (this.currentHardwareCommand) {
      if (this.isDianGangCommand(this.currentHardwareCommand)) {
        this.dianGangShakeStopRequested = true
        this.dianGangActionToken += 1
      }

      const stopTask = this.isDianGangCommand(this.currentHardwareCommand)
        ? dianGang.stopAndReset()
        : hardwareSerial.sendControl(buildHardwareStopCommands(this.currentHardwareCommand))

      stopTask.catch(err => {
        console.error('退出页面时停止硬件失败：', err)
      }).finally(() => {
        if (this.isDianGangCommand(this.currentHardwareCommand)) {
          dianGang.release().catch(err => {
            console.error('释放电缸 UDP 通信失败：', err)
          })
        }
        hardwareSerial.close()
      })
      return
    }
    hardwareSerial.close()
  },
  methods: {
    getCurrentRole() {
      const role = localStorage.getItem(PLATFORM_ROLE_KEY)

      return PLATFORM_ROLES.indexOf(role) !== -1 ? role : DEFAULT_PLATFORM_ROLE
    },
    async ensureSoftwareRoleData(list) {
      const legacyList = list.filter(item => !item.role)

      if (!legacyList.length) {
        return list
      }

      await db.transaction('rw', db.Software, async() => {
        const workerCopies = legacyList.map(item => {
          const copy = {
            ...item,
            role: 'worker'
          }

          delete copy.id
          return copy
        })

        await Promise.all(legacyList.map(item => db.Software.update(item.id, { role: 'admin' })))
        await db.Software.bulkAdd(workerCopies)
      })

      return db.Software.toArray()
    },
    handleConfigImported() {
      this.currentPage = 1
      this.loadTabSettings()
      this.loadSoftware()
    },
    normalizeTopTypeVisibleValues(values) {
      const allowedValues = new Set(this.categoryOptions.map(option => option.value))
      const normalizedValues = Array.isArray(values)
        ? values.map(value => Number(value)).filter(value => allowedValues.has(value))
        : []

      return Array.from(new Set(normalizedValues))
    },
    getSavedTopTypeVisibleValues() {
      const appConfig = store.get('config') || {}
      const values = this.normalizeTopTypeVisibleValues(
        store.get('topTypeVisibleValues') || appConfig.topTypeVisibleValues
      )

      return values.length ? values : this.categoryOptions.map(option => option.value)
    },
    loadTabSettings() {
      this.topTypeVisibleValues = this.getSavedTopTypeVisibleValues()
      this.ensureVisibleTopType()
    },
    ensureVisibleTopType() {
      if (this.type !== 1) {
        return
      }

      if (this.visibleCategoryOptions.some(option => option.value === this.topType)) {
        return
      }

      this.topType = this.visibleCategoryOptions[0].value
      this.currentPage = 1
    },
    ensureRoleVisibleType() {
      if (this.currentRole === 'worker' && this.type === 2) {
        this.type = 0
        this.currentPage = 1
      }
    },
    writeAppConfigFile(config) {
      if (!config || !remote || !remote.app) {
        return
      }

      try {
        const configFilePath = path.join(remote.app.getPath('userData'), 'cfgApp.json')
        const configDir = path.dirname(configFilePath)

        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true })
        }
        fs.writeFileSync(configFilePath, JSON.stringify(config), 'utf-8')
      } catch (err) {
        console.error('Tab settings config file write failed:', err)
      }
    },
    openTabSettings() {
      this.draftTopTypeVisibleValues = this.topTypeVisibleValues.slice()
      this.tabSettingsDialogVisible = true
    },
    closeTabSettings() {
      this.tabSettingsDialogVisible = false
    },
    saveTabSettings() {
      const values = this.normalizeTopTypeVisibleValues(this.draftTopTypeVisibleValues)

      if (!values.length) {
        this.$message.warning('\u8bf7\u81f3\u5c11\u4fdd\u7559\u4e00\u4e2a\u9876\u90e8Tab')
        return
      }

      const appConfig = {
        ...(store.get('config') || {}),
        topTypeVisibleValues: values
      }

      store.set('config', appConfig)
      store.set('topTypeVisibleValues', values)
      this.writeAppConfigFile(appConfig)
      this.topTypeVisibleValues = values
      this.ensureVisibleTopType()
      this.tabSettingsDialogVisible = false
      this.$message.success('已保存')
    },
    handleExportConfig() {
      exportConfigPackage().then(result => {
        if (!result) {
          return
        }
        this.$message.success(`配置导出成功：${result.exportDir}`)
      }).catch(err => {
        console.error('配置导出失败：', err)
        this.$message.error(err.message || '配置导出失败')
      })
    },
    handleImportConfig() {
      MessageBox.confirm('导入会替换当前电脑上的配置和业务数据，是否继续？', '提示', {
        confirmButtonText: '继续导入',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return importConfigPackage()
      }).then(result => {
        if (!result) {
          return
        }
        this.currentPage = 1
        this.loadTabSettings()
        this.loadSoftware()
        this.$message.success('配置导入成功')
      }).catch(err => {
        if (err === 'cancel' || err === 'close') {
          return
        }
        console.error('配置导入失败：', err)
        this.$message.error(err.message || '配置导入失败')
      })
    },
    closeApplication() {
      MessageBox.confirm('确定退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ipcRenderer.send('close-window-request')
      }).catch(() => {})
    },
    goLogin() {
      this.$router.push('/login')
    },
    handleItemClick(item) {
      if (Number(item.type) === 2) {
        this.runHardware(item)
        return
      }

      this.runLocalProgram(item)
    },
    runHardware(item) {
      const command = getHardwareCommand(item.softNumber)
      console.log('点击硬件项目：', item)
      console.log('匹配到的硬件指令配置：', command)

      if (!command) {
        this.$message.warning('未找到硬件指令配置')
        return
      }

      this.currentHardwareItem = item
      this.currentHardwareCommand = command
      this.hardwareLevel = command.minLevel || 1
      this.hardwareRunning = false
      this.hardwareSwitching = false
      this.dianGangShakeStopRequested = false
      this.hardwareDialogVisible = true
    },
    isDianGangCommand(command) {
      return Boolean(command && command.type === 'dianGang')
    },
    startDianGangHardware() {
      const command = this.currentHardwareCommand
      const actionToken = this.dianGangActionToken + 1
      const appConfig = store.get('config') || {}
      const commonOptions = {
        minLengthCm: Number(appConfig.dianGangMinLengthCm) || command.minLengthCm || 1,
        maxLengthCm: Number(appConfig.dianGangMaxLengthCm) || command.maxLengthCm || 9,
        lowLengthCm: command.minLengthCm || 1,
        highLengthCm: command.maxLengthCm || 9
      }

      this.dianGangActionToken = actionToken
      this.dianGangShakeStopRequested = false

      if (command.effect === 'fall') {
        console.log('准备启动电缸坠落效果：', {
          upTimeMs: command.upTimeMs,
          downTimeMs: command.downTimeMs,
          ...commonOptions
        })

        this.hardwareRunning = true
        this.hardwareSwitching = true

        return dianGang.fallEffect({
          ...commonOptions,
          upTimeMs: command.upTimeMs || 1000,
          downTimeMs: command.downTimeMs || 120
        }).then(() => {
          if (this.dianGangActionToken !== actionToken) {
            return
          }

          this.hardwareSwitching = false
          this.$message.success('电缸坠落效果完成，请手动结束或关闭后复位')
        }).catch(err => {
          this.hardwareRunning = false
          this.hardwareSwitching = false
          console.error('电缸坠落效果执行失败：', err)
          this.$message.error(err.message || '电缸坠落效果执行失败')
        })
      }

      if (command.effect === 'shake') {
        const shakeOptions = {
          ...commonOptions,
          lowLengthCm: Number(appConfig.dianGangShakeLowLengthCm) || command.shakeLowLengthCm || 3,
          highLengthCm: Number(appConfig.dianGangShakeHighLengthCm) || command.shakeHighLengthCm || 5,
          stepTimeMs: Number(appConfig.dianGangShakeStepTimeMs) || command.stepTimeMs || 300,
          stopLevelCm: Number(appConfig.dianGangShakeLowLengthCm) || command.stopLevelCm || 3,
          stopLevelTimeMs: command.stopLevelTimeMs || 1200,
          stopDownTimeMs: command.stopDownTimeMs || 1200,
          stopConfirmTimeMs: command.stopConfirmTimeMs || 300,
          rounds: command.rounds || 1
        }

        console.log('准备启动电缸晃动效果：', {
          stepTimeMs: shakeOptions.stepTimeMs,
          rounds: shakeOptions.rounds,
          lowLengthCm: shakeOptions.lowLengthCm,
          highLengthCm: shakeOptions.highLengthCm,
          ...commonOptions
        })

        this.hardwareRunning = true
        this.$message.success('电缸晃动效果已启动')

        return this.runDianGangMoveStep(
          [shakeOptions.lowLengthCm, shakeOptions.lowLengthCm, shakeOptions.lowLengthCm],
          shakeOptions.stepTimeMs,
          '晃动初始上升到低位',
          shakeOptions
        ).then(() => {
          if (!this.isCurrentDianGangAction(actionToken)) {
            return
          }

          return this.runDianGangShakeLoop(shakeOptions, actionToken)
        })
      }

      return Promise.reject(new Error('未知电缸动作配置'))
    },
    waitDianGangStep(timeMs) {
      return new Promise(resolve => {
        window.setTimeout(resolve, Math.max(1, Number(timeMs) || 1))
      })
    },
    isCurrentDianGangAction(actionToken) {
      return !this.dianGangShakeStopRequested && this.dianGangActionToken === actionToken
    },
    buildDianGangShakeSteps(options) {
      const lowLengthCm = options.lowLengthCm
      const highLengthCm = options.highLengthCm
      const rounds = Math.max(1, Number(options.rounds || 1))
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

      return steps
    },
    runDianGangMoveStep(lengths, timeMs, label, options) {
      console.log(`准备执行电缸${label}动作：`, {
        timeMs,
        lengths
      })

      return dianGang.moveRelativeMs({
        timeMs,
        lengths,
        minLengthCm: options.minLengthCm,
        maxLengthCm: options.maxLengthCm
      }).then(result => this.waitDianGangStep(timeMs).then(() => result))
    },
    runDianGangShakeLoop(options, actionToken) {
      if (!this.isCurrentDianGangAction(actionToken)) {
        console.log('电缸晃动循环已停止')
        return Promise.resolve()
      }

      const steps = this.buildDianGangShakeSteps(options)

      return steps.reduce((chain, lengths, index) => chain.then(() => {
        if (!this.isCurrentDianGangAction(actionToken)) {
          return
        }

        return this.runDianGangMoveStep(lengths, options.stepTimeMs, `晃动第 ${index + 1} 步`, options)
      }), Promise.resolve()).then(() => this.runDianGangShakeLoop(options, actionToken)).catch(err => {
        if (!this.isCurrentDianGangAction(actionToken)) {
          return
        }

        this.hardwareRunning = false
        console.error('电缸晃动效果执行失败：', err)
        this.$message.error(err.message || '电缸晃动效果执行失败')
      })
    },
    stopDianGangHardware() {
      const command = this.currentHardwareCommand
      this.dianGangShakeStopRequested = true
      this.dianGangActionToken += 1
      this.hardwareSwitching = true

      if (command && command.effect === 'shake') {
        const appConfig = store.get('config') || {}
        const minLengthCm = command.minLengthCm || 1
        const maxLengthCm = command.maxLengthCm || 9
        const stopLevelCm = Number(appConfig.dianGangShakeLowLengthCm) || command.stopLevelCm || 3
        const commonOptions = {
          minLengthCm,
          maxLengthCm
        }

        console.log('准备结束电缸晃动：先三轴收平到中间高度，再一起降到低位，确认低位后复位')
        return this.runDianGangMoveStep(
          [stopLevelCm, stopLevelCm, stopLevelCm],
          command.stopLevelTimeMs || 1200,
          '晃动收平',
          commonOptions
        ).then(() => this.runDianGangMoveStep(
          [minLengthCm, minLengthCm, minLengthCm],
          command.stopDownTimeMs || 1200,
          '晃动整体下降',
          commonOptions
        )).then(() => this.runDianGangMoveStep(
          [minLengthCm, minLengthCm, minLengthCm],
          command.stopConfirmTimeMs || 300,
          '晃动低位确认',
          commonOptions
        ))
      }

      console.log('准备结束电缸：发送急停，复位等关闭弹窗时执行')
      return dianGang.stop()
    },
    startHardware() {
      if (!this.currentHardwareCommand) {
        this.$message.warning('未选择硬件指令')
        return
      }
      if (this.hardwareSwitching) {
        return
      }

      if (this.isDianGangCommand(this.currentHardwareCommand)) {
        this.startDianGangHardware().catch(err => {
          console.error('电缸启动指令发送失败：', err)
          this.$message.error(err.message || '电缸指令发送失败')
        })
        return
      }

      const commands = buildHardwareCommands(this.currentHardwareCommand, this.hardwareLevel)
      console.log('准备启动硬件项目：', this.currentHardwareItem)
      console.log('当前硬件指令配置：', this.currentHardwareCommand)
      console.log('当前硬件档位：', this.hardwareLevel)
      console.log('即将发送的硬件启动指令：', commands)

      return hardwareSerial.sendControl(commands).then(() => {
        this.hardwareRunning = true
        this.$message.success('硬件指令已发送')
      }).catch(err => {
        console.error('硬件启动指令发送失败：', err)
        this.$message.error(err.message || '硬件指令发送失败')
      })
    },
    stopHardwareByDialog() {
      this.stopHardware({
        closeSerialAfterStop: !this.isDianGangCommand(this.currentHardwareCommand)
      })
    },
    stopHardware(options = {}) {
      const closeSerialAfterStop = Boolean(options.closeSerialAfterStop)

      if (!this.currentHardwareCommand) {
        this.hardwareDialogVisible = false
        if (closeSerialAfterStop) {
          hardwareSerial.close()
        }
        return
      }
      if (this.hardwareSwitching) {
        return
      }

      if (this.isDianGangCommand(this.currentHardwareCommand)) {
        const successMessage = this.currentHardwareCommand.effect === 'shake'
          ? '电缸晃动已结束，已整体降到低位，请手动关闭后复位'
          : '电缸已结束，请手动关闭后复位'

        this.stopDianGangHardware().then(() => {
          this.hardwareRunning = false
          this.$message.success(successMessage)
          this.hardwareSwitching = false
          return dianGang.release().catch(err => {
            console.error('释放电缸 UDP 通信失败：', err)
          })
        }).catch(err => {
          console.error('电缸结束复位失败：', err)
          this.hardwareSwitching = false
          this.$message.error(err.message || '电缸结束复位失败')
        })
        return
      }

      const commands = buildHardwareStopCommands(this.currentHardwareCommand)
      console.log('准备停止硬件项目：', this.currentHardwareItem)
      console.log('即将发送的硬件停止指令：', commands)

      return hardwareSerial.sendControl(commands).then(() => {
        this.hardwareRunning = false
        this.$message.success('硬件指令已结束')
        this.hardwareDialogVisible = false
        this.hardwareSwitching = false
        this.currentHardwareItem = null
        this.currentHardwareCommand = null
      }).catch(err => {
        console.error(err)
        this.$message.error(err.message || '硬件结束指令发送失败')
      }).finally(() => {
        if (closeSerialAfterStop) {
          hardwareSerial.close()
        }
      })
    },
    finishCloseHardwareDialog() {
      hardwareSerial.close()
      if (this.isDianGangCommand(this.currentHardwareCommand)) {
        dianGang.release().catch(err => {
          console.error('释放电缸 UDP 通信失败：', err)
        })
      }
      this.hardwareDialogVisible = false
      this.currentHardwareItem = null
      this.currentHardwareCommand = null
      this.hardwareRunning = false
      this.hardwareSwitching = false
      this.dianGangShakeStopRequested = true
    },
    closeDianGangDialogWithReset() {
      this.hardwareSwitching = true
      const loading = this.$loading({
        lock: true,
        text: '\u7535\u7f38\u590d\u4f4d\u4e2d\uff0c\u8bf7\u7a0d\u5019...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })

      const stopTask = this.hardwareRunning
        ? this.stopDianGangHardware()
        : Promise.resolve()

      stopTask.then(() => {
        console.log('关闭电缸弹窗：发送复位指令')
        return dianGang.reset()
      }).then(() => {
        return this.waitDianGangStep(5000)
      }).then(() => {
        this.$message.success('电缸已复位')
        this.finishCloseHardwareDialog()
      }).catch(err => {
        console.error('关闭电缸弹窗复位失败：', err)
        this.hardwareSwitching = false
        this.$message.error(err.message || '电缸复位失败')
      }).finally(() => {
        loading.close()
      })
    },
    closeHardwareDialog() {
      if (this.hardwareSwitching) {
        return
      }

      if (this.isDianGangCommand(this.currentHardwareCommand)) {
        this.closeDianGangDialogWithReset()
        return
      }

      if (this.hardwareRunning) {
        this.stopHardware({ closeSerialAfterStop: true })
        return
      }

      this.finishCloseHardwareDialog()
    },
    removeHardwareLevel() {
      if (this.hardwareLevel <= 1) {
        return
      }
      this.changeHardwareLevel(this.hardwareLevel - 1)
    },
    addHardwareLevel() {
      if (this.hardwareLevel >= this.currentHardwareMaxLevel) {
        return
      }
      this.changeHardwareLevel(this.hardwareLevel + 1)
    },
    changeHardwareLevel(level) {
      const nextLevel = Math.min(this.currentHardwareMaxLevel, Math.max(1, level))

      if (nextLevel === this.hardwareLevel || this.hardwareSwitching) {
        return
      }

      if (!this.hardwareRunning) {
        this.hardwareLevel = nextLevel
        return
      }

      this.switchRunningHardwareLevel(nextLevel)
    },
    switchRunningHardwareLevel(nextLevel) {
      const stopCommands = buildHardwareStopCommands(this.currentHardwareCommand)
      const startCommands = buildHardwareCommands(this.currentHardwareCommand, nextLevel)
      this.hardwareSwitching = true

      console.log('硬件档位切换：当前档位', this.hardwareLevel)
      console.log('硬件档位切换：目标档位', nextLevel)
      console.log('档位切换时先发送停止指令：', stopCommands)
      console.log('档位切换时再发送启动指令：', startCommands)

      hardwareSerial.sendControl(stopCommands).then(() => {
        return hardwareSerial.sendControl(startCommands)
      }).then(() => {
        this.hardwareLevel = nextLevel
        this.hardwareRunning = true
        this.hardwareSwitching = false
        this.$message.success('硬件挡位已切换')
      }).catch(err => {
        this.hardwareSwitching = false
        console.error('硬件档位切换失败：', err)
        this.$message.error(err.message || '硬件挡位切换失败')
      })
    },
    runLocalProgram(item) {
      if (!item.runFilePath) {
        this.$message.warning('该软件没有配置运行路径')
        return
      }
      const loading = this.$loading({
        lock: true,
        text: '正在启动程序...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      const { exec } = window.require('child_process')
      exec(`"${item.runFilePath}"`, err => {
        if (err) {
          loading.close()
          console.error('启动本地程序失败：', err)
          this.$message.error('启动失败')
        }
      })
      setTimeout(() => {
        loading.close()
      }, 3000)
    },
    changeType(val) {
      if (this.currentRole === 'worker' && val === 2) {
        return
      }

      if (this.type === val) {
        return
      }

      if (this.isDianGangCommand(this.currentHardwareCommand)) {
        this.type = val
        this.currentPage = 1
        this.ensureVisibleTopType()
        this.ensureRoleVisibleType()
        this.closeDianGangDialogWithReset()
        return
      }

      if (this.hardwareRunning && this.currentHardwareCommand) {
        this.stopHardware()
      }
      this.type = val
      this.currentPage = 1
      this.ensureVisibleTopType()
      this.ensureRoleVisibleType()
      this.hardwareDialogVisible = false
    },
    changeTopType(val) {
      if (this.type === 1 && this.topType === val) {
        return
      }

      this.topType = val
      this.currentPage = 1
      this.changeType(1)
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    addItem() {
      this.currentEditId = null
      this.currentEditStarTimer = null
      this.form = {
        imgUrl: '',
        runFilePath: '',
        softNumber: '',
        name: '',
        category: this.type === 1 ? this.topType : 1
      }
      this.addDialogVisible = true
    },
    // 编辑
    edit(item) {
      const itemType = Number(item.type)
      const itemCategory = Number(item.category || 1)
      this.currentEditId = item.id
      this.currentEditStarTimer = item.starTimer
      this.type = itemType

      if (itemType === 1) {
        this.topType = itemCategory
      }

      this.form = {
        imgUrl: item.imgUrl || '',
        runFilePath: item.runFilePath || '',
        softNumber: item.softNumber || '',
        name: item.name || '',
        category: itemCategory
      }
      this.addDialogVisible = true
    },
    // 删除
    del(item) {
      this.currentDelId = item.id
      this.deldialog = true
    },

    // 删除一项
    confirmDel() {
      if (this.currentDelId) {
        db.Software.delete(this.currentDelId).then(() => {
          this.loadSoftware()
          this.deldialog = false
          this.currentDelId = null
        })
      } else {
        this.deldialog = false
      }
    },
    closeAdd() {
      this.addDialogVisible = false
      this.$refs.addform.resetFields()
      this.currentEditId = null
      this.currentEditStarTimer = null
      this.form = {
        imgUrl: '',
        runFilePath: '',
        softNumber: '',
        name: '',
        category: this.topType
      }
      this.imgFileList = []
      this.runFileList = []
    },
    // 新增确认
    confirmAdd() {
      this.$refs.addform.validate(valid => {
        if (!valid) {
          return
        }
        const starTimer = new Date().toISOString().slice(0, 10)
        const selectedCategory = Number(this.form.category)
        const formData = {
          imgUrl: this.form.imgUrl,
          runFilePath: this.type !== 2 ? this.form.runFilePath : '',
          softNumber: this.form.softNumber,
          name: this.form.name,
          type: this.type,
          category: this.type === 1 ? selectedCategory : null,
          role: this.currentRole,
          starTimer: this.currentEditStarTimer || starTimer
        }
        const saveTask = this.currentEditId
          ? db.Software.update(this.currentEditId, formData)
          : db.Software.bulkPut([formData])

        saveTask.then(() => {
          if (this.type === 1) {
            this.topType = selectedCategory
          }
          this.loadSoftware()
          this.closeAdd()
        })
      })
    },
    uploadImgSuccess(response) {
      if (this.loading) {
        this.loading.close()
      }
      if (response && response.code === 200) {
        this.$message({
          message: '上传成功',
          type: 'success'
        })
      } else {
        this.$message.error('上传失败')
      }
    },
    uploadImgError() {
      if (this.loading) {
        this.loading.close()
      }
      this.$message.error('上传失败')
    },
    imgfileChange(file, fileList) {
      this.imgFileList = fileList.slice(-1)
      if (file && file.raw && file.raw.path) {
        this.form.imgUrl = file.raw.path
      }
      this.$nextTick(() => {
        if (this.$refs.courseFormImgUpload) {
          this.$refs.courseFormImgUpload.clearFiles()
        }
        this.imgFileList = []
      })
    },
    loadSoftware() {
      db.Software.toArray().then(list => {
        return this.ensureSoftwareRoleData(list)
      }).then(list => {
        this.currentRole = this.getCurrentRole()
        this.ensureRoleVisibleType()
        this.softwareList = list
          .filter(item => item.role === this.currentRole)
          .map(item => ({
            ...item,
            type: Number(item.type),
            category: Number(item.category || 1)
          }))
        console.log('Software list', list)
        this.$nextTick(() => {
          if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages)
          }
        })
      })
    },
    uploadRunFileSuccess(response) {
      if (this.loading) {
        this.loading.close()
      }
      if (response && response.code === 200) {
        this.$message({
          message: '上传成功',
          type: 'success'
        })
      } else {
        this.$message.error('上传失败')
      }
    },
    uploadRunFileError() {
      if (this.loading) {
        this.loading.close()
      }
      this.$message.error('上传失败')
    },
    runFileChange(file, fileList) {
      this.runFileList = fileList.slice(-1)
      if (file && file.raw && file.raw.path) {
        this.form.runFilePath = file.raw.path
      }
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
        console.log(this.ruleForm.registerCode)
      })
      ipcRenderer.send('get_registerCode_data', 'registrationCode&12321')
    },
    submitForm() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          ipcRenderer.removeAllListeners('send_activate_data')
          ipcRenderer.once('send_activate_data', (event, data) => {
            console.log(new TextDecoder().decode(data))
            const newData = new TextDecoder().decode(data)
            const errorMessage = this.getActivationErrorMessage(newData)
            if (errorMessage) {
              Message({ message: errorMessage, type: 'warning' })
              return
            }
            if (this.isActivationSuccess(newData)) {
              this.dialogVisible = false
              store.set('activateData', this.ruleForm)
              // projectActive(this.ruleForm).then(res=>{
              //   this.dialogVisible2 = false
              // }).catch(err=>{
              //   this.dialogVisible2 = false
              // })
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
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    close() {
      ipcRenderer.send('close-window-request')
    },
    goToHome() {
      this.$router.push('/home')
    },
    goSys() {
      ipcRenderer.send('go-to-sys')
    }
  }
}
</script>

<style lang="scss">
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
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #ffffff;
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

.Container {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -100;

  .bg {
    width: 100%;
    height: 100%;
    background: url('./../assets/pingtai-img/背景.png');

    .top-title {
      display: flex;
      align-items: center;
      width: 100%;
      height: 80px;
      padding-left: 70px;
    }

    .content {
      position: relative;
      display: flex;
      width: 1770px;
      height: 889px;
      ;
      margin-left: 111px;
      margin-top: 65px;

      .top-type-tabs {
        position: absolute;
        top: -2px;
        left: -24px;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 6px;
        height: 42px;
      }

      .top-type-tab {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 122px;
        height: 48px;
        background: url('./../assets/images/noactive.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        cursor: pointer;
        user-select: none;

        span {
          font-family: Alibaba PuHuiTi 2.0;
          font-weight: bold;
          font-size: 20px;
          line-height: 38px;
          color: #FFFFFF;
          text-shadow: 0 0 8px rgba(0, 20, 40, 0.85);
        }

        &.active {
          background-image: url('./../assets/images/active.png');

          span {
            color: #FFFFFF;
          }
        }
      }

      .left {
        width: 1508px;
        height: 100%;

        .left-top {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          box-sizing: border-box;
          padding-top: 7px;
          padding-right: 20px;
          height: 53px;
        }

        .left-content {
          display: flex;
          flex-wrap: wrap;
          padding: 20px;
          width: 100%;
          padding-left: 0px;
          padding-top: 30px;

          .item {
            position: relative;
            width: 233px;
            height: 214px;
            box-sizing: border-box;
            background-color: pink;
            background: url('./../assets/pingtai-img/横向打击.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            cursor: pointer;

            .name-tip {
              display: none;
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              padding: 5px 10px;
              color: #fff;
              font-size: 14px;
              text-align: left;
              background-color: rgba(0, 0, 0, 0.6);
              border-radius: 0 0 5px 5px;
            }

            &:hover .name-tip {
              display: block;
            }

            .edit,
            .del {
              position: absolute;
              top: 10px;
              z-index: 2;
              width: 38px;
              height: 33px;
              background-size: 100% 100%;
              background-repeat: no-repeat;
              display: none;
              cursor: pointer;
            }

            .edit {
              right: 56px;
              background-image: url('./../assets/pingtai-img/edit.png');
            }

            .del {
              right: 10px;
              background: url('./../assets/pingtai-img/删除.png');
            }

            &:hover .edit,
            &:hover .del,
            &.remote-key-focused .edit,
            &.remote-key-focused .del {
              display: block;
            }
          }

          column-gap: 16px;
          row-gap: 25px;
        }

        .left-foots {
          position: fixed;
          bottom: 40px;
          display: flex;
          justify-content: center;
          width: 1508px;
          height: 85px;
          padding-top: 10px;

          .last {
            width: 142px;
            height: 43px;
            background: url('./../assets/pingtai-img/last.png');
            cursor: pointer;

          }

          .page-info {
            display: flex;
            justify-content: center;
            width: 150px;
            font-family: Arial;
            font-weight: 400;
            font-size: 30px;
            color: #FFD776;
            line-height: 54px;
          }

          .next {
            width: 142px;
            height: 43px;
            background: url('./../assets/pingtai-img/next.png');
            cursor: pointer;
          }
        }
      }

        .right {
          flex: 1;
          height: 100%;
          padding-top: 89px;

        .right-button-JC {
          width: 230px;
          height: 73px;
          background: url('./../assets/pingtai-img/新手教程2.png');
          cursor: pointer;
          background-size: 100% 100%;
        }

        .right-button-JC.active {
          background: url('./../assets/pingtai-img/教程.png');
          cursor: pointer;
          background-size: 100% 100%;
        }

        .right-button-VR {
          width: 230px;
          height: 73px;
          margin-top: 20px;
          background: url('./../assets/pingtai-img/VR软件-默认.png');
          cursor: pointer;
          background-size: 100% 100%;
        }

        .right-button-VR.active {
          background: url('./../assets/pingtai-img/设备体感-点击-1.png');
          cursor: pointer;
          background-size: 100% 100%;
            cursor: pointer;

        }

        .right-button-SB {
          width: 230px;
          height: 73px;
          margin-top: 20px;
          background: url('./../assets/pingtai-img/设备体感-默认.png');
          background-size: 100% 100%;
            cursor: pointer;

        }

        .right-button-SB.active {
          background: url('./../assets/pingtai-img/设备体感-点击.png');
          background-size: 100% 100%;
            cursor: pointer;

        }
      }
    }
  }
}

.Container:before {
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

.del-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 789px;
  height: 442px;
  background: url('./../assets/pingtai-img/提示界面.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1;

  .tip {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 120px;
    font-family: Alimama ShuHeiTi;
    font-weight: bold;
    font-size: 36px;
    color: #FFFFFF;
    line-height: 54px;

    img {
      position: absolute;
      right: 40px;
      cursor: pointer;
    }
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 150px;
    font-family: Alibaba PuHuiTi 2.0;
    font-weight: normal;
    font-size: 30px;
    color: #FFFFFF;
    line-height: 54px;

  }

  .foot {
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 72px;
    margin-top: 50px;

    .confirm {
      width: 260px;
      height: 72px;
      background: url('./../assets/pingtai-img/按钮-删除.png');
      cursor: pointer;
    }

    .cancel {
      width: 260px;
      height: 72px;
      background: url('./../assets/pingtai-img/按钮-取消.png');
      margin-left: 30px;
      cursor: pointer;
    }
  }
}

.hardware-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 789px;
  height: 442px;
  background: url('./../assets/pingtai-img/提示界面.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1;

  .hardware-close {
    position: absolute;
    right: 36px;
    top: 32px;
    z-index: 2;
    width: 30px;
    height: 30px;
    cursor: pointer;
  }

  .tip {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 120px;
    font-family: Alimama ShuHeiTi;
    font-weight: bold;
    font-size: 36px;
    color: #FFFFFF;
    line-height: 54px;
  }

  .center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 150px;
  }

  .hardware-control-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 150px;
  }

  .hardware-status {
    height: 40px;
    line-height: 40px;
    margin-bottom: 16px;
    color: #FFD776;
    font-size: 26px;
    text-align: center;
  }

  .hardware-level-control {
    display: flex;
    align-items: center;
    height: 72px;
    color: #FFFFFF;
    font-size: 30px;
  }

  .hardware-level-btn {
    width: 72px;
    height: 72px;
    line-height: 68px;
    text-align: center;
    border: 2px solid #0D8FD8;
    background: #006EBD;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
  }

  .hardware-level-value {
    width: 180px;
    height: 72px;
    line-height: 72px;
    margin: 0 20px;
    text-align: center;
    background: #012122;
    border: 2px solid #0D4C4C;
    box-sizing: border-box;
  }

  .foot {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 72px;
    margin-top: 50px;
  }

  .start,
  .stop {
    width: 260px;
    height: 72px;
    line-height: 72px;
    text-align: center;
    color: #FFFFFF;
    font-size: 30px;
    cursor: pointer;
    background: #006EBD;
  }

  .stop {
    margin-left: 30px;
    background: #7A2830;
  }
}

.add-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1062px;
  height: 822px;
  background: url('./../assets/pingtai-img/add.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1;

  .add-close {
    position: absolute;
    right: 36px;
    top: 32px;
    z-index: 2;
    width: 30px;
    height: 30px;
    cursor: pointer;
  }

  .tip {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 120px;
    font-family: Alimama ShuHeiTi;
    font-weight: bold;
    font-size: 36px;
    color: #FFFFFF;
    line-height: 54px;
  }

  .center {
    padding: 40px;
    display: flex;
    align-items: center;
    width: 100%;
    height: 512px;
    font-family: Alibaba PuHuiTi 2.0;
    font-weight: normal;
    font-size: 30px;
    color: #FFFFFF;
    line-height: 54px;
    margin-top: 20px;
  }

  ::v-deep .el-form-item__label {
    font-family: Alibaba PuHuiTi 2.0;
    font-weight: normal;
    font-size: 26px;
    color: #FFFFFF;
    line-height: 54px;
    margin-top: 10px;
  }

  .file-path-input {
    vertical-align: middle;
  }

  ::v-deep .file-path-input .el-input__inner {
    background-color: #006EBD;
    color: #FFFFFF;
    border: none;
    height: 74px;
    line-height: 74px;
    font-size: 24px;
  }

  ::v-deep .file-path-input .el-input__inner::placeholder {
    color: #FFFFFF;
  }

  .run-upload {
    display: inline-flex;
    align-items: center;
    height: 74px;
    margin-left: 10px;
    vertical-align: middle;
  }

  .icon-upload-area {
    display: flex;
    align-items: flex-start;
  }

  .icon-box {
    width: 200px;
    height: 200px;
    margin-right: 40px;
  }

  .icon-box img {
    width: 100%;
    height: 100%;
    display: block;
  }

  .icon-upload {
    display: inline-block;
    margin-top: 143px;
    // align-self: flex-end;
  }

  .upload-btn {
    width: 161px;
    height: 58px;
    padding: 0;
    border: none;
    background: url('.././assets/pingtai-img/按钮-上传.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    color: #FFFFFF;
    font-size: 18px;
    line-height: 58px;
  }

  .foot {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 72px;
    margin-top: 75px;

    .confirm {
      width: 260px;
      height: 72px;
      background: url('./../assets/pingtai-img/按钮-删除.png');
      cursor: pointer;
    }

    .cancel {
      width: 260px;
      height: 72px;
      background: url('./../assets/pingtai-img/Confirm.png');
      margin-left: 30px;
      cursor: pointer;
    }
  }
}

.tab-settings-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 789px;
  height: 442px;
  background: url('./../assets/pingtai-img/提示界面.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1;

  .tab-settings-close {
    position: absolute;
    right: 36px;
    top: 32px;
    z-index: 2;
    width: 30px;
    height: 30px;
    cursor: pointer;
  }

  .tip {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 105px;
    font-family: Alimama ShuHeiTi;
    font-weight: bold;
    font-size: 36px;
    color: #FFFFFF;
    line-height: 54px;
  }

  .center {
    width: 704px;
    height: 176px;
    margin: 0 auto;
    padding: 6px 74px 0;
    box-sizing: border-box;
    overflow: hidden;
  }

  .tab-settings-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 68px;
    row-gap: 4px;
  }

  .tab-settings-item {
    height: 28px;
    margin: 0;
    color: #FFFFFF;
    font-size: 20px;
    line-height: 28px;
  }

  .tab-settings-item.remote-key-focused {
    outline-width: 2px !important;
    outline-offset: 2px;
    background: rgba(255, 216, 90, 0.12);
  }

  ::v-deep .el-checkbox__label {
    color: #FFFFFF;
    font-size: 20px;
    line-height: 28px;
  }

  ::v-deep .el-checkbox__inner {
    width: 18px;
    height: 18px;
    border-color: #35d7ff;
    background: rgba(0, 139, 210, 0.35);
  }

  ::v-deep .el-checkbox__inner::after {
    left: 5px;
    top: 2px;
    width: 4px;
    height: 9px;
  }

  ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
    border-color: #FFD776;
    background: #006EBD;
  }

  .foot {
    display: flex;
    justify-content: space-around;
    width: 100%;
    height: 72px;
    margin-top: 25px;
    padding: 0 120px;
    box-sizing: border-box;
  }

  .tab-settings-confirm,
  .tab-settings-cancel {
    width: 260px;
    height: 72px;
    padding: 0;
    border: none;
    cursor: pointer;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .tab-settings-confirm {
    background-image: url('./../assets/pingtai-img/Confirm.png');
  }

  .tab-settings-cancel {
    margin-left: 30px;
    background-image: url('./../assets/pingtai-img/按钮-取消.png');
  }
}

.config-actions {
  position: fixed;
  right: 288px;
  bottom: 11px;
  display: flex;
  gap: 12px;
}

.config-action {
  min-width: 116px;
  height: 40px;
  border: 1px solid #35d7ff;
  background: rgba(0, 139, 210, 0.72);
  color: #fff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  box-shadow: inset 0 0 14px rgba(65, 225, 255, 0.55), 0 0 10px rgba(0, 198, 255, 0.35);
}

.config-action:hover {
  background: rgba(0, 175, 235, 0.9);
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  background: rgba(25, 29, 34, 0.65);
}

.fillWidth {
  width: 100%;
}

.btn {
  position: absolute;
  display: flex;
  align-items: center;
  left: 50%;
  top: 60%;
  transform: translateX(-50%);
}
</style>
