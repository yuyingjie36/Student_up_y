// @ts-nocheck
import request from '../utils/request'

// 获取成绩列表（关联学生+课程）
export function getScoreList() {
  return request({
    url: '/api/score/list',
    method: 'get'
  })
}

// 录入成绩
export function insertScore(data) {
  return request({
    url: '/api/score/insert',
    method: 'post',
    data
  })
}

// 修改成绩
export function updateScore(studentId, data) {
  return request({
    url: `/api/score/${studentId}`,
    method: 'put',
    data
  })
}

// 查询单学生成绩（关联学生+课程）
export function getScoreByStudentId(studentId) {
  return request({
    url: `/api/score/${studentId}`,
    method: 'get'
  })
}
