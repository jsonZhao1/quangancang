import request from '@/utils/request'

// 登录方法
export function login(data) {
  return request({
    url: '/api/devicePlatform/studentLogin',
    headers: {
      isToken: false
    },
    method: 'post',
    params: data
  })
}

// 软件开始
export function appStart(data) {
  return request({
    url: '/api/VRARDevice/start',
    method: 'post',
    params: data
  })
}

// 软件结束
export function AppQuit(data) {
  return request({
    url: '/api/VRARDevice/close',
    method: 'post',
    params: data
  })
}


// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

// 退出方法
export function logout(data) {
  return request({
    url: '/api/devicePlatform/logout',
    method: 'post',
    params: data
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  })
}

// 获取背景图
export function getBackUrl() {
  return request({
    url: 'http://192.168.1.169:8090/study/identifier/getBackUrl'
  })
}


//获取二维码信息
export function getQrCode() {
  return request({
    url: '/loginQrCode',
    headers: {
      isToken: false
    },
    method: 'get',
  })
}

export function getLoginStatus(query) {
  return request({
    url: '/getLoginStatus',
    headers: {
      isToken: false
    },
    method: 'get',
    params: query
  })
}


// 游客登录方法
export function touristLogin(query) {
  return request({
    url: '/api/devicePlatform/visitorLogin',
    headers: {
      isToken: false
    },
    method: 'post',
    params: query
  })
}


//激活
export function projectActive(data) {
  return request({
    url: '/projectActive',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  })
}

//更新用户成绩(用户退出程序时调用此接口)
export function updateResult(data) {
  return request({
    url: '/smart/userResult/updateResult',
    method: 'post',
    data
  })
}

export function userResult(data) {
  return request({
    url: '/smart/userResult',
    method: 'post',
    data
  })
}

export function getheartbeat(data) {
  return request({
    url: `/api/VRARDevice/heartbeat?user_device_id=${data.user_device_id}`,
    method: 'post'
  })
}
