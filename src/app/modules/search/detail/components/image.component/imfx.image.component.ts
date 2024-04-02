import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'image-block',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class IMFXImageComponent {
    @Input() PROXY_URL;
    constructor() {
    }
}
