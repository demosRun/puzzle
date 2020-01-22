// 设计宽度
var deviseW = 750
// 设计高度
var deviseH = 1508

function getScale () {
  const scaleBox = document.getElementsByClassName('scale-box')[0]
  // 如果比例大于1则进入电脑模式
  if ((window.innerWidth / window.innerHeight) < 1) {
    var scale = window.innerWidth / deviseW
    window.translationScale = scale
    scaleBox.style.width = deviseW + 'px'
    scaleBox.style.height = deviseH + 'px'
    scaleBox.style.transform = `scale(${scale}, ${scale})`
    // console.log(window.innerHeight, deviseH * scale)
    window.translationScaleY = window.innerHeight - deviseH * scale
    scaleBox.style.transformOrigin = `0 ${(window.translationScaleY) + 'px' } 0`
  } else {
    window.translationScale = 1
    window.translationScaleY = 1
    document.body.classList.add('pc')
    
    var scale = (window.innerHeight / deviseH).toFixed(2)
    scaleBox.style.width = deviseW + 'px'
    scaleBox.style.height = deviseH + 'px'
    scaleBox.style.transform = `scale(${scale}, ${scale}) translate(${(window.innerWidth - deviseW * scale) / 2 / scale + 'px' }, 0)`
    scaleBox.style.transformOrigin = '0 0 0'
  }
}

getScale()

document.addEventListener("WeixinJSBridgeReady", function () {
  owo.script.playMusic.play()
}, false)

let timer = null
window.onresize = () => {
  // console.log(timer)
  window.clearTimeout(timer)
  timer = setTimeout(() => {
    getScale()
  }, 300)
}

function scrollIntoView () {
  window.scrollTo(0, 0)
}

// 阻止微信拖动
document.body.addEventListener('touchmove', function (e) {
  e.preventDefault() // 阻止默认的处理方式(阻止下拉滑动的效果)
}, {passive: false})