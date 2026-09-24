<script>

// import VideoPlayer from 'vue-video-player';
// import 'vue-video-player/src/custom-theme.css'
// import 'video.js/dist/video-js.css
// import VideoPlayer from 'vue-video-player';
export default {
  name: 'index',
  components: {
    // VideoPlayer
  },
  data() {
    return {
      allData: [],
      displayedData: [],
      itemsPerPage: 3,
      currentPage: 1,
      total: 0,
      dialogVisible: false,
      playerOptions: {
        autoplay: true,
        height: '500px',
        width: '660px',
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 播放速率选项
        fullscreen: {    // 设置全屏选项
          enabled: true, // 默认开启全屏
        },
        sources: [{
          type: 'video/mp4',
          src: '' // 视频地址
        }],
        controlBar: {
          currentTimeDisplay: true,
          progressControl: true,  // 是否显示进度条
          playbackRateMenuButton: true, // 是否显示调整播放倍速按钮
          timeDivider: true, // 当前时间和持续时间的分隔符
          durationDisplay: true, // 显示持续时间
          remainingTimeDisplay: true, // 是否显示剩余时间功能
          fullscreenToggle: true // 是否显示全屏按钮
        }
      }
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.itemsPerPage)
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.db.videoData.count().then(totalCount => {
        this.total = totalCount
        // 计算当前页的起始位置
        let offset = (this.currentPage - 1) * this.itemsPerPage
        // 执行分页查询
        this.db.videoData.offset(offset).limit(this.itemsPerPage).toArray().then(dataArray => {
          this.allData = dataArray
        }).catch(function(error) {
          console.error('Error querying data: ' + error)
        })
      }).catch(function(error) {
        console.error('Error querying data: ' + error)
      })
      // videoList({ pageNum: this.currentPage, pageSize: this.itemsPerPage }).then(res => {
      //   this.allData = res.rows
      //   this.total = res.total
      //   this.updateDisplayedData()
      // })
    },
    updateDisplayedData() {
      // const start = (this.currentPage - 1) * this.itemsPerPage;
      // const end = start + this.itemsPerPage;
      // this.displayedData = this.allData.slice(start, end);
    },
    prevPage() {
      console.log(this.currentPage)
      if (this.currentPage > 1) {
        this.currentPage--
        this.init()
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        console.log(this.total)
        this.currentPage++
        console.log(this.currentPage * this.itemsPerPage)
        this.init()
        // if (this.currentPage * this.itemsPerPage >= this.total) {
        //   this.init()
        // } else {
        //   this.updateDisplayedData()
        // }
      }
    },
    openVideo(item) {
      this.dialogVisible = true
      this.playerOptions.sources[0].src = item.videoUrl
      this.$nextTick(()=>{
        this.$refs.myVideo.player.requestFullscreen()
      })
      // this.playerOptions.sources[0].src = item.videoUrl
    },
    goToDetails(path) {
      this.$router.push({
        path: path
      })
    }

  }

}
</script>

<template>
  <div class="study-container" id="index" ref="appRef">
    <img src="../../../assets/images/anquankepu-title.png" alt=""
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px"
    >
    <img src="../../../assets/images/fanhui.png" alt=""  v-click-sound
         style="position: absolute;top: 0px;right: 30px;z-index: 999" @click="$router.back()"
    >
    <div class="home">
      <div class="prev" @click="prevPage" v-if="currentPage !== 1" v-click-sound></div>
      <div class="index-block">
        <div v-if="allData.length > 0" class="index-block-block" v-for="(item, index) in allData" :key="index"
             @click="openVideo(item)"
        >
          <div class="video-top">
            <img class="block-img" alt="" :src="item.imgUrl"/>
          </div>
          <div class="video-botton">
            <div class="video-botton-text" style="">{{ item.name }}</div>
          </div>
          <!--            <img  class="block-img" alt="" src="../../../assets/images/video-item.png" @click="openVideo(item)"/>-->
        </div>
        <div v-else class="index-block">
          <span style="font-size: 40px; color: #FFFFFF">暂无数据</span>
        </div>
      </div>
      <div class="next" @click="nextPage" v-if="currentPage !== totalPages" v-click-sound></div>
    </div>
    <el-dialog class="dilog3" ref="myDialog" :visible.sync="dialogVisible" :close-on-click-modal="false"
               :close-on-press-escap="false" :append-to-body="true"
    >
      <video-player v-if="dialogVisible" ref="myVideo" :options="playerOptions" style="width: 100%;height: 100%"/>
    </el-dialog>
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
  background: url("../../../assets/images/bg1.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  //background-size: 100% auto;
  //padding-top: 120px;
}

.home {
  position: relative;
  height: 100%;
  //display: flex;
  //text-align: center;
  //align-items: center;
  //justify-content: center;
}

.index-block {
  position: absolute;
  width: 1490px;
  //padding: 30px;
  //margin-top: 100px;
  left: 0;
  right: 0;
  top: 50%;
  margin: auto;
  transform: translateY(-50%);
}

.block-img {
  //margin: 30px;
  //width: 370px;
  //height: 390px;
  //position: absolute;
  //top: 0;
  //left: 0;
  //bottom: 0;
  //right: 0;
  //margin: auto;
  //border-radius: 40px;
  width: 100%;
  height: 100%;
}


.prev {
  position: absolute;
  background: url("../../../assets/images/fanye.png");
  width: 122px;
  height: 142px;
  left: 60px;
  top: 40%;
  transform: rotate(180deg);
}

.next {
  position: absolute;
  background: url("../../../assets/images/fanye.png");
  width: 122px;
  height: 142px;
  top: 40%;
  right: 60px;
}

.index-block-block {
  float: left;
  font-size: 0;

}

.index-block-block:nth-child(n+2) {
  margin-left: 90px;
}

.video-box {
  width: 100%;
  height: 100%;
}

//.dilog3{
//  height: 500px;
//}
::v-deep .el-dialog {
  width: 700px;
  height: 600px;
}

.video-top {
  //background: url("../../../assets/images/video-top.png");
  //background-size:100% 100%;
  //background-repeat: no-repeat;
  width: 430px;
  height: 452px;
  //position: relative;
  //overflow: hidden;
}

.video-botton {
  background: url("../../../assets/images/video-button.png");
  width: 430px;
  height: 118px;
  position: relative;
}

.video-botton-text {
  position: absolute;
  font-size: 20px;
  width: 100%;
  bottom: 25px;
  padding: 0 60px;
  text-align: center;
  font-weight: 550;
  color: #FFFFFF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
