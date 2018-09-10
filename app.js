//app.js
App({
  data:{
    who_id:41,
    userInfo:null,
    fieldDetailIdToAuction:null,
  },
  onLaunch: function (path, query) { // 全局只执行一次
    this.userBind();
  },
  
  // 获取支付参数
  pay: function (orderId, succ, err) {
    wx.request({
      url: app.apiUrl + '/v1/index.php/pay/doPay_mini/' + orderId + '/' + this.openid,
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
            success: succ,
            'fail': err,
            'complete': function (res) {

            }
          })
      }
    })
  },



  // 获取用户openid
  getOpenid: function (callback) {
    let _this = this
    wx.login({
      //获取code
      success: function (res) { // 返回code
        let code = res.code
        // 后台处理获取appId
        // 获取openId
        wx.request({
          url: _this.apiUrl + '/v1/index.php?c=members&a=get_openid',
          header: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          method: 'POST',
          data: {
            code: code
          },
          success: function (res) {

            // 成功回调
            if (res.statusCode === 200) {
              _this.openid = res.data.openid
              if (callback) {
                callback();
              }
            } else {
              _this.openid = ''
            }
          },
          fail: function () {
            _this.openid = ''
          }
        })
      }
    })
  },
  // 判断用户是否绑定到商城
  userBind: function () {
    // 如果没有openID,则先获取openID
    if (this.openid === '') {
      this.getOpenid(this.userBind);
      return
    }

    let _this = this
    wx.request({
      url: this.apiUrl + '/v1/index.php?c=members&a=is_wechat_bind',
      header: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      method: 'POST',
      data: {
        mode: 'wechat_small',
        oauth_id: this.openid
      },
      success: function (res) {
        if (res.statusCode === 200) {
          wx.setStorageSync('token', res.data.token)
          wx.setStorageSync('mobile', res.data.mobile)
          _this.isBind = true
        } else {
          wx.removeStorageSync('mobile')
          _this.isBind = false
        }
      },
      fail: function () {
        _this.isBind = false
      }
    })
  },

  // 获取TOKEN,成功之后进行别的操作
  getToken: function (callback) {
    let _this = this
    if (this.openid) {
      wx.request({
        url: this.apiUrl + '/v1/index.php?c=members&a=is_wechat_bind',
        header: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        method: 'POST',
        data: {
          mode: 'wechat_small',
          oauth_id: this.openid
        },
        success: function (res) {
          if (res.statusCode === 200) {
            wx.setStorageSync('token', res.data.token)

            wx.setStorageSync('mobile', res.data.mobile)
            _this.isBind = true
            if (callback) {
              callback()
            }
          } else {
            _this.isBind = false
          }
        },
        fail: function () {
          _this.isBind = false
        }
      })
    }
  },
  // validateToken
  validateToken: function (callback) {
    let _this = this
    wx.request({
      url: _this.apiUrl + '/v1/index.php?c=user&a=authorization',
      method: 'POST',
      header: {
        'x-access-token': wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode === 200) {
          if (callback) {
            callback()
          }

        } else if (res.statusCode === 201) {
          s
          wx.setStorageSync('token', res.data.token)
          if (callback) {
            callback()
          }
        } else {
          if (callback) {
            _this.getToken(callback)
          } else {
            _this.getToken()
          }
        }
      }
    })
    
  },
  openid: '',
  isBind: false,
  isToken: true,
  apiUrl: 'https://api.iweicang.com',
  // apiUrl: 'https://www.iweicang.com',
  imgUrl: 'https://pic.iweicang.com',
  pays: function () {
    wx.navigateTo({
      url: '../orderDetail/index'
    })
    return

    if (app.openid === '') { // 如果没有openid
      app.getOpenid();
      return;
    }
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=order&a=payAuction',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'x-access-token': wx.getStorageSync('token')
      },
      data: {
        id: this.data.id,
        method: 'wechat_mini',
        terminal: 'wechat',
        add_id: '6701'
      },
      success: function (res) {
        if (res.statusCode === 200) {
          // 获取openid
          let orderId = res.data.id
          wx.login({
            //获取code
            success: function (res) {
              var code = res.code; //返回code
              // 后台处理获取appId
              // 获取openId
              wx.request({
                url: app.apiUrl + '/v1/index.php?c=members&a=get_openid',
                header: {
                  'Content-type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json'
                },
                method: 'POST',
                data: {
                  code: code
                },
                success: function (res) {
                  // 获取支付参数
                  wx.request({
                    url: app.apiUrl + '/v1/index.php/pay/doPay_mini/' + orderId + '/' + res.data.openid,
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
                          },
                          'fail': function (res) { },
                          'complete': function (res) { }
                        })
                    }
                  })
                }
              })
            }
          })
        }
      }
    })
  },
})