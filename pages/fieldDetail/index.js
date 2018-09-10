//index.js
var util = require('../../utils/util.js')
//获取应用实例
const app = getApp()
Page({
  data: {
    isLoading: true,
    loadMore: false,
    loadingText: '正在加载中...',
    id: 0,
    page: 1,
    loadMore: true,
    detailInfo: {},
    list: [],
    imgUrl: app.imgUrl,
  },
  // 分享 
  onShareAppMessage: function () {
    return {
      title: "爱微藏+",        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index?fieldDetailId=' + this.data.id,        // 默认是当前页面，必须是以‘/’开头的完整路径
    }
  },

  onLoad: function (options) { 
    app.fieldDetailIdToAuction = options.id;
    if (options.auctionId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../auction/index?id=' + options.auctionId + '&share=' + true + '&user_openid=' + options.user_openid,
      })
    } 
    this.setData({
      id: options.id
    })
    wx.setNavigationBarTitle({
      title: '翡翠禄来'
    })
    this.loadDetail()
    this.loadGoodsList()
  },
  // 场次详情
  loadDetail: function() {
    wx.showLoading({
      title: '加载中...',
    })
    var that = this; 
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=auction&a=sceneDetail&id=' + this.data.id,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:  (res) => {
        res.data.end_time = util.formatTime(new Date(res.data.end_time*1000))
        this.setData(
          {detailInfo: res.data}
        )
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  // 加载拍品列表
  loadGoodsList: function () {
    if (this.data.page === 1) {
      wx.showLoading({
        title: '加载中...',
      })
    }
    var str = app.apiUrl + '/v1/index.php?c=auction&a=goodsList&id=' + this.data.id + '&page=' + this.data.page
    var _this = this
    wx.request({
      url: str,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        let status = res.statusCode,
          data = this.data.list,
          list = res.data
        if (status === 200) {
          data = data.concat(res.data)
          if (res.data.length < 20) { // 数据数目小于10，不能下拉加载更多
            this.setData(
              {
                loadMore: false
              }
            )
          } else {
            this.setData(
              { loadMore: true }
            )
          }
          this.setData(
            {
              list: data,
            }
          )
        }
        if (status === 400) {
          if (this.data.page === 1) { // 如果数据为空且当前页为1
            this.setData(
              { isNull: true }
            )
          }
          this.setData(
            { loadMore: false }
          )
        }
      },
      complete: function () {
        _this.setData(
          {
            isLoading: false
          }
        )
        wx.hideLoading()
      },
      fail: (err) => {
      }
    })
  },
  // 滚动到底
  lower(e) {
    if (this.data.loadMore) {
      this.setData({
        loadMore: false,
      })
      let nowPage = this.data.page + 1;
      if (nowPage > 1) {
        this.setData({
          isLoading: true
        })
      }
      this.setData({
        page: nowPage
      })
      this.loadGoodsList()
    } else {
      if (this.data.page !== 1) {
        wx.showToast({
          icon: 'none',
          title: '没有更多了',
        })
      }
    }
  }
})
