/**
 * h5
 */

import { getGUID } from '@fatesigner/utils/random';
import { browserPlatform } from '@fatesigner/utils/user-agent';
import { isNullOrUndefined } from '@fatesigner/utils/type-check';
import { addEventListener, createElement, removeElement } from '@fatesigner/utils/document';

import { dispatchClick, resetInputFile } from '../utils';
import { ICreateFileChooser, IFileChooserChangeResponse, IFileChooserOptions, IOpenFileChooser, compressImage, validateFile } from '../core';

function createInputEl(targetEl, options: IFileChooserOptions, onChanged?: (res: IFileChooserChangeResponse) => void, onFailed?: (error: Error) => void) {
  const inputEl = createElement(
    `
    <input id="${options.id}"
           class="${targetEl ? 'file-chooser-input' : 'file-chooser-input-hidden'}"
           type="file"
           accept="${options.accept}"
           ${options.multiple ? ' multiple="multiple"' : ''}
           ${browserPlatform.IOS || isNullOrUndefined(options.capture) ? '' : ' capture="' + options.capture + '"'}
           readonly="true" />`
  ) as HTMLInputElement;

  addEventListener(inputEl, 'change', async function () {
    const validErr = validateFile(this.files, options);
    if (!validErr) {
      // 压缩图片
      await compressImage(this.files, options)
        .then(function (files) {
          if (onChanged) {
            const res: IFileChooserChangeResponse = {
              files
            };
            if (!isNullOrUndefined(options.data)) {
              res.data = options.data;
            }
            onChanged(res);
          }
        })
        .catch(function (error: Error) {
          if (onFailed) {
            onFailed(error);
          }
        });
    }

    // 重置 input file value
    resetInputFile(inputEl);

    if (validErr) {
      if (onFailed) {
        onFailed(validErr);
      }
    }
  });

  addEventListener(inputEl, 'click', function (e: any) {
    e.stopPropagation();
  });

  return inputEl;
}

export const openFileChooser: IOpenFileChooser = async function (
  options?: IFileChooserOptions,
  onChanged?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) {
  const options_: IFileChooserOptions = Object.assign({}, options, {
    id: getGUID(10),
    clickable: false
  });

  let inputEl: any = document.body.querySelector(':scope > .file-chooser-input-hidden');

  if (!inputEl) {
    inputEl = createInputEl(null, options_, onChanged, onFailed);
    document.body.appendChild(inputEl);
  }

  dispatchClick(inputEl);
};

export const createFileChooser: ICreateFileChooser = async function createFileChooser(
  targetEl: HTMLElement,
  options?: IFileChooserOptions,
  onChanged?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) {
  const options_: IFileChooserOptions = Object.assign({}, options, {
    id: getGUID(10)
  });

  const inputEl = createInputEl(targetEl, options_, onChanged, onFailed);

  const trigger = function () {
    dispatchClick(inputEl);
  };

  if (targetEl) {
    targetEl.style.position = 'relative';
    targetEl.appendChild(inputEl);
  }

  const handleClick = function (e: any) {
    e.stopPropagation();
    trigger();
  };

  if (options_.clickable) {
    targetEl.addEventListener('click', handleClick);
  }

  const destroy = () => {
    targetEl.removeEventListener('click', handleClick);
    removeElement(inputEl);
  };

  return {
    trigger,
    destroy
  };
};
