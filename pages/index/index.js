//index.js
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');

//获取应用实例
const app = getApp()
Page({
  data: {
    isAd: false,
    isNull: false,
    loadMore: true,
    isLoading: false,
    loadingText: '正在加载...',
    status: 2,
    page: 1,
    scrollTop: 15,
    tabList: [
      {
        id: 2,
        name: '热卖区'
      },
      {
        id: 1,
        name: '预展区'
      }
    ],
    imgUrl: app.imgUrl,
    list: [],
    adList: [],
    sellerName:null,
    sellerImg: null,
    sellerContent:null,
    content: null
  },
  onShow: function () {

  },
  onLoad: function (options) {
    this.getSellerInfo()
    if (options.fieldDetailId) {
      //这个pageId的值存在则证明首页的开启来源于用户点击来首页,同时可以通过获取到的pageId的值跳转导航到对应的详情页
      wx.navigateTo({
        url: '../fieldDetail/index?id=' + options.fieldDetailId,
      })
    } else if(options.fieldDetailIdToAuction){
      wx.navigateTo({
        url: '../fieldDetail/index?id=' + options.fieldDetailIdToAuction + '&auctionId=' + options.auctionId + '&user_openid=' + options.user_openid,
      })
    }
    this.loadAd(); // 加载广告

    this.loadStatusList(); // 加载场次列表

    wx.setNavigationBarTitle({
      title: "翡翠禄来"
    })

  },

  jump: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/fieldDetail/index?id=' + id,
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      }
    })
  },
  // 加载广告
  loadAd: function () {
    let _this = this
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=ad&a=detail&id=3',
      success: function (res) {
        let status = res.statusCode
        if (status === 200) {
          _this.setData(
            {
              adList: res.data,
              isAd: true
            }
          )
        }
        
      }
    })
  },

  loadStatusList: function () {
    let _this = this
    if (this.data.page === 1) {
      wx.showLoading({
        title: '加载中...',
      })
    }
    var str = app.apiUrl + '/v1/index.php?c=auction&a=sceneList&cate_id=0&status=' + this.data.status + '&who_id='+app.data.who_id+'&page=' + this.data.page
    var that = this
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
          // 处理日期
            // 根据场次的状态处理不同的时间戳
            if (this.data.status === 1) {
              for (let i = 0; i < list.length; i++) {
                list[i].star_time = util.formatTime(new Date(list[i].star_time * 1000))
              }
            } else {
              for (let i = 0; i < list.length; i++) {
                list[i].end_time = util.formatTime(new Date(list[i].end_time * 1000))
              }
            }
          // 拼接数据
          data = data.concat(res.data)
          if (res.data.length < 10) { // 数据数目小于10，不能下拉加载更多
            this.setData(
              { loadMore: false }
            )
          } else {
            this.setData(
              { loadMore: true }
            )
          }
          this.setData(
            {
              list: data,
              isNull: false,
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
      fail: function (err) {
      },
      complete: function (res) {
        _this.setData(
          { isLoading: false }
        ) 
        wx.hideLoading()
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: "爱微藏+",        // 默认是小程序的名称(可以写slogan等)
      path: '/pages/index/index',        // 默认是当前页面，必须是以‘/’开头的完整路径 
    }
  },
  
  changeStatus: function (e) {
    let id = e.currentTarget.dataset.id;
    // 如果点击的为当前选中按钮，则不做任何操作
    if (id === this.data.status) {
      return;
    }
    // 置空状态
    this.setData({
      page: 1,
      list: [],
      status: id
    })

    this.loadStatusList();
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
      this.loadStatusList()
    } else {
      if (this.data.page !== 1) {
        wx.showToast({
          icon: 'none',
          title: '没有更多了',
        })
      }
      
    }
  },
  getSellerInfo:function(){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=who&a=detail&id=' + app.data.who_id,
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        if (res.statusCode === 200) {
          var content = res.data.content;

          /**s
      * WxParse.wxParse(bindName , type, data, target,imagePadding)
      * 1.bindName绑定的数据名(必填)
      * 2.type可以为html或者md(必填)
      * 3.data为传入的具体数据(必填)
      * 4.target为Page对象,一般为this(必填)
      * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
      */

          WxParse.wxParse('content', 'html', content, that, 5);
          that.setData({
            sellerName:res.data.who_name,
            sellerImg:res.data.head_img,
            sellerContent:res.data.content
          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  }
})


