/**
 * Created by IvanBanan on 09.04.2018.
 */
import { Directive, ElementRef, Injector, Input, Renderer2 } from '@angular/core';
import { SplitProvider } from '../../providers/split/split.provider';

@Directive({
  selector: '[save-split-state]'
})
export class SaveSplitStateDirective{
  @Input() splitCounter;
  constructor(private elementRef: ElementRef,
              private renderer: Renderer2,
              private injector: Injector,
              private splitProvider: SplitProvider){

    // splitProvider.directiveCount++;
    // splitProvider.splitArray.push(elementRef);
  }
  ngOnInit(){
    console.log(this.splitCounter, this.elementRef, this.renderer);
  }


}
