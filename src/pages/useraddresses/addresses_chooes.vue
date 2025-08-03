<script setup lang="ts">
import { ref, onMounted } from 'vue';
import baseUrl from '../../config.js';
import {onShow} from "@dcloudio/uni-app";

// 定义地址数据类型
interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  type: string;
}

// 定义地址数据
const addresses = ref<Address[]>([]);

// 页面加载时获取地址列表
onMounted(() => {
  getAddressList();
});

// 页面显示时也获取地址列表（从添加或修改页面返回时会触发）
onShow(() => {
  getAddressList();
});

// 获取用户信息
const getUserInfo = (): any => {
  try {
    const userInfo = uni.getStorageSync('userInfo');
    console.log('从缓存中获取到的用户信息:', userInfo);
    return userInfo || null;
  } catch (e) {
    console.error('获取用户信息失败:', e);
    return null;
  }
};

// 获取用户ID
const getUserId = (): number | null => {
  try {
    const userInfo = getUserInfo();
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

// 获取地址列表
const getAddressList = (): void => {
  const userInfo = getUserInfo();
  const userId = getUserId();

  console.log('用户信息:', userInfo);
  console.log('用户ID:', userId);

  if (!userId) {
    uni.showToast({
      title: '未登录，请先登录',
      icon: 'none'
    });
    return;
  }

  // 构造请求配置 - 使用路径参数而不是查询参数
  const requestOptions = {
    url: `${baseUrl}/api/user/address/list/${userId}`,
    method: 'GET' as const,
    header: {
      'Content-Type': 'application/json'
    }
  };

  // 打印完整的请求信息
  console.log('=== 发送到后端的请求信息 ===');
  console.log('请求URL:', requestOptions.url);
  console.log('请求方法:', requestOptions.method);
  console.log('请求头:', {
    'Content-Type': requestOptions.header['Content-Type']
  });
  console.log('========================');

  uni.request({
    ...requestOptions,
    success: (res: any) => {
      console.log('获取地址列表成功，完整响应:', res);
      if (res.statusCode === 200) {
        console.log('业务响应数据:', res.data);
        if (res.data.code === 200) {
          addresses.value = res.data.data.map((item: any) => ({
            id: item.id,
            name: item.receiverName,  // 修改为 receiverName
            phone: item.phoneNumber,  // 修改为 phoneNumber
            address: item.address,
            isDefault: item.isDefault,  // 修改为 isDefault
            type: item.type
          }));
          console.log('处理后的地址数据:', addresses.value);
        } else {
          console.error('获取地址列表失败:', res.data.msg);
          uni.showToast({
            title: res.data.msg || '获取地址列表失败',
            icon: 'none'
          });
        }
      } else {
        console.error('HTTP状态码错误:', res.statusCode);
        console.error('响应体:', res.data);
        if (res.statusCode === 401) {
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
        } else {
          uni.showToast({
            title: '请求失败，状态码:' + res.statusCode,
            icon: 'none'
          });
        }
      }
    },
    fail: (err: any) => {
      console.error('获取地址列表失败:', err);
      uni.showToast({
        title: '请求失败，请检查网络',
        icon: 'none'
      });
    }
  });
};

// 删除地址
const deleteAddress = (index: number): void => {
  // 检查是否是默认地址
  if (addresses.value[index].isDefault) {
    uni.showToast({
      title: '默认地址不能删除，请先取消默认',
      icon: 'none'
    });
    return;
  }

  const userId = getUserId();
  console.log('删除地址时获取到的用户ID:', userId);

  if (!userId) {
    uni.showToast({
      title: '未登录，请先登录',
      icon: 'none'
    });
    return;
  }

  const addressId = addresses.value[index].id;

  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个收货地址吗？',
    success: (res: any) => {
      if (res.confirm) {
        // 构造请求配置 - 使用路径参数
        const requestOptions = {
          url: `${baseUrl}/api/user/address/delete/${addressId}`,
          method: 'DELETE' as const,
          header: {
            'Content-Type': 'application/json'
          }
        };

        // 打印完整的请求信息
        console.log('=== 发送到后端的请求信息 ===');
        console.log('请求URL:', requestOptions.url);
        console.log('请求方法:', requestOptions.method);
        console.log('请求头:', {
          'Content-Type': requestOptions.header['Content-Type']
        });
        console.log('========================');

        uni.request({
          ...requestOptions,
          success: (res: any) => {
            console.log('删除地址返回:', res);
            if (res.statusCode === 200) {
              console.log('删除地址业务响应:', res.data);
              if (res.data.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                // 从列表中移除
                addresses.value.splice(index, 1);
              } else {
                uni.showToast({
                  title: res.data.msg || '删除失败',
                  icon: 'none'
                });
              }
            } else {
              uni.showToast({
                title: '删除失败，状态码:' + res.statusCode,
                icon: 'none'
              });
            }
          },
          fail: (err: any) => {
            console.error('删除地址失败:', err);
            uni.showToast({
              title: '请求失败',
              icon: 'none'
            });
          }
        });
      }
    }
  });
};

// 设置默认地址
const setDefault = (index: number): void => {
  // 已经是默认地址则不处理
  if (addresses.value[index].isDefault) return;

  const userId = getUserId();
  console.log('设置默认地址时获取到的用户ID:', userId);

  if (!userId) {
    uni.showToast({
      title: '未登录，请先登录',
      icon: 'none'
    });
    return;
  }

  const addressId = addresses.value[index].id;

  // 构造请求配置 - 使用路径参数
  const requestOptions = {
    url: `${baseUrl}/api/user/address/default/${userId}/${addressId}`,
    method: 'PUT' as const,
    header: {
      'Content-Type': 'application/json'
    }
  };

  // 打印完整的请求信息
  console.log('=== 发送到后端的请求信息 ===');
  console.log('请求URL:', requestOptions.url);
  console.log('请求方法:', requestOptions.method);
  console.log('请求头:', {
    'Content-Type': requestOptions.header['Content-Type']
  });
  console.log('========================');

  uni.request({
    ...requestOptions,
    success: (res: any) => {
      console.log('设置默认地址返回:', res);
      if (res.statusCode === 200) {
        console.log('设置默认地址业务响应:', res.data);
        if (res.data.code === 200) {
          uni.showToast({
            title: '设置成功',
            icon: 'success'
          });
          // 更新列表中的默认状态 - 确保只有一个默认地址
          addresses.value.forEach((item, i) => {
            item.isDefault = i === index;
          });
        } else {
          uni.showToast({
            title: res.data.msg || '设置失败',
            icon: 'none'
          });
        }
      } else {
        uni.showToast({
          title: '设置失败，状态码:' + res.statusCode,
          icon: 'none'
        });
      }
    },
    fail: (err: any) => {
      console.error('设置默认地址失败:', err);
      uni.showToast({
        title: '请求失败',
        icon: 'none'
      });
    }
  });
};

// 编辑地址 - 跳转到修改页面
const editAddress = (index: number): void => {
  const addressId = addresses.value[index].id;
  // 跳转到地址修改页面，传递地址ID
  uni.navigateTo({
    url: `/pages/useraddresses/modification_address?id=${addressId}`,
    success: () => {
      console.log('跳转到地址修改页面成功，地址ID:', addressId);
    },
    fail: (err) => {
      console.error('跳转到地址修改页面失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
};

// 新增地址 - 跳转到新增地址页面
const addNewAddress = (): void => {
  // 跳转到新增地址页面
  uni.navigateTo({
    url: '/pages/useraddresses/Add_address',
    success: () => {
      console.log('跳转到新增地址页面成功');
    },
    fail: (err) => {
      console.error('跳转到新增地址页面失败:', err);
      uni.showToast({
        title: '跳转失败',
        icon: 'none'
      });
    }
  });
};

</script>

<template>
  <view class="address-list">
    <!-- 地址列表 -->
    <view v-for="(address, index) in addresses" :key="address.id" class="address-item">
      <view class="address-header">
        <text>{{ address.name }} {{ address.phone }}</text>
        <view v-if="address.isDefault" class="default-tag">默认</view>
        <view v-if="address.type" :class="['type-tag', address.type]">{{ address.type }}</view>
      </view>
      <view class="address-detail">
        {{ address.address }}
      </view>
      <view class="address-actions">
        <checkbox v-if="!address.isDefault" :checked="false" @click="setDefault(index)">设为默认</checkbox>
        <text v-else class="default-checked">已默认</text>
        <view class="action-buttons">
          <button class="action-btn" @click="deleteAddress(index)">删除</button>
          <button class="action-btn" @click="editAddress(index)">修改</button>
        </view>
      </view>
    </view>

    <!-- 新增收货地址按钮 -->
    <button class="add-address-btn" @click="addNewAddress">新增收货地址</button>
  </view>
</template>

<style scoped>
.address-list {
  padding: 10px;
}

.address-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative; /* 为绝对定位的按钮提供参考 */
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.default-tag, .type-tag {
  margin-left: 5px;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: 12px;
}

.default-tag {
  background-color: #ff6666;
  color: #fff;
}

.type-tag {
  background-color: #66b3ff;
  color: #fff;
}

.address-detail {
  margin-bottom: 10px;
}

.address-actions {
  display: flex;
  align-items: center;
  padding-right: 10px; /* 为右侧按钮留出空间 */
}

.action-buttons {
  position: absolute;
  right: 10px;
  display: flex;
}

.action-btn {
  margin-left: 10px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.default-checked {
  color: #666;
  margin-right: auto; /* 推到左侧，让按钮居右 */
}

.add-address-btn {
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