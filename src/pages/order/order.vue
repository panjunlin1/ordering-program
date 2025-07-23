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
      <!--        当点击堂食外卖时显示筛选-->
      <view v-if="activeTab === '堂食外卖'">
        <view class="filter-bar" @tap="showFilter = true">
          <view class="filter-text">全部：近3天</view>
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
        <view class="empty-card">
          <image src="/static/order-icons/noInformation.png" class="empty-img"/>
          <text class="empty-text">还没有订单哦</text>
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
  </view>


  <!-- 筛选弹层 -->
  <view class="filter-popup" v-if="showFilter">
    <view class="filter-card">
      <view class="popup-header" @tap="showFilter = false">
        <view class="filter-text">全部：近3天</view>
        <view class="filter-right">
          <text>收起</text>
          <image src="/static/order-icons/up.png" class="dropdown-icon"/>
        </view>
      </view>

      <view class="popup-section">
        <text class="section-title">按分类</text>
        <view class="option-group">
          <view :class="['option-item', category === '全部' ? 'active' : '']" @tap="category = '全部'">全部</view>
          <view :class="['option-item', category === '堂食' ? 'active' : '']" @tap="category = '堂食'">堂食</view>
          <view :class="['option-item', category === '外卖' ? 'active' : '']" @tap="category = '外卖'">外卖</view>
        </view>
      </view>

      <view class="popup-section">
        <text class="section-title">按时间</text>
        <view class="option-group">
          <view :class="['option-item', time === '近3天' ? 'active' : '']" @tap="time = '近3天'">近3天</view>
          <view :class="['option-item', time === '近1月' ? 'active' : '']" @tap="time = '近1月'">近1月</view>
          <view :class="['option-item', time === '近3月' ? 'active' : '']" @tap="time = '近3月'">近3月</view>
        </view>
      </view>

      <view class="popup-section">
        <text class="section-title">按门店</text>
        <br>
        <text class="store-tips">近3天内暂无消费门店</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import {ref} from 'vue'

const activeTab = ref('堂食外卖')
const showFilter = ref(false)
const category = ref('全部')
const time = ref('近3天')

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
.mall-card{
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
/*点击筛选后弹出界面*/
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
  padding: 16rpx 70rpx;
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
