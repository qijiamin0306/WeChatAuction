//index.js
var util = require('../../utils/util.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    isAddress: false,
    isOrderAddress: false, // 订单地址
    isPay: false, // 是否需要付款
    isDefault: true,
    id: 0,
    addressId: 0,
    orderDetailInfo: {},
    addressInfo: [],
    allAddress:[],
    imgUrl: app.imgUrl,

    addressList:[],
    isFromAddress: false
  },
  onShareAppMessage: function () {
    return {
      title: 'hello world',
      path: '/page/indexpages/index/index'
    }
  },
  onLoad: function (options) {
    var that = this
    this.setData(
      { id: options.id }
    )
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
    this.addressList()   
    this.loadOrderDetail();
  },

  addressList: function () {
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=getList',
      data: '',
      header: { 'x-access-token': wx.getStorageSync('token') },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        if (res.data) {
          that.setData({
          addressList:res.data
          })
          that.defaultAddress();
        } 
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  defaultAddress: function(){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=getDefaultAddress',
      data: '',
      header: { 'x-access-token': wx.getStorageSync('token')},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        if(res.statusCode===200){
          that.setData({
            isAddress: true,
            isDefault:false,
            addressInfo: res.data
          })
        } else{
          that.setData({
            isAddress: true,
            isDefault: false,
            addressInfo: that.data.addressList[0]
          })
        }
      },
      fail: function(res) {

      },
      complete: function(res) {},
    })
  },
  // orderDetail
  loadOrderDetail: function () {
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=order&a=detail&id=' + this.data.id, //仅为示例，并非真实的接口地址
      header: {
        'content-type': 'application/json', // 默认值
        'x-access-token': wx.getStorageSync('token')
      },
      success: (res) => {
        let data = res.data
        data.create_time = util.formatTime2(new Date(parseInt(data.create_time * 1000)))
        if (data.pay_time) {
          data.pay_time = util.formatTime2(new Date(parseInt(data.pay_time * 1000)))
        }
        that.setData(
          { orderDetailInfo: data }
        )
        // 如果订单状态为---待付款
        if (data.status === '1') {
          this.setData(
            {
              isPay: true
            }
          )
        } else if (data.status === '2' || data.status === '5' || data.status === '6' || data.status === '7' || data.status === '8') { // 已支付或已完成
          this.setData(
            {
              isAddress: true,
              isPay: false,
              isOrderAddress: true
            }
          )
        }
      }
    })
  },
  // pay
  pay: function () {
    let _this = this
    if (!this.data.addressInfo) {
      wx.showToast({
        icon: 'none',
        title: '地址不能为空',
      })
      return
    }  
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=order&a=payAuction',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'x-access-token': wx.getStorageSync('token')
      },
      data: {
        id: _this.data.id,
        method: 'wechat_mini',
        terminal: 'wechat',
        add_id: _this.data.addressInfo.id
      },
      success: function (res) {
        if (res.statusCode === 200) {
          let orderId = res.data.id
          wx.request({
            url: app.apiUrl + '/v1/index.php/pay/doPay_mini/' + orderId + '/' + app.openid,
            success: function (res) {
              let data = res.data;
              wx.requestPayment(
                {
                  'appId': data.appId,
                  'timeStamp': data.timeStamp.toString(),
                  'nonceStr': data.nonceStr.toString(),
                  'package': data.package,
                  'signType': data.signType,
                  'paySign': data.paySign,
                  success: function (res) {
                    _this.loadOrderDetail();
                    _this.setData(
                      {
                        isPay: false
                      }
                    )
                  },
                  'fail': function (res) {
                    wx.showToast({
                      icon: 'none',
                      title: '付款失败！',
                    })
                  },
                  'complete': function (res) {

                  }
                })
            }
          })
        }
      }
    })
  },
})
