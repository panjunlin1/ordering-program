<template>
  <button class="pay-btn" @tap="onPayClick">确认支付</button>
</template>

<script setup>
// 点击“微信支付”按钮时触发的函数
const onPayClick = () => {
  // 从本地缓存中读取用户信息（其中包含 openId）
  const userInfo = wx.getStorageSync('userInfo')
  console.log(userInfo)

  // 如果用户未登录或缺少 openId，则提示用户登录
  if (!userInfo || !userInfo.openId) {
    wx.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  // 向后端发起支付请求，生成 JSAPI 支付参数
  wx.request({
    url: 'https://11kars1238468.vicp.fun/api/pay/create',  // 后端接口地址（生成预支付订单）
    method: 'POST',
    data: {
      openid: userInfo.openId,         // 当前用户的 openid，用于标识微信身份
      total: 1,                         // 支付金额（单位：分，这里是 1 分 = 0.01 元）
      description: '桂林米粉 + 饮料'    // 商品描述
    },
    success(res) {
      // 获取后端返回的支付参数（用于调起微信支付）
      const payData = res.data.data

      // 调起微信支付能力
      wx.requestPayment({
        timeStamp: payData.timeStamp,   // 支付签名时间戳
        nonceStr: payData.nonceStr,     // 支付签名随机串
        package: payData.package,       // 预支付交易会话标识（格式必须为 prepay_id=xxx）
        signType: payData.signType,     // 签名算法（一般为 RSA 或 MD5）
        paySign: payData.paySign,       // 支付签名

        // 支付成功回调
        success() {
          wx.showToast({ title: '支付成功' })
          // 你可以在这里跳转页面、刷新订单状态等
        },

        // 支付失败或用户取消回调
        fail() {
          wx.showToast({ title: '支付失败', icon: 'none' })
          console.error("支付失败", res)
        }
      })

      // 打印支付数据，调试用
      console.log(payData)
    },

    // 后端接口请求失败（如网络错误等）
    fail(err) {
      console.error('发起支付失败', err)
      wx.showToast({ title: '支付请求失败', icon: 'none' })
    }
  })
}
</script>


<style scoped>
.pay-btn {
  background-color: #409e3a;
  color: white;
  padding: 20rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  width: 60%;
  margin: 20rpx auto;
}
</style>
