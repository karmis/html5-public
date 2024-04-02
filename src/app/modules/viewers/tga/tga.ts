import {Component, ViewEncapsulation, ViewChild, Input, ElementRef} from '@angular/core';

import * as TGA from "./plugins/tga"

@Component({
    selector: 'tga-viewer',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})

export class TGAViewerComponent {
    @Input('config') private config: any = {
        url: ''
    }
    @ViewChild('target', {static: false}) private target: ElementRef;

    constructor() {

    }

    ngOnInit() {
        let self = this;
        var tga = new TGA.TGA();
        tga.open( self.config.url, function(){
            self.target.nativeElement.append(tga.getCanvas());
        });
    }
}
