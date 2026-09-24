import request from '@/utils/request'
let server = 'http://192.168.1.169:8090'
// const server = 'http://192.168.50.119:8086/prod-api'

export function eleScoreList() {
  return request({
    url: server + '/electricity/eleScore/infoList',
    method: 'get'
  })
}

// 查询安全用电教育考试列表
export function questionExamList() {
  return request({
    url: server + '/electricity/question/examList',
    method: 'get'
  })
}

export function examination(data) {
  return request({
    url: server + '/electricity/question/examination',
    method: 'POST',
    params: data
  })
}

//新增成绩
export function eleScore(data) {
  return request({
    url: server + '/electricity/eleScore',
    method: 'POST',
    data: data
  })
}

// 获取视频分页列表
export function videoList(query) {
  return request({
    url: server + '/electricity/video/list',
    method: 'get',
    params: query
  })
}

