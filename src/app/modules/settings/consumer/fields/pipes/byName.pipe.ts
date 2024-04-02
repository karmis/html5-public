/**
 * Created by Sergey Trizna on 24.08.2017.
 */
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'byName'})
export class SettingsFieldsForConsumerSearchByName implements PipeTransform {
    transform(value, args: string[]): any {
        let keys = [];
        for (let key in value) {
            if (!args[0] || (value[key].TemplateName.toLowerCase().indexOf(args[0].toLowerCase()) != -1)){
                keys.push(value[key]);
            }
        }
        return keys;
    }
}
