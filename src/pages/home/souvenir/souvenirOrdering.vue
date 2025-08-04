<template>
  <view class="container">

    <!-- 主界面，菜单+购物车 -->
    <view>
      <!-- 菜单分类和菜品 -->
      <view>
        <view class="souvenir-list">
          <view
              v-for="souvenir in menu"
              :key="souvenir.id"
              class="souvenir-item"
          >
            <image :src="souvenir.image || 'https://picsum.photos/200/200'" class="souvenir-image" mode="aspectFill" />
            <view class="souvenir-info">
              <view class="souvenir-name">{{ souvenir.souvenirName }}</view>
              <view class="souvenir-description">{{ souvenir.description }}</view>
              <view class="souvenir-price">￥{{ souvenir.price.toFixed(2) }}</view>
            </view>
            <view class="souvenir-actions">
              <button v-if="selectedSouvenir[souvenir.id] > 0" class="btn-action" @click="decreaseCount(souvenir)">-</button>
              <view v-if="selectedSouvenir[souvenir.id] > 0" class="count">{{ selectedSouvenir[souvenir.id] }}</view>
              <button class="btn-action" @click="increaseCount(souvenir)">+</button>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部购物车面板 -->
      <view :class="['cart-panel', isCartOpen ? 'open' : 'closed']">
        <!-- 面板头部 -->
        <view class="cart-header" @click="toggleCart">
          <view class="cart-info">
            <text class="cart-icon">🛒</text>
            <text class="item-count">{{ totalCount }}</text>
            <text class="item-count">运费:￥{{ 10 }}</text>
            <text class="total-price">总价: ￥{{ totalPrice.toFixed(2)}}</text>
          </view>
          <button class="checkout-btn" @click="onCheckout">结算</button>
        </view>

        <!-- 面板内容 -->
        <view v-if="isCartOpen" class="cart-content">
          <view v-if="totalCount === 0" class="empty-cart">购物车空空如也</view>
          <view v-for="(count, souvenirId) in selectedSouvenir" :key="souvenirId" class="cart-item">
            <image
                class="cart-item-image"
                :src="menu.find(d => d.id === Number(souvenirId))?.image || 'https://picsum.photos/100'"
                mode="aspectFill"
            />
            <view class="cart-item-info">
              <text class="item-name">{{ menu.find(d => d.id === Number(souvenirId))?.souvenirName || '' }}</text>
              <view class="souvenir-price">￥{{ (menu.find(d => d.id === Number(souvenirId))?.price ?? 0).toFixed(2) }}</view>
              <view class="actions-right">
                <text class="item-count">×{{ count }}</text>
                <button class="btn-small" @click="decreaseCount(menu.find(d => d.id === Number(souvenirId)))">-</button>
                <button class="btn-small" @click="increaseCount(menu.find(d => d.id === Number(souvenirId)))">+</button>
              </view>
            </view>
          </view>
        </view>
      </view>

    </view>

  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import baseUrl from '../../../config.js'

// 菜单相关
const menu = ref([])
const selectedSouvenir = ref({})
const isCartOpen = ref(false)

//查询全部好物
const fetchMenu = async () => {
  const {data} = await uni.request({
    url: baseUrl + `/manager/souvenir/all`,
    method: 'GET'
  })
  if (data.code===200) {
    menu.value = data.data
    selectedSouvenir.value = {}
  } else {
    uni.showToast({
      title: data.msg || '菜单加载失败',
      icon: 'error'
    })
  }
}

const increaseCount = (souvenir) => {
  if (!selectedSouvenir.value[souvenir.id]) selectedSouvenir.value[souvenir.id] = 0
  selectedSouvenir.value = { ...selectedSouvenir.value, [souvenir.id]: selectedSouvenir.value[souvenir.id] + 1 }
}

const decreaseCount = (souvenir) => {
  if (!souvenir || !selectedSouvenir.value[souvenir.id]) return
  if (selectedSouvenir.value[souvenir.id] > 0) {
    selectedSouvenir.value = { ...selectedSouvenir.value, [souvenir.id]: selectedSouvenir.value[souvenir.id] - 1 }
    if (selectedSouvenir.value[souvenir.id] === 0) {
      delete selectedSouvenir.value[souvenir.id]
    }
  }
}
const totalCount = computed(() => {
  return Object.values(selectedSouvenir.value).reduce((sum, c) => sum + c, 0)
})

//运费
const deliveryFee = ref(10)

// 计算总价
const totalPrice = computed(() => {
  const souvenirTotal = Object.entries(selectedSouvenir.value).reduce((total, [souvenirId, count]) => {
    const souvenir = menu.value.find(d => d.id === Number(souvenirId))
    return total + (souvenir ? souvenir.price * count : 0)
  }, 0)
  //运费+商品费
  return souvenirTotal  + deliveryFee.value
})

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}


onMounted(() => {
  fetchMenu()
})

//结算
const onCheckout = () => {
  const selectedIds = Object.keys(selectedSouvenir.value)
  const productList = selectedIds.map(souvenirId => {
    const souvenir = menu.value.find(d => d.id === Number(souvenirId))
    if (!souvenir) return null
    return {
      id: souvenir.id,
      name: souvenir.souvenirName,
      price: souvenir.price,
      quantity: selectedSouvenir.value[souvenirId],
      imgUrl: souvenir.image,
      spec: souvenir.spec || ''
      // 去掉 shopId 和 shopName，改用 currentShop 统一传递
    }
  }).filter(Boolean)

  if (productList.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }

  const orderData = {
    products: productList,
  }

  console.log('订单结算数据:', orderData)


  uni.navigateTo({
    url: `/pages/home/souvenir/souvenirPaid?data=${encodeURIComponent(JSON.stringify(orderData))}`
  })
}



</script>

<style scoped>
.container {
  padding: 16rpx;
  padding-bottom: 140rpx;
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #e0f2f1; /* 浅墨绿色背景 */
}

/* 门店选择遮罩弹窗 */
.shop-select-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1200;

  display: flex;
  justify-content: center;
  align-items: center;
}

/* 弹窗内容 */
.shop-list-popup {
  background: #004d40;
  border-radius: 20rpx;
  padding: 30rpx 40rpx;
  width: 80vw;
  max-height: 80vh;
  overflow-y: auto;
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.5);
}

/* 省份标题 */
.province-title {
  font-size: 32rpx;
  font-weight: bold;
  padding: 16rpx 10rpx;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  border-bottom: 1rpx solid #00332f;
}

/* 门店项 */
.shop-item {
  font-size: 28rpx;
  padding: 12rpx 20rpx;
  cursor: pointer;
  border-bottom: 1rpx solid #002822;
}
.shop-item:hover {
  background-color: #00221a;
}

/* 左上角当前门店显示 */
.shop-selector {
  position: fixed;
  top: 20rpx;
  left: 20rpx;
  z-index: 1100;
  background: #004d40;
  border-radius: 12rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.25);
  font-size: 28rpx;
  color: #fff;
  display: flex;
  align-items: center;
  user-select: none;
}
.change-shop-btn {
  margin-left: 20rpx;
  color: #1de9b6;
  cursor: pointer;
  font-weight: bold;
}

/* 分类标题 */
.type-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 20rpx 0 10rpx 0;
  color: #000;
  border-left: 10rpx solid #004d40;
  padding-left: 16rpx;
}

/* 菜品列表 */
.souvenir-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.souvenir-item {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.souvenir-image {
  width: 180rpx;
  height: 140rpx;
  object-fit: cover;
  border-top-left-radius: 16rpx;
  border-bottom-left-radius: 16rpx;
}
.souvenir-info {
  flex: 1;
  padding: 20rpx;
}
.souvenir-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #000;
}
.souvenir-description {
  font-size: 24rpx;
  color: #333;
  margin: 8rpx 0;
}
.souvenir-price {
  font-size: 28rpx;
  color: #004d40;
  font-weight: bold;
}

/* + - 按钮 */
.souvenir-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
  padding: 0 20rpx;
}
.btn-action,
.btn-small {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: #004d40;
  color: #fff;
  font-size: 32rpx;
  border: none;

  display: flex;
  justify-content: center;
  align-items: center;

  user-select: none;
}

/* 底部购物车 */
.cart-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;

  max-height: 100vh;
  overflow: visible;
  transition: height 0.3s ease;
}
.cart-panel.closed {
  height: 100rpx;
}
.cart-panel.open {
  max-height: 80vh;
  overflow-y: auto;
}

/* 面板头部 */
.cart-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 20rpx;
  background: #004d40;
  color: #fff;
  border-top-left-radius: 16rpx;
  border-top-right-radius: 16rpx;
}
.cart-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}
.cart-icon {
  font-size: 36rpx;
}
.total-price {
  font-weight: bold;
}
.checkout-btn {
  background: #1de9b6;
  color: #000;
  border-radius: 20rpx;
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  border: none;
}

/* 面板内容 */
.cart-content {
  padding: 20rpx;
}
.empty-cart {
  text-align: center;
  color: #888;
  font-size: 28rpx;
}
.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  gap: 16rpx;
}
.cart-item-image {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  object-fit: cover;
  flex-shrink: 0;
}
.cart-item-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.actions-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding-right: 20rpx;
}
.actions-right .btn-small:first-child {
  order: 1;
}
.actions-right .item-count {
  order: 2;
  width: 40rpx;
  text-align: center;
  line-height: 40rpx;
  font-weight: bold;
  color: #000;
}
.actions-right .btn-small:last-child {
  order: 3;
}
.item-count {
  margin-right: 12rpx;
}
</style>
