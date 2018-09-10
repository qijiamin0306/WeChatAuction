//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    isCode: false,
    isBtn: false,
    num: 90,
    mobile: '',
    code: '',
    timer: null
  },
  onShareAppMessage: function () {
    return {
      title: 'hello world',
      path: '/page/indexpages/index/index'
    }
  },
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '绑定手机号'
    })
  },
  // 绑定手机号
  bindMobile: function (e) {
    this.setData(
      { mobile: e.detail.value }
    )
  },
  
  // 绑定验证码
  bindCode: function (e) {
    this.setData(
      { code: e.detail.value }
    )
    if (this.data.code == '') {
      this.setData(
        {
          isBtn: false
        }
      )
    }
    if ((/^1[3|4|5|6|8][0-9]\d{4,8}$/.test(this.data.mobile))) {
      if (this.data.code) {
        this.setData(
          {
            isBtn: true
          }
        )
      }
    }
  },
  timerFun: function () {
    let _this = this
    let timerId = setInterval(function () {
      let num = _this.data.num
      num--
      _this.setData(
        {
          num: num
        }
      )
      if (_this.data.num <= 0) {
        clearInterval(_this.data.timer)
        _this.setData(
          {
            isCode: false,
            num: 90
          }
        )
      }
    }, 1000)
    this.setData(
      {
        timer: timerId
      }
    )
  },
  // 获取验证码
  getCode: function () {
    if (this.data.mobile === '') {
      wx.showToast({
        icon: 'none',
        title: '手机号不能为空！',
      })
      return
    }
    let _this = this
    this.testMobile();
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=members&a=send_reg_code_common&mobile=' + this.data.mobile,
      success: function (res) {
        wx.showToast({
          icon: 'none',
          title: res.data.msg,
        })

        if (res.statusCode === 200) {
          // 定时器
          _this.setData(
            {
              isCode: true

            }
          )
          _this.timerFun()
        }

      },
      fail: function (err) {
        wx.showToast({
          icon: 'none',
          title: '验证码发送错误！',
        })
      }
    })
  },
  // 验证手机号
  testMobile: function () {
    if (!(/^1[3|4|5|6|8][0-9]\d{4,8}$/.test(this.data.mobile))) {
      wx.showToast({
        icon: 'none',
        title: '手机号格式错误！',
      })
      return;
    }
  },
  // bind
  bind: function () {
    this.testMobile();
    if (this.data.code === '') {
      wx.showToast({
        icon: 'none',
        title: '验证码不能为空！',
      })
      return;
    }

    if (app.openid === '') {
      app.getOpenid(this.bind)
      return
    }

    wx.request({
      url: app.apiUrl + '/v1/index.php?c=members&a=bind_wechat_user',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        mobile: this.data.mobile,
        code: this.data.code,
        type: 4,
        mode: 'wechat_small',
        oauth_id: app.openid
      },
      success: function (res) {
        if (res.statusCode === 200) {
          wx.setStorageSync('token', res.data.token);
          wx.setStorageSync('mobile', res.data.mobile);
          app.isBind = true
          // 返回上一级页面
          wx.navigateBack({

          })
        }
      },
      fail: function (err) {
        // wx.showToast({
        //   icon: 'none',
        //   title: '验证码不能为空！',
        // })
      }
    })
  }
})
