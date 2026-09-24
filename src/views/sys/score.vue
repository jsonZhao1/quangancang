<script>
import { parseTime } from '@/utils/yyh'

export default {
  name: 'score',
  data() {
    return {
      queryParams: { theoryName: '', pageNum: 1, pageSize: 10 },
      multiple: true,
      loading: false,
      list: [],
      total: 0,
      title: '新增',
      form: {},
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        theoryDesc: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        sort: [{ required: true, message: '排序不能为空', trigger: 'blur' }]
      },
      open: false
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
      // this.db.education.count().then(total => {
      //   console.log(total)
      //   this.total = total
      //   this.db.education.education.where('name').equals(this.queryParams.theoryName).orderBy('sort').offset(offset).limit(this.queryParams.pageSize).toArray().then(data => {
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
      let query = this.db.scoreData.toCollection()
      if (fieldValue) {
        query = query.filter(record => record.name.includes(fieldValue))
      }
      query.count().then(res => {
        query.toArray().then(records => {
          const sortedRecords = records.sort((a, b) => b.score - a.score  )
          const startIndex = (pageNum - 1) * pageSize
          const endIndex = startIndex + pageSize
          const paginatedRecords = sortedRecords.slice(startIndex, endIndex)
          this.total = res
          this.list = paginatedRecords
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
        id: undefined,
        name: undefined,
        sort: undefined,
        theoryDesc: undefined,
        starTimer: undefined
      }
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增'
    },
    handleDelete(row) {
      // 执行删除操作
      this.db.scoreData.delete(row.id).then(res => {
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
      this.db.scoreData.bulkDelete(this.ids).then(res => {
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
            this.db.education.update(this.form.id, this.form).then(res => {
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
            this.db.education.add(this.form).then(() => {
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
          <el-form-item label="名称" prop="theoryName">
            <el-input
              v-model="queryParams.theoryName"
              placeholder="请输入名称"
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

<!--        <el-row :gutter="10" class="mb8">-->
<!--          <el-col :span="1.5">-->
<!--            <el-button-->
<!--              type="primary"-->
<!--              plain-->
<!--              icon="Plus"-->
<!--              size="small"-->
<!--              @click="handleAdd"-->
<!--            >新增-->
<!--            </el-button>-->
<!--          </el-col>-->
<!--          <el-col :span="1.5">-->
<!--            <el-button-->
<!--              type="danger"-->
<!--              plain-->
<!--              icon="Delete"-->
<!--              size="small"-->
<!--              :disabled="multiple"-->
<!--              @click="DownloadHandleDelete"-->
<!--            >删除-->
<!--            </el-button>-->
<!--          </el-col>-->
<!--          &lt;!&ndash;          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>&ndash;&gt;-->
<!--        </el-row>-->

        <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange" empty-text="暂无数据"
                  height="70vh"
        >
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column prop="seq" label="排名" :formatter="seqFormat" width="100"></el-table-column>
          <el-table-column label="名称" align="center" key="name" prop="name"
                           :show-overflow-tooltip="true"
          />
          <el-table-column label="成绩" align="center" key="score" prop="score"
                           :show-overflow-tooltip="true"
          />
          <!--          <el-table-column label="创建时间" align="center" key="createTime" prop="createTime"  width="180">-->
          <!--            <template #default="scope">-->
          <!--              <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
            <template slot-scope="scope">
<!--              <el-button link type="primary" size="small" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>-->
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
            <el-form-item label="名称" prop="name" width="200px">
              <el-input v-model="form.name" placeholder="请输入名称" maxlength="9" show-word-limit/>
            </el-form-item>
            <el-form-item label="内容" prop="theoryDesc" width="200px">
              <editor v-model="form.theoryDesc" :height="200"/>
            </el-form-item>
            <el-form-item label="排序" prop="sort" width="200px">
              <el-input-number v-model="form.sort" controls-position="right" :min="0"/>
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
  </div>
</template>

<style scoped lang="scss">

</style>
