<template>
  <view class="container">
    <!-- 顶部背景区域 -->
    <view class="top-section">
      <image class="bg-img" src="/static/bg.jpg" mode="aspectFill" />
      <view class="card">
        <view class="user-row">
          <image
              class="avatar"
              :src="avatarUrl || defaultAvatar"
              @tap="chooseAvatar"
              @error="handleAvatarError"
          />
          <view class="user-info">
            <text v-if="!loggedIn" class="login-text" @tap="navigateToLogin">登录</text>
            <text v-if="loggedIn" class="user-name">{{ userName || '未设置姓名' }}</text>
            <text v-if="loggedIn" class="user-id">会员ID：{{ memberId }}</text>
            <text v-if="loggedIn" class="user-phone">{{ userPhone || '未绑定手机' }}</text>
            <text v-if="!loggedIn" class="tip-text">登录后享更多会员权益</text>
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

    <!-- 我的功能 - 网格布局 -->
    <view class="grid">
      <view class="grid-item" v-for="(item, index) in features" :key="index" @tap="onFeatureTap(index)">
        <view class="grid-icon-container">
          <image :src="item.icon" class="grid-icon" @error="handleImageError" />
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
      userName: '',
      userPhone: '',
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
        { label: '地址选择', icon: '/static/profile-icons/icon-rules.png' },
        { label: '绑定会员卡', icon: '/static/profile-icons/icon-bindcard.png' },
        { label: '退出登录', icon: '/static/profile-icons/icon-logout.png' }
      ]
    };
  },
  onLoad() {
    this.syncGlobalUserInfo();
    // 注册全局数据变化监听
    this.setupGlobalDataWatcher();
  },
  onShow() {
    this.syncGlobalUserInfo();
  },
  methods: {
    syncGlobalUserInfo() {
      const app = getApp();

      // 首先尝试从缓存中获取用户信息
      try {
        const cachedUserInfo = uni.getStorageSync('userInfo');
        if (cachedUserInfo && cachedUserInfo.nickname) {
          // 使用缓存中的数据
          this.loggedIn = true;
          this.avatarUrl = cachedUserInfo.avatarUrl || this.defaultAvatar;
          this.userName = cachedUserInfo.nickname || cachedUserInfo.username;
          this.userPhone = cachedUserInfo.phone;
          this.memberId = cachedUserInfo.userId || `VIP${Math.floor(Math.random() * 1000000)}`;

          // 同步到全局数据
          if (app.globalData) {
            app.globalData.isLoggedIn = true;
            app.globalData.userInfo = cachedUserInfo;
          }

          console.log('从缓存中同步用户信息成功:', this.avatarUrl);
          return;
        }
      } catch (e) {
        console.error('读取缓存失败:', e);
      }

      // 如果缓存中没有，则使用全局数据
      if (app.globalData && app.globalData.userInfo && app.globalData.isLoggedIn) {
        const userData = app.globalData.userInfo;
        this.loggedIn = true;
        this.avatarUrl = userData.avatarUrl || this.defaultAvatar;
        this.userName = userData.nickname || userData.username;
        this.userPhone = userData.phone;
        // 使用业务会员ID而不是openid
        this.memberId = userData.userId || `VIP${Math.floor(Math.random() * 1000000)}`;

        // 同步到缓存
        try {
          uni.setStorageSync('userInfo', userData);
        } catch (e) {
          console.error('写入缓存失败:', e);
        }

        console.log('用户信息同步成功:', this.avatarUrl);
      } else {
        this.resetUserInfo();
      }
    },
    resetUserInfo() {
      this.loggedIn = false;
      this.avatarUrl = '';
      this.userName = '';
      this.userPhone = '';
      this.memberId = '未登录';
      this.balance = 0;
      this.points = 0;
      this.coupons = 0;

      // 清除缓存
      try {
        uni.removeStorageSync('userInfo');
      } catch (e) {
        console.error('清除缓存失败:', e);
      }
    },
    chooseAvatar() {
      if (!this.loggedIn) {
        this.navigateToLogin();
        return;
      }

      uni.chooseImage({
        count: 1,
        success: res => {
          this.avatarUrl = res.tempFilePaths[0];
          // 更新全局数据中的头像
          const app = getApp();
          if (app.globalData && app.globalData.userInfo) {
            app.globalData.userInfo.avatarUrl = this.avatarUrl;
          }
          uni.showToast({ title: '头像已更新', icon: 'success' });
        },
        fail: err => {
          console.error('选择头像失败', err);
          uni.showToast({ title: '选择失败', icon: 'none' });
        }
      });
    },
    navigateToLogin() {
      uni.showModal({
        title: '未登录',
        content: '当前未登录，将自动跳转至主页进行登录',
        showCancel: false,
        confirmText: '确定',
        success: (res) => {
          if (res.confirm) {
            uni.switchTab({
              url: '/pages/home/index',
              success: () => {
                console.log('跳转到登录页');
              },
              fail: err => {
                console.error('跳转失败', err);
                uni.showToast({ title: '请从首页登录', icon: 'none' });
              }
            });
          }
        }
      });
    },
    onFeatureTap(index) {
      const item = this.features[index];

      if (item.label === '退出登录') {
        if (!this.loggedIn) {
          uni.showToast({ title: '尚未登录', icon: 'none' });
          return;
        }

        const app = getApp();
        this.resetUserInfo();

        if (app.globalData) {
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          app.globalData.userStats = null;
        }

        uni.showToast({ title: '已退出登录', icon: 'none' });
        return;
      }

      if (item.label === '地址选择') {
        if (!this.loggedIn) {
          this.navigateToLogin();
          return;
        }

        uni.navigateTo({
          url: '/pages/useraddresses/addresses_chooes',
          success: () => {
            console.log('跳转到地址选择页面');
          },
          fail: (err) => {
            console.error('跳转失败', err);
            uni.showToast({ title: '跳转失败', icon: 'none' });
          }
        });
        return;
      }

      if (!this.loggedIn) {
        this.navigateToLogin();
        return;
      }

      uni.showToast({ title: item.label, icon: 'none' });
    },
    // 新增：处理头像加载错误
    handleAvatarError(e) {
      console.error('头像加载失败:', e);
      this.avatarUrl = this.defaultAvatar;
      uni.showToast({ title: '头像加载失败，使用默认头像', icon: 'none' });
    },
    // 新增：处理其他图片加载错误
    handleImageError(e) {
      console.error('图片加载失败:', e);
      uni.showToast({ title: '图片加载失败', icon: 'none' });
    },
    // 新增：全局数据变化监听
    setupGlobalDataWatcher() {
      const app = getApp();
      // 使用定时器检查全局数据变化（简单实现）
      this.dataWatcher = setInterval(() => {
        if (this.loggedIn !== (app.globalData?.isLoggedIn || false)) {
          this.syncGlobalUserInfo();
        }
      }, 1000);
    }
  },
  // 新增：页面卸载时清除监听器
  onUnload() {
    if (this.dataWatcher) {
      clearInterval(this.dataWatcher);
    }
  }
};
</script>

<style scoped>
/* 原有样式保持不变 */
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
  cursor: pointer;
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

.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #000;
}

.user-id {
  font-size: 28rpx;
  color: #333;
}

.user-phone {
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