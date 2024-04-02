/**
 * Created by Sergey Trizna on 10.01.2017.
 */
import {Pipe, PipeTransform, Injectable} from '@angular/core';
import * as $ from 'jquery';
@Pipe({
    name: 'filter',
    pure: true
})
@Injectable()
export class FilterPipe implements PipeTransform {
    res = [];
    transform(items: any[], fields: any[], val: string): any {
        this.res = [];
        let v = $.trim(val).toLowerCase();

        if(v) {
            let self = this;
            $.each(items, function (k, o) {
                fields.forEach(function (f) {
                    if(o[f]) {
                        let fval = $.trim(o[f]).toLowerCase();
                        if(fval.indexOf(v) != -1) {
                            self.res.push(o);

                            return false;
                        }
                    }

                })
            });
        }

        return !v&&this.res.length == 0?items:this.res;
    }
}