/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})
// 保留 Vue 实例的 $mount 方法
const mount = Vue.prototype.$mount
// 接着重写 $mount 方法
// 调用 $mount 位置: 
// src/core/instance/index.js 
// --> Vue._init (src/core/instance/init.js)
Vue.prototype.$mount = function (
  el?: string | Element,
  // 非 ssr 情况下为 false, ssr 时候为 true
  hydrating?: boolean
): Component {
  // 获取创建 Vue 实例时传入的 el 对象
  el = el && query(el)

  /* istanbul ignore if */
  // el 不能是 body 或者 html 标签
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 如果没有 render, 则把 template 转换成 render 函数
  // 如果有 render 函数, 则下面的 if 语句不会执行, 直接调用 mount 方法挂在 dom
  // 即: render 比 template 优先级高. 如果 template 和 render 同时设置, 则 render 生效
  if (!options.render) {
    // 获取 template 值
    let template = options.template
    // 模板存在时:
    if (template) {
      if (typeof template === 'string') {
        // 如果模板是 id 选择器
        if (template.charAt(0) === '#') {
          // 获取对应的 dom 对象的 innerHTML
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        // 如果模板是元素, 返回元素的 innerHTML
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        // 返回当前实例
        return this
      }
    } else if (el) {
      // 如果没有 template, 获取 el 的 outerHTML 作为模板
      template = getOuterHTML(el)
    }

    // 把 template 转换成 render 函数
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 调用 mount 方法, 挂在 DOM
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

// 增加静态方法
Vue.compile = compileToFunctions

export default Vue
