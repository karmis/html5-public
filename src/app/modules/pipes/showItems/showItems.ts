import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
  name: 'showItems',
})

export class ShowItems implements PipeTransform {
  transform(items: any[]): any {
    return items.filter(item => !item.hide);
  }
}
