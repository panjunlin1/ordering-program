<template>
  <view class="container" style="padding: 20px;">
    <view class="form-group">
      <label>会员UID（自动生成）</label>
      <input type="text" :value="memberUid" readonly class="input-disabled" />
    </view>

    <view class="form-group">
      <label>手机号</label>
      <input
          type="number"
          v-model="userPhone"
          placeholder="请输入手机号"
          maxlength="11"
          class="input"
          :disabled="registerSuccess"
      />
    </view>

    <view class="form-group">
      <label>姓名</label>
      <input type="text" v-model="userName" placeholder="请输入姓名" class="input" :disabled="registerSuccess" />
    </view>

    <view class="form-group">
      <label>性别</label>
      <picker :range="genders" :value="genderIndex" @change="onGenderChange" :disabled="registerSuccess">
        <view class="picker">
          {{ genders[genderIndex] }}
        </view>
      </picker>
    </view>

    <view class="form-group">
      <label>生日</label>
      <picker mode="date" :value="birthday" @change="onBirthdayChange" :disabled="registerSuccess">
        <view class="picker">
          {{ birthday || '请选择生日' }}
        </view>
      </picker>
    </view>

    <button
        @click="registerMember"
        :disabled="loading || registerSuccess"
        class="btn-submit"
    >
      {{ loading ? '注册中...' : (registerSuccess ? '注册成功' : '注册') }}
    </button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      memberUid: 'M-infinity',
      userPhone: '',
      userName: '',
      genderIndex: 0,
      genders: ['女', '男', '未知'],
      birthday: '',
      loading: false,
      userId: null,
      registerSuccess: false, // 注册成功标志
    };
  },
  methods: {
    fetchMaxUid() {
      uni.request({
        url: 'https://1hj114ab57208.vicp.fun/manager/member/list',
        method: 'GET',
        success: (res) => {
          if (res.data && Array.isArray(res.data)) {
            let maxNum = 0;
            res.data.forEach((member) => {
              const uid = member.uid;
              if (uid && uid.startsWith('M')) {
                const num = parseInt(uid.slice(1), 10);
                if (!isNaN(num) && num > maxNum) {
                  maxNum = num;
                }
              }
            });
            const nextNum = maxNum + 1;
            this.memberUid = 'M' + nextNum.toString().padStart(5, '0');
          } else {
            this.memberUid = 'M00001';
          }
        },
        fail: () => {
          this.memberUid = 'M00001';
        }
      });
    },

    registerMember() {
      if (!this.userPhone || this.userPhone.length !== 11) {
        uni.showToast({ title: '请输入有效的11位手机号', icon: 'none' });
        return;
      }
      if (!this.userName) {
        uni.showToast({ title: '请输入姓名', icon: 'none' });
        return;
      }

      this.loading = true;
      const genderMap = { 0: 0, 1: 1, 2: 2 };

      const memberData = {
        uid: this.memberUid,
        phone: this.userPhone,
        name: this.userName,
        gender: genderMap[this.genderIndex],
        birthday: this.birthday ? new Date(this.birthday).toISOString() : null,
        userId: this.userId,
        balance: 0.0,
        createdAt: new Date().toISOString(),
      };

      uni.request({
        url: 'https://1hj114ab57208.vicp.fun/manager/member/add',
        method: 'POST',
        data: memberData,
        success: () => {
          // 注册请求成功后，重新获取会员列表进行验证
          uni.request({
            url: 'https://1hj114ab57208.vicp.fun/manager/member/list',
            method: 'GET',
            success: (res) => {
              if (res.data && Array.isArray(res.data)) {
                const exists = res.data.some(
                    (m) => m.uid === this.memberUid && m.name === this.userName
                );
                if (exists) {
                  this.registerSuccess = true;
                  uni.showToast({
                    title: '注册成功',
                    icon: 'success',
                    duration: 3000,
                    success: () => {
                      setTimeout(() => {
                        uni.navigateBack();
                      }, 3000);
                    },
                  });
                } else {
                  uni.showToast({
                    title: '注册异常，未能确认数据，请重试',
                    icon: 'none',
                  });
                }
              } else {
                uni.showToast({
                  title: '无法验证注册结果',
                  icon: 'none',
                });
              }
            },
            fail: () => {
              uni.showToast({
                title: '验证失败，请检查网络',
                icon: 'none',
              });
            },
            complete: () => {
              this.loading = false;
            },
          });
        },
        fail: () => {
          uni.showToast({ title: '网络错误，注册失败', icon: 'none' });
          this.loading = false;
        }
      });
    },

    onGenderChange(e) {
      this.genderIndex = e.detail.value;
    },

    onBirthdayChange(e) {
      this.birthday = e.detail.value;
    },

    syncUserPhoneAndId() {
      const app = getApp();
      if (app.globalData && app.globalData.userInfo) {
        this.userPhone = app.globalData.userInfo.phone || '';
        this.userId = app.globalData.userInfo.userId || null;
      } else {
        const stored = uni.getStorageSync('userInfo');
        if (stored) {
          this.userPhone = stored.phone || '';
          this.userId = stored.userId || null;
        }
      }
    },
  },

  onLoad() {
    this.syncUserPhoneAndId();
    this.fetchMaxUid();
  },
};
</script>

<style>
.container {
  padding: 20px;
  background-color: #fff;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.input,
.picker,
.input-disabled {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.input-disabled {
  background-color: #f5f5f5;
  color: #999;
}

.picker {
  line-height: 36px;
}

.btn-submit {
  width: 100%;
  background-color: #409e3a;
  color: white;
  padding: 12px 0;
  border-radius: 6px;
  font-size: 18px;
}
</style>
