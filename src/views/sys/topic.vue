<script>
import { parseTime, DExcel } from '@/utils/yyh'
import * as XLSX from 'xlsx'

export default {
  name: 'topic',
  data() {
    return {
      parseTime,
      queryParams: { theoryName: '', pageNum: 1, pageSize: 10 },
      multiple: true,
      loading: false,
      list: [],
      total: 0,
      title: '新增',
      form: {
        optionA: '',
        name: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOptions: ''
      },
      topicOption: [{
        value: 'A',
        label: 'A'
      },
        {
          value: 'B',
          label: 'B'
        },
        {
          value: 'C',
          label: 'C'
        },
        {
          value: 'D',
          label: 'D'
        }],
      rules: {
        name: [{ required: true, message: '题目名称不能为空', trigger: 'blur' }],
        optionA: [{ required: true, message: '选项A不能为空', trigger: 'blur' }],
        optionB: [{ required: true, message: '选项B不能为空', trigger: 'blur' }],
        optionC: [{ required: true, message: '选项C不能为空', trigger: 'blur' }],
        optionD: [{ required: true, message: '选项D不能为空', trigger: 'blur' }],
        correctOptions: [{ required: true, message: '正确选项为空', trigger: 'change' }]
      },
      listHander: {
        name: '题目名称',
        optionA: '选项A',
        optionB: '选项B',
        optionC: '选项C',
        optionD: '选项D',
        correctOptions: '正确选项'
      },
      listHandler: {
        '题目名称': 'name',
        '选项A': 'optionA',
        '选项B': 'optionB',
        '选项C': 'optionC',
        '选项D': 'optionD',
        '正确选项': 'correctOptions'
      },
      open: false,
      dialogVisible: false,
      accept: '',
      fileList: [],
      importDataList: []
    }
  },
  computed: {},
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.queryAndPaginate(this.queryParams.theoryName, this.queryParams.pageNum, this.queryParams.pageSize)
      // let offset = (this.queryParams.pageNum - 1) * this.queryParams.pageSize
      // // 执行分页查询
      // this.db.topicData.count().then(total => {
      //   console.log(total)
      //   this.total = total
      //   this.db.topicData.topicData.where('name').equals(this.queryParams.theoryName).orderBy('sort').offset(offset).limit(this.queryParams.pageSize).toArray().then(data => {
      //     console.log(data)
      //     this.list = data
      //   }).catch(function(error) {
      //     console.error('Error querying data: ' + error)
      //   })
      // }).catch(function(error) {
      //   console.error('Error querying data: ' + error)
      // })
    },
    seqFormat: function(row, column, cellValue, index) {
      return (this.queryParams.pageSize * (this.queryParams.pageNum - 1)) + index + 1
    },
    queryAndPaginate(fieldValue, pageNum, pageSize) {
      let query = this.db.topicData.toCollection()
      if (fieldValue) {
        query = query.filter(record => record.name.includes(fieldValue))
      }
      query.count().then(res => {
        query.reverse().toArray().then(records => {
          const sortedRecords = records
          const startIndex = (pageNum - 1) * pageSize
          const endIndex = startIndex + pageSize
          const paginatedRecords = sortedRecords.slice(startIndex, endIndex)
          this.total = res
          this.list = paginatedRecords
          console.log(this.list)
          if (this.list.length === 0) {
            const startIndex = 0 * pageSize
            const endIndex = startIndex + pageSize
            const paginatedRecords = sortedRecords.slice(startIndex, endIndex)
            console.log(paginatedRecords)
            this.list = paginatedRecords
          }
        })
        // query.offset((pageNum - 1) * pageSize).limit(pageSize).sortBy('sort').then(records => {
        //   this.total = res
        //   console.log(records)
        //   this.list = records
        // })
      })
    },
    handleQuery() {
      this.queryAndPaginate(this.queryParams.theoryName, this.queryParams.pageNum, this.queryParams.pageSize)
    },
    reset() {
      this.form = {
        name: undefined,
        optionA: undefined,
        optionB: undefined,
        optionC: undefined,
        optionD: undefined,
        correctOptions: undefined
      }
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增'
    },
    handleDelete(row) {
      // 执行删除操作
      this.db.topicData.delete(row.id).then(res => {
        this.showMessage({
          message: '删除成功',
          type: 'success',
          duration: 1000
        })
        this.getList()
      }).catch(function(error) {
        console.error('Error deleting record: ' + error)
      })
    },
    DownloadHandleDelete() {
      this.db.topicData.bulkDelete(this.ids).then(res => {
        this.showMessage({
          message: '删除成功',
          type: 'success',
          duration: 1000
        })
        this.getList()
      })
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    handleUpdate(row) {
      this.reset()
      this.form = JSON.parse(JSON.stringify(row))
      this.open = true
      this.title = '修改'
    },
    submitForm() {
      this.$refs['identifierClassRef'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            this.db.topicData.update(this.form.id, this.form).then(res => {
              this.showMessage({
                message: '修改成功',
                type: 'success',
                duration: 1000
              })
              this.open = false
              this.getList()
            }).catch(function(error) {
              console.error('Error updating record: ' + error)
            })
          } else {
            this.form.starTimer = parseTime(new Date(), '{y}-{m}-{d}')
            this.db.topicData.add(this.form).then(() => {
              this.showMessage({
                message: '新增成功',
                type: 'success',
                duration: 1000
              })
              this.open = false
              this.getList()
            }).catch(function(error) {
              console.error('Error adding data: ' + error)
            })
          }
        }
      })
    },
    cancel() {
      this.reset()
      this.open = false
    },
    handleImport() {
      this.dialogVisible = true
    },
    handleFileSuccess(response) {
      console.log(response)
    },
    submitFileForm() {
      this.db.topicData.bulkPut(this.importDataList)
        .then(() => {
          this.showMessage({
            message: '导入成功',
            type: 'success',
            duration: 1000
          })
          this.cancelFile()
          this.getList()
          console.log('批量新增记录成功')
        })
        .catch(error => {
          console.error('批量新增记录时出错:', error)
        })
    },
    readFile(file) {
      return new Promise(resolve => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = ev => {
          resolve(ev.target.result)
        }
      })
    },
    async fileChange(file, fileList) {
      console.log(file)
      const fileContent = await this.readFile(file.raw)
      // 解析表格文件，获取表格数据
      const workbook = XLSX.read(fileContent, { type: 'binary' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      this.importDataList = jsonData.map(obj => {
        const mappedObj = {}
        for (const prop in obj) {
          if (this.listHandler[prop]) {
            mappedObj[this.listHandler[prop]] = obj[prop]
            mappedObj.starTimer = parseTime(new Date(), '{y}-{m}-{d}')
          }
        }
        return mappedObj
      })
      console.log(this.importDataList)
    },
    importTemplate() {
      DExcel([], this.listHander, '试题导入')
    },
    cancelFile() {
      this.dialogVisible = false
      this.fileList = []
      this.importDataList = []
    }
  }
}
</script>

<template>
  <div>
    <el-row :gutter="24">
      <!--标识分类数据-->
      <el-col :span="24" :xs="24">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="70px">
          <el-form-item label="题目名称" prop="theoryName">
            <el-input
              v-model="queryParams.theoryName"
              placeholder="请输入题目名称"
              clearable
              style="width: 240px"
              size="medium"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" icon="Search" @click="handleQuery">搜索</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="Plus"
              size="small"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="Delete"
              size="small"
              :disabled="multiple"
              @click="DownloadHandleDelete"
            >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              size="small"
              @click="handleImport"
            >导入
            </el-button>
          </el-col>
          <!--          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>-->
        </el-row>

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange" empty-text="暂无数据"
                  height="70vh"
        >
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column prop="seq" label="序号" :formatter="seqFormat" width="50"></el-table-column>
          <el-table-column label="题目名称" align="center" key="name" prop="name"
                           :show-overflow-tooltip="true"
          />
          <el-table-column label="选项A" align="center" width="100" key="optionA" prop="optionA" :show-overflow-tooltip="true"/>
          <el-table-column label="选项B" align="center" width="100" key="optionB" prop="optionB" :show-overflow-tooltip="true"/>
          <el-table-column label="选项C" align="center"  width="100" key="optionC" prop="optionC" :show-overflow-tooltip="true"/>
          <el-table-column label="选项D" align="center" width="100" key="optionD" prop="optionD" :show-overflow-tooltip="true"/>
<!--          <el-table-column label="创建时间" align="center" key="starTimer" prop="starTimer" width="180">-->
<!--            <template slot-scope="scope">-->
<!--              <span>{{ parseTime(scope.row.starTimer, '{y}-{m}-{d}') }}</span>-->
<!--            </template>-->
<!--          </el-table-column>-->
          <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button link type="primary" size="small" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button link type="primary" size="small" icon="Delete" @click="handleDelete(scope.row)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改标识分类配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form :model="form" :rules="rules" ref="identifierClassRef" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="题目名称" prop="name" width="200px">
              <el-input v-model="form.name" placeholder="请输入名称" size="small" maxlength="100" show-word-limit/>
            </el-form-item>
            <el-form-item label="选项A" prop="optionA" width="200px">
              <el-input v-model="form.optionA" placeholder="请输入选项A" maxlength="50" show-word-limit/>
            </el-form-item>
            <el-form-item label="选项B" prop="optionB" width="200px">
              <el-input v-model="form.optionB" placeholder="请输入选项B" maxlength="50" show-word-limit/>
            </el-form-item>
            <el-form-item label="选项C" prop="optionC" width="200px">
              <el-input v-model="form.optionC" placeholder="请输入选项C" maxlength="50" show-word-limit/>
            </el-form-item>
            <el-form-item label="选项D" prop="optionD" width="200px">
              <el-input v-model="form.optionD" placeholder="请输入选项D" maxlength="50" show-word-limit/>
            </el-form-item>
            <el-form-item label="正确选项" prop="correctOptions" width="200px">
              <el-select v-model="form.correctOptions" placeholder="请选择" style="width: 100%">
                <el-option
                  v-for="dict in topicOption"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="导入" :visible.sync="dialogVisible" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :action=accept
        :file-list="fileList"
        :on-success="handleFileSuccess"
        :on-change="fileChange"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                     @click="importTemplate"
            >下载模板
            </el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="cancelFile">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
