<template>
  <view class="container">

    <!-- 顶部红到浅红渐变背景（从上到下渐变） -->
    <view class="top-banner">
      <view class="header-content">
        <view class="header-title">订单结算</view>
      </view>
    </view>

    <!-- 浮动卡片：取餐方式 + 门店信息 + 联系电话 -->
    <view class="card-floating card-location">
      <view class="dining-type">
        <view
            :class="['dining-option', diningType === '堂食' ? 'active' : '']"
            @tap="diningType = '堂食'"
        >堂食</view>
        <view
            :class="['dining-option', diningType === '外卖' ? 'active' : '']"
            @tap="diningType = '外卖'"
        >外卖</view>
      </view>

      <view class="store-info">
        <view class="store-name">蜜雪冰城（挂电商业街店）</view>
        <view class="store-address">直线距离 1.6km / 广西桂林市灵川县灵川镇...</view>

        <!-- 堂食显示营业时间和店家电话 -->
        <template v-if="diningType === '堂食'">
          <view class="store-time">营业时间: 09:00-23:00</view>
          <view class="store-phone">店家电话: {{ storeInfo.phone }}</view>
        </template>

        <!-- 外卖显示收件信息（从数据库获取的模拟数据） -->
        <template v-if="diningType === '外卖'">
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
            <view class="store-phone mt-15">店家电话: {{ storeInfo.phone }}</view>
          </view>
        </template>
      </view>
    </view>

    <!-- 商品列表（只显示一个，预留后续从数据库获取） -->
    <view class="card-floating card-products">
      <view class="section-header">
        <text class="section-title">商品</text>
      </view>

      <view class="product-list">
        <view class="product-item">
          <view class="product-info">
            <view class="product-img">
              <image :src="product.imgUrl" mode="aspectFill"></image>
            </view>
            <view class="product-details">
              <view class="product-name">{{ product.name }}</view>
              <view class="product-spec">{{ product.spec }}</view>
              <view class="product-price">¥{{ product.price.toFixed(2) }}</view>
            </view>
          </view>
          <view class="product-quantity">×{{ product.quantity }}</view>
        </view>
      </view>
    </view>

    <!-- 优惠券组件（保留组件但不实现功能） -->
    <view class="card-floating card-coupon">
      <view class="coupon-info">
        <text class="coupon-title">优惠券</text>
      </view>
    </view>

    <!-- 价格信息 -->
    <view class="card-floating card-price">
      <view class="price-item">
        <text>商品总价</text>
        <text>¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <view class="price-item" v-if="packagingFee > 0">
        <text>包装费</text>
        <text>¥{{ packagingFee.toFixed(2) }}</text>
      </view>
      <view class="price-item" v-if="deliveryFee > 0">
        <text>配送费</text>
        <text>¥{{ deliveryFee.toFixed(2) }}</text>
      </view>
      <view class="price-item discount">
        <text>优惠</text>
        <text>-¥{{ discountAmount.toFixed(2) }}</text>
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
</template>

<script setup>
import { ref, computed } from 'vue'

// 取餐方式
const diningType = ref('堂食')

// 订单备注
const orderRemark = ref('')

// 模拟用户信息（从数据库获取）
const userInfo = ref({
  name: '张三',
  phone: '13812345678',  // 外卖收件人电话
  address: '广西桂林市灵川县灵川镇XX小区3栋2单元501室'
})

// 模拟店家信息（从数据库获取）
const storeInfo = ref({
  phone: '1999999999'  // 店家电话，所有场景均使用此电话
})

// 单个商品信息（预留后续从数据库获取）
const product = ref({
  id: 1,
  name: '珍珠奶茶',
  spec: '中杯 / 正常糖 / 去冰',
  price: 6.00,
  quantity: 2,
  imgUrl: 'https://picsum.photos/100/100?random=1'
})

// 价格相关计算
const totalPrice = computed(() => {
  return product.value.price * product.value.quantity
})

// 包装费：堂食0元，外卖1元
const packagingFee = computed(() => {
  return diningType.value === '外卖' ? 1.00 : 0
})

const deliveryFee = computed(() => {
  return diningType.value === '外卖' ? 3.00 : 0
})

// 优惠金额（简化处理，实际项目可从数据库获取）
const discountAmount = ref(0)

const payableAmount = computed(() => {
  return totalPrice.value + packagingFee.value + deliveryFee.value - discountAmount.value
})


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

/* 取餐方式 */
.dining-type {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 30rpx;
}

.dining-option {
  padding: 22rpx 70rpx;
  border-radius: 50rpx;
  border: 2rpx solid #ff5a3c;
  font-size: 30rpx;
  color: #ff5a3c;
  background-color: #fff5f2;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dining-option.active {
  color: #fff;
  background-color: #ff5a3c;
  box-shadow: 0 5rpx 15rpx rgba(255, 90, 60, 0.25);
}

/* 门店信息 */
.store-info {
  margin-top: 15rpx;
  color: #333;
}

.store-name {
  font-weight: 600;
  margin-bottom: 10rpx;
  display: flex;
  align-items: center;
  font-size: 30rpx;
}

.store-name::before {
  content: '';
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background-color: #ff5a3c;
  margin-right: 12rpx;
}

.store-address {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  line-height: 1.4;
}

.store-address::before {
  content: '📍';
  margin-right: 10rpx;
  font-size: 26rpx;
}

.store-time {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.store-time::before {
  content: '⏰';
  margin-right: 10rpx;
  font-size: 24rpx;
}

.store-phone {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.store-phone::before {
  content: '📞';
  margin-right: 10rpx;
  font-size: 24rpx;
}

/* 外卖信息中的店家电话上边距 */
.mt-15 {
  margin-top: 15rpx;
}

/* 联系信息样式 */
.contact-label {
  font-size: 28rpx;
  color: #666;
  width: 140rpx;
  display: inline-block;
}

/* 外卖收件信息 */
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

/* 商品列表 */
.product-list {
  margin-top: 10rpx;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-img {
  width: 130rpx;
  height: 130rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 24rpx;
  background-color: #f9f9f9;
}

.product-img image {
  width: 100%;
  height: 100%;
}

.product-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.product-spec {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.product-price {
  font-size: 28rpx;
  color: #ff5a3c;
  font-weight: 600;
}

.product-quantity {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

/* 优惠券组件 */
.card-coupon {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
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
