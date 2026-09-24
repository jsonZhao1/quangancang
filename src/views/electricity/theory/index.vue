<script>
export default {
  name: 'index',
  data() {
    return {
      list: [],
      courindex: 0,
      detailsCenter: '',
      currentUtterance: null
    }
  },
  created() {
    this.init()
  },
  beforeDestroy() {
    this.stopSpeaking()
  },
  methods: {
    init() {
      this.db.education.toArray().then(res => {
        this.list = res
        this.getDetails(this.list[this.courindex],this.courindex)
      })
      // theoryNameList().then(res=>{
      //   this.list = res.data
      //   this.getDetails(this.list[this.courindex],this.courindex)
      // })
    },
    getDetails(item, index) {
        this.detailsCenter = item
        this.courindex = index
        this.speak(this.detailsCenter.theoryDesc)
    },
    speak(text) {
      // 停止当前的语音播放
      this.stopSpeaking();
      // 创建一个新的语音合成对象
      const utterance = new SpeechSynthesisUtterance(text);
      // 开始播放新的语音
      window.speechSynthesis.speak(utterance);
      // 将当前的 utterance 保存到组件的数据中，以便稍后停止播放
      this.currentUtterance = utterance;
    },
    stopSpeaking() {
      // 如果存在当前的语音播放对象，则停止它
      if (this.currentUtterance) {
        window.speechSynthesis.cancel();
        this.currentUtterance = null;
      }
    }
  }

}
</script>

<template>
  <div class="login-page" id="index" ref="appRef">
    <div class="study-container">
      <img src="../../../assets/images/liluanjiaoyu.png" alt=""
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
          <div style="margin-top: 50px;display: flex;padding: 15px 0px 20px 50px;align-items: center">
            <div class="left">
              <div v-for="(item,index) in list" :key="index" class="item" :class="index==courindex?'itembg2':'itembg1'" v-click-sound
                   @click="getDetails(item,index)"
              >{{ item.name }}
              </div>
            </div>
            <div class="right">
              <div v-html="detailsCenter.theoryDesc" style=" overflow-y: scroll;height: 750px" class="right-center"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  //background-size: cover;
  //background-attachment: scroll;
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: left top;
  overflow: hidden;
  //display: flex;
  //align-items: center;
  //justify-content: center;
}

.study-container {
  //width: 100%;
  height: 100%;
  background: url("../../../assets/images/bg2.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  //background-size: 100% auto;
  //padding-top: 120px;
}

.study-main {
  height: 100%;
  //text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 30px;
  font-size: 25px;
}

.identifier-img {
  width: 1771px;
  height: 932px;
  margin-top: 70px;
  background: url("../../../assets/images/jiaoyu-center-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  //align-items: center;
}

.left {
  //flex: 0.5;
  width: 300px;
  height: 791px;
  background: url("../../../assets/images/jiaoyu-menu-bg.png");
  background-size: cover; // 让背景图片完全覆盖整个元素
  background-position: center; // 将背景图片置中
  background-repeat: no-repeat; // 防止背景图片重复显示
  overflow-y: scroll;
  padding: 0; // 设置内边距为零
  margin: 0; // 设置外边距为零
  border: 0; // 可选，设置边框为零
}

.left::-webkit-scrollbar {
  width: 0;
}

.right {
  width: 1366px;
  height: 791px;
  background: url("../../../assets/images/jiaoyu-text-bg.png");
  background-size: cover; // 让背景图片完全覆盖整个元素
  background-position: center; // 将背景图片置中
  background-repeat: no-repeat; // 防止背景图片重复显示
  padding: 20px 40px 20px 80px; // 设置内边距为零
  margin: 0; // 设置外边距为零
  border: 0; // 可选，设置边框为零
  color: #FFFFFF;

}

.right-center::-webkit-scrollbar {
  width: 0;
}

.item {
  width: 296px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  color: #FFFFFF;
  font-weight: bold;
}

.itembg1 {
  background: url("../../../assets/images/menu-item-bg.png");
}

.itembg2 {
  background: url("../../../assets/images/menu-item-bg2.png");
}

::v-deep .ql-size-huge {
  display: block;
  line-height: 40px;
}
</style>
