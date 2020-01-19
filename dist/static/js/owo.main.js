// Sun Jan 19 2020 17:29:50 GMT+0800 (GMT+08:00)
var owo = {tool: {},state: {},};
/* 方法合集 */
var _owo = {}

/* 运行页面初始化方法 */
_owo.runCreated = function (pageFunction) {
  try {
    // console.log(pageFunction)
    if (pageFunction.show) {
      pageFunction.show.apply(pageFunction)
    }
    if (pageFunction["_isCreated"]) return

    // 确保created事件只被执行一次
    pageFunction._isCreated = true
    
    if (pageFunction.created) {
      pageFunction.created.apply(pageFunction)
    }
    
  } catch (e) {
    console.error(e)
  }
}




// 判断是否为手机
_owo.isMobi = navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null


_owo._run = function (eventFor, event, newPageFunction) {
  // 复制eventFor防止污染
  var eventForCopy = eventFor
  // 待优化可以单独提出来
  // 取出参数
  var parameterArr = []
  var parameterList = eventForCopy.match(/[^\(\)]+(?=\))/g)
  
  if (parameterList && parameterList.length > 0) {
    // 参数列表
    parameterArr = parameterList[0].split(',')
    // 进一步处理参数
    
    for (var i = 0; i < parameterArr.length; i++) {
      var parameterValue = parameterArr[i].replace(/(^\s*)|(\s*$)/g, "")
      // console.log(parameterValue)
      // 判断参数是否为一个字符串
      
      if (parameterValue.charAt(0) === '"' && parameterValue.charAt(parameterValue.length - 1) === '"') {
        parameterArr[i] = parameterValue.substring(1, parameterValue.length - 1)
      }
      if (parameterValue.charAt(0) === "'" && parameterValue.charAt(parameterValue.length - 1) === "'") {
        parameterArr[i] = parameterValue.substring(1, parameterValue.length - 1)
      }
      // console.log(parameterArr[i])
    }
  }
  eventForCopy = eventFor.replace(/\([\d\D]*\)/, '')
  // console.log(newPageFunction, eventForCopy)
  // 如果有方法,则运行它
  if (newPageFunction && newPageFunction[eventForCopy]) {
    // 绑定window.owo对象
    newPageFunction.$event = event
    newPageFunction.$target = event.target
    newPageFunction[eventForCopy].apply(newPageFunction, parameterArr)
  } else {
    shaheRun.apply(newPageFunction, [eventFor])
  }
}

_owo.bindEvent = function (eventName, eventFor, tempDom, moudleScript) {
  tempDom['on' + eventName] = function(event) {
    _owo._run(eventFor, event || this, moudleScript)
  }
}

// 沙盒运行
function shaheRun (code) {
  try {
    return eval(code)
  } catch (error) {
    console.error(error)
    console.log('执行代码: ' + code)
    return undefined
  }
}

/* owo事件处理 */
// 参数1: 当前正在处理的dom节点
// 参数2: 当前正在处理的模块名称
_owo.handleEvent = function (moudleScript) {
  if (!moudleScript.$el) throw 'error'
  var tempDom = moudleScript.$el
  // 递归处理元素属性
  function recursion(tempDom) {
    if (tempDom.attributes) {
      for (var ind = 0; ind < tempDom.attributes.length; ind++) {
        var attribute = tempDom.attributes[ind]
        // ie不支持startsWith
        var eventFor = attribute.textContent || attribute.value
        eventFor = eventFor.replace(/ /g, '')
        // 判断是否为owo的事件
        if (new RegExp("^o-").test(attribute.name)) {
          var eventName = attribute.name.slice(2)
          switch (eventName) {
            
            case 'tap': {
              // 待优化 可合并
              // 根据手机和PC做不同处理
              if (_owo.isMobi) {
                if (!_owo._event_tap) {console.error('找不到_event_tap方法！'); break;}
                _owo._event_tap(tempDom, eventFor, function (event, eventFor) {
                  _owo._run(eventFor, event || this, moudleScript)
                })
              } else _owo.bindEvent('click', eventFor, tempDom, moudleScript)
              break
            }
            
            
            
            
            default: {
              _owo.bindEvent(eventName, eventFor, tempDom, moudleScript)
            }
          }
        } else if (attribute.name == 'view') {
          viewName = eventFor
        } else if (attribute.name == 'route') {
          routeName = eventFor
        }
      }
    }
    // 判断是否有子节点需要处理
    if (tempDom.children) {
      
      // 递归处理所有子Dom结点
      for (var i = 0; i < tempDom.children.length; i++) {
        // 获取子节点实例
        var childrenDom = tempDom.children[i]
        // o-if处理
        var ifValue = childrenDom.getAttribute('o-if')
        if (ifValue) {
          var temp = ifValue.replace(/ /g, '')
          var show = shaheRun.apply(moudleScript, [temp])
          if (!show) {
            childrenDom.style.display = 'none'
            return
          } else {
            childrenDom.style.display = ''
          }
        }
        if (!childrenDom.hasAttribute('template') && !childrenDom.hasAttribute('view')) {
          recursion(childrenDom)
        }
      }
    } else {
      console.info('元素不存在子节点!')
      console.info(tempDom)
    }
  }
  recursion(moudleScript.$el)
  // 递归处理子模板
  for (var key in moudleScript.template) {
    moudleScript.template[key].$el = tempDom.querySelector('[template=' + key + ']')
    _owo.handleEvent(moudleScript.template[key])
  }
}

// 快速选择器
owo.query = function (str) {
  return document.querySelectorAll('.owo[template=' + owo.activePage +'] ' + str)
}

/* 运行页面所属的方法 */
_owo.handlePage = function (newPageFunction, entryDom) {
  /* 判断页面是否有自己的方法 */
  if (!newPageFunction) return
  // console.log(entryDom)
  newPageFunction['$el'] = entryDom
  // console.log(newPageFunction)
  _owo.runCreated(newPageFunction)
  // debugger
  // 判断页面是否有下属模板,如果有运行所有模板的初始化方法
  for (var key in newPageFunction.template) {
    var templateScript = newPageFunction.template[key]
    
    templateScript.$el = entryDom.querySelector('[template="' + key +'"]')
    _owo.runCreated(templateScript)
  }

  owo.state.urlVariable = _owo.getQueryVariable()
  // 判断页面中是否有路由
  if (newPageFunction.view) {
    for (var viewName in newPageFunction.view) {
      var routeList = newPageFunction.view[viewName]
      // 标识是否没有指定显示哪个路由
      var activeRouteIndex = 0
      var urlViewName = owo.state.urlVariable['view-' + viewName]
      for (var routeInd in routeList) {
        var routeItem = routeList[routeInd]
        routeList[routeInd].$el = entryDom.querySelector('[view="' + viewName +'"] [route="' + routeItem._name +'"]')
        // 错误处理
        if (!routeList[routeInd].$el) {
          console.error('找不到视窗 ' + viewName + ' 中的路由: ' + routeItem._name)
          break
        }
        routeList[routeInd].$el.setAttribute('route-ind', routeInd)
        // console.log(urlViewName, )
        if (urlViewName && urlViewName == routeItem._name) {
          activeRouteIndex = routeInd
        }
      }
      // 激活对应路由
      _owo.showViewIndex(routeList, activeRouteIndex)
      _owo.handlePage(routeList[activeRouteIndex], routeList[activeRouteIndex].$el)
    }
  }
}

_owo.showViewIndex = function (routeList, ind) {
  for (var routeIndex = 0; routeIndex < routeList.length; routeIndex++) {
    var element = routeList[routeIndex];
    if (routeIndex == ind) {
      element.$el.style.display = 'block'
      element.$el.classList.add('route-active')
    } else {
      element.$el.style.display = 'none'
      element.$el.classList.remove('route-active')
    }
  }
}

_owo.showViewName = function (routeList, name) {
  for (var routeIndex = 0; routeIndex < routeList.length; routeIndex++) {
    var element = routeList[routeIndex];
    if (element._name == name) {
      element.$el.style.display = 'block'
      element.$el.classList.add('route-active')
    } else {
      element.$el.style.display = 'none'
      element.$el.classList.remove('route-active')
    }
  }
}

// 获取URL中的参数
_owo.getQueryVariable = function () {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  var temp = {}
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    temp[pair[0]] = pair[1];
  }
  return temp;
}
/*
 * 传递函数给whenReady()
 * 当文档解析完毕且为操作准备就绪时，函数作为document的方法调用
 */
_owo.ready = (function() {               //这个函数返回whenReady()函数
  var funcs = [];             //当获得事件时，要运行的函数
  
  //当文档就绪时,调用事件处理程序
  function handler(e) {
    //如果发生onreadystatechange事件，但其状态不是complete的话,那么文档尚未准备好
    if(e.type === 'onreadystatechange' && document.readyState !== 'complete') {
      return
    }
    // 确保事件处理程序只运行一次
    if(window.owo.state.isRrady) return
    window.owo.state.isRrady = true
    
    // 运行所有注册函数
    for(var i=0; i<funcs.length; i++) {
      funcs[i].call(document);
    }
    funcs = null;
  }
  //为接收到的任何事件注册处理程序
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', handler, false)
    document.addEventListener('readystatechange', handler, false)            //IE9+
    window.addEventListener('load', handler, false)
  } else if(document.attachEvent) {
    document.attachEvent('onreadystatechange', handler)
    window.attachEvent('onload', handler)
  }
  //返回whenReady()函数
  return function whenReady (fn) {
    if (window.owo.state.isRrady) {
      fn.call(document)
    } else {
      funcs.push(fn)
    }
  }
})()


_owo.getarg = function (url) { // 获取URL #后面内容
  if (!url) return null
  var arg = url.split("#");
  return arg[1] ? arg[1].split('?')[0] : null
}

// 页面资源加载完毕事件
_owo.showPage = function() {
  owo.entry = document.querySelector('[template]').getAttribute('template')
  // 取出URL地址判断当前所在页面
  var pageArg = _owo.getarg(window.location.hash)
  
  

  // 计算$dom
  for(var page in owo.script) {
    var idList = document.querySelectorAll('.owo[template="' + page + '"] [id]')
    owo.script[page].$dom = {}
    for (var ind = 0; ind < idList.length; ind++) {
      owo.script[page].$dom[idList[ind].getAttribute('id')] = idList[ind]
    }
  }

  // 从配置项中取出程序入口
  var page = pageArg ? pageArg : owo.entry
  if (page) {
    var entryDom = document.querySelector('.owo[template="' + page + '"]')
    if (!entryDom) {
      console.error('入口文件设置错误,错误值为: ', page)
      entryDom = document.querySelector('.owo')
      page = entryDom.getAttribute('template')
      window.location.replace('#' + page)
      return
    }
    // 显示主页面
    entryDom.style.display = 'block'
    window.owo.activePage = page
    _owo.handlePage(owo.script[page], entryDom)
    _owo.handleEvent(owo.script[page])
    // 处理插件
    var plugList = document.querySelectorAll('.owo-block')
    for (var ind = 0; ind < plugList.length; ind++) {
      var plugEL = plugList[ind]
      var plugName = plugEL.getAttribute('template')
      owo.script[plugName].$el = plugEL
      _owo.handlePage(owo.script[plugName], plugEL)
      _owo.handleEvent(owo.script[plugName])
    }
    
  } else {
    console.error('未设置程序入口!')
  }
  
  // 设置当前页面为活跃页面
  owo.state.newUrlParam = _owo.getarg(document.URL)
}

/*
  页面跳转方法
  参数1: 需要跳转到页面名字
  参数2: 离开页面动画
  参数3: 进入页面动画
*/
owo.go = function (pageName, inAnimation, outAnimation, backInAnimation, backOutAnimation, noBack, param) {
  if (!owo.script[pageName]) {
    console.error("导航到不存在的页面: " + pageName)
    return
  }
  owo.script[pageName]._animation = {
    "in": inAnimation,
    "out": outAnimation,
    "forward": true
  }
  var paramString = ''
  if (param && typeof param == 'object') {
    paramString += '?'
    // 生成URL参数
    for (var paramKey in param) {
      paramString += paramKey + '=' + param[paramKey] + '&'
    }
    // 去掉尾端的&
    paramString = paramString.slice(0, -1)
  }
  // 如果有返回动画那么设置返回动画
  if (backInAnimation && backOutAnimation) {
    owo.script[owo.activePage]._animation = {
      "in": backInAnimation,
      "out": backOutAnimation,
      "forward": false
    }
  }
  if (noBack) {
    location.replace(paramString + "#" + pageName)
  } else {
    window.location.href = paramString + "#" + pageName
  }
}

// url发生改变事件
_owo.hashchange = function (e) {
  // 这样处理而不是直接用event中的URL，是因为需要兼容IE
  owo.state.oldUrlParam = owo.state.newUrlParam;
  owo.state.newUrlParam = _owo.getarg(document.URL); 
  // console.log(owo.state.oldUrlParam, owo.state.newUrlParam)
  // 如果旧页面不存在则为默认页面
  if (!owo.state.oldUrlParam) owo.state.oldUrlParam = owo.entry;
  var newUrlParam = owo.state.newUrlParam;

  // 如果没有跳转到任何页面则跳转到主页
  if (newUrlParam === undefined) {
    newUrlParam = owo.entry;
  }

  // 如果没有发生页面跳转则不需要进行操作
  // 进行页面切换
  switchPage(owo.state.oldUrlParam, newUrlParam);
}

// ios的QQ有BUG 无法触发onhashchange事件
if(/iPhone\sOS.*QQ[^B]/.test(navigator.userAgent)) {window.onpopstate = _owo.hashchange;} else {window.onhashchange = _owo.hashchange;}

// 执行页面加载完毕方法
_owo.ready(_owo.showPage)
_owo._event_tap = function (tempDom, eventFor, callBack) {
  // 变量
  var startTime = 0
  var isMove = false
  tempDom.addEventListener('touchstart', function() {
    startTime = Date.now();
  })
  tempDom.addEventListener('touchmove', function() {
    isMove = true
  })
  tempDom.addEventListener('touchend', function(e) {
    if (Date.now() - startTime < 300 && !isMove) {
      callBack(e, eventFor)
    }
    // 清零
    startTime = 0;
    isMove = false
  })
}
/**
 * 赋予节点动画效果
 * @param  {string} name 动画效果名称
 * @param  {dom} dom 节点
 */
owo.tool.animate = function (name, dom, delay) {
  dom.classList.add(name)
  dom.classList.add('owo-animated')
  if (delay) {
    dom.style.animationDelay = delay + 'ms'
  }
  // 待优化可以单独提出绑定方法
  dom.addEventListener('animationend', animateEnd)
  function animateEnd () {
    // 待优化 感觉不需要这样
    dom.classList.remove(name)
    dom.classList.remove('owo-animated')
    if (delay) {
      dom.style.animationDelay = ''
    }
  }
}




// 这是用于代码调试的自动刷新代码，他不应该出现在正式上线版本!
if ("WebSocket" in window) {
  // 打开一个 web socket
  if (!window._owo.ws) window._owo.ws = new WebSocket("ws://" + window.location.host)
  window._owo.ws.onmessage = function (evt) { 
    if (evt.data == 'reload') {
      location.reload()
    }
  }
  window._owo.ws.onclose = function() { 
    console.info('与服务器断开连接')
  }
} else {
  console.error('浏览器不支持WebSocket')
}

// 切换页面动画
function animation (oldDom, newDom, animationIn, animationOut, forward) {
  // 动画延迟
  var delay = 0
  // 获取父元素
  var parentDom = newDom.parentElement
  if (!oldDom) {
    console.error('旧页面不存在!')
  }
  oldDom.addEventListener("animationend", oldDomFun)
  newDom.addEventListener("animationend", newDomFun)
  
  oldDom.style.position = 'absolute'

  newDom.style.display = 'block'
  newDom.style.position = 'absolute'
  // 给即将生效的页面加上“未来”标识
  if (forward) {
    newDom.classList.add('owo-animation-forward')
  } else {
    oldDom.classList.add('owo-animation-forward')
  }
  // document.body.style.overflow = 'hidden'

  parentDom.style.perspective = '1200px'
  oldDom.classList.add('owo-animation')
  for (var ind =0; ind < animationIn.length; ind++) {
    var value = animationIn[ind]
    //判断是否为延迟属性
    if (value.slice(0, 5) == 'delay') {
      var tempDelay = parseInt(value.slice(5))
      if (delay < tempDelay)  delay = tempDelay
    }
    oldDom.classList.add('o-page-' + value)
  }

  newDom.classList.add('owo-animation')
  for (var ind =0; ind < animationOut.length; ind++) {
    var value = animationOut[ind]
    if (value.slice(0, 5) == 'delay') {
      var tempDelay = parseInt(value.slice(5))
      if (delay < tempDelay)  delay = tempDelay
    }
    newDom.classList.add('o-page-' + value)
  }
  // 旧DOM执行函数
  function oldDomFun (e) {
    // 排除非框架引起的结束事件
    if (e.target.getAttribute('template')) {
      // 移除监听
      oldDom.removeEventListener('animationend', oldDomFun, false)
      // 延迟后再清除，防止动画还没完成
      setTimeout(function () {
        oldDom.style.display = 'none'
        // console.log(oldDom)
        oldDom.style.position = ''
        oldDom.classList.remove('owo-animation')
        oldDom.classList.remove('owo-animation-forward')
        parentDom.style.perspective = ''
        // 清除临时设置的class
        for (var ind =0; ind < animationIn.length; ind++) {
          var value = animationIn[ind]
          oldDom.classList.remove('o-page-' + value)
        }
      }, delay);
    }
  }

  // 新DOM执行函数
  function newDomFun () {
    // 移除监听
    newDom.removeEventListener('animationend', newDomFun, false)
    // 延迟后再清除，防止动画还没完成
    setTimeout(function () {
      // 清除临时设置的style
      newDom.style.position = '';
      newDom.classList.remove('owo-animation');
      newDom.classList.remove('owo-animation-forward');
      for (var ind =0; ind < animationOut.length; ind++) {
        var value = animationOut[ind]
        newDom.classList.remove('o-page-' + value);
      }
    }, delay);
  }
}

// 切换页面前的准备工作
function switchPage (oldUrlParam, newUrlParam) {
  var oldPage = oldUrlParam ? oldUrlParam.split('&')[0] : owo.entry
  var newPage = newUrlParam ? newUrlParam.split('&')[0] : owo.entry
  // console.log(oldPage, newPage)
  var oldDom = document.querySelector('.owo[template="' + oldPage + '"]')
  var newDom = document.querySelector('.owo[template="' + newPage + '"]')
  
  if (!newDom) {
    console.error('页面不存在!')
    return
  }
  // console.log(owo.state.animation)
  // 判断是否有动画效果
  if (!owo.script[newPage]._animation) owo.script[newPage]._animation = {}
  // 直接.in会在ie下报错
  var animationIn = owo.script[newPage]._animation['in']
  var animationOut = owo.script[newPage]._animation['out']
  // 全局跳转设置判断
  if (owo.state.go) {
    animationIn = animationIn || owo.state.go.inAnimation
    animationOut = animationOut || owo.state.go.outAnimation
  }
  if (animationIn || animationOut) {
    animation(oldDom, newDom, animationIn.split('&&'), animationOut.split('&&'))
  } else {
    if (oldDom) {
      // 隐藏掉旧的节点
      oldDom.style.display = 'none'
    }
    // 查找页面跳转后的page
    newDom.style.display = 'block'
  }
  
  window.owo.activePage = newPage
  _owo.handlePage(window.owo.script[newPage], newDom)
  _owo.handleEvent(window.owo.script[newPage])
  
  // 显示路由
  var viewList = newDom.querySelectorAll('[view]')
  _owo.showViewIndex(viewList, 0)
}

// 切换路由前的准备工作
function switchRoute (view, newRouteName, animationIn, animationOut) {
  var view = document.querySelector('[template=' + owo.activePage + '] [view=' + view + ']')
  var oldDom = view.querySelector('.active-route')
  var newDom = view.querySelector('[route=' + newRouteName +']')
  oldDom.addEventListener("animationend", oldDomFun)
  newDom.addEventListener("animationend", newDomFun)
  // 动画延迟
  var delay = 0
  oldDom.style.position = 'absolute'

  newDom.style.display = 'block'
  newDom.style.position = 'absolute'
  // 给即将生效的页面加上“未来”标识
  newDom.classList.add('owo-animation-forward')
  // document.body.style.overflow = 'hidden'

  // parentDom.style.perspective = '1200px'
  oldDom.classList.add('owo-animation')
  for (var ind =0; ind < animationIn.length; ind++) {
    var value = animationIn[ind]
    //判断是否为延迟属性
    if (value.slice(0, 5) == 'delay') {
      var tempDelay = parseInt(value.slice(5))
      if (delay < tempDelay)  delay = tempDelay
    }
    oldDom.classList.add('o-page-' + value)
  }

  newDom.classList.add('owo-animation')
  for (var ind =0; ind < animationOut.length; ind++) {
    var value = animationOut[ind]
    if (value.startsWith('delay')) {
      var tempDelay = parseInt(value.slice(5))
      if (delay < tempDelay)  delay = tempDelay
    }
    newDom.classList.add('o-page-' + value)
  }
  // 旧DOM执行函数
  function oldDomFun (e) {
    // 排除非框架引起的结束事件
    if (e.target.getAttribute('view')) {
      // 移除监听
      oldDom.removeEventListener('animationend', oldDomFun, false)
      // 延迟后再清除，防止动画还没完成
      setTimeout(function () {
        oldDom.style.display = 'none'
        // console.log(oldDom)
        oldDom.style.position = ''
        oldDom.classList.remove('owo-animation')
        parentDom.style.perspective = ''
        // 清除临时设置的class
        for (var ind =0; ind < animationIn.length; ind++) {
          var value = animationIn[ind]
          oldDom.classList.remove('o-page-' + value)
        }
      }, delay);
    }
  }

  // 新DOM执行函数
  function newDomFun () {
    // 移除监听
    newDom.removeEventListener('animationend', newDomFun, false)
    // 延迟后再清除，防止动画还没完成
    setTimeout(function () {
      // 清除临时设置的style
      newDom.style.position = '';
      newDom.classList.remove('owo-animation');
      newDom.classList.remove('owo-animation-forward');
      for (var ind =0; ind < animationOut.length; ind++) {
        var value = animationOut[ind]
        newDom.classList.remove('o-page-' + value);
      }
    }, delay);
  }
}