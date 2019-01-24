/**
 * file-chooser.directive
 */

import { VNode, VueConstructor } from 'vue';
import { DirectiveBinding } from 'vue/types/options';

import { FileChooserService } from '../file-chooser';

export function FileChooserDirectiveForVue(vue: VueConstructor): void {
  vue.directive('file-chooser', {
    bind(el: any, binding: DirectiveBinding, vnode: VNode) {
      FileChooserService.createFileChooser(
        el,
        binding.value,
        (res) => {
          // vnode.context.$emit('fileChooserChange', res);
          DispatchEvent(vnode, 'fileChooserChange', res);
        },
        (reason) => {
          DispatchEvent(vnode, 'fileChooserError', reason);
        }
      ).then(function (res) {
        el.chooser = res;
      });
    },
    unbind(el: any) {
      if (el.chooser && el.chooser.destroy) {
        el.chooser.destroy();
      }
    }
  });
}

/**
 * 为指定的 vnode 分发自定义事件
 * @param vnode
 * @param eventName
 * @param data
 * @constructor
 */
export function DispatchEvent(vnode: VNode, eventName: string, data: any) {
  const handlers: any = (vnode.data && vnode.data.on) || (vnode.componentOptions && vnode.componentOptions.listeners);

  if (handlers && handlers[eventName]) {
    handlers[eventName].fns(data);
  }

  /* if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, {
      detail: data
    });
  } else {
    vnode.elm.dispatchEvent(new CustomEvent('onFileChooserChange', {
      detail: data
    }));
  } */
}
