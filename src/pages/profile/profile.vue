<template>
  <view class="container">
    <!-- 顶部背景区域 -->
    <view class="top-section">
      <image class="bg-img" src="/static/bg.jpg" mode="aspectFill" />
      <view class="card">
        <view class="user-row">
          <image class="avatar" :src="avatarUrl || defaultAvatar" @tap="chooseAvatar" />
          <view class="user-info">
            <text v-if="!loggedIn" class="login-text" @tap="login">登录</text>
            <text v-else class="user-id">会员ID：{{ memberId }}</text>
            <text class="tip-text">登录后享更多会员权益</text>
          </view>
          <view class="vip-badge">会员</view>
        </view>

        <!-- 余额、积分、券 -->
        <view class="summary">
          <view class="item">
            <image src="/static/icon-balance.png" class="icon" />
            <text>余额</text>
            <text class="value">￥{{ balance }}</text>
          </view>
          <view class="item">
            <image src="/static/icon-points.png" class="icon" />
            <text>积分</text>
            <text class="value">{{ points }}</text>
          </view>
          <view class="item">
            <image src="/static/icon-coupon.png" class="icon" />
            <text>券</text>
            <text class="value">{{ coupons }} 张</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 生日好礼 -->
    <view class="gift-box">
      <image src="/static/icon-gift.png" class="gift-icon" />
      <view class="gift-content">
        <text class="gift-title">生日专属好礼</text>
        <text class="gift-sub">填写生日有好礼</text>
      </view>
      <button class="get-btn" size="mini">去获取</button>
    </view>

    <!-- 我的功能 - 修改后的网格布局 -->
    <view class="grid">
      <view class="grid-item" v-for="(item, index) in features" :key="index" @tap="onFeatureTap(index)">
        <view class="grid-icon-container">
          <image :src="item.icon" class="grid-icon" />
          <text class="grid-label">{{ item.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loggedIn: false,
      avatarUrl: '',
      defaultAvatar: '/static/default-avatar.png',
      balance: 0.00,
      points: 0,
      coupons: 0,
      memberId: '未登录',
      features: [
        { label: '商城', icon: '/static/profile-icons/icon-shop.png' },
        { label: '会员码', icon: '/static/profile-icons/icon-qrcode.png' },
        { label: '在线充值', icon: '/static/profile-icons/icon-recharge.png' },
        { label: '我的信息', icon: '/static/profile-icons/icon-info.png' },
        { label: '修改密码', icon: '/static/profile-icons/icon-password.png' },
        { label: '会员条款', icon: '/static/profile-icons/icon-rules.png' },
        { label: '绑定会员卡', icon: '/static/profile-icons/icon-bindcard.png' }
      ]
    };
  },
  methods: {
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success: res => {
          this.avatarUrl = res.tempFilePaths[0];
        }
      });
    },
    login() {
      this.loggedIn = true;
      this.memberId = 'VIP20250725';
      this.balance = 88.88;
      this.points = 120;
      this.coupons = 5;
    },
    onFeatureTap(index) {
      const item = this.features[index];
      uni.showToast({
        title: item.label,
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.top-section {
  position: relative;
  height: 300rpx;
}

.bg-img {
  width: 100%;
  height: 300rpx;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.card {
  background-color: #fff;
  margin: 200rpx 30rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
}

.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #ddd;
}

.user-info {
  flex: 1;
  margin-left: 20rpx;
}

.login-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
}

.user-id {
  font-size: 28rpx;
  color: #333;
}

.tip-text {
  font-size: 24rpx;
  color: #999;
}

.vip-badge {
  background: #f4d03f;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  color: #000;
}

.summary {
  display: flex;
  justify-content: space-around;
  margin-top: 30rpx;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item .icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 10rpx;
}

.item .value {
  font-size: 28rpx;
  color: #333;
}

.gift-box {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;
}

.gift-icon {
  width: 60rpx;
  height: 60rpx;
}

.gift-content {
  flex: 1;
  margin-left: 20rpx;
}

.gift-title {
  font-size: 28rpx;
  font-weight: bold;
}

.gift-sub {
  font-size: 24rpx;
  color: #888;
}

.get-btn {
  background: #00c77e;
  color: white;
  font-size: 24rpx;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
}

.grid-item {
  width: 25%;
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.grid-icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.grid-icon {
  width: 60rpx;
  height: 60rpx;
}

.grid-label {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  margin-top: 10rpx;
}
</style>
