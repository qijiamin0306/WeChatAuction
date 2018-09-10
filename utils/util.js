const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatTime1 = date => {
  let now = Math.ceil(new Date().getTime() / 1000)
  now = date - now
  let day = parseInt(now / 86400)
  let hour = Math.floor(now % 86400 / 3600)
  let minute = Math.floor(now % 86400 % 3600 / 60)
  let second = Math.floor(now % 86400 % 3600 % 60)
  
  day = zero(day)
  hour = zero(hour)
  minute = zero(minute)
  second = zero(second)

  return day + '天' + hour + '小时' +  minute + '分' + second + '秒'
}

const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return [month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 补0
const zero = num => {
  if (num < 10) {
    num = '0' + num
  }

  return num
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatTime1: formatTime1,
  formatTime2: formatTime2
}
