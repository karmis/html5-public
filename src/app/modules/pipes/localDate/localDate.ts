import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'localDate'})
export class LocalDate implements PipeTransform {
  transform(value, args: string): any {
      let exp = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
      if (value && value.match(exp)) {
          let date = new Date(value); // .toLocaleString();
          return moment(date).format(args);
      }
      return value;
  }
}
