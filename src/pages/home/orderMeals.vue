<template>
  <view class="container">
    <scroll-view class="left-menu" scroll-y>
      <view
          v-for="(type, index) in types"
          :key="type.id"
          :class="['menu-item', currentType === type.id ? 'active' : '']"
          @click="selectType(type.id)"
      >
        {{ type.name }}
      </view>
    </scroll-view>

    <scroll-view class="right-content" scroll-y>
      <view v-for="dish in filteredDishes" :key="dish.id" class="dish-item">
        <image :src="dish.image" class="dish-image" mode="aspectFill" />
        <view class="dish-info">
          <text class="dish-name">{{ dish.dish_name }}</text>
          <text class="dish-desc">{{ dish.description }}</text>
          <text class="dish-price">￥{{ dish.price.toFixed(2) }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="cart-bar">
      <text>总价：￥{{ totalPrice.toFixed(2) }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const types = ref([])
const dishes = ref([])
const currentType = ref(0)
const selectedDishes = ref([])

const selectType = (id) => {
  currentType.value = id
}

const filteredDishes = computed(() => {
  return dishes.value.filter(d => d.type_id === currentType.value && d.is_available === 1)
})

const totalPrice = computed(() => {
  return selectedDishes.value.reduce((sum, d) => sum + d.price, 0)
})

onMounted(async () => {
  const res = await uni.request({
    url: 'https://1hj114ab57208.vicp.fun/api/menu',
    method: 'GET'
  })
  dishes.value = res.data.dishes
  types.value = res.data.types
  if (types.value.length > 0) {
    currentType.value = types.value[0].id
  }
})
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  flex-direction: row;
}
.left-menu {
  width: 30%;
  background: #f5f5f5;
}
.menu-item {
  padding: 16rpx;
  text-align: center;
}
.active {
  background-color: #ffe8cc;
  font-weight: bold;
}
.right-content {
  width: 70%;
  padding: 20rpx;
}
.dish-item {
  display: flex;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.dish-image {
  width: 160rpx;
  height: 160rpx;
}
.dish-info {
  flex: 1;
  padding: 10rpx;
}
.dish-name {
  font-size: 32rpx;
  font-weight: bold;
}
.dish-desc {
  font-size: 24rpx;
  color: #666;
}
.dish-price {
  font-size: 28rpx;
  color: #e64340;
}
.cart-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100rpx;
  background: #fff;
  border-top: 1rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
