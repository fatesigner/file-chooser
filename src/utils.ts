/**
 * utils
 */

export const ImageTypeReg = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/;

/**
 * 获取文件的路径
 * @param {File} file
 * @returns {string}
 */
export function getPath(file: File): string {
  if (file) {
    return file.name;
  }
  return null;
}

/**
 * 获取 File 对象的文件名
 * @param {File} file 对象
 * @return {string} filename
 */
export function getFileName(file: File): string {
  const path = getPath(file);
  if (path) {
    const array = path.split('/');
    return array[array.length - 1];
  }
  return null;
}

/**
 * 获取 File 对象的后缀名
 * @param {File} file
 * @returns {string} extname
 */
export function getExtension(file: File): string {
  const name = getFileName(file);
  if (name) {
    const i = name.lastIndexOf('.');
    return name.substring(i, name.length);
  }
  return null;
}

/**
 * 判断 File 对象是否为图片类型
 * @param {File} file
 * @returns {boolean}
 */
export function isImage(file: File): boolean {
  const extension = getExtension(file);
  return ImageTypeReg.test(extension);
}

/**
 * 重置 input file 元素，实现对相同文件的选择均可触发 change 事件
 * @param file
 * @constructor
 */
export function resetInputFile(file: HTMLInputElement): void {
  file.value = '';
}

/**
 * 触发指定元素的 click 事件
 * @param el
 * @constructor
 */
export function dispatchClick(el) {
  el.dispatchEvent(new MouseEvent('click'));

  if (el && document.createEvent) {
    // const evt = document.createEvent('MouseEvents');
    // evt.initEvent('click', true, false);
    // el.dispatchEvent(evt);
  }
}
