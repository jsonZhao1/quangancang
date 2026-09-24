import request from '@/utils/request'
let server = 'http://192.168.1.169:8090'
export function login(data) {
  return request({
    url: server + '/login',
    method: 'post',
    data
  })
}

export function getBackUrl() {
  return request({
    url: server + '/study/identifier/getBackUrl'
  })
}

export function getInfo(token) {
  return request({
    url: server + '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: server + '/vue-admin-template/user/logout',
    method: 'post'
  })
}
