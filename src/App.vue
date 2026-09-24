<template>
  <div id="app">
    <router-view/>
    <audio
      loop="loop"
      preload="preload"
      id="bgmusic"
      controls="controls"
      ref="MusicPlay"
      style="display: none;"
    >
    </audio>
    <audio
      preload="preload"
      id="bgmusic"
      controls="controls"
      ref="MusicPlayTwo"
      style="display: none;"
    >
    </audio>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      resizeTimer: null
    }
  },
  mounted() {
    this.setPageScale()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    clearTimeout(this.resizeTimer)
  },
  methods: {
    setPageScale() {
      const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
      this.$el.style.setProperty('--page-scale', scale || 1)
    },
    handleResize() {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(this.setPageScale, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>

<style lang="scss">
#index {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(var(--page-scale, 1));
  transform-origin: center center;
}

[data-remote-key='true'],
button,
.el-button,
[role='button'] {
  outline: none;
}

.remote-key-focused {
  z-index: 20;
  outline: 4px solid #ffd85a !important;
  outline-offset: 6px;
  box-shadow: 0 0 0 4px rgba(0, 12, 30, 0.7), 0 0 26px rgba(255, 216, 90, 0.95) !important;
}
</style>
