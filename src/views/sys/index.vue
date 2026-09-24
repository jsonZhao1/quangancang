<script>
import education from './education.vue'
import videoDemo from './video.vue'
import topic from './topic.vue'
import score from './score.vue'
import configTransfer from './configTransfer.vue'

const { ipcRenderer } = window.require('electron')

export default {
  name: 'SysIndex',
  components: { education, videoDemo, topic, score, configTransfer },
  data() {
    return {
      menu: [
        { 'name': '理论教育管理', id: 1, path: 'education' },
        { 'name': '试题管理', id: 2, path: 'topic' },
        { 'name': '视频管理', id: 3, path: 'videoDemo' },
        { 'name': '成绩管理', id: 4, path: 'score' },
        { 'name': '配置导入导出', id: 5, path: 'configTransfer' }
      ],
      id: 1,
      show: 'education'
    }
  },
  beforeDestroy() {

  },
  created() {

  },
  methods: {
    goBack() {
      ipcRenderer.send('go-to-sys')
    },
    goToPath(item, index) {
      this.id = item.id
      this.show = item.path
    }
  }
}
</script>

<template>
  <div style="height: 100%;">
    <div class="navbar">
      <div class="flex">
        <img style="width: 40px;height: 40px;"
             src="@/assets/images/login.png"
        />
        <div style="margin-left: 20px;  cursor: pointer;">短路演示管理后台</div>
      </div>
      <div style="padding-right: 20px" @click="goBack"><el-button type="primary">返回</el-button></div>
    </div>
    <div class="center">
      <div class="sidebar">
        <div v-for="(item,index) in menu" :key="index" class="item" @click="goToPath(item,index)"
             :class="id==item.id?'itembg':''"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="min">
        <!--        <education></education>-->
        <component v-bind:is="show"></component>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flex {
  display: flex;
  align-items: center;
}

.navbar {
  width: 100%;
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #006E6B;
  -webkit-box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  color: #FFFFFF;
}

.center {
  height: calc(100% - 70px);
  display: flex;
  //margin-top: 20px;
}

.sidebar {
  padding: 20px 20px 20px 0;
  color: #FFFFFF;
  -webkit-transition: width .28s;
  transition: width .28s;
  width: 200px !important;
  background-color: #ffffff;
  height: 100%;
  //border-radius: 0 10px 10px 0;
  //position: fixed;
  //font-size: 0;
  //top: 50px;
  //bottom: 0;
  //left: 0;
  z-index: 1001;
  overflow: hidden;
  -webkit-box-shadow: 2px 0 6px rgba(0, 21, 41, .35);
  box-shadow: 2px 0 6px rgba(0, 21, 41, .35);
}

.item {
  padding: 10px 0;
  border-radius: 0 10px 10px 0;
  padding-left: 20%;
  color: #333333;
  cursor: pointer;
}

.itembg {
  background-color: #006E6B;
  color: #FFFFFF;
  //transition: background-color 0.5s ease
}

.min {
  padding: 20px;
  width: 100%;
}
</style>
