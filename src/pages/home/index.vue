<template>
  <view class="container">
    <!-- 轮播图 -->
    <view class="banner-wrapper">
      <swiper
          class="banner-swiper"
          indicator-dots
          autoplay
          circular
          interval="3000"
          duration="500"
      >
        <swiper-item v-for="(item, index) in banners" :key="index">
          <image :src="item" class="banner-image" mode="aspectFill"/>
        </swiper-item>
      </swiper>

      <!-- 叠加卡片区域 -->
      <view class="card-wrapper">
        <!-- 顶部提示 -->
        <view class="promo-header">
          <view class="promo-text">用餐攒积分 商城兑好物</view>
          <view class="promo-button">去兑换</view>
        </view>

        <!-- 会员卡 -->
        <view class="member-card">
          <!-- 顶部信息 -->
          <view class="card-header">
            <view class="user-info">
              <image class="avatar" :src="userInfo.avatarUrl"/>
              <text class="user-name">HI,{{ userInfo.nickname }}</text>
            </view>
<!--            <button-->
<!--                open-type="getPhoneNumber"-->
<!--                class="login-button"-->
<!--                @getphonenumber="onGetPhoneNumber"-->
<!--            >-->
<!--             登陆-->
<!--            </button>-->
            <view v-if="isLoggedIn" class="login-success">
              <image class="vip-icon" src="" />
              <text class="vip-label">粉丝会员</text>
            </view>

            <button
                v-else
                open-type="getPhoneNumber"
                class="login-button"
                @getphonenumber="onGetPhoneNumber"
            >
              登录
            </button>
          </view>

          <!-- 横向分割线 -->
          <view class="divider-horizontal"></view>

          <!-- 数据统计 -->
          <view class="card-stats">
            <view class="stat-item">
              <view class="stat-value">--</view>
              <view class="stat-label">余额</view>
            </view>
            <view class="stat-item">
              <view class="stat-value">--</view>
              <view class="stat-label">积分</view>
            </view>
            <view class="stat-item">
              <view class="stat-value">--</view>
              <view class="stat-label">券</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能区域 -->
    <view class="features">
      <view class="feature-left">
        <image class="feature-icon" src="/static/home-icons/堂食点餐.png"/>
        <br>
        <text class="feature-desc">店内就餐味更好</text>
      </view>
      <view class="feature-right">
        <view class="feature-item">
          <image class="feature-icon-sm" src="/static/home-icons/vip.png"/>
          <text class="feature-title-sm">会员储值</text>
          <br>
          <text class="feature-desc-sm">更实惠</text>
        </view>
        <view class="feature-item">
          <image class="feature-icon-sm" src="/static/home-icons/外卖点餐.png"/>
          <text class="feature-title-sm">外卖点餐</text>
          <br>
          <text class="feature-desc-sm">在家享美味</text>
        </view>
        <view class="feature-item">
          <image class="feature-icon-sm" src="/static/home-icons/购物篮.png"/>
          <text class="feature-title-sm">桂林好物</text>
          <br>
          <text class="feature-desc-sm">桂林有优选</text>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="bottom-tips">
      <image src="/static/home-icons/客服.png" class="bottom-icon"/>
      <text class="bottom-tips-text">添加GG企微，免费领GG专属</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const banners = [
  '/static/home-icons/banner1.jpg',
  '/static/home-icons/banner2.jpg',
  '/static/home-icons/banner3.jpg'
]

const isLoggedIn = ref(false)
const userInfo = ref({
  phone: '',
  openId: '',
  token: '',
  nickname: '朋友',
  avatarUrl:'/static/home-icons/默认头像.png'
  // avatarUrl:'https://v.guet.edu.cn/wengine-vpn/js/image/logo.png'
})

function onGetPhoneNumber(e) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    const { encryptedData, iv } = e.detail

    wx.login({
      success: res => {
        const code = res.code
        console.log('微信code：', code)

        wx.request({
          url: 'https://11kars1238468.vicp.fun/login',
          method: 'POST',
          data: {
            code,
            encryptedData,
            iv
          },
          success: res => {
            console.log('登录成功', res.data)

            if (res.data.code === 200) {
              wx.showToast({
                title: '登录成功',
                icon: 'success'
              })

              // 保存用户信息
              const data = res.data.data
              userInfo.value.phone = data.users.phone
              userInfo.value.openId = data.users.openid
              userInfo.value.token = data.token
              userInfo.value.nickname = data.users.username
              userInfo.value.avatarUrl = data.users.avatarUrl
              isLoggedIn.value = true
            } else {
              wx.showToast({
                title: '登录失败',
                icon: 'none'
              })
            }
          },
          fail: err => {
            console.error('登录失败', err)
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        })
      },
      fail: err => {
        console.error('wx.login 失败', err)
      }
    })
  } else {
    console.warn('用户拒绝手机号授权：', e.detail.errMsg)
    wx.showToast({
      title: '需要授权手机号',
      icon: 'none'
    })
  }
}

</script>

<style scoped>
.container {
  width: 100%;
}

.banner-wrapper {
  height: 50vh;
  position: relative;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 卡片叠加 */
.card-wrapper {
  position: absolute;
  bottom: -12vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 顶部用餐积分 */
.promo-header {
  background-color: #08391f;
  color: #f5e4c7;
  width: 90%;
  padding: 12px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 40rpx;
}

.promo-button {
  background-color: #f5d7a5;
  color: #08391f;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 30rpx;
}

/* 会员卡片 */
.member-card {
  background-color: white;
  width: 90%;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.user-name {
  font-size: 32rpx;
  font-weight: bold;
}

.login-button {
  background-color: #409e3a;
  color: white;
  padding: 5rpx 30rpx;
  border-radius: 20px;
  font-size: 28rpx;
  margin-right: 50rpx;
}

.login-success {
  display: flex;
  align-items: center;
  padding: 5rpx 20rpx;
  border-radius: 20rpx;
  margin-right: 50rpx;
  height: 70rpx;
}

.vip-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.vip-label {
  font-size: 28rpx;
  color: #a19e9e;
  font-weight: bold;
}

.divider-horizontal {
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
}

.card-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-weight: bold;
  font-size: 32rpx;
}

.stat-label {
  font-size: 28rpx;
  color: gray;
}

/* 功能入口 */
.features {
  margin-top: 14vh;
  display: flex;
  padding: 0 16px;
  justify-content: space-between;
}

.feature-left {
  width: 45%;
  height: 21vh;
  background-color: #f5f5f5;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
}

.feature-icon {
  width: 110%;
  height: 60%;
  margin-top: 18px;
  margin-left: 0px;
}

.feature-title {
  font-size: 23px;
  font-weight: bold;
  color: #003300;
}

.feature-desc {
  font-size: 40rpx;
  color: gray;
}

.feature-right {
  width: 45%;
  height: 21vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.feature-item {
  height: 7vh;
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 8px;
  text-align: center;
}

.feature-icon-sm {
  width: 30%;
  height: 100%;
  margin: 0 auto 4px;
  float: left;
}

.feature-title-sm {
  font-size: 30rpx;
  font-weight: bold;
  color: #003300;
}

.feature-desc-sm {
  font-size: 20rpx;
  color: gray;
}

.bottom-tips {
  margin: 17px;
  height: 35px;
  display: flex;
  align-items: center;
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 10px;
}

.bottom-icon {
  width: 20%;
  height: 100%;
  margin-left: 5px;
  margin-right: 5px;
}

.bottom-tips-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #003300;
}
</style>
