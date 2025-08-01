<script setup lang="ts">
import { ref } from 'vue';
import baseUrl from '../../config.js';

// 定义表单数据
const formData = ref({
  receiverName: '',
  phoneNumber: '',
  address: '',
  isDefault: false
});

// 获取用户ID
const getUserId = (): number | null => {
  try {
    const userInfo = uni.getStorageSync('userInfo');
    if (!userInfo) {
      console.log('用户信息为空');
      return null;
    }

    // 检查不同的可能字段
    const userId = userInfo.userId || userInfo.id || userInfo.userid || null;
    console.log('获取到的用户ID:', userId);
    return userId;
  } catch (e) {
    console.error('获取用户ID失败:', e);
    return null;
  }
};

// 提交表单
const submitForm = () => {
  const userId = getUserId();

  if (!userId) {
    uni.showToast({
      title: '未登录，请先登录',
      icon: 'none'
    });
    return;
  }

  // 构造请求配置 - 使用路径参数
  const requestOptions = {
    url: `${baseUrl}/api/user/address/add`,
    method: 'POST' as const,
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      userId,
      ...formData.value
    }
  };

  // 打印完整的请求信息
  console.log('=== 发送到后端的请求信息 ===');
  console.log('请求URL:', requestOptions.url);
  console.log('请求方法:', requestOptions.method);
  console.log('请求头:', {
    'Content-Type': requestOptions.header['Content-Type']
  });
  console.log('请求体:', requestOptions.data);
  console.log('========================');

  uni.request({
    ...requestOptions,
    success: (res: any) => {
      console.log('新增地址返回:', res);
      if (res.statusCode === 200) {
        console.log('新增地址业务响应:', res.data);
        if (res.data.code === 200) {
          uni.showToast({
            title: '新增成功',
            icon: 'success'
          });
          // 延迟一段时间后返回，确保提示信息显示
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          uni.showToast({
            title: res.data.msg || '新增失败',
            icon: 'none'
          });
        }
      } else {
        uni.showToast({
          title: '新增失败，状态码:' + res.statusCode,
          icon: 'none'
        });
      }
    },
    fail: (err: any) => {
      console.error('新增地址失败:', err);
      uni.showToast({
        title: '请求失败',
        icon: 'none'
      });
    }
  });
};
</script>

<template>
  <view class="add-address-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text>新增收货地址</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 收货人 -->
      <view class="form-item">
        <text class="label">收货人</text>
        <input v-model="formData.receiverName" placeholder="请填写收货人姓名" />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <input v-model="formData.phoneNumber" placeholder="请填写收货人手机号" />
      </view>

      <!-- 地区选择 -->
      <view class="form-item">
        <text class="label">所在地区</text>
        <picker mode="region" @change="(e) => formData.address = e.detail.value.join(' ')">
          <view class="placeholder" v-if="!formData.address">请选择省、市、区</view>
          <text v-else>{{ formData.address }}</text>
        </picker>
      </view>

      <!-- 详细地址 -->
      <view class="form-item">
        <text class="label">详细地址</text>
        <input v-model="formData.address" placeholder="小区、门牌号" />
      </view>

      <!-- 设为默认地址 -->
      <view class="form-item default-address">
        <text class="label">设为默认地址</text>
        <checkbox :checked="formData.isDefault" @click="formData.isDefault = !formData.isDefault" />
        <text class="tip">提示：下单时会优先使用该地址</text>
      </view>
    </view>

    <!-- 确认按钮 -->
    <button class="confirm-btn" @click="submitForm">确认</button>
  </view>
</template>

<style scoped>
.add-address-page {
  padding: 20px;
}

.page-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.form-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.label {
  width: 100px;
  font-size: 14px;
  color: #333;
}

input, .placeholder {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.default-address {
  align-items: flex-start;
}

.default-address .label {
  margin-right: 10px;
}

.default-address .tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.confirm-btn {
  width: 100%;
  background-color: #ff4444;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px 0;
  font-size: 16px;
  margin-top: 20px;
}
</style>
