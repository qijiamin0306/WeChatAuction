// pages/addAddress/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isProvince:false,
    isArea: false,
    isCity: false,
   
    defaultChoose: 0,

    name:"",
    mobileNumber:"",
    province: '',
    city: "",
    area: "",
    address: "",
    allProvince:"",
    allCity:"",
    allArea:"",

    addressListLength:null,
    addressList:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      addressListLength: options.addressListLength,
    })
  },

  chooseProvince:function(e){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=area&area_id=0',
      data: '',
      header: { 'x-access-token': wx.getStorageSync('token')},
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        that.setData({
          isProvince: true,
          allProvince: res.data,
        })
      },
      fail: function (res) {},
      complete: function(res) {},
    })
  },
  chooseCity:function(e){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=area&area_id='+e.currentTarget.dataset.area_id,
      data: '',
      header: { 'x-access-token': wx.getStorageSync('token') },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          province: e.currentTarget.dataset.area_name,
          isCity: true,
          allCity: res.data,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  chooseArea:function(e){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=area&area_id=' + e.currentTarget.dataset.area_id,
      data: '',
      header: { 'x-access-token': wx.getStorageSync('token') },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          city: e.currentTarget.dataset.area_name,
          isArea: true,
          allArea: res.data,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  makeAddress:function(e){
    this.setData({
      area: e.currentTarget.dataset.area_name,
      isProvince: false,
      isArea: false,
      isCity: false,
    })
  },
  name: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  mobileNumber: function (e) {
    this.setData({
      mobileNumber: e.detail.value
    })
  },
  detailAddress: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  checkboxChange: function (e) {
    this.setData({
      defaultChoose: e.detail.value.length
    })
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
        that.setData({
          addressList: res.data
        })
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];//上一页面
        if (!that.data.addressListLength){
          let prev2Page = pages[pages.length - 3]
          prev2Page.setData({//直接给上移页面赋值
            isAddress: true,
            isDefault: false,
            addressInfo: that.data.addressList[0]
          });
        }
        prevPage.setData({//直接给上移页面赋值
          addressList: that.data.addressList
        });
        wx.navigateBack();
      },
      fail: function (res) { },
      complete: function (res) { },
    })

  },
  address:function(){
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=addAddress',
      data: { 
        accept_name: that.data.name,
        accept_mobile: that.data.mobileNumber, 
        province: that.data.province, 
        city: that.data.city, 
        area: that.data.area, 
        address: that.data.address, 
        is_default: that.data.defaultChoose
         },
      header: {
        'content-type': 'application/x-www-form-urlencoded',      
        'x-access-token': wx.getStorageSync('token')
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function(res) {
        if(res.statusCode===200){
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          that.addressList();
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  cancel:function(){
    wx.navigateBack();
  }

})