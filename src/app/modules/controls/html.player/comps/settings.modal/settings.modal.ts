import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    EventEmitter, Injector, Input, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Event as RouterEvent, NavigationStart, Router} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {ItemTypes} from "../../item.types";


@Component({
    selector: 'player-settings-modal',
    templateUrl: './tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PlayerSettingsModalComponent {
    @Input() player: any;
    @Input() mediaType: number = 150;
    @ViewChild('brightnessRanger', {static: false}) public brightnessRanger: ElementRef;
    @ViewChild('contrastRanger', {static: false}) public contrastRanger: ElementRef;
    @ViewChild('invertRanger', {static: false}) public invertRanger: ElementRef;
    @ViewChild('grayscaleRanger', {static: false}) public grayscaleRanger: ElementRef;
    @ViewChild('saturateRanger', {static: false}) public saturateRanger: ElementRef;
    public timecodeOverlay: boolean = false;
    private FILTER_VALS = [];
    private type: string = 'media';

    constructor(private router: Router,
                private injector: Injector,
                private translate: TranslateService) {
        if (this.mediaType == ItemTypes.MEDIA) {
            this.type = 'media';
        } else if (this.mediaType == ItemTypes.AUDIO) {
            this.type = 'audio';
        }
    }

    public set(filter, value) {
        // let value = parseFloat(_value) - 5;
        this.FILTER_VALS[filter] = typeof value == 'number' ? Math.round(value * 10) / 10 : value;
        if (value == 1 || (typeof value == 'string' && parseFloat(value) == 1)) {
            // delete  this.FILTER_VALS[filter];
        }
        let vals = [];
        let _this = this
        Object.keys( this.FILTER_VALS).sort().forEach(function(key, i) {
            vals.push(key + '(' +  _this.FILTER_VALS[key] + ')');
        });
        let val = vals.join(' ');
        $(this.player.el()).find('video').css('filter', val);
    }
    public clear() {
        this.FILTER_VALS = [];
        if (this.player && this.player.el()) {
            $(this.player.el()).find('video').css('filter', '');
        }
        if (this.mediaType == ItemTypes.MEDIA) {
            this.brightnessRanger.nativeElement.value = 1;
            this.contrastRanger.nativeElement.value = 1;
            this.saturateRanger.nativeElement.value = 1;
            this.invertRanger.nativeElement.value = 0;
            this.grayscaleRanger.nativeElement.value = 0;
        }
    }
    public hideSettingsWindow() {
        $('#settings-modal-wrapper').hide();
        if (this.mediaType == ItemTypes.MEDIA) {
            this.type = 'media';
        } else if (this.mediaType == ItemTypes.AUDIO) {
            this.type = 'audio';
        }
    }

    public changeTimecodeOverlayShowing() {
        this.timecodeOverlay = !this.timecodeOverlay;
        // this.player.componentContext.timecodeOverlayShowing = this.timecodeOverlay;
        this.timecodeOverlay ? $('#timecode-overlay').show() : $('#timecode-overlay').hide();
    }
}
