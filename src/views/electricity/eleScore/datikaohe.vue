<script>
import { questionExamList, examination, eleScore } from '@/api/electricity/score'
// import oo from '../../../assets'
import { parseTime } from '@/utils/yyh'

export default {
  name: 'index',
  data() {
    return {
      list: [],
      courindex: 0,
      chicked: '',
      checkList: [],
      dialogVisible: false,
      currentAnswer: true,
      successQuantity: 0,
      errorQuantity: 0,
      dialogVisible2: false,
      dialogVisible3: false,
      successDa: '',
      objData: {
        'A': 'optionA',
        'B': 'optionB',
        'C': 'optionC',
        'D': 'optionD'
      },
      isAdd: false,
      name: '',
      form: {
        name: '',
        score: 0,
        starTimer: ''
      },
      speech: new SpeechSynthesisUtterance()
      // total: 0
    }
  },
  created() {
    this.init()
  },
  beforeDestroy() {
    this.stopSpeaking()
  },
  computed: {
    total() {
      return this.successQuantity * 10
    }
  },
  methods: {
    init() {
      this.db.topicData.count().then(totalCount => {
        this.total = totalCount
        this.db.topicData.toArray().then(dataArray => {
          this.list = this.getRandomElementsFromArray(dataArray, 10)
          this.readQuestions()
        }).catch(function(error) {
          console.error('Error querying data: ' + error)
        })
      }).catch(function(error) {
        console.error('Error querying data: ' + error)
      })
      // questionExamList().then(res => {
      //   this.$nextTick(() => {
      //     this.list = res.rows
      //   })
      //
      // })
    },
    getRandomElementsFromArray(arr, numElements) {
      const shuffledArr = arr.sort(() => Math.random() - 0.5) // 使用洗牌算法对数组进行乱序
      return shuffledArr.slice(0, Math.min(numElements, arr.length)) // 取出最多 numElements 条数据
    },
    confirm() {
      if (this.chicked !== '') {
        this.stopSpeaking()
        this.currentAnswer = this.chicked.toUpperCase() == this.list[this.courindex].correctOptions.toUpperCase()
        if (this.currentAnswer) {
          this.speech.text = `回答正确`
          this.successQuantity++
        } else {
          this.speech.text = `回答错误`
          this.errorQuantity++
          this.successDa = `${this.list[this.courindex].correctOptions}.${this.list[this.courindex][this.objData[this.list[this.courindex].correctOptions]]}`
        }
        window.speechSynthesis.speak(this.speech)
        this.dialogVisible = true
        // examination({ electricityQuestionId: this.list[this.courindex].id, yourOptions: this.chicked }).then(res => {
        //   this.currentAnswer = res.data.checkFlag
        //   if (this.currentAnswer) {
        //     this.successQuantity++
        //   } else {
        //     this.errorQuantity++
        //     this.successDa = `${res.data.correctOptions}.${res.data.optionContent}`
        //   }
        //   this.dialogVisible = true
        // })
      } else {
        this.showMessage({
          message: '请选择答案',
          type: 'warning',
          duration: 1000
        })
      }
    },
    next() {
      this.stopSpeaking()
      this.dialogVisible = false
      if (this.courindex == this.list.length - 1) {
        this.dialogVisible2 = true
        console.log(this.dialogVisible2)
      } else {
        this.chicked = ''
        this.courindex++
        this.readQuestions()
      }
    },
    confirm2() {
      this.dialogVisible2 = false
      this.dialogVisible3 = true
    },
    changeType() {
      this.isAdd = true
    },
    submitRank() {
      if (!this.name) {
        this.showMessage({
          message: '请填写名称',
          type: 'warning',
          duration: 1000
        })
        return
      }
      this.form.name = this.name
      this.form.score = this.total
      this.form.starTimer = parseTime(new Date(), '{y}-{m}-{d}')
      this.db.scoreData.add(this.form).then(() => {
        this.showMessage({
          message: '计入成功',
          type: 'success',
          duration: 1000
        })
        this.$router.back()
        // this.open = false
        // this.getList()
      }).catch(function(error) {
        console.error('Error adding data: ' + error)
      })
    },
    triggerKeyboard(){
      // 获取到输入框的 DOM 元素
      const inputElement = this.$refs.myInput.$el.querySelector('input');

      // 模拟点击输入框以获取焦点
      inputElement.click();
      inputElement.focus();
    },
    readQuestions(){
      let optionC
      let optionD
      if(this.list[this.courindex].optionC ==='' || this.list[this.courindex].optionC ==='/'){
        optionC = ''
        optionD = ''
      }else{
        optionC = `C(${this.list[this.courindex].optionC})`
        optionD = `D(${this.list[this.courindex].optionD})`
      }

      this.speech.text = `${this.list[this.courindex].name}....A(${this.list[this.courindex].optionA}) B(${this.list[this.courindex].optionB}) ${optionC} ${optionD}`
      window.speechSynthesis.speak(this.speech)
    },
    stopSpeaking() {
        window.speechSynthesis.cancel();
    }
  }

}
</script>

<template>
  <div class="score-container" id="index" ref="appRef">
    <img src="../../../assets/images/datikaohe-title.png" alt=""
         style="position: absolute;left: 50%;transform: translateX(-50%);top: 20px"
    >
    <img src="../../../assets/images/fanhui.png" alt=""
         style="position: absolute;top: 0px;right: 30px" @click="$router.back()" v-click-sound
    >
    <!--    <el-header class="study-header" style="height: 80px;width:100%;display: flex;align-items: center;justify-content: space-between">-->
    <!--    <div class="study-back" @click="gotoBack"></div>-->
    <!--    <div class="exam-back-right" @click="screenFullToggle()"></div>-->
    <!--    </el-header>-->
    <div class="study-main">
      <div class="identifier-img">
        <div class="surplusSubject">
          <span> 第 <span> {{ courindex + 1 }} / {{ list.length }} </span> 题</span>
        </div>
        <div class="rightAndWrong">
          <div style="display: flex;align-items: center">
            <div>答对</div>
            <div style="width: 120px;height: 30px;border: 2px solid #218484;margin-left: 10px">{{ successQuantity }}
            </div>
          </div>
          <div style="display: flex;align-items: center;margin-left: 25px">
            <div>答错</div>
            <div style="width: 120px;height: 30px;border: 2px solid #218484;margin-left: 10px">{{ errorQuantity }}</div>
          </div>
        </div>
        <div class="center">
          <div>
            {{ courindex + 1 }}.{{ list[courindex] ? list[courindex].name : '' }}
          </div>
          <div>
            <div class="exam-desc-selector">
              <el-row>
                <el-col>
                  <el-radio-group v-model="chicked" v-click-sound>
                    <el-radio label="A">A.{{ list[courindex] ? list[courindex].optionA : '' }}</el-radio>
                    <el-radio label="B">B.{{ list[courindex] ? list[courindex].optionB : '' }}</el-radio>
                    <el-radio label="C">C.{{ list[courindex] ? list[courindex].optionC : '' }}</el-radio>
                    <el-radio label="D">D.{{ list[courindex] ? list[courindex].optionD : '' }}</el-radio>
                  </el-radio-group>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div class="btn" @click="confirm" v-click-sound>

        </div>
      </div>
    </div>
    <el-dialog :class="currentAnswer===true?'dilog1':'dilog2'" :visible.sync="dialogVisible" :modal="false"
               :close-on-click-modal="false" :close-on-press-escap="false" :show-close="false"
    >
      <div :class="currentAnswer===true?'exam-dialog1':'exam-dialog2'">
        <div
          style="position: absolute;left: 50%;bottom:177px;transform: translateX(-57%);color:#FFFA6D;display: flex;align-items: center"
          v-if="currentAnswer"
        >
          <div style="font-size: 120px;font-weight: bold;">+</div>
          <div style="font-size: 120px;font-weight: bold">10</div>
          <div style="font-size: 50px; font-weight: bold">分</div>
        </div>
        <div v-else style="position: absolute;top: 180px;left: 50%;transform: translateX(-50%)">
          <div style="color: #FFFFFF;font-size: 35px;font-weight: bolder">本题的正确答案为：</div>
          <div style="font-size: 35px;color: #00FFDE;font-weight: bolder;margin-top: 50px">{{ successDa }}</div>
        </div>
        <div @click="next" class="btn2" :class="currentAnswer===true?'bottom1':'bottom2'" v-click-sound></div>
      </div>
    </el-dialog>
    <el-dialog class="dilog3" :visible.sync="dialogVisible2" :close-on-click-modal="false" :close-on-press-escap="false"
               :show-close="false" :append-to-body="true"
    >
      <div class="exam-dialog3">
        <div style="position: absolute;left: 50%;transform: translateX(-50%);top: 100px;font-size: 25px;color: #FFE992">
          <span style="font-size: 100px;margin-right: 10px">{{ total }}
          </span>
          分
        </div>
        <div style="position: absolute;left: 300px;top: 265px;font-size: 25px;color: #00AC31">
          <span>{{ successQuantity }}</span>
          <span style="margin-left: 10px">个</span>
        </div>
        <div style="position: absolute;left: 300px;top: 350px;font-size: 25px;color: #DA521C">
          <span>{{ errorQuantity }}</span>
          <span style="margin-left: 10px">个</span>
        </div>
        <div style="position: absolute;left: 300px;top: 430px;font-size: 25px;color: #FFFFFF">
          <span>{{ list.length }}</span>
          <span style="margin-left: 10px">个</span>
        </div>
        <!--        <div @click="next" class="btn2" :class="currentAnswer===true?'bottom1':'bottom2'"></div>-->
        <div class="btn" @click="confirm2" v-click-sound>

        </div>
      </div>
    </el-dialog>
    <el-dialog class="dilog4" :visible.sync="dialogVisible3" :close-on-click-modal="false" :close-on-press-escap="false"
               :show-close="false" :append-to-body="true"
    >
      <div class="exam-dialog4">
        <div class="exam-dialog4-text pos1" v-if="!isAdd">
          本次考核成绩是否计入排行?
        </div>
        <div class="exam-dialog4-text pos2" v-if="isAdd">
          <div>名称</div>
          <div style="margin-top: 50px">
            <el-input v-model="name" ref="myInput" style="height: 72px;width: 480px" placeholder="请输入名称" @click="triggerKeyboard"></el-input>
          </div>
        </div>
        <div class="exam-dialog4-btn">
          <div class="exam-dialog4-btn1 btn-size" @click="$router.back()" v-click-sound></div>
          <div class="exam-dialog4-btn2 btn-size" v-if="isAdd" @click="submitRank" v-click-sound></div>
          <div class="exam-dialog4-btn3 btn-size" v-if="!isAdd" @click="changeType" v-click-sound></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.score-container {
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: left top;
  overflow: hidden;
  background: url("../../../assets/images/bg2.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  //z-index: 9990;
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

.identifier-img {
  width: 1890px;
  height: 932px;
  margin-top: 70px;
  background: url("../../../assets/images/datikaohe-center-bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  position: relative;
  padding: 0 120px;
}

.surplusSubject {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: #6EE9E5;
  font-size: 25px;
  font-weight: bold;
}

.rightAndWrong {
  position: absolute;
  right: 200px;
  color: #6EE9E5;
  display: flex;
  font-size: 25px;
  top: -15px;
}

.center {
  position: absolute;
  top: 120px;
  font-size: 30px;
  color: #FFFFFF;
  text-align: left;
}

::v-deep .el-radio-group {
  flex-direction: column;
  align-items: flex-start;
  display: flex;
}

::v-deep .el-radio {
  margin-top: 60px;
  display: flex;
  align-items: center;
}

::v-deep .el-radio__inner {
  width: 30px !important;
  height: 30px !important;
  background-color: #123F43;
  border: 2px solid #04C0BA;
}

::v-deep .el-radio__input.is-checked .el-radio__inner {
  background-color: #123F43;
  border-color: #00FFFF;
}

::v-deep .el-radio__inner::after {
  width: 15px !important;
  height: 15px !important;
  background-color: #00FFFF !important;
}

::v-deep .el-radio__label {
  color: #FFFFFF;
  font-size: 25px;
  padding-left: 20px;
}

::v-deep .el-radio__input.is-checked + .el-radio__label {
  color: #FFFFFF;
}

.btn {
  width: 226px;
  height: 61px;
  background: url("../../../assets/images/queren.png");
  background-size: 100% 100%;
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
}

.exam-dialog1 {
  background: url("../../../assets/images/success.png");
  width: 1755px;
  height: 822px;
  background-size: contain;
}

.exam-dialog2 {
  background: url("../../../assets/images/erry.png");
  width: 1456px;
  height: 534px;
}


.dilog1 {
  margin-top: -7vh !important;

  ::v-deep .el-dialog {
    width: 1755px;
    background: transparent !important;
  }

}

.dilog2 {
  background: transparent !important;
  margin-top: 10vh !important;

  ::v-deep .el-dialog {
    width: 1456px;
    background: transparent !important;
  }
}


::v-deep .el-pager li {
  background: transparent !important;
}

::v-deep .el-dialog__body {
  padding: 0;
}

::v-deep .el-message {
  z-index: 99999 !important;
}

::v-deep .el-dialog__header {
  padding: 0;
}

.btn2 {
  background: url("../../../assets/images/xiayiti.png");
  width: 393px;
  height: 77px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.bottom1 {
  bottom: -50px;
}

.bottom2 {
  bottom: -70px;
}

.dilog3 {
  z-index: 9999 !important;

  ::v-deep .el-dialog {
    width: 739px;
    background-color: transparent;
  }
}

.exam-dialog3 {
  background: url("../../../assets/images/kaohejieguo.png");
  width: 739px;
  height: 661px;
}

.dilog4 {
  z-index: 9999 !important;
  //margin-top: 10vh !important;

  ::v-deep .el-dialog {
    width: 720px;
    background: transparent !important;
  }
}

.exam-dialog4 {
  background: url("../../../assets/images/datikaohe-querenbg.png");
  width: 720px;
  height: 405px;
}

.exam-dialog4-text {
  color: #FFFFFF;
  font-weight: bold;
  font-size: 30px;
  text-align: center;
}

.pos1 {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
}

.pos2 {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
}

.exam-dialog4-btn {
  width: 100%;
  position: absolute;
  bottom: 100px;
  display: flex;
  justify-content: center;

  .exam-dialog4-btn1 {
    background: url("../../../assets/images/datikaohe-quxiao.png");
    margin-right: 20px;
  }

  .exam-dialog4-btn2 {
    background: url("../../../assets/images/datikaohe-queren.png");
  }

  .exam-dialog4-btn3 {
    background: url("../../../assets/images/datikaohe-jiru.png");
  }
}

.btn-size {
  width: 226px;
  height: 61px;
}

::v-deep .el-input__inner {
  font-size: 40px !important;
  height: 100% !important;
  background-color: #012122;
  border: 2px solid #0D4C4C;
}

::v-deep .el-input.is-disabled .el-input__inner {
  background-color: #012122;
  border: 2px solid #0D4C4C;
}
</style>
