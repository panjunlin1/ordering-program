// utils/request.js
export function request(options) {
    const token = wx.getStorageSync('token') || ''
    return new Promise((resolve, reject) => {
        uni.request({
            ...options,
            header: {
                ...options.header,
                token,  // 自动带上token
            },
            success: (res) => {
                if (res.statusCode === 401) {
                    uni.showToast({ title: '登录失效，请重新登录', icon: 'none' })
                    // 这里可以做跳转登录页的逻辑，或者清除缓存等
                    reject(res)
                } else {
                    resolve(res)
                }
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
