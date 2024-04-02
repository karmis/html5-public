import {
    Input,
    Component,
    ViewEncapsulation,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Output,
    EventEmitter,
    ViewChild,
    QueryList,
    ViewChildren,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
    ElementRef
} from '@angular/core';
import { NotificationService } from "../../notification/services/notification.service";
import { ClipEditorDetailProvider } from "../../../views/clip-editor/providers/clip-editor.detail.provider";
import {ThumbComponent} from "../thumb/thumb";
import {appRouter} from "../../../constants/appRouter";
import {Router} from "@angular/router";
import {TelestreamService} from "./service/telestream.service";
import {IMFXControlsSelect2Component, Select2EventType} from "../select2/imfx.select2";
import {SecurityService} from "../../../services/security/security.service";
import {IMFXControlsLookupsSelect2Component} from "../select2/imfx.select2.lookups";
import {TimecodeInputComponent} from "../timecode/timecode.input";
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";

interface TelestreamStateButtonType {
    visibility?: boolean;
    enabled?: boolean;
    overlay?: boolean;
}

@Component({
    selector: 'telestream-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [
        ClipEditorDetailProvider
    ]
})
export class TelestreamComponent implements AfterViewInit, OnChanges {
    // @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('controlPlayoutDevices', {static: false} ) controlPlayoutDevices: IMFXControlsLookupsSelect2Component;
    @ViewChild('playFromTimecodeElement', {static: false} ) playFromTimecodeElement: TimecodeInputComponent;
    @ViewChild('playToTimecodeElement', {static: false} ) playToTimecodeElement: TimecodeInputComponent;
    deviceGroupId = null;
    inFrame: number = 0;
    outFrame: number = 0;
    inText: string = '';
    outText: string = '';

    private item: any;
    @Input('item') setItem(val) {
        this.refresh(val);
    };

    private showOverlay: boolean = false;
    private error: boolean = false;
    private errorText: string = '';
    private statusText: string = 'Disconnected';

    private btnStop: TelestreamStateButtonType = {visibility: true, enabled: true, overlay: false};
    private btnPlay: TelestreamStateButtonType = {visibility: true, enabled: true, overlay: false};
    private btnPause: TelestreamStateButtonType = {visibility: true, enabled: true, overlay: false};
    private btnBack: TelestreamStateButtonType = {visibility: true, enabled: false, overlay: false};
    private btnForward: TelestreamStateButtonType = {visibility: true, enabled: false, overlay: false};
    private disabledBtns: boolean = true;

    constructor(public cdr: ChangeDetectorRef,
                private router: Router,
                private notificationService: NotificationService,
                private securityService: SecurityService,
                private telestreamService: TelestreamService
    ) {

    };


    ngOnInit() {

    }

    ngAfterViewInit() {
        this.controlPlayoutDevices.onReady.subscribe(() => {
            const id = this.controlPlayoutDevices.getSelectedId();
            if (!id) {
                return;
            }

            this.connectDevice(id);
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(changes);
    }

    ngOnDestroy() {

    }

    loadComponentData() {

    }

    refresh(val) {
        this.item = val;
        this.resetSomEom();
        // const id = this.controlPlayoutDevices.getSelectedId();
        // if (!id) {
        //     return;
        // }

        // this.connectDevice(id);
    }

    resetSomEom() {
        this.inFrame = this.item.SOM;
        this.outFrame = this.item.EOM;
        this.inText = this.item.SOM_text;
        this.outText = this.item.EOM_text;
    }

    getInputError(){
        return TMDTimecode.compareStrings(this.outText, this.inText) < 0;
    }

    onChangedInputValue($event) {
        if($event || this.getInputError()) {
           return;
        }

        this.inFrame = TMDTimecode.stringToFrames(this.inText, TimeCodeFormat[this.item.TimecodeFormat]);
        this.outFrame = TMDTimecode.stringToFrames(this.outText, TimeCodeFormat[this.item.TimecodeFormat]);
    }


    onStopBtn($event) {
        const id = this.controlPlayoutDevices.getSelectedId();
        this.disabledBtns = true;
        this.btnStop.overlay = true;
        this.telestreamService.stop(id).subscribe(res => {
            if (res.Result === true) {
                this.calcBtnsStatuses('Stopped');
                this.btnStop.overlay = false;
                this.disabledBtns = false;
            } else {
                this.statusText = 'Failed';
            }

            this.btnStop.overlay = false;
            this.cdr.detectChanges();
        }, error => {
            this.disabledBtns = false; //todo remove
            this.btnStop.overlay = false;
            this.cdr.detectChanges();
        });
    }

    onPauseBtn($event) {
        const id = this.controlPlayoutDevices.getSelectedId();
        this.disabledBtns = true;
        this.btnPause.overlay = true;
        this.telestreamService.pause(id).subscribe(res => {
            if (res.Result === true) {
                this.calcBtnsStatuses('Paused');
                this.btnPause.overlay = false;
                this.disabledBtns = false;
            } else {
                this.statusText = 'Failed';
            }
            this.cdr.detectChanges();
        }, error => {
            this.disabledBtns = false; //todo remove
            this.btnPause.overlay = false;
            this.cdr.detectChanges();
        });
    }

    onPlayBtn($event) {
        const id = this.controlPlayoutDevices.getSelectedId();
        this.disabledBtns = true;
        this.btnPlay.overlay = true;
        // only for available play/pause mode

        if(this.statusText == 'Paused') {
            this.telestreamService.play(id).subscribe(res => {
                if (res.Result === true) {
                    this.calcBtnsStatuses('Playing');
                    this.btnPlay.overlay = false;
                    this.disabledBtns = false;
                    this.intervalCheckingStatus(id);
                } else {
                    this.statusText = 'Failed';
                }
                this.cdr.detectChanges();
            }, error => {
                this.disabledBtns = false; //todo remove
                this.btnPlay.overlay = false;
                this.cdr.detectChanges();
            });
        } else if (this.statusText == 'Stopped') {
            // } else {
            this.telestreamService.playClip(id, {
                'Path': this.item.LOCATION,
                'FileSom': this.item.FILE_SOM,
                'InFrame': this.inFrame,
                'OutFrame': this.outFrame
            }).subscribe(res => {
                if (res.Result === true) {
                    this.calcBtnsStatuses('Playing');
                    this.btnPlay.overlay = false;
                    this.disabledBtns = false;
                    this.intervalCheckingStatus(id);
                } else {
                    this.statusText = 'Failed';
                }
                this.cdr.detectChanges();
            }, error => {
                this.statusText = 'Failed';
                this.cdr.detectChanges();
            });
        } else {
            console.log('status error');
        }
    }

    private timerHandler = null;
    private intervalCheckingStatus(id) {
        if(this.timerHandler) {
            this.resetTimer();
        }

        this.timerHandler = setTimeout(() => {
            this.calcStatus(id, res => {
                if (res.ResultObject.ClipStatus == 'Playing') {
                    this.intervalCheckingStatus(id);
                }
            });
        }, 2000);
    }

    private resetTimer(): void {
        if (this.timerHandler) {
            clearTimeout(this.timerHandler);
            this.timerHandler = null;
        }
    }

    onBackBtn($event) {

    }

    onForwardBtn($event) {

    }

    onResetBtn($event) {
        this.resetSomEom();
    }

    onSelectDevice($event: Select2EventType) {
        const id = $event.params.data[0].id;
        this.connectDevice(id);
    }

    connectDevice(id) {
        this.statusText = 'Connecting';
        this.disabledBtns = true;
        this.telestreamService.testConnectivity(id).subscribe(res => {
        // this.telestreamService.getStatus(id).subscribe(res => {

            if (res.Result === true) {
                this.calcStatus(id);
            } else {
                this.statusText = 'Unavailable';
                this.cdr.detectChanges();
            }
        }, error => {
            this.statusText = 'Unavailable';
            this.cdr.detectChanges();
        });
    }

    calcStatus(id, callback = (res) => {}) {
            this.telestreamService.getStatus(id).subscribe(_res => {
                if (_res.Result === true) {
                    this.calcBtnsStatuses(_res.ResultObject.ClipStatus);
                    this.disabledBtns = false;
                    callback(_res);
                } else {
                    this.statusText = 'Failed';
                }
                this.cdr.detectChanges();
            }, error => {
                this.statusText = 'Failed';
                this.cdr.detectChanges();
            });
    }

    calcBtnsStatuses(text) {
        this.statusText = text;
        switch (this.statusText) {
            case 'Unknown':
                this.btnStop.enabled = false;
                this.btnPause.enabled = false;
                this.btnPlay.enabled = false;
                break;
            case 'Playing':
                this.btnStop.enabled = true;
                this.btnPause.enabled = true;
                this.btnPlay.enabled = false;
                break;
            case 'Paused':
                this.btnStop.enabled = true;
                this.btnPause.enabled = false;
                this.btnPlay.enabled = true;
                break;
            case 'Stopped':
                this.btnStop.enabled = false;
                this.btnPause.enabled = false;
                this.btnPlay.enabled = true;
                break;
            default:
                this.btnStop.enabled = false;
                this.btnPause.enabled = false;
                this.btnPlay.enabled = false;
        }

    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
