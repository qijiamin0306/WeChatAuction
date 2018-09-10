// pages/address/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],

    isProvince: false,
    isArea: false,
    isCity: false,

    defaultChoose: 0,

    name: "",
    mobileNumber: "",
    province: '',
    city: "",
    area: "",
    detailAddress: "",
    allProvince: "",
    allCity: "",
    allArea: "",
    addressInfoId:"",
    deleteId:null,
    addressDefault:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      addressInfoId: options.addressInfoId
    })
    wx.setNavigationBarTitle({
      title: '地址列表'
    })
    this.addressList()
  },

  chooseAddress: function(e){
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      isAddress: true,
      isDefault: false,
      addressInfo: e.currentTarget.dataset
    });
    wx.navigateBack();
  },

  addressList: function(){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=getList',
      data: '',
      header: {'x-access-token': wx.getStorageSync('token')},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        if(res.statusCode===200){
          that.setData({
            addressList: res.data
          }) 
        } else if (res.statusCode === 400){
          that.setData({
            addressList: null
          })
        }   
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];//上一页面
        if (that.data.addressList!==null){
          if (that.data.deleteId === that.data.addressInfoId) {
            prevPage.setData({
              addressInfo: that.data.addressList[0]
            });
          }  
        }else{
          prevPage.setData({
            isAddress: false,
            isDefault: true,
          });
        }
         
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  edit:function(e){
    var addressInfo = e.currentTarget.dataset
    wx.navigateTo({
      url: '../editAddress/index?addressInfo=' + JSON.stringify(addressInfo),
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  delete: function (e) {
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=detail',
      data: {
        id: e.currentTarget.id
        },
      header: { 
        'content-type': 'application/x-www-form-urlencoded',
        'x-access-token': wx.getStorageSync('token')
        },
      method: 'DELETE',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          deleteId:e.target.id
        })
        if (res.statusCode === 200) {
          wx.showToast({
            title: "删除成功",
            icon: 'none',
          })
        }
        that.addressList()
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})