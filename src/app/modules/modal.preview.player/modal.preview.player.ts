import {Component, EventEmitter, Injector, ViewChild, ViewEncapsulation} from '@angular/core';
import {TimeCodeFormat, TMDTimecode} from '../../utils/tmd.timecode';
import {SimplePreviewPlayerComponent} from "../controls/simple.preview.player/simple.preview.player.component";

@Component({
    selector: 'imfx-modal-preview-player',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        // ControlToAdvTransfer,
    ],
    entryComponents: [
        // IMFXHtmlPlayerComponent
    ]
})

export class ModalPreviewPlayerComponent {
    public onShow: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('player', {static: false}) public playerWrapper: SimplePreviewPlayerComponent;
    private data;
    //private src: any;
    private file: any;
    private modalRef;

    constructor(private injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();
    }

    ngAfterViewInit() {
        this.playerWrapper.srcs = [];
        if (this.data.clips.length > 0) {
            if (this.data.type == "Media") {
                this.data.clips.map(el => {
                    var start = TMDTimecode.fromString(
                        el.start,
                        TimeCodeFormat[el.file.TimecodeFormat]
                    ).toSeconds() - TMDTimecode.fromString(
                        el.file.SOM_text,
                        TimeCodeFormat[el.file.TimecodeFormat]
                    ).toSeconds();
                    var end = TMDTimecode.fromString(
                        el.end,
                        TimeCodeFormat[el.file.TimecodeFormat]
                    ).toSeconds() - TMDTimecode.fromString(
                        el.file.SOM_text,
                        TimeCodeFormat[el.file.TimecodeFormat]
                    ).toSeconds();
                    var src = el.file.PROXY_URL;

                    this.playerWrapper.srcs.push(
                        {
                            "s": src,
                            "d": [start, end]
                        }
                    )
                });
            } else {
                this.data.clips.map(el => {
                    var start = TMDTimecode.fromString(
                        el.start,
                        TimeCodeFormat[this.data.file.TimecodeFormat]
                    ).toSeconds() - TMDTimecode.fromString(
                        this.data.file.SOM_text,
                        TimeCodeFormat[this.data.file.TimecodeFormat]
                    ).toSeconds();
                    var end = TMDTimecode.fromString(
                        el.end,
                        TimeCodeFormat[this.data.file.TimecodeFormat]
                    ).toSeconds() - TMDTimecode.fromString(
                        this.data.file.SOM_text,
                        TimeCodeFormat[this.data.file.TimecodeFormat]
                    ).toSeconds();
                    var src = this.data.src.filter(el2 => el2.id == el.mediaId)[0].src;

                    this.playerWrapper.srcs.push(
                        {
                            "s": src,
                            "d": [start, end]
                        }
                    )
                });
            }
        } else {
            this.data.src.map(el => {
                this.playerWrapper.srcs.push(
                    {
                        "s": el.src,
                        "d": [0, el.seconds]
                    }
                )
            });
        }
        this.playerWrapper.updatePlayer();
    }

    closeModal() {
        this.modalRef.hide();
    }
}
