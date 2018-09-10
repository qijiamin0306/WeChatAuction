// pages/editAddress/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:null,
    addressInfo:{},
    is_default: false,
    province:"",
    city:"",
    area:"",
    name:null,
    mobileNumber:null,
    address:null,
    isProvince:false,
    isCity:false,
    isArea:false,
    allArea:null,
    allProvince:null,
    allCity:null,
    defaultChoose:0,
    addressList:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {   
    this.setData({
      addressInfo:JSON.parse(options.addressInfo)
    })
    this.setData({
      id: this.data.addressInfo.id,
      province: this.data.addressInfo.province_text,
      city: this.data.addressInfo.city_text, 
      area: this.data.addressInfo.area_text, 
      name: this.data.addressInfo.accept_name,
      mobileNumber:this.data.addressInfo.accept_mobile,
      address:this.data.addressInfo.address,
      defaultChoose:this.data.addressInfo.is_default
    })
    if (this.data.addressInfo.is_default==="1"){
      this.setData({
        is_default:true,
      })   
    }
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
  chooseProvince: function (e) {
    var that = this;
    wx.request({
      url: app.apiUrl + '/v1/index.php?c=address&a=area&area_id=0',
      data: '',
      header: { 'x-access-token': wx.getStorageSync('token') },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        that.setData({
          isProvince: true,
          allProvince: res.data,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  chooseCity: function (e) {
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
          province: e.currentTarget.dataset.area_name,
          isCity: true,
          allCity: res.data,
        })
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  chooseArea: function (e) {
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
  makeAddress: function (e) {
    this.setData({
      area: e.currentTarget.dataset.area_name,
      isProvince: false,
      isArea: false,
      isCity: false,
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
        prevPage.setData({//直接给上移页面赋值
          addressList: that.data.addressList
        });
        wx.navigateBack(); 
      },
      fail: function (res) { },
      complete: function (res) { },
    })
    
  },

  updateAddress: function(){
     var that = this;
     wx.request({
       url: app.apiUrl +'/v1/index.php?c=address&a=updateAddress',
       data: {
         id:that.data.id,
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
       method: 'PUT',
       dataType: 'json',
       responseType: 'text',
       success: function(res) {
         if(res.statusCode===200){
           wx.showToast({
             title: res.data.msg,
             icon: 'none',
           })
           that.addressList();
         }else{
           wx.showToast({
             title: res.data.msg,
             icon: 'none',
           })
         }
       },
       fail: function (res) { },
       complete: function(res) {},
     })
   },
  cancel: function () {
    wx.navigateBack();
  }

})