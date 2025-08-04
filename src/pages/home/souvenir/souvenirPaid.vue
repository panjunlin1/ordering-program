<template>
  <view class="container">

    <!-- 顶部红到浅红渐变背景（从上到下渐变） -->
    <view class="top-banner">
      <view class="header-content">
        <view class="header-title">好物订单结算</view>
      </view>
    </view>

    <!-- 浮动卡片：取餐方式 + 门店信息 + 联系电话 -->
    <view class="card-floating card-location">
        <!-- 好物显示收件信息（从数据库获取的模拟数据） -->
        <view class="delivery-info">
          <view class="delivery-item">
            <text class="contact-label">收件人:</text>
            <text class="delivery-value">{{ userInfo.name }}</text>
          </view>
          <view class="delivery-item">
            <text class="contact-label">联系电话:</text>
            <text class="delivery-value">{{ userInfo.phone }}</text>
          </view>
          <view class="delivery-item">
            <text class="contact-label">收货地址:</text>
            <text class="delivery-value">{{ userInfo.address }}</text>
          </view>
        </view>
    </view>

    <view class="card-floating card-products">
      <view class="section-header">
        <text class="section-title">商品</text>
      </view>

      <view class="product-list">
        <view class="product-item" v-for="(souvenir, index) in productList" :key="index">
          <view class="product-img">
            <image :src="souvenir.imgUrl || defaultImg" mode="aspectFill" />
          </view>
          <view class="product-info">
            <view class="product-name">{{ souvenir.name || '未知商品' }}</view>
            <view class="product-meta">
              <text class="product-price">¥{{ getPrice(souvenir.price) }}</text>
              <text class="product-quantity">x{{ souvenir.quantity || 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="card-floating card-price">
        <view class="price-item">
          <text>商品总价</text>
          <text>¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <view class="price-item">
          <text>运费</text>
          <text>¥{{ deliveryFee.toFixed(2) }}</text>
        </view>
        <view class="price-total">
          <text>实付款</text>
          <text>¥{{ payableAmount.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="card-floating card-remark">
        <view class="remark-title">订单备注</view>
        <input
            class="remark-input"
            v-model="orderRemark"
        />
      </view>

      <!-- 支付按钮 -->
      <button class="pay-btn" @tap="onPayClick">确认支付 ¥{{ payableAmount.toFixed(2) }}</button>
    </view>
  </view>
</template>

<script setup>
import {computed, ref} from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import baseUrl from '../../../config.js'

// 订单备注
const orderRemark = ref('')

// 模拟用户信息（从数据库获取）
const userInfo = ref({
  name: '张三',
  phone: '13812345678',  // 好物收件人电话
  address: '广西桂林市灵川县灵川镇XX小区3栋2单元501室'
})

const productList = ref([])


function getPrice(price) {
  return typeof price === 'number' ? price.toFixed(2) : '0.00'
}

onLoad((query) => {
  if (query.data) {
    try {
      const parsed = JSON.parse(decodeURIComponent(query.data))

      console.log('✅ onLoad 接收到的 query:', parsed)

      // 设置商品
      if (Array.isArray(parsed.products)) {
        productList.value = parsed.products
        console.log('接收到的商品列表:', productList.value)
      }
    } catch (e) {
      console.error('订单数据解析失败:', e)
      uni.showToast({title: '订单数据错误', icon: 'none'})
    }
  }
})
// 商品总价
const totalPrice = computed(() => {
  return productList.value.reduce((sum, souvenir) => {
    const price = typeof souvenir.price === 'number' ? souvenir.price : 0
    const quantity = typeof souvenir.quantity === 'number' ? souvenir.quantity : 0
    return sum + price * quantity
  }, 0)
})


//运费
const deliveryFee = ref(10)

const payableAmount = computed(() => {
  return totalPrice.value + deliveryFee.value
})


// 点击“微信支付”按钮时触发的函数
const onPayClick = () => {
  // 从本地缓存中读取用户信息（其中包含 openId）
  const userInfo = wx.getStorageSync('userInfo')
  console.log(userInfo)

  // 如果用户未登录或缺少 openId，则提示用户登录
  if (!userInfo || !userInfo.openId) {
    wx.showToast({title: '请先登录', icon: 'none'})
    return
  }

  // 向后端发起支付请求，生成 JSAPI 支付参数
  wx.request({
    url: baseUrl + '/api/pay/create',  // 后端接口地址（生成预支付订单）
    method: 'POST',
    data: {
      openid: userInfo.openId,         // 当前用户的 openid，用于标识微信身份
      total: payableAmount.value.toFixed(2),          //这里是字符串格式，后端再乘100变成元
      description: '好物订单'    // 商品描述
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
          wx.showToast({title: '支付成功'})
          // 你可以在这里跳转页面、刷新订单状态等
        },

        // 支付失败或用户取消回调
        fail() {
          wx.showToast({title: '支付失败', icon: 'none'})
          console.error("支付失败", res)
        }
      })

      // 打印支付数据，调试用
      console.log(payData)
    },

    // 后端接口请求失败（如网络错误等）
    fail(err) {
      console.error('发起支付失败', err)
      wx.showToast({title: '支付请求失败', icon: 'none'})
    }
  })
}
</script>

<style scoped>
.container {
  position: relative;
  background-color: #f7f7f7;
  min-height: 100vh;
  padding-bottom: 150rpx;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 顶部红到浅红渐变背景（从上到下渐变，加深红色） */
.top-banner {
  /* 使用相对单位设置高度，适应不同屏幕 */
  height: 40vh;
  min-height: 220rpx;
  max-height: 350rpx;
  /* 修改为从上到下的渐变方向，且起始红色更深 */
  background: linear-gradient(180deg, #e60000, #ff7a7a);
  position: relative;
  width: 100%; /* 确保宽度充满屏幕 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头部内容容器，用于更灵活的布局控制 */
.header-content {
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 5vw; /* 使用视窗宽度单位，自动适应屏幕 */
  min-font-size: 36rpx;
  max-font-size: 42rpx;
  color: #fff;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.header-back {
  position: absolute;
  left: 30rpx;
  color: #fff;
  font-size: 40rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 浮动卡片通用样式 */
.card-floating {
  background-color: #ffffff;
  border-radius: 28rpx;
  padding: 36rpx;
  margin: 20rpx 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
  transition: transform 0.2s ease;
}

.card-floating:active {
  transform: scale(0.995);
}

/* 位置信息卡片 */
.card-location {
  margin-top: -140rpx;
}

/* 以下样式保持不变 */
.card-products {
  margin-top: 20rpx;
}

.section-header {
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

/* 联系信息样式 */
.contact-label {
  font-size: 28rpx;
  color: #666;
  width: 140rpx;
  display: inline-block;
}

/* 好物收件信息 */
.delivery-info {
  margin-top: 15rpx;
  border-top: 1rpx dashed #f0f0f0;
  padding-top: 15rpx;
}

.delivery-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.delivery-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

/* 商品列表整体 */
.product-list {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 每个商品项 */
.product-item {
  display: flex;
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 左侧图片区域 */
.product-img {
  width: 130rpx;
  height: 130rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #f9f9f9;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.product-img image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 商品文字信息 */
.product-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

/* 商品名 */
.product-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 12rpx;
  line-height: 1.4;
}

/* 价格和数量行 */
.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 单价 */
.product-price {
  font-size: 28rpx;
  color: #ff5a3c;
  font-weight: bold;
}

/* 数量 */
.product-quantity {
  font-size: 26rpx;
  color: #888;
}


/* 优惠券组件 */
.card-coupon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  margin-left: 0;
  width: 560rpx;
}

.coupon-info {
  display: flex;
  flex-direction: column;
}

.coupon-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 6rpx;
  font-weight: 500;
}

/* 价格信息 */
.card-price {
  margin-top: 20rpx;
  margin-left: 0;
  width: 560rpx;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
  border-bottom: 1rpx dashed #f0f0f0;
}

.price-item:last-child:not(.price-total) {
  border-bottom: none;
}

.price-item.discount {
  color: #ff5a3c;
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 0 10rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.price-total text:first-child {
  color: #333;
}

.price-total text:last-child {
  color: #ff5a3c;
  font-size: 32rpx;
}

/* 订单备注 */
.card-remark {
  margin-top: 20rpx;
  margin-left: 0;
  width: 560rpx;
}

.remark-title {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 18rpx;
  font-weight: 500;
}

.remark-input {
  width: 100%;
  height: 80rpx;
  padding: 24rpx;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #333;
  box-sizing: border-box;
}

.remark-input::placeholder {
  color: #ccc;
}

/* 支付按钮 */
.pay-btn {
  background-color: #ff5a3c;
  color: white;
  padding: 28rpx 0;
  border-radius: 80rpx;
  font-size: 34rpx;
  width: calc(100% - 48rpx);
  margin: 40rpx 24rpx 20rpx;
  font-weight: 600;
  box-shadow: 0 10rpx 20rpx rgba(255, 90, 60, 0.25);
  transition: all 0.3s ease;
}

.pay-btn:active {
  background-color: #e84a2e;
  transform: scale(0.99);
}
</style>