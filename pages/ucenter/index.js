//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    isUser: false,
    isMobile: false,
    mobile: '',
    userInfo: null
  },
  onShow: function () {
    if (!app.isBind) {
      
    }
    let mobile = wx.getStorageSync('mobile')
    if (mobile) {
      this.setData(
        {
          isMobile: true,
          mobile: mobile
        }
      )
    }
  },
  onLoad: function () {
    if (app.data.userInfo){
      this.setData({
        userInfo: app.data.userInfo
      })
    }
    wx.setNavigationBarTitle({
      title: '个人中心'
    })
    this.getUserInfo()
    if (app.isBind) {
      this.setData(
        {isMobile: true}
      )
      this.setData(
        {
          mobile: wx.getStorageSync('mobile')
        }
      )
    }
  },
  get: function () {
    this.getUserInfo()
  },
  bind: function () {
    if (!this.data.userInfo) {
      wx.showToast({
        icon: 'none',
        title: '请您先登录！',
      })
      return
    }
    if (!app.isBind) {
      wx.navigateTo({
        url: '../login/index'
      })
    }
  },
  getUserInfo: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData(
                {
                  userInfo: res.userInfo,
                  isUser: true
                }
              )
              app.isShowMobil = true
            }
          })
        }
      }
    })
  }
})
