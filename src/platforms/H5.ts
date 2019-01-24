/**
 * h5
 */

import { GetGUID } from '@fatesigner/utils/random';
import { BrowserPlatform } from '@fatesigner/utils/user-agent';
import { IsNullOrUndefined } from '@fatesigner/utils/type-check';
import { AddEventListener, CreateElement, RemoveElement } from '@fatesigner/utils/document';

import { CompressImage, DefaultOptions, DispatchClick, ResetInputFile, ValidateFile } from '../file-chooser';
import { IFileChooser, IFileChooserChangeResponse, IFileChooserOptions, IFileChooserService } from '../interfaces';

function CreateInputEl(
  targetEl,
  options: IFileChooserOptions,
  onSelected?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) {
  const inputEl = CreateElement(
    `
    <input id="${options.id}"
           class="${targetEl ? 'file-chooser-input' : 'file-chooser-input-hidden'}"
           type="file"
           accept="${options.accept}"
           ${options.multiple ? ' multiple="multiple"' : ''}
           ${BrowserPlatform.IOS || IsNullOrUndefined(options.capture) ? '' : ' capture="' + options.capture + '"'}
           readonly="true" />`
  ) as HTMLInputElement;

  AddEventListener(inputEl, 'change', async function () {
    const validErr = ValidateFile(this.files, options);
    if (!validErr) {
      // 压缩图片
      await CompressImage(this.files, options)
        .then(function (files) {
          if (onSelected) {
            const res: IFileChooserChangeResponse = {
              files
            };
            if (!IsNullOrUndefined(options.data)) {
              res.data = options.data;
            }
            onSelected(res);
          }
        })
        .catch(function (error: Error) {
          if (onFailed) {
            onFailed(error);
          }
        });
    }

    // 重置 input file value
    ResetInputFile(inputEl);

    if (validErr) {
      if (onFailed) {
        onFailed(validErr);
      }
    }
  });

  AddEventListener(inputEl, 'click', function (e: any) {
    e.stopPropagation();
  });

  return inputEl;
}

const FileChooserService: IFileChooserService = {
  async openFileChooser(options?: IFileChooserOptions) {
    return new Promise<IFileChooserChangeResponse>((resolve, reject) => {
      const options_: IFileChooserOptions = Object.assign({}, options, {
        id: GetGUID(10),
        clickable: false
      });

      let inputEl: any = document.body.querySelector(':scope > .file-chooser-input-hidden');

      if (!inputEl) {
        inputEl = CreateInputEl(null, options_, resolve, reject);
        document.body.appendChild(inputEl);
      }

      DispatchClick(inputEl);
    });
  },
  async createFileChooser(
    targetEl: HTMLElement,
    options?: IFileChooserOptions,
    onSelected?: (res: IFileChooserChangeResponse) => void,
    onFailed?: (error: Error) => void
  ): Promise<IFileChooser> {
    const options_: IFileChooserOptions = Object.assign({}, options, {
      id: GetGUID(10)
    });

    const inputEl = CreateInputEl(targetEl, options_, onSelected, onFailed);

    const trigger = function () {
      DispatchClick(inputEl);
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
      RemoveElement(inputEl);
    };

    return {
      trigger,
      destroy
    };
  }
};

export default FileChooserService;
