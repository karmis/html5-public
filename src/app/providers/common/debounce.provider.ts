/**
 * Created by Sergey Trizna on 24.03.2017.
 */
// https://davidwalsh.name/javascript-debounce-function

import { Injectable } from '@angular/core';
import * as _ from "lodash";

@Injectable()
export class DebounceProvider {
    private debounceFunc;
    public debounce(func: Function, wait: number, immediate?: boolean) {
        if (!immediate) {
            if(!this.debounceFunc){
                this.debounceFunc = _.debounce(() => {
                    func();
                }, wait, {
                    'leading': true,
                    'trailing': true
                });
            }
            return this.debounceFunc();
        } else {
            return func();
        }
    };
}
