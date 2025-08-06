// src/main.ts
import { createSSRApp } from 'vue'
import App from './App.vue'

// 安装全局请求拦截器
const installInterceptor = () => {
  const noAuthUrls = ['/login']

  uni.addInterceptor('request', {
    invoke(options) {
      const requiresAuth = !noAuthUrls.some(url => options.url?.includes(url))

      if (requiresAuth) {
        const token = uni.getStorageSync('token')
        if (token) {
          if (!options.header) options.header = {}
          options.header['token'] = token // 注意不是 Authorization
        } else {
          console.warn('需要认证但未找到 token:', options.url)
        }
      }

      if (!options.header) options.header = {}
      if (!options.header['Content-Type']) {
        options.header['Content-Type'] = 'application/json'
      }

      return options
    },

    success(response) {
      console.log('响应成功:', response)
      return response
    },

    fail(error) {
      console.error('请求失败:', error)
      return error
    }
  })
}

export function createApp() {
  const app = createSSRApp(App)

  installInterceptor() // 启动时安装请求拦截器

  return {
    app
  }
}
