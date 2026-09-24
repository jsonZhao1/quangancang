import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/yyh'
let server = 'http://192.168.1.169:8090'
export function theoryNameList(query) {
  return request({
    url: server + '/electricity/theory/theoryNameList',
    method: 'get',
    params: query
  })
}

export function theoryList(id) {
  return request({
    url: server + '/electricity/theory/' + parseStrEmpty(id),
    method: 'get'
  })
}
