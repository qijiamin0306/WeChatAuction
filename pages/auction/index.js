//index.js
var util = require('../../utils/util.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    id: 0, // 拍品ID
    isPrice: true, // 弹出层
    isCountDown: false, // 倒计时
    isVideo: false, // 视频
    isHasVideo: false, // 是否有视频
    isDeposit: false, // 保证金
    isPay: false, // 直接付款
    isOver: false,
    hiddenVideo: true,

    instruction: '距结束还有:',
    countDown: '', // 倒计时
    timeStamp: '', // 时间戳

    offerId: 1, // 出价类型
    offerPrice: 0, // 出价价格

    interval: 3000,
    duration: 500,
    imgUrl: 'https://pic.iweicang.com',
    //imgUrl1: 'https://www.iweicang.com',

    commentList: [],
    goodsInfo: {}, // 拍品信息
    offerList: [], // 出价列表
    rangePrice: 0, // 加价幅度
    price1: 0,
    price2: 0,
    fixedPrice: 0, // 一口价
    timer: null,

    userId:null,
    user_openid: null,  //分享用户的openid
    friend_ip :null //好友ip
  },
  onShow: function () {
    this.setData(
      {
        isPrice: true
      }
    )
    // 刷新数据
    this.loadGoodsDetail() // 加载拍品详情
    this.loadOfferList() // 加载出价列表
  },
  onLoad: function (options) {
    // 获取拍品ID
    this.setData({
      id: options.id,
      user_openid: app.openid,
    })
    if (options.share) {
      this.setData({
        userId:options.user_openid,
      })
      this.getIp()
    }
  },
  load: function () {
  },
  play: function () {
    this.setData(
      {
        hiddenVideo: false
      }
    )
  },
  getIp:function(){
    var that = this;
    wx.request({
      url: 'http://ip-api.com/json',
      success: function (e) {
        that.setData({
          friend_ip: e.data.query
        })
        that.shareSaleFunc();
      }
    })
  },
  pause: function () {
    this.setData(
      {
        hiddenVideo: true
      }
    )
  },

  onShareAppMessage: function () {
    return {
      title: "爱微藏+",        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index?auctionId=' + this.data.id + '&fieldDetailIdToAuction=' + app.fieldDetailIdToAuction + '&user_openid=' + this.data.user_openid,       // 默认是当前页面，必须是以‘/’开头的完整路径    
    }
  },

  // validateToken
  validateToken: function () {
    let _this = this
    let token = wx.getStorageSync('token')
    if (token) {
      wx.request({
        url: app.apiUrl + '/v1/index.php?c=user&a=authorization',
        method: 'POST',
        header: {
          'x-access-token': token
        },
        success: function (res) {
          if (res.statusCode === 200) {
            _this.showPrice()
          } else if (res.statusCode === 201) {
            wx.setStorageSync('token', res.data.token)
            _this.showPrice()
          } else {
            app.getToken(_this.showOffer)
          }
        },
        
        complete: function () {

        }
      })
    }
    
  },
  // 拍品详情
  loadGoodsDetail: function () {
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=auction&a=goodsDetail&id=' + this.data.id,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        // 设置标题
        wx.setNavigationBarTitle({
          title: '翡翠禄来',
        })

        let data = res.data;
        this.setData(
          { goodsInfo: res.data }
        )
        // 处理倒计时
        let status
        let time

        if (data.goods_status === '1') {
          status = '距开始还有：'
          time = data.star_time;
          this.setData(
            { isPay: true }
          )
        } else if (data.goods_status === '2') {
          status = '距结束还有：'
          time = data.end_time;
        } else if (data.goods_status === '3') {          
          status = '拍卖已结束'
          this.setData({
            isOver: true,
            isPay: true
          })
        } else if (data.goods_status === '4'){        
          status = '拍卖已结束'
          this.setData({
            isOver: true,
            isPay: true
          })
        }
        this.setData(
          {
            isCountDown: true,
            instruction: status,
            timeStamp: parseInt(time)
          }
        )

        if (data.goods_status !== '3') {
          this.down() // 开启倒计时
        }


        // 是否有视频介绍
        if (!(res.data.content === '0')) {
          this.setData(
            { isHasVideo: true }
          )
        }

        // 如果该拍品需要保证金
        if (!(res.data.deposit == '0.00' || res.data.deposit == '0')) {
          // app.getToken(this.deposit)
          // 获取保证金状态
          this.deposit();
        }

        // 拍卖结束 --- 检查是否为中拍者
        // if (!(res.data.goods_status === 3)) {
        //   this.pay();
        // }


        // 设置出价基本信息
        let nowPrice
        let daiPrice
        let rangePrice = parseInt(data.range_price)
        let fixedPrice = parseInt(data.direct_price)
        if (data.now_price === '0.00') { // 如果当前价位 0.00
          if(data.star_price === '0.00') {
            nowPrice = parseInt(res.data.range_price)
            daiPrice = rangePrice * 2
          } else {
            nowPrice = parseInt(res.data.star_price)
            daiPrice = parseInt(data.star_price) + rangePrice
          }
        } else { // 如果当前价位不为 0.00
          nowPrice = parseInt(data.now_price) + rangePrice
          daiPrice = parseInt(data.now_price) + rangePrice * 2;
        }



        this.setData(
          {
            price1: nowPrice,
            price2: daiPrice,
            rangePrice: rangePrice,
            fixedPrice: fixedPrice
          }
        );

      },
      complete: function () {
        wx.hideLoading()
      },
    })
  },
  // countDown
  down: function () {
    let _this = this;
    let id = setTimeout(function () {
      let num = _this.data.timeStamp
      let data = util.formatTime1(_this.data.timeStamp)
      _this.setData(
        {
          timeStamp: num,
          countDown: data,
          isCountDown: true,
          timer: id
        }
      )
      // 拍卖结束 -- 清除定时器，隐藏倒计时
      if (data === '00天00小时00分00秒') {
        clearTimeout(_this.data.timer)
        this.setData(
          {
            isCountDown: false
          }
        )
      } else {
        _this.down()
      }
    }, 1000)
  },
  // 绑定手机号
  bindMobile: function () {
    // 1.是否登录
    if (!app.isBind) { // 没有绑定，必须先绑定手机号
      wx.navigateTo({
        url: '../login/index'
      })
      return
    }
  },

  /**
   * 出价按钮
   */
  // 判断用户状态  -- 1.未绑定； 2.绑定未登录； 3.绑定已登录
  showOffer: function (e) {
    var that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 1.先验证是否绑定
          that.bindMobile()
          // 2.验证token有效性
          that.validateToken()
        } else {
          // app.data.userInfo = e.detail.userInfo
          // app.data.isUser = true
        }
      }
    })  
  },


  /**
   * 出价方式
   */
  // 正常出价
  offer: function (e) {
    let typeId = e.currentTarget.dataset.id
    this.setData(
      {
        offerId: 1,
        offerPrice: this.data.price1
      }
    )
    this.offerAjax()
  },

  // 一口价
  fixedOffer: function (e) {
    this.setData(
      {
        offerId: 2,
        offerPrice: this.data.goodsInfo.direct_price
      }
    )
    this.offerAjax()
  },

  // 代理出价
  agentOffer: function (e) {
    this.setData(
      {
        offerId: 3,
        offerPrice: this.data.price2
      }
    )
    this.offerAjax()
  },
  
  test: function () {
    wx.showToast({
      title: '出价不能小于0',
      icon: 'none'
    })
  },
  // 改变出价
  minusPrice1: function () {
    if (this.data.price1 - this.data.rangePrice < 0) {
      wx.showToast({
        title: '出价不能小于0',
        icon: 'none'
      })
      return
    }
    var that = this,
      price = this.data.price1 - this.data.rangePrice
    this.setData({
      price1: price
    })
  },
  addPrice1: function () {
    var that = this,
      price = this.data.price1 + this.data.rangePrice
    this.setData({
      price1: price
    })
  },
  minusPrice2: function () {
    if (this.data.price2 - this.data.rangePrice < 0) {
      wx.showToast({
        title: '出价不能小于0',
        icon: 'none'
      })
      return
    }
    var that = this,
      price = this.data.price2 - this.data.rangePrice
    this.setData({
      price2: price
    })
  },
  addPrice2: function () {
    var that = this,
      price = this.data.price2 + this.data.rangePrice
    this.setData({
      price2: price
    })
  },

  // 隐藏出价操作
  hide: function () {
    this.setData({
      isPrice: true
    })
  },
  // 显示出价操作
  showPrice: function () {
    this.setData({
      isPrice: false
    })
  },

  // 视频 -- 图片  开关
  video: function () {
    this.setData(
      { isVideo: true }
    )
  },
  images: function () {
    this.setData(
      { isVideo: false }
    )
  },
//分享帮减
  shareSaleFunc:function(e) {
    var that = this;
    if (app.openid != that.data.userId){
      wx.request({
        url: app.apiUrl + '/v1/index.php?c=auction&a=shareSale',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          user_openid: that.data.userId,
          auction_id: that.data.id,
          friend_ip: that.data.friend_ip
        },
        success: function (res) {
        },
        fail: function (res) {
        },
        complete: function (res) { },
      })
    }
  },
   
  // 用户是否支付了保证金
  deposit: function () {
    let _this = this
    if (app.isBind) {
      wx.request({
        url: app.apiUrl + '/v1/index.php?c=bidder&a=checkGoodsDeposit&goods_id=' + this.data.id,
        header: {
          'content-type': 'application/json', // 默认值
          'x-access-token': wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.status === '-1' || res.data.status === '1') {
              this.setData(
                { isDeposit: false }
              )
            } else if (res.data.status === '0' || res.data.status === '2' || res.data.status === '3' || res.data.status === '4') {
              // this.payDeposit();
              this.setData(
                { isDeposit: true }
              )
            }
          } else if (res.statusCode == 401) {
            app.getToken(_this.deposit)
          }
        }
      })
    } else {
      this.setData(
        {
          isDeposit: true
        }
      )
    }
    
  },

  /**
   * Method
   * token
   */
  // 出价列表 -- 也可以不需要 tonken
  loadOfferList: function () {
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=auction&a=bidderList&id=' + this.data.id,
      header: {
        'content-type': 'application/json', // 默认值
        'x-access-token': wx.getStorageSync('token')
      },
      success: (res) => {
        this.setData(
          { offerList: res.data }
        )
      }
    })
  },
  // 出价交互
  offerAjax: function (typeId, price) {
    if (app.isBind) {
      let token = wx.getStorageSync('token')
      let _this = this
      wx.request({
        url: app.apiUrl + '/v1/index.php?c=bidder&a=makeBid',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded', // 默认值
          'x-access-token': wx.getStorageSync('token')
        },
        data: {
          id: this.data.id,
          price: this.data.offerPrice,
          type: this.data.offerId
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.setData(
              {

                isPrice: true
              }
            )
            _this.loadOfferList()
            _this.loadGoodsDetail()
          } else if (res.statusCode == 401) {
            app.getToken(_this.offerAjax)
          }
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })

    }
    
  },
  // 支付保证金
  payDeposit: function () {
    if (!app.isBind) {
      wx.navigateTo({
        url: '../login/index'
      })
      return;
    }
    // return
    let _this = this
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=bidder&a=payDeposit',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'x-access-token': wx.getStorageSync('token')
      },
      data: {
        id: this.data.id,
        method: 'wechat_mini',
        terminal: 'wechat'
      },
      success: function (res) {
        if (res.statusCode === 200) {
          wx.request({
          url: app.apiUrl + '/v1/index.php/pay/doPay_mini/' + res.data.id + '/' + app.openid,
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
                success: function () {

                  _this.deposit()

                },
                'fail': function () {
                  wx.showToast({
                    icon: 'none',
                    title: '支付失败',
                  })
                }
              })
          }
        })
        } else if (res.statusCode === 401) {
          app.getToken(_this.payDeposit)
        } else if (res.statusCode === 406) {
          wx.showToast({
            icon: 'none',
            title: res.data.msg,
          })
        }
        
        

      }
    })
  },
  onGotUserInfo: function (e) {
    if (e.detail.userInfo){
      app.data.userInfo = e.detail.userInfo;
    }
    console.log(e.detail.userInfo)
  },
})
