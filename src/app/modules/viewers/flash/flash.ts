import {Component, Input, ViewChild, ViewEncapsulation} from "@angular/core";
import 'script-loader!./libs/swfobject/swfobject/swfobject.js';

declare var swfobject: any;
@Component({
    selector: 'flash-viewer',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,

})

export class FlashViewerComponent {
    @Input('config') private config: any = {
      url: ''
    };
    @ViewChild('flashTarget', {static: false}) private compRef;
    constructor() {
    }

    ngAfterViewInit() {
      setTimeout(() => {
        swfobject.embedSWF(this.config.url, this.compRef.nativeElement, 100, 100, 10);
      });
    }
}
