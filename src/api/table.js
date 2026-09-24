import request from '@/utils/request'
let server = 'http://192.168.1.169:8090'
export function getList(params) {
  return request({
    url: server + '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}
