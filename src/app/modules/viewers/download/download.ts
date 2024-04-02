/**
 * Created by Sergey Trizna on 16.05.2017.
 */
import {Component, ViewEncapsulation, ViewChild, Input, ChangeDetectorRef} from '@angular/core';

@Component({
    selector: 'download-viewer',
    templateUrl: "tpl/index.html",
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})

export class DownloadViewerComponent {
    @Input('config') private config: any = {
        url: ''
    };
    @ViewChild('target', {static: false}) private compRef;
    private fileName: string;
    constructor() {
    }

    ngOnInit() {
        if (this.config.data && this.config.data.Filename) {
            this.config.fileName = this.config.data.Filename;
        } else if (this.config.url) {
            this.config.fileName = this.config.url.split('/').pop().split('?')[0];
        }
    }
    ngAfterViewInit() {

    }


    isSameHost() {
        let host = `${window.location.protocol}//${window.location.hostname}`;
        let url = this.config.url;

        if (!url) {
            return false;
        }

        if (url.indexOf(host) !== -1) {
            return true;
        } else {
            return false;
        }
    }
}
