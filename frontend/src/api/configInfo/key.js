import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询钥匙卡列表
export function listKey(query) {
  return request({
    url: '/config/key/list',
    method: 'get',
    params: query
  })
}

// 查询钥匙卡详细
export function getKey(KeyId) {
  return request({
    url: '/config/key/' + parseStrEmpty(KeyId),
    method: 'get'
  })
}

// 新增钥匙卡
export function addKey(data) {
  return request({
    url: '/config/key',
    method: 'post',
    data: data
  })
}

// 修改钥匙卡
export function updateKey(data) {
  return request({
    url: '/config/key',
    method: 'put',
    data: data
  })
}

// 删除钥匙卡
export function delKey(KeyId) {
  return request({
    url: '/config/key/' + KeyId,
    method: 'delete'
  })
}
