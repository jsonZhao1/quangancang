const baseWidth = 1920
const baseHeight = 1080

export default {
  data() {
    return {
      drawTiming: null,
      style: null
    }
  },
  mounted() {
    this.calcRate()
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resize)
    clearTimeout(this.drawTiming)
  },
  methods: {
    calcRate() {
      const appRef = this.$refs.appRef
      if (!appRef) return

      const scale = Math.min(window.innerWidth / baseWidth, window.innerHeight / baseHeight) || 1
      const transform = `translate(-50%, -50%) scale(${scale})`
      appRef.style.transform = transform
      appRef.style.transformOrigin = 'center center'
      this.style = `transform: ${transform}`
    },
    resize() {
      clearTimeout(this.drawTiming)
      this.drawTiming = setTimeout(() => {
        this.calcRate()
      }, 100)
    }
  }
}
