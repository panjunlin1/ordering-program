<template>
  <view class="container">

    <!-- 强制门店选择弹窗（遮罩层） -->
    <view v-if="showShopSelector" class="shop-select-mask">
      <view class="shop-list-popup">
        <view
            v-for="(shops, province) in shopsByProvince"
            :key="province"
            class="province-group"
        >
          <view class="province-title" @click="toggleProvince(province)">
            {{ province }}
            <text>{{ openedProvinces.has(province) ? '▲' : '▼' }}</text>
          </view>
          <view v-show="openedProvinces.has(province)">
            <view
                v-for="shop in shops"
                :key="shop.id"
                class="shop-item"
                @click="selectShop(shop)"
            >
              {{ shop.shopName }} - {{ shop.address }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 主界面，菜单+购物车 -->
    <view v-if="!showShopSelector">

      <!-- 左上角显示当前选中门店 -->
      <view class="shop-selector">
        <text>门店: {{ currentShop?.shopName || '未知门店' }}</text>
        <text class="change-shop-btn" @click="showShopSelector = true">[切换]</text>
      </view>

      <!-- 菜单分类和菜品 -->
      <view v-for="type in types" :key="type" class="type-section">
        <view class="type-title">{{ type }}</view>
        <view class="dish-list">
          <view
              v-for="dish in menu.filter(d => d.typeName === type)"
              :key="dish.id"
              class="dish-item"
          >
            <image :src="dish.image || 'https://picsum.photos/200/200'" class="dish-image" mode="aspectFill" />
            <view class="dish-info">
              <view class="dish-name">{{ dish.dishName }}</view>
              <view class="dish-description">{{ dish.description }}</view>
              <view class="dish-price">￥{{ dish.price.toFixed(2) }}</view>
            </view>
            <view class="dish-actions">
              <button v-if="selectedDishes[dish.id] > 0" class="btn-action" @click="decreaseCount(dish)">-</button>
              <view v-if="selectedDishes[dish.id] > 0" class="count">{{ selectedDishes[dish.id] }}</view>
              <button class="btn-action" @click="increaseCount(dish)">+</button>
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
            <text class="total-price">总价: ￥{{ totalPrice.toFixed(2)}}</text>
          </view>
          <button class="checkout-btn" @click="onCheckout">结算</button>
        </view>

        <!-- 面板内容 -->
        <view v-if="isCartOpen" class="cart-content">
          <view v-if="totalCount === 0" class="empty-cart">购物车空空如也</view>
          <view v-for="(count, dishId) in selectedDishes" :key="dishId" class="cart-item">
            <image
                class="cart-item-image"
                :src="menu.find(d => d.id === Number(dishId))?.image || 'https://picsum.photos/100'"
                mode="aspectFill"
            />
            <view class="cart-item-info">
              <text class="item-name">{{ menu.find(d => d.id === Number(dishId))?.dishName || '' }}</text>
              <view class="dish-price">￥{{ (menu.find(d => d.id === Number(dishId))?.price ?? 0).toFixed(2) }}</view>
              <view class="actions-right">
                <text class="item-count">×{{ count }}</text>
                <button class="btn-small" @click="decreaseCount(menu.find(d => d.id === Number(dishId)))">-</button>
                <button class="btn-small" @click="increaseCount(menu.find(d => d.id === Number(dishId)))">+</button>
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
import baseUrl from '../../config.js'


const shops = ref([]) // 门店列表
const showShopSelector = ref(true) // 强制弹窗显示

const currentShop = ref(null)
const openedProvinces = ref(new Set())

// 菜单相关
const menu = ref([])
const types = ref([])
const selectedDishes = ref({})
const isCartOpen = ref(false)

// 取省市，简单正则匹配地址开头省/市/自治区等关键词
function extractProvince(address) {
  if (!address) return '未知地区'
  const cityMatch = address.match(/^(.*?市|.*?省|.*?自治区|.*?特别行政区)/)
  return cityMatch ? cityMatch[0] : address.slice(0, 2)
}

// 根据省份分组门店
const shopsByProvince = computed(() => {
  const map = {}
  shops.value.forEach(shop => {
    const province = extractProvince(shop.address)
    if (!map[province]) map[province] = []
    map[province].push(shop)
  })
  return map
})

function toggleProvince(province) {
  if (openedProvinces.value.has(province)) {
    openedProvinces.value.delete(province)
  } else {
    openedProvinces.value.add(province)
  }
  openedProvinces.value = new Set(openedProvinces.value) // 触发响应式
}

function selectShop(shop) {
  currentShop.value = shop
  showShopSelector.value = false
  selectedDishes.value = {}
  fetchMenu(shop.id)
}

const fetchShops = async () => {
  const res = await uni.request({
    url: baseUrl + '/manager/shop/all',
    method: 'GET'
  })
  if (res.statusCode === 200 && res.data.code === 200 && Array.isArray(res.data.data)) {
    shops.value = res.data.data
  } else {
    uni.showToast({ title: '门店列表加载失败', icon: 'error' })
  }
}

const fetchMenu = async (shopId) => {
  if (!shopId) return
  const res = await uni.request({
    url: baseUrl + `/shop/getDishes?shopId=${shopId}`,
    method: 'GET'
  })
  if (res.statusCode === 200 && res.data.code === 200 && Array.isArray(res.data.data)) {
    menu.value = res.data.data
    types.value = [...new Set(menu.value.map(d => d.typeName))]
    selectedDishes.value = {}
  } else {
    uni.showToast({
      title: res.data.msg || '菜单加载失败',
      icon: 'error'
    })
  }
}

const increaseCount = (dish) => {
  if (!selectedDishes.value[dish.id]) selectedDishes.value[dish.id] = 0
  selectedDishes.value = { ...selectedDishes.value, [dish.id]: selectedDishes.value[dish.id] + 1 }
}

const decreaseCount = (dish) => {
  if (!dish || !selectedDishes.value[dish.id]) return
  if (selectedDishes.value[dish.id] > 0) {
    selectedDishes.value = { ...selectedDishes.value, [dish.id]: selectedDishes.value[dish.id] - 1 }
    if (selectedDishes.value[dish.id] === 0) {
      delete selectedDishes.value[dish.id]
    }
  }
}
const totalCount = computed(() => {
  return Object.values(selectedDishes.value).reduce((sum, c) => sum + c, 0)
})


const totalPrice = computed(() => {
  return Object.entries(selectedDishes.value).reduce((total, [dishId, count]) => {
    const dish = menu.value.find(d => d.id === Number(dishId))
    return dish ? total + dish.price * count : total
  }, 0)
})

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value
}


onMounted(() => {
  fetchShops()
})
const onCheckout = () => {
  const selectedIds = Object.keys(selectedDishes.value)
  const productList = selectedIds.map(dishId => {
    const dish = menu.value.find(d => d.id === Number(dishId))
    if (!dish) return null
    return {
      id: dish.id,
      name: dish.dishName,
      price: dish.price,
      quantity: selectedDishes.value[dishId],
      imgUrl: dish.image,
      spec: dish.spec || ''
      // 去掉 shopId 和 shopName，改用 currentShop 统一传递
    }
  }).filter(Boolean)

  if (productList.length === 0) {
    uni.showToast({ title: '请先选择商品', icon: 'none' })
    return
  }

  const store = {
    id: currentShop.value?.id,
    name: currentShop.value?.shopName,
    phone: currentShop.value?.phone || '',
    address: currentShop.value?.address|| ''
  }

  const orderData = {
    products: productList,
    store
  }

  console.log('订单结算数据:', orderData)


  uni.navigateTo({
    url: `/pages/home/unpaid?data=${encodeURIComponent(JSON.stringify(orderData))}`
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
.dish-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.dish-item {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.dish-image {
  width: 180rpx;
  height: 140rpx;
  object-fit: cover;
  border-top-left-radius: 16rpx;
  border-bottom-left-radius: 16rpx;
}
.dish-info {
  flex: 1;
  padding: 20rpx;
}
.dish-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #000;
}
.dish-description {
  font-size: 24rpx;
  color: #333;
  margin: 8rpx 0;
}
.dish-price {
  font-size: 28rpx;
  color: #004d40;
  font-weight: bold;
}

/* + - 按钮 */
.dish-actions {
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
