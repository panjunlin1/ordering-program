<script >
import {onLaunch, onShow, onHide} from "@dcloudio/uni-app";
export default {
  globalData: {
    userId: null
  }
}
onLaunch(()=>{
  const cachedUser = wx.getStorageSync('userInfo')
  if (cachedUser && cachedUser.userId) {
    getApp().globalData.userId = cachedUser.userId
  }
})
// import jsrsasign from 'jsrsasign'
//
// const signature = (data) => {
//   let encipher = new jsrsasign.RSAKey()
//   // 私钥 在微信端申请好后会有，一般由后端提供
//   const key = `-----BEGIN PRIVATE KEY-----
// MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDx+Wo2MXwmRVpi
// qxQEj2iiZzgVYXsLC05Tnzspo1n/ObVRfjgeiU/sim0v+b3JTZShfzhX38EqLXGP
// i+VsFWCP1aRmRpyT8DxOwyiZgosF9c8np2ZpeGGQrsOyYCFK/VsrF7zukNY2eZh8
// /5Gi8jlMTcZnwwf0Hx+3QUK9WukThktjHm3z9ZbcBHWlNGNGdqIx/LEYLq4nXuvF
// xPZdouCXyvV1EvJ7IN/Z335jlarIDuWe0oTDBt73KCHQsnE4z3yjzQ67DuMm3Akb
// Y7e3ljyYf4uUTU6WGl5gM6VWP0z9bYzDGZxx9eGeFF8E9OWE6YSZq5WCshVb9zkq
// k6r6odDxAgMBAAECggEARvXAqwHaCZMfDX5kEW5I3g9tCAAdSEDZiHZSsERCOTGg
// NbTRGktkT9bMbFxNxsHki3O2fzaT/B11hwYckpS2S5f4bTHZ6xxxYxuiRVpeELJk
// PJm/08BExFwr8Zx1RvuDh+CfPErnNvRzvnxoJiPon7LTM0yjgXi7IU+XFdaaMWoH
// oqWt82XHnKpdTualbfbA3PTTVHlGQbDIaWDEEBVTCNWWE+NDnRrNYoA+FM8mbzII
// TrMZMig2DDw2mvjd0BFhJMookHVMC+08yNCQXvlqauwFaT9Hth0+IloVfmLxxA73
// mQM+UxhtTKwdrX+l9XwkaF0ZJrWa+gIg2TIxPjVI0QKBgQD9qsu4tLofk2klJ9Xn
// /BVVfHypqHddqAd1J7oMbyoSx93WseYqcG80lFKfYg3RhSLEHqOwYa+ixUycge4k
// HzeC4SMpzV1wniiD8XSBpm6WsL3eOfgsb8WbfvizIQD6xuIMKR63EwqFHjep++Ww
// w0E1nYaMrqsYfwx5iVpLA5pfPQKBgQD0Mxc5vdSiXk43vMKhpPs3X7xdkuZdZE0c
// uxdtyitYf+CPeKF8ZEeiVG8Q8UpR1LEhE/pZf5lGEoZoNsjEK3CqQArOlRbfplJM
// 29xBD/IRts/97EJJMvxg9JhIUQYAYyhdcyrRQLnU7PZDjYYiuB5u3dx5BsRZ6MwS
// +6QJaykTxQKBgBgqA/wVY0GMxlBeyhauQc4B7NIwlSZb0lILtcJneIePeIdyLO3Q
// BhfpJTG/ondaCmTKUmeD9ro3t0OVcP0J6DzUe4gI4yTOPCfNgX60Pwal0YBw3z5E
// a3uTjddqhnBdL71e0Wk5LCBgL4dG0quS/gxAdEfEf9H2kFanie1pa3Q1AoGBAK+A
// OGTrJPI8TIKKSmbZpyI4z6uAc8cS2siXPVNORLCp1r3FuGkpuMHVZK0MfJkq/tID
// BZ1kssdFcQtctBUoEySIOjwVsgayBdvu9vBbgWFxvTGEpm7tEaysnPT8JhAJM21V
// 46PXnLaGRsZt48T4Bgcvs8/XKS5kvKW37EBIn5DxAoGBANoVq3VaM/7Ga4r8RC3W
// NSsSqt3+mPG2sSgByeAL4LhaPtv0aoIHGWvxzUNisjhnX4eBFix8eEtS1SyGuahC
// Ew83f3Zahvem0kh8EM1K9jBRLm8QgmbC+bsUIN80wsjebsioZ22nSBwbo555pidf
// mhm9xAvR5eBI0opjJkMKssK5
// -----END PRIVATE KEY-----`
//   // 把私钥转成16进制并设置秘钥
//   encipher = jsrsasign.KEYUTIL.getKey(key)
//   // 设置SHA256withRSA方式加密
//   const sig = new jsrsasign.KJUR.crypto.Signature({
//     alg: 'SHA256withRSA',
//   })
//   // 初始化
//   sig.init(encipher)
//   // 需要加密的字段，这里注意下一定要按每一个字段一行，切末位加上 \n
//   const str = `${data.appId}\n` +
//       `${data.timeStamp}\n` +
//       `${data.nonceStr}\n` +
//       `${data.package}\n`
//   const paySign = sig.updateString(str)
//   // 加密后,转成base64
//   return jsrsasign.hextob64(sig.sign())
// }
//
// onLaunch(() => {
//   console.log("App Launch");
//   uni.login({
//     provider: 'weixin', //使用微信登录
//     success: function (loginRes) {
//       console.log("xxxxx: ", loginRes.code);
//       uni.request({
//         // url: 'http://localhost:8080/login',
//         url: 'https://11kars1238468.vicp.fun/pay',
//         data: {
//           code: loginRes.code
//         },
//         success: (res) => {
//           let str = {
//             appId: res.data.appId,   //appId后端返回,可在小程序开发平台获取
//             timeStamp: res.data.timeStamp, //10时间戳
//             nonceStr: res.data.nonceStr,  //随机字符串
//             package: 'prepay_id=' + res.data.prePayId, //通过JSAPI下单接口获取到发起支付的必要参数prepay_id
//           }
//           let sign = signature(str);
//           uni.requestPayment({
//             provider: 'wxpay', //支付类型-固定值 这里是微信支付
//             appId: str.appId,  //appId
//             timeStamp: str.timeStamp, // 时间戳（单位：秒）要和上面签名的一致
//             nonceStr: str.nonceStr, // 随机字符串
//             package: str.package, // 固定值 prepay_id
//             signType: 'RSA', //固定值
//             paySign: sign, //签名
//
//             success: function (res) {
//               console.log('支付成功')
//               uni.showToast({
//                 icon: 'success',
//                 title: '支付成功',
//               })
//               //此处为自己的刷新数据方法
//               //_this.getUserInfo()
//             },
//
//             fail: function (err) {
//               console.log('支付失败', err)
//               uni.showToast({
//                 icon: 'none',
//                 title: '支付失败',
//               })
//             },
//           })
//         }
//       });
//     }
//   });
// });
// onShow(() => {
// });
// onHide(() => {
// });
</script>
<style>
</style>
