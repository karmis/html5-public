/**
 * Created by Pavel on 25.04.2017.
 */

import { Directive, ElementRef, Input } from '@angular/core';
import {NgModel} from "@angular/forms";
@Directive({
  selector: '[tristate]',
  providers: [NgModel],
  host: {
    '(ngModelChange)' : 'onInputChange($event)'
  }
})
export class TristateDirective {
  @Input() tristateData: any = {
      allow: false,
      currentValue: null
  };

  constructor(private el: ElementRef, private model:NgModel) {
    this.updateIndeterminate();
  }

  onInputChange(event){
    this.updateIndeterminate();
  }

  updateIndeterminate() {
    setTimeout(()=>{
      let self = this;
      let indeterminate = typeof self.model.value != "boolean";
      this.el.nativeElement.indeterminate = this.tristateData.allow ? indeterminate : false;
    })
  }

}
