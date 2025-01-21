import request from "@/utils/request.js"
// 新建窗口
export const newSession = (params) =>
	request({
		url: `/ais/session`,
		method: 'post',
		data:params
	})
// 聊天接口
export const getChat = (params) =>
	request({
		url: `/ais/chat`,
		method: 'post',
		data:params
	})
// 查询聊天记录
export const getChatHistory = (params) =>
	request({
		url: `/ais/history?sessionId=${params.sessionId}`,
		method: 'get'
	})
export const chatStop = (params) =>
	request({
		url: `/ais/chat/stop?sessionId=${params.sessionId}`,
		method: 'post',
		data:params
	})
	