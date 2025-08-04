<template>
  <view class="container">
    <!-- 顶部背景区域 -->
    <view class="top-section">
      <image class="bg-img" src="" mode="aspectFill" />
      <view class="card">
        <view class="user-header">
          <image
              class="avatar"
              :src="avatarUrl || getDefaultAvatarByGender()"
              @error="handleAvatarError"
          />

          <!-- 会员标识 -->
          <view class="vip-badge" v-if="isMember === 1">
            <text class="vip-text">会员</text>
          </view>
        </view>

        <view class="user-info">
          <!-- 未登录 -->
          <view v-if="!loggedIn" class="not-login">
            <text class="login-text" @tap="navigateToLogin">点击登录</text>
            <text class="tip-text">登录后可享受更多会员专属权益</text>
          </view>

          <!-- 已登录信息 -->
          <view v-else class="logged-in">
            <!-- 性别 + 昵称 + 用户ID -->
            <view class="name-container">
              <text
                  class="gender-icon"
                  :class="{ 'male': gender === 1, 'female': gender === 0 }"
              >
                {{ gender === 1 ? '♂' : gender === 0 ? '♀' : '未知' }}
              </text>
              <text class="user-name">{{ userName || '未设置姓名' }}</text>
              <text class="user-id">ID: {{ userId }}</text>
            </view>

            <!-- 会员ID - 单独一行居中显示 -->
            <view class="member-id-container" v-if="isMember === 1">
              <text class="member-id">会员ID: {{ memberUid }}</text>
            </view>

            <!-- 手机号（已加遮掩格式） -->
            <text class="user-phone">{{ maskedPhone }}</text>

            <!-- 地址/生日等额外信息 -->
            <view class="extra-info">
              <text v-if="address" class="info-item">{{ address }}</text>
              <text v-if="formattedBirthday" class="info-item">
                生日: {{ formattedBirthday }}
              </text>
            </view>
          </view>
        </view>

        <!-- 余额、券 -->
        <view class="summary">
          <view class="summary-item" @tap="handleSummaryTap('balance')">
            <image src="/static/profile-icons/钱包.png" class="summary-icon" mode="widthFix" />
            <view class="summary-info">
              <text class="summary-label">余额</text>
              <text class="summary-value">￥{{ balance }}</text>
            </view>
          </view>
          <view class="summary-item" @tap="handleSummaryTap('coupons')">
            <image src="/static/profile-icons/优惠券.png" class="summary-icon" mode="widthFix" />
            <view class="summary-info">
              <text class="summary-label">优惠券</text>
              <text class="summary-value">{{ coupons }} 张</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 内容容器 - 增加间距，避免重叠 -->
    <view class="content-container">
      <!-- 生日好礼 -->
      <view class="gift-box">
        <!-- 生日蛋糕图标 -->
        <image class="gift-icon" src="/static/profile-icons/生日.png" mode="widthFix" />
        <view class="gift-content">
          <text class="gift-title">生日专属好礼</text>
          <text class="gift-sub">
            {{ formattedBirthday ? `您的生日是${formattedBirthday}，当天可前往前台领取专属福利` : '完善生日信息，领取专属福利' }}
          </text>
        </view>
        <!-- 注册按钮，仅非会员显示 -->
        <button
            class="get-btn"
            size="mini"
            v-if="loggedIn && isMember === 0"
            @tap="navigateToRegister"
        >
          注册
        </button>
      </view>

      <!-- 功能标题 -->
      <view class="type-title">会员功能</view>

      <!-- 我的功能 - 网格布局 -->
      <view class="grid">
        <view
            class="grid-item"
            v-for="(item, index) in features"
            :key="index"
            @tap="onFeatureTap(index)"
        >
          <view class="grid-icon-container">
            <image :src="item.icon" class="grid-icon" @error="handleImageError" />
            <text class="grid-label">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优惠券详情弹窗 -->
    <view class="coupon-modal" v-if="showCouponModal">
      <view class="modal-mask" @tap="closeCouponModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">我的优惠券</text>
          <text class="modal-close" @tap="closeCouponModal">×</text>
        </view>

        <view class="coupon-list">
          <view v-if="loadingCoupons" class="loading">加载中...</view>

          <view v-if="errorMessage" class="error-message">{{ errorMessage }}</view>

          <view v-if="userCoupons.length === 0 && !loadingCoupons && !errorMessage" class="no-coupons">
            暂无优惠券
          </view>

          <!-- 优惠券列表 - 详细展示每种优惠券的ID和数量 -->
          <view class="coupon-item" v-for="(coupon, index) in userCoupons" :key="coupon.id">
            <view class="coupon-header">
              <text class="coupon-type">优惠券 #{{ coupon.couponId }}</text>
              <text class="coupon-count">{{ coupon.quantity }} 张可用</text>
            </view>
            <view class="coupon-footer">
              <text class="coupon-desc">优惠券ID: {{ coupon.id }}</text>
              <text class="coupon-member">会员ID: {{ coupon.memberUid }}</text>
            </view>
          </view>
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
      userId: null,
      userName: '',
      userPhone: '',
      balance: 0.0,
      coupons: 0,
      memberUid: '', // 会员uid字段
      address: '',
      gender: 0, // 0:女性, 1:男性, 其他:未知
      openid: '',
      createTime: '',
      birthday: '', // 生日字段
      isMember: 0,
      // 性别对应的默认头像
      genderAvatars: {
        male: '/static/gender/male.png',
        female: '/static/gender/female.png',
        default: '/static/gender/unknown.png'
      },

      // 优惠券相关数据
      showCouponModal: false,
      userCoupons: [],       // 当前用户的优惠券列表
      allMemberData: [],     // 所有会员数据缓存
      loadingCoupons: false,
      errorMessage: '',

      features: [
        {label: '商城', icon: '/static/profile-icons/icon-shop.png'},
        {label: '会员码', icon: '/static/profile-icons/icon-qrcode.png'},
        {label: '我的信息', icon: '/static/profile-icons/icon-info.png'},
        {label: '会员条款', icon: '/static/profile-icons/icon-rules.png'}
      ],

      dataWatcher: null,  // 定时器

      refreshIntervalMs: 15000,  // 自动刷新的时间间隔，默认ms
    };
  },
  computed: {
    maskedPhone() {
      if (!this.userPhone || this.userPhone.length < 11) return this.userPhone || '未绑定手机';
      return this.userPhone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
    },
    formattedBirthday() {
      if (!this.birthday) return '';
      const date = new Date(this.birthday);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  },
  methods: {
    startAutoRefresh() {
      if (this.dataWatcher) {
        clearInterval(this.dataWatcher);
      }
      if (this.refreshIntervalMs > 0) {
        this.dataWatcher = setInterval(() => {
          this.fetchMemberWithCoupons();
        }, this.refreshIntervalMs);
      }
    },

    stopAutoRefresh() {
      if (this.dataWatcher) {
        clearInterval(this.dataWatcher);
        this.dataWatcher = null;
      }
    },

    navigateToRegister() {
      uni.navigateTo({
        url: '/pages/profile/memberRegister',
        fail: (err) => {
          console.error('跳转到注册页面失败', err);
          uni.showToast({title: '跳转失败', icon: 'none'});
        }
      });
    },
    getDefaultAvatarByGender() {
      if (this.gender === 1) {
        return this.genderAvatars.male;
      } else if (this.gender === 0) {
        return this.genderAvatars.female;
      } else {
        return this.genderAvatars.default;
      }
    },
    fetchMemberWithCoupons() {
      uni.request({
        url: 'https://1hj114ab57208.vicp.fun/manager/member/listWithCoupons',
        method: 'GET',
        success: (res) => {
          // console.log('获取到的全部会员数据:', res.data);

          if (res.data && Array.isArray(res.data)) {
            this.allMemberData = res.data;
            const matchedUser = res.data.find(user =>
                user.uid === this.memberUid || user.userId === this.userId
            );

            if (matchedUser) {
              // console.log('匹配到的当前用户数据:', matchedUser);
              this.isMember = 1;
              this.balance = matchedUser.balance || 0;
              this.userName = matchedUser.name || this.userName;
              this.gender = matchedUser.gender || this.gender;
              this.birthday = matchedUser.birthday || '';
              this.createTime = matchedUser.createdAt || this.createTime;
              this.memberUid = matchedUser.uid || this.memberUid;

              if (matchedUser.memberCoupons && Array.isArray(matchedUser.memberCoupons)) {
                this.userCoupons = matchedUser.memberCoupons;
                this.coupons = matchedUser.memberCoupons.reduce(
                    (total, coupon) => total + coupon.quantity, 0
                );
                // console.log('当前用户的优惠券列表:', this.userCoupons);
                // console.log('优惠券总数:', this.coupons);
              } else {
                this.userCoupons = [];
                this.coupons = 0;
              }
            } else {
              console.log('未找到匹配的用户数据');
              this.resetUserCoupons();
            }
          } else {
            console.error('接口返回数据格式不正确');
            this.resetUserCoupons();
          }
        },
        fail: (err) => {
          console.error('调用 listWithCoupons 接口失败', err);
          this.resetUserCoupons();
        }
      });
    },
    resetUserCoupons() {
      this.userCoupons = [];
      this.coupons = 0;
      this.isMember = 0;
    },
    fetchCouponDetails() {
      if (!this.loggedIn) {
        this.navigateToLogin();
        return;
      }
      this.loadingCoupons = true;
      this.errorMessage = '';
      if (this.allMemberData.length > 0) {
        const currentUser = this.allMemberData.find(user => user.uid === this.memberUid);
        if (currentUser && currentUser.memberCoupons) {
          this.userCoupons = currentUser.memberCoupons;
          this.loadingCoupons = false;
          return;
        }
      }
      uni.request({
        url: 'https://1hj114ab57208.vicp.fun/manager/coupon-details',
        method: 'GET',
        success: (res) => {
          this.loadingCoupons = false;
          if (res.data && Array.isArray(res.data)) {
            this.allMemberData = res.data;
            const currentUser = res.data.find(user => user.uid === this.memberUid);
            if (currentUser && currentUser.memberCoupons && Array.isArray(currentUser.memberCoupons)) {
              this.userCoupons = currentUser.memberCoupons;
              console.log('从coupon-details获取的当前用户优惠券:', this.userCoupons);
            } else {
              this.userCoupons = [];
              this.errorMessage = '未找到您的优惠券信息';
            }
          } else {
            this.errorMessage = '获取优惠券失败，数据格式不正确';
          }
        },
        fail: (err) => {
          this.loadingCoupons = false;
          this.errorMessage = '网络错误，请稍后重试';
          console.error('调用 coupon-details 接口失败', err);
        }
      });
    },
    syncGlobalUserInfo() {
      const app = getApp();
      if (app.globalData && app.globalData.userInfo && app.globalData.isLoggedIn) {
        const userData = app.globalData.userInfo;
        this.loggedIn = true;
        this.avatarUrl = userData.avatarUrl || this.avatarUrl;
        this.userName = userData.nickname || userData.username || '';
        this.userPhone = userData.phone || '';
        this.userId = userData.userId || null;
        this.memberUid = userData.memberUid || this.memberUid;
        this.gender = userData.gender !== undefined ? userData.gender : this.gender;

        if (app.globalData.userStats) {
          this.balance = app.globalData.userStats.balance || 0;
          this.coupons = app.globalData.userStats.coupons || 0;
        }
      } else {
        this.resetUserInfo();
      }
    },
    syncStorageUserInfo() {
      const stored = uni.getStorageSync('userInfo');
      if (stored && Object.keys(stored).length > 0) {
        this.loggedIn = true;
        this.avatarUrl = stored.avatarUrl || this.avatarUrl;
        this.userName = stored.nickname || this.userName || '';
        this.userPhone = stored.phone || this.userPhone || '';
        this.userId = stored.userId || this.userId;
        this.memberUid = stored.memberUid || this.memberUid;
        this.gender = stored.gender !== undefined ? stored.gender : this.gender;

        this.balance = this.balance || 0;
        this.coupons = this.coupons || 0;

        this.address = stored.address || '';
        this.birthday = stored.birthday || '';
        this.openid = stored.openId || '';
        this.createTime = stored.createTime || '';
        this.isMember = stored.isMember || 0;
      }
    },
    resetUserInfo() {
      this.loggedIn = false;
      this.avatarUrl = '';
      this.userName = '';
      this.userPhone = '';
      this.userId = null;
      this.balance = 0;
      this.coupons = 0;
      this.memberUid = '';

      this.address = '';
      this.gender = 0;
      this.birthday = '';
      this.openid = '';
      this.createTime = '';
      this.isMember = 0;
      this.userCoupons = [];
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
              fail: (err) => {
                console.error('跳转失败', err);
                uni.showToast({title: '请从首页登录', icon: 'none'});
              }
            });
          }
        }
      });
    },
    onFeatureTap(index) {
      const item = this.features[index];
      if (!this.loggedIn) {
        this.navigateToLogin();
        return;
      }
      switch(index) {
        case 0:
          uni.showToast({title: '商城功能开发中', icon: 'none'});
          break;
        case 1:
          uni.showToast({title: '会员码功能开发中', icon: 'none'});
          break;
        case 2:
          uni.showToast({title: '我的信息功能开发中', icon: 'none'});
          break;
        case 3:
          uni.showToast({title: '会员条款功能开发中', icon: 'none'});
          break;
      }
    },
    handleSummaryTap(type) {
      if (!this.loggedIn) {
        this.navigateToLogin();
        return;
      }
      switch (type) {
        case 'balance':
          uni.showToast({title: '余额详情', icon: 'none'});
          break;
        case 'coupons':
          this.showCouponModal = true;
          this.fetchCouponDetails();
          break;
      }
    },
    closeCouponModal() {
      this.showCouponModal = false;
    },
    handleAvatarError(e) {
      console.error('头像加载失败:', e);
      this.avatarUrl = this.getDefaultAvatarByGender();
      uni.showToast({title: '头像加载失败，使用默认头像', icon: 'none'});
    },
    handleImageError(e) {
      console.error('图片加载失败:', e);
      uni.showToast({title: '图片加载失败', icon: 'none'});
    }
  },
  onLoad() {
    this.syncGlobalUserInfo();
    this.syncStorageUserInfo();
    this.fetchMemberWithCoupons();
    this.startAutoRefresh();
  },
  onShow() {
    this.syncGlobalUserInfo();
    this.syncStorageUserInfo();
  },
  onUnload() {
    this.stopAutoRefresh();
  }
}
</script>

<style scoped>
.container {
  padding: 16rpx;
  padding-bottom: 200rpx;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f4f2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 顶部区域调整 - 解决重叠问题 */
.top-section {
  position: relative;
  margin-bottom: 40rpx;
  padding-top: 20rpx;
  box-sizing: border-box;
  padding-bottom: 40rpx; /* 给底部留空间，防止内容溢出 */
}

.bg-img {
  width: 100%;
  height: 240rpx;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  border-radius: 20rpx;
  background-color: #08391f; /* 默认背景色 */
}

/* 卡片样式，增加立体感 */
.card {
  background-color: #fff;
  margin: 180rpx 16rpx 0;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(64, 158, 58, 0.15);
  position: relative;
  z-index: 1;
  border: 2rpx solid #409e3a;
}

.user-header {
  position: relative;
  display: flex;
  justify-content: center;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: 4rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(64, 158, 58, 0.2);
  margin-top: -90rpx; /* 向上突出显示 */
}

/* 会员标识，使用主题色 */
.vip-badge {
  position: absolute;
  right: 20rpx;
  top: -40rpx;
  background: #409e3a;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(64, 158, 58, 0.3);
  border: 1rpx solid #08391f;
}

.vip-text {
  font-size: 26rpx;
  color: #fff;
  font-weight: bold;
}

.user-info {
  margin-top: 20rpx;
  text-align: center;
  padding: 10rpx 0;
}

.not-login {
  padding: 20rpx 0;
}

.login-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #08391f;
  margin-right: 8rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-top: 10rpx;
}

.logged-in {
  padding: 10rpx 0;
}

.name-container {
  margin-bottom: 15rpx;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
}

.gender-icon {
  font-size: 34rpx;
}

.gender-icon.male {
  color: #3498db;
}

.gender-icon.female {
  color: #e91e63;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #08391f;
}

.user-id {
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 2rpx 12rpx;
  border-radius: 15rpx;
}

.member-id-container {
  margin-bottom: 15rpx;
  text-align: center;
}

.member-id {
  font-size: 30rpx;
  color: #08391f;
  font-weight: 600;
  background-color: #e4f0de;
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
  display: inline-block;
  border-left: 4rpx solid #409e3a;
}

.user-phone {
  font-size: 28rpx;
  color: #555;
  display: block;
  margin-bottom: 15rpx;
}

.extra-info {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15rpx 25rpx;
  margin-top: 5rpx;
}

.info-item {
  font-size: 24rpx;
  color: #777;
  background-color: #f9f9f9;
  padding: 3rpx 15rpx;
  border-radius: 15rpx;
}

/* 余额和优惠券区域 */
.summary {
  display: flex;
  justify-content: space-around;
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1px solid #e4f0de;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  padding: 10rpx 0;
  border-radius: 10rpx;
  transition: background-color 0.2s;
}

.summary-item:active {
  background-color: #e4f0de;
}

.summary-icon {
  width: 50rpx;
  height: 50rpx;
  margin-bottom: 10rpx;
}

.summary-info {
  text-align: center;
}

.summary-label {
  font-size: 26rpx;
  color: #666;
}

.summary-value {
  font-size: 30rpx;
  font-weight: bold;
  color: #409e3a;
  margin-top: 5rpx;
}

/* 内容容器 - 解决重叠问题的关键 */
.content-container {
  padding: 0 16rpx;
  margin-top: 0;
  padding-bottom: 40rpx;
}

/* 生日好礼区域 */
.gift-box {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
  margin-bottom: 25rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 10rpx rgba(64, 158, 58, 0.1);
  width: 100%;
  box-sizing: border-box;
  border: 2rpx solid #409e3a;
}

/* 生日蛋糕图标样式 */
.gift-icon {
  width: 65rpx;
  height: 65rpx;
}

.gift-content {
  flex: 1;
  margin-left: 20rpx;
}

.gift-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #08391f;
}

.gift-sub {
  font-size: 24rpx;
  color: #888;
  display: block;
  margin-top: 5rpx;
}

.get-btn {
  background: #409e3a;
  color: white;
  font-size: 26rpx;
  padding: 15rpx 30rpx;
  border-radius: 20rpx;
  line-height: 1.2;
  border: 1rpx solid #08391f;
  box-shadow: 0 2rpx 6rpx rgba(64, 158, 58, 0.6);
}

.get-btn:active {
  background: #2e7d32;
}

/* 分类标题 - 与提供的样式统一 */
.type-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 24rpx 0 12rpx;
  color: #08391f;
  border-left: 12rpx solid #409e3a;
  padding-left: 16rpx;
  background-color: #e4f0de;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 6rpx rgba(64, 158, 58, 0.3);
}

/* 网格功能区 */
.grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 10rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 10rpx rgba(64, 158, 58, 0.1);
  width: 100%;
  box-sizing: border-box;
  border: 2rpx solid #409e3a;
}

.grid-item {
  width: 25%;
  display: flex;
  justify-content: center;
  padding: 25rpx 0;
  box-sizing: border-box;
  transition: background-color 0.3s;
}

.grid-item:active {
  background-color: #e4f0de;
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
  width: 65rpx;
  height: 65rpx;
}

.grid-label {
  font-size: 26rpx;
  color: #08391f;
  text-align: center;
  margin-top: 15rpx;
  font-weight: 500;
}
.coupon-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  width: 100%;
  background-color: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  max-height: 70vh;
  box-sizing: border-box;
  position: relative;
  border-top: 3rpx solid #409e3a;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1px solid #e4f0de;
}

.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #08391f;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.coupon-list {
  overflow-y: auto;
  max-height: calc(70vh - 120rpx);
}
.coupon-item {
  background-color: #f9f9f9;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #409e3a;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1rpx solid #e4f0de;
}

.coupon-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(64, 158, 58, 0.2);
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.coupon-type {
  font-size: 30rpx;
  font-weight: bold;
  color: #08391f;
}

.coupon-count {
  font-size: 28rpx;
  color: #409e3a;
  background-color: #e4f0de;
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
}

.coupon-footer {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #666;
  padding-top: 15rpx;
  border-top: 1px dashed #e4f0de;
}

.loading {
  text-align: center;
  padding: 50rpx 0;
  color: #666;
  font-size: 28rpx;
}

.error-message {
  text-align: center;
  padding: 50rpx 0;
  color: #e53e3e;
  font-size: 28rpx;
}

.no-coupons {
  text-align: center;
  padding: 50rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
