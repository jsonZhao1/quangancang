<script>
export default {
  name: 'index',
  data() {
    return {
      scoreList: [],
      open: false,
      loading: true,
      showSearch: true,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      title: '',
      dateRange: [],
      className: '',
      classId: null,
      queryParams: {
        pageNum: 1,
        pageSize: 999,
        testScore: undefined,
        classId: null
      }
    }
  },
  created() {
    // this.classId = this.$route.query.classId;
    // this.queryParams.classId = this.$route.query.classId;
    this.getList()
  },
  methods: {
    getList() {
      this.db.scoreData.orderBy('score').reverse().toArray().then(dataArray => {
        this.scoreList = dataArray.map((item, index) => {
          item.ranking = index + 1
          return item
        })
        // this.scoreList
        // ranking
        console.log(this.scoreList)
      }).catch(function(error) {
        console.error('Error querying data: ' + error)
      })
      // this.loading = true;
      // eleScoreList().then(res => {
      //   this.loading = false;
      //   this.scoreList = res.data;
      // });
    },
    gotoBack() {
      // videoUrl(this.$root.$children[0].$refs)
      this.$router.back()
    },
    screenFullToggle() {
      // videoUrl(this.$root.$children[0].$refs)
    }
  }
}
</script>

<template>
  <div class="score-container" id="index" ref="appRef">
    <img src="../../../assets/images/fenshupaihang-title.png" alt=""
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px"
    >
    <img src="../../../assets/images/fanhui.png" alt="" v-click-sound
         style="position: absolute;top: 0px;right: 30px" @click="$router.back()"
    >
    <!--    <el-header class="score-header" style="height: 80px;width:100%;display: flex;align-items: center;justify-content: space-between">-->
    <!--      <div class="score-back" @click="gotoBack"></div>-->
    <!--      <div class="exam-back-right" @click="screenFullToggle()"></div>-->
    <!--    </el-header>-->
    <div class="score-main">
      <div class="score-img">
        <div class="score-top">
          <div style="width: 1543px">
            <el-row style="display: flex">
              <div style="width: 170px">
                <span class="column-name">名次</span>
              </div>
              <!--              <el-col class="score-column" :span="3">-->

              <!--              </el-col>-->
              <el-col class="score-column" :span="7">
                <span class="column-name">名称</span>
              </el-col>
              <!--              <el-col class="score-column" :span="5">-->
              <!--                <span class="column-name">类型</span>-->
              <!--              </el-col>-->
              <el-col class="score-column" :span="7">
                <span class="column-name">分数</span>
              </el-col>
              <el-col class="score-column" :span="7">
                <span class="column-name">时间</span>
              </el-col>
            </el-row>
          </div>
          <div class="score-body">
            <el-form ref="form">
              <el-form-item v-for="(it, index) in scoreList" prop="rank">
                <div class="score-pic1">
                  <el-row style="display: flex">
                    <div style="width: 170px">
                      <img src="../../../assets/images/1.png" v-if="it.ranking===1" alt="">
                      <img src="../../../assets/images/2.png" v-else-if="it.ranking===2" alt="">
                      <img src="../../../assets/images/3.png" v-else-if="it.ranking===3" alt="">
                      <span class="score-font" v-else>{{ it.ranking }}</span>
                    </div>
                    <!--                    <el-col class="score-column" :span="3">-->
                    <!--                    </el-col>-->
                    <el-col class="score-column" :span="7">
                      <span class="score-font">{{ it.name }}</span>
                    </el-col>
                    <!--                    <el-col class="score-column" :span="4">-->
                    <!--                      <span class="score-font">{{ it.className }}</span>-->
                    <!--                    </el-col>-->
                    <el-col class="score-column" :span="7">
                      <span class="score-font">{{ it.score }}</span>
                    </el-col>
                    <el-col class="score-column" :span="7">
                      <span class="score-font">{{ it.starTimer }}</span>
                    </el-col>
                  </el-row>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.score-img {
  background: url("../../../assets/images/fenshupaihang-bg.png");
  width: 1706px;
  height: 1039px;
  margin-top: -40px;
}

.score-body {
  height: 800px;
  overflow-y: scroll;
}

::-webkit-scrollbar {
  width: 0px;
}

.score-body::-webkit-scrollbar {
  display: none;
}

.score-header {
  height: 90px;
  line-height: 90px;
}

.score-main {
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-container {
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: left top;
  overflow: hidden;
  background: url("../../../assets/images/bg1.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.score-top {
  margin-left: 80px;
  margin-top: 165px;
}

.column-name {
  font-size: 25px;
  color: #FFFFFF;
  font-weight: bold;
  margin-bottom: 10px;
}

.score-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.score-font {
  font-size: 22px;
  color: #FFFFFF;
  font-weight: bold;
}

.score-pic1 {
  background: url("../../../assets/images/fenshupaihang-item.png");
  background-repeat: no-repeat;
  width: 1543px;
  height: 119px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.score-pic2 {
  //background: url("../../../assets/images/第二名.png");
  width: 1543px;
  height: 119px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.score-pic3 {
  //background: url("../../../assets/images/第三名.png");
  width: 1543px;
  height: 119px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.score-pic {
  //background: url("../../../assets/images/其他排名.png");
  width: 1543px;
  height: 119px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.score-back {
  //background: url("../../../assets/images/返回.png");
  width: 90px;
  height: 52px;
  margin: 15px;
}

.score-back:active {
  //background: url("../../../assets/images/返回-点击.png");
  width: 106px;
  height: 70px;
  margin-top: 6px;
  margin-left: 8px;
}

.exam-back-right {
  //background: url("../../../assets/images/fullScreen.png");
  background-size: 100%;
  width: 53px;
  height: 52px;
  margin: 15px;
}
</style>
