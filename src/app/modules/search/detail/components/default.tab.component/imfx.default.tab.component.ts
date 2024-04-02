/**
 * Created by initr on 20.10.2016.
 */
import {Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Injectable, Inject, ChangeDetectorRef} from '@angular/core'
import {FormControl} from '@angular/forms';
// Loading jQuery
import * as $ from 'jquery';

@Component({
    selector: 'default-tabs',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
@Injectable()
export class IMFXDefaultTabComponent {
    config: any;

    constructor() {}

    ngOnInit() {}
}
