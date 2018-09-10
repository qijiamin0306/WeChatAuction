//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    isLoading: false,
    loadMore: false,
    loadingText: '正在加载...',
    isNull: false,
    status: 2,
    page: 1,
    
    statusList: [
      {id: 1, name: '全部'},
      { id: 2, name: '待付款' },
      { id: 3, name: '待发货' },
      { id: 4, name: '待收货' }
    ],
    orderList: [],
    imgUrl: app.imgUrl
  },
  onShow: function () {
    this.load()
  },
  onLoad: function () {
    // 设置标题
    wx.setNavigationBarTitle({
      title: '订单中心'
    })
  },
 load: function () {
   // 验证用户有效性
   if (app.isBind) { // 如果已绑定 --- 加载订单列表
    this.setData(
      {
        orderList: [],
        page: 1
      }
    )
     this.loadOrderList() // loadOrderList
   } else { // 默认数据为空
     this.setData(
       {
         isNull: true
       }
     )
   }
 },
  orderList: function () {
    let _this = this
    if (this.data.page === 1) {
      wx.showLoading({
        title: '加载中',
      })
    }
    let token = wx.getStorageSync('token')
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=order&a=orderListCustom&who_id='+app.data.who_id+'&type=1&status=' + this.data.status + '&page=' + this.data.page,
      header: {
        'content-type': 'application/json', // 默认值
        'x-access-token': token
      },
      success: (res) => {
        let status = res.statusCode;
        let data = this.data.orderList;
        this.setData({
          isLoading: false
        })
        if (status === 200) {
          data = data.concat(res.data)
          if (res.data.length < 10) { // 数据数目小于10，不能下拉加载更多
            this.setData(
              {
                loadMore: false,
              }
            )
          } else {
            this.setData(
              { loadMore: true }
            )
          }
          this.setData(
            {
              orderList: data,
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
      complete: function (res) {
        _this.setData(
          {
            isLoading: false
          }
        )
        wx.hideLoading()
      }
    })
  },
  // orderList
  loadOrderList: function() {
    

    // 先验证token
    let token = wx.getStorageSync('token')

    if (token) {
      app.validateToken(this.orderList)
    }

    
  },
  
  changeStatus: function (e) {
    
    if (!app.isBind) {
      wx.showModal({
        title: '提示',
        content: '请先绑定手机号',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/index'
            })
          } else if (res.cancel) {
            
          }
        }
      })
    }
    
    let id = e.currentTarget.dataset.id
    if (this.data.status === id) {
      return
    }
    this.setData(
      { 
        status: id,
        page: 1,
        orderList: [] 
      }
    )
    this.loadOrderList()
  },
  // 下拉加载
  lower: function () {
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
      this.loadOrderList()
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
