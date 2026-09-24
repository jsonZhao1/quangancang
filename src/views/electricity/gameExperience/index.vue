<script>

export default {
  name: "index",
  data(){
    return{
    }
  },
  created() {
  },
  methods:{
    goToDetails(path){
      // videoUrl(proxy.$root.$refs)
      this.$router.push({
        path: path,
      });
    }

  },

}
</script><audio data-v-7ba5bd90 loop="loop" preload="preload" id="bgmusic" controls="controls" style="display: none;"></audio>

<template>
  <div class="study-container" id="index" ref="appRef">
    <img src="../../../assets/images/tigantiyan.png" alt=""
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px">
    <img src="../../../assets/images/fanhui.png" alt=""
         style="position: absolute;top: 0px;right: 30px" @click="$router.back()" v-click-sound>
    <!--    <el-header class="study-header" style="height: 80px;width:100%;display: flex;align-items: center;justify-content: space-between">-->
    <!--    <div class="study-back" @click="gotoBack"></div>-->
    <!--    <div class="exam-back-right" @click="screenFullToggle()"></div>-->
    <!--    </el-header>-->
    <div class="study-main">
        <div style="display:flex;width: 100%;margin-top: 250px;justify-content: center">
          <div class="left" @click="goToDetails('/electricity/chudiantiyan')" v-click-sound></div>
          <div class="right" @click="goToDetails('/electricity/daoxianguozai')" v-click-sound></div>
          <div class="second" @click="goToDetails('/electricity/duanluyanshi')" v-click-sound></div>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.study-container{
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: left top;
  overflow: hidden;
  background: url("../../../assets/images/bg1.png");
  background-size:100% 100%;
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
.left{
  width: 352px;
  height: 768px;
  background: url("../../../assets/images/chudiantiyan.png");
  background-size:100% 100%;
  background-repeat: no-repeat;
  margin-right: 100px;
}
.right{
  width: 352px;
  height: 768px;
  background: url("../../../assets/images/daoxianguozai.png");
  background-size:100% 100%;
  background-repeat: no-repeat;
  //margin-left: 100px;
  margin-right: 100px;

}
.second{
  width: 352px;
  height: 768px;
  background: url("../../../assets/images/短路演示.png");
  background-size:100% 100%;
  background-repeat: no-repeat;
  //margin-left: 100px;
}
</style>
