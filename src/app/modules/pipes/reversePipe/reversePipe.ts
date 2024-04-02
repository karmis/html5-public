/**
 * Created by Sergey Trizna on 31.07.2017.
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'reverse',
    pure: false
})
export class ReversePipe implements PipeTransform{
    transform(values) {
        if (values) {
            return values.reverse();
        }
    }
}