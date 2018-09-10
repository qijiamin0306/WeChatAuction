//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
  },
  // onShareAppMessage: function () {
  //   return {
  //     title: 'hello world',
  //     path: '/page/indexpages/index/index'
  //   }
  // },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '常见问题'
    })
  }
})
