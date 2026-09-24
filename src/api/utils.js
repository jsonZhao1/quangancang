import { db } from '/src/dexie'

export function add(data) {
  return new Promise((resolve, reject) => {
    // 执行异步操作
    db.education.add(data).then(res => {
      resolve(res)
    }).catch(error => {
      reject('Error')
    })
  })
}

export function update(data) {
  return new Promise((resolve, reject) => {
    // 执行异步操作
    db.education.update(data.id, data).then(res => {
      resolve(res)
    }).catch(error => {
      reject('Error')
    })
  })
}
