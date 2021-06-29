import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 构造函数不用 class 的原因是为了方便后续给 Vue 实例混入实例成员
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 _init 方法
  this._init(options)
}

// 注册 vm 的 _init() 方法
initMixin(Vue)
// 注册 vm 的 $data/$props/$set/$delete/$watch
stateMixin(Vue)
// 注册事件相关方法: $on/$once/$off/$emit
eventsMixin(Vue)
// 注册生命周期相关方法: _update/$forceUpdate/$destroy
lifecycleMixin(Vue)
// 注册 render 相关方法: $nextTick/_render
renderMixin(Vue)

export default Vue
