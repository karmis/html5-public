import * as $ from "jquery";

/**
 * Created by Pavel on 28.01.2017.
 */

export class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  }
}

export const copyText = (toClipboard) => {
    let $temp = $('<input>');
    $('body').append($temp);
    $temp.val(toClipboard).select();
    document.execCommand('copy');
    $temp.remove();
}
