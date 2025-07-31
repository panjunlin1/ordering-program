<template>
  <view class="order-container">
    <!-- 固定顶部区域（橙色 + 卡片） -->
    <view class="fixed-top">
      <!-- 顶部橙色区域 -->
      <view class="top-orange">
        <view class="top-buttons">
          <view class="btn-left">
            <image src="/static/order-icons/开发票.png" class="btn-icon"/>
            <text class="btn-text">开发票</text>
          </view>
        </view>
      </view>

      <!-- 卡片浮在橙色区域上 -->
      <view class="top-card card-float">
        <view class="top-bar">
          <view :class="['tab-item', activeTab === '堂食外卖' ? 'active' : '']" @tap="activeTab = '堂食外卖'">堂食外卖
          </view>
          <view :class="['tab-item', activeTab === '商城' ? 'active' : '']" @tap="activeTab = '商城'">商城</view>
          <view :class="['tab-item', activeTab === '充值' ? 'active' : '']" @tap="activeTab = '充值'">充值</view>
        </view>
        <!-- 当点击堂食外卖时显示筛选-->
        <view v-if="activeTab === '堂食外卖'">
          <view class="filter-bar" @tap="showFilter = true">
            <view class="filter-text">{{ filterSummaryText }}</view>
            <view class="filter-right">
              <text>筛选</text>
              <image src="/static/order-icons/down.png" class="dropdown-icon"/>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="scroll-content">
      <!-- 堂食外卖内容 -->
      <view v-if="activeTab === '堂食外卖'">
        <!-- 有订单时显示订单卡片 -->
        <view v-if="orders.length > 0">
          <view
              class="order-card"
              v-for="order in filteredOrders"
              :key="order.id"
          >
            <view class="order-header" style="display: flex; align-items: center; gap: 12rpx;">
              <view class="order-extract">{{ order.diningChoice }}</view>
              <text class="order-shop">{{ order.shopName }}</text>
              <text class="order-status">{{ getStatusText(order.status) }}</text>
            </view>

            <view class="order-items">
              <view
                  class="item"
                  v-for="item in order.items"
                  :key="item.dishName"
              >
                <image :src="item.image" class="dish-img"/>
                <view class="dish-info">
                  <text class="dish-name">{{ item.dishName }}</text>
                  <text class="dish-price">¥{{ item.unitPrice }}</text>
                  <text class="dish-qty">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>

            <!-- 订单底部 -->
            <view class="order-footer">
              <text class="order-time">{{ formatDateTime(order.ordertime) }}</text>
              <text class="order-price">总计：¥{{calcTotalPrice(order)  }}</text>
            </view>
            <view class="oder-again">
            <button class="btn-reorder">再来一单</button>
          </view>
          </view>
        </view>
      <!-- 没有订单时显示提示 -->
      <view v-else class="empty-card">
        <image src="/static/order-icons/noInformation.png" class="empty-img"/>
        <text class="empty-text">还没有订单哦，没有登陆请先登陆</text>
      </view>
  </view>

  <!-- 商城内容 -->
  <view v-else-if="activeTab === '商城'">
    <view class="mall-card">
      <image src="/static/order-icons/noInformation.png" class="empty-img"/>
      <text class="empty-title">暂未登录</text>
      <view class="login-button">立即登录</view>
    </view>
  </view>

  <!-- 充值内容 -->
  <view v-else-if="activeTab === '充值'">
    <view class="mall-card">
      <image src="/static/order-icons/noInformation.png" class="empty-img"/>
      <text class="empty-title">充值记录为空</text>
    </view>
  </view>
  </scroll-view>

  <!-- 筛选弹层 -->
  <view class="filter-popup" v-if="showFilter" @tap="showFilter = false">
    <view class="filter-card">
      <view class="popup-header">
        <view class="filter-text">{{ filterSummaryText }}</view>
        <view class="filter-right">
          <text>收起</text>
          <image src="/static/order-icons/up.png" class="dropdown-icon"/>
        </view>
      </view>

      <view class="popup-section" >
        <text class="section-title">按分类</text>
        <view class="option-group">
          <view :class="['option-item', category === '全部' ? 'active' : '']" @tap="category = '全部'">全部</view>
          <view :class="['option-item', category === '堂食' ? 'active' : '']" @tap="category = '堂食'">堂食</view>
          <view :class="['option-item', category === '外卖' ? 'active' : '']" @tap="category = '外卖'">外卖</view>
        </view>
      </view>

      <view class="popup-section" >
        <text class="section-title">按时间</text>
        <view class="option-group">
          <view :class="['option-item', time === '全部' ? 'active' : '']" @tap="time = '全部'">全部</view>
          <view :class="['option-item', time === '近3天' ? 'active' : '']" @tap="time = '近3天'">近3天</view>
          <view :class="['option-item', time === '近1月' ? 'active' : '']" @tap="time = '近1月'">近1月</view>
          <view :class="['option-item', time === '1个月以上' ? 'active' : '']" @tap="time = '1个月以上'">1个月以上</view>
        </view>
      </view>

      <view class="popup-section">
        <text class="section-title">按门店</text>
        <br/>
        <text class="store-tips">近3天内暂无消费门店</text>
      </view>
    </view>
  </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 当前选中的 tab
const activeTab = ref('堂食外卖')
const showFilter = ref(false)
const category = ref('全部')
const time = ref('近3天')

// 保存订单数据
const orders = ref([])

onShow(() => {
  // const userId = getApp().globalData.userId
  // const userId = getApp().globalData.userId || wx.getStorageSync('userInfo')?.userId
  const cachedUser = wx.getStorageSync('userInfo')
  console.log('cachedUser:', cachedUser)
  const userId = cachedUser?.userId

  if (!userId) {
    wx.showToast({
      title: '请先登录',
      icon: 'none'
    })
    return
  }

  console.log('当前用户 ID：', userId)

  wx.request({
    url: `https://11kars1238468.vicp.fun/api/orders/user/${userId}/details`,
    method: 'GET',
    success: res => {
      if (res.data.code === 200) {
        orders.value = res.data.data
        console.log('订单数据：', orders.value)
      } else {
        wx.showToast({ title: '获取订单失败', icon: 'none' })
      }
    },
    fail: err => {
      console.error('请求失败:', err)
      wx.showToast({ title: '请求失败', icon: 'none' })
    }
  })
})


// 格式化时间
function formatDateTime(datetime) {
  if (!datetime) return ''
  const date = new Date(datetime)
  const Y = date.getFullYear()
  const M = (date.getMonth() + 1).toString().padStart(2, '0')
  const D = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

// 状态文字
const getStatusText = (status) => {
  switch (status) {
    case 0: return '待支付'
    case 1: return '已支付'
    case 2: return '已接单'
    case 3: return '配送中'
    case 4: return '已完成'
    case 5: return '已取消'
    case 6: return '待接单'
    case 7: return '待完成'
    case 8: return '商家已拒绝'
    default: return '未知状态'
  }
}

// 总价计算
const calcTotalPrice = (order) => {
  if (!order.items || order.items.length === 0) return 0
  return order.items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity)
  }, 0).toFixed(2)
}

// 筛选 + 排序
const filteredOrders = computed(() => {
  let result = [...orders.value]

  // 分类筛选
  if (category.value !== '全部') {
    result = result.filter(order => order.diningChoice === category.value)
  }

  // 时间筛选
  const now = new Date()
  result = result.filter(order => {
    const orderDate = new Date(order.ordertime)
    const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24)
    if (time.value === '近3天') return diffDays <= 3
    if (time.value === '近1月') return diffDays <= 30
    if (time.value === '1个月以上') return diffDays > 30
    return true
  })

  // 时间倒序
  result.sort((a, b) => new Date(b.ordertime) - new Date(a.ordertime))
  return result
})

// 用于筛选标题显示
const filterSummaryText = computed(() => {
  const timeText = time.value === '全部' ? '' : time.value || '';//当time.value为全部时返回一个空
  const categoryText = category.value || '';
  return `${timeText}${categoryText}`
})
</script>



<style scoped>
.order-container {
  position: relative;
  height: 100vh;
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 固定顶部区域 */
.fixed-top {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
}

/* 顶部橙色区域 */
.top-orange {
  background-color: #FF8F1F;
  height: 11vh;
  padding-top: 5vh;
}

.top-buttons {
  display: flex;
  justify-content: flex-end;
  padding: 0 24rpx;
}

.btn-left {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.25);
  padding: 14rpx 32rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #fff;
  margin-right: 11vh;
}

.btn-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 8rpx;
}

/* 卡片样式 */
.top-card {
  width: 100%;
  background-color: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin: 0;
  overflow: hidden;
}

/* 浮入橙色区域 */
.card-float {
  margin-top: -5vh;
}

/* 标签栏 */
.top-bar {
  display: flex;
  justify-content: space-around;
  padding: 27rpx 0;
  font-size: 32rpx;
  border-bottom: 1px solid #eee;
}

.tab-item {
  color: #666;
}

.tab-item.active {
  color: #0c7c3e;
  font-weight: bold;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #666;
}

.dropdown-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 12rpx;
}

/* 滚动区域 */
.scroll-content {
  position: absolute;
  top: 17vh; /* 顶部区域总高度（橙色 + 卡片） */
  bottom: 0;
  width: 100%;
  overflow: scroll;
  margin-top: 100rpx;
}

.order-card {
  background-color: #fff;
  margin: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 订单头部 */
.order-header {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.order-extract {
  font-size: 26rpx;
  color: #666;
  padding: 5rpx 20rpx;
  border-radius: 10px;
  border: 1px solid red;
}

.order-shop {
  font-weight: bold;
  font-size: 28rpx;
}

.order-status {
  font-size: 26rpx;
  color: #999;
  margin-left: auto; /* 让状态靠右 */
}

/* 订单项 */
.order-items {
  border-top: 1px solid #eee;
  margin-top: 10rpx;
  padding-top: 10rpx;
}

.item {
  display: flex;
  margin-bottom: 10rpx;
}

.dish-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.dish-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 26rpx;
}

.dish-name {
  font-weight: bold;
}

.dish-price {
  color: #ff9900;
}

.dish-qty {
  color: #888;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #333;
}

.order-time {
  color: #666;
}

.order-price {
  font-weight: bold;
  font-size: 28rpx;
}

.btn-reorder {
  width: 150rpx;
  background-color: #409e3a;
  color: white;
  padding: 5rpx 20rpx;
  border-radius: 10px;
  font-size: 25rpx;
  margin-right: 10rpx;
}


/* 空状态卡片 */
.empty-card {
  width: 100%;
  min-height: 100%;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  color: #999;
  margin-top: 110rpx;
}

.empty-img {
  width: 400rpx;
  height: 400rpx;
  margin-top: 200rpx;
}

.empty-text {
  font-size: 30rpx;
}

.login-button {
  margin-top: 40rpx;
  background-color: #409e3a;
  color: white;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 28rpx;
}

.mall-card {
  width: 100%;
  min-height: 100%;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  color: #999;
  margin-top: 30rpx;
}

/* 筛选弹层 */
.filter-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9999;
  display: flex;
  justify-content: center;
  padding-top: 14vh; /* 使得 filter-card 从橙色浮出的 tab 区域向下延伸 */
}

.filter-card {
  width: 92%;
  height: 50%;
  background-color: #fff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-top: -4vh; /* 让其浮入 tab 区域，模拟“卡片浮出” */
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.popup-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.option-group {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20rpx;
}

.option-item {
  padding: 16rpx 60rpx;
  background-color: #f2f2f2;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #333;
}

.option-item.active {
  background-color: #e9f7f1;
  color: #0c7c3e;
  font-weight: bold;
}

.store-tips {
  font-size: 26rpx;
  color: #bbb;
}
</style>
