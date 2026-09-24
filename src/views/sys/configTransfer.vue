<script>
import { exportConfigPackage, importConfigPackage } from '@/utils/configTransfer'

const { ipcRenderer } = window.require('electron')

export default {
  name: 'ConfigTransfer',
  data() {
    return {
      loading: false,
      lastResult: null
    }
  },
  methods: {
    handleExport() {
      this.loading = true
      exportConfigPackage().then(result => {
        if (!result) {
          return
        }

        this.lastResult = {
          type: 'export',
          ...result
        }
        this.$message.success('配置导出成功')
      }).catch(err => {
        console.error('配置导出失败：', err)
        this.$message.error(err.message || '配置导出失败')
      }).finally(() => {
        this.loading = false
      })
    },
    handleImport() {
      this.$confirm('导入会替换当前电脑上的配置和业务数据，是否继续？', '提示', {
        confirmButtonText: '继续导入',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        return importConfigPackage()
      }).then(result => {
        if (!result) {
          return
        }

        this.lastResult = {
          type: 'import',
          ...result
        }
        ipcRenderer.send('config-imported')
        this.$message.success('配置导入成功')
      }).catch(err => {
        if (err === 'cancel' || err === 'close') {
          return
        }
        console.error('配置导入失败：', err)
        this.$message.error(err.message || '配置导入失败')
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<template>
  <div v-loading="loading" class="config-transfer">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-download" @click="handleExport">导出配置</el-button>
      <el-button type="warning" icon="el-icon-upload2" @click="handleImport">导入配置</el-button>
    </div>

    <div v-if="lastResult" class="result">
      <div class="result-title">{{ lastResult.type === 'export' ? '最近导出' : '最近导入' }}</div>
      <div>数据记录：{{ lastResult.tableCount }} 条</div>
      <div>媒体文件：{{ lastResult.fileCount }} 个</div>
      <div v-if="lastResult.missingFileCount">未找到文件：{{ lastResult.missingFileCount }} 个</div>
      <div v-if="lastResult.exportDir">导出目录：{{ lastResult.exportDir }}</div>
      <div v-if="lastResult.manifestPath">配置文件：{{ lastResult.manifestPath }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.config-transfer {
  width: 100%;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.result {
  line-height: 32px;
  color: #333;
  word-break: break-all;
}

.result-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}
</style>
