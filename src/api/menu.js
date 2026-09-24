import request from '@/utils/request'
let server = 'http://192.168.1.169:8090'
// 获取路由
export const getRouters = () => {
  return request({
    url: server + '/getRouters',
    method: 'get'
  })
}
