import {Component, ViewChild, ChangeDetectorRef, ViewEncapsulation, Injector, ElementRef, Input} from '@angular/core';
import {XMLService} from "../../../../services/xml/xml.service";
import {ActivatedRoute} from "@angular/router";
import {IMFXHtmlPlayerComponent} from "../../../../modules/controls/html.player/imfx.html.player";
import {DetailService} from "../../../../modules/search/detail/services/detail.service";
import {IMFXControlsSelect2Component} from "../../../../modules/controls/select2/imfx.select2";
import {MediaDetailMediaVideoResponse} from "../../../../models/media/detail/mediavideo/media.detail.mediavideo.response";
import {TimecodeProvider} from "../../../../modules/controls/html.player/providers/timecode.provider";
import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {RCEArraySource, RCESource} from "../../../clip-editor/rce.component";
// import {EventsHandlerProvider} from "../../../../modules/controls/html.player/providers/events.handler.provider";
// import {TimecodeControlsProvider} from "../../../../modules/controls/html.player/providers/timecode.controls.provider";
// import {TimecodeProvider} from "../../../../modules/controls/html.player/providers/timecode.provider";



@Component({
  selector: 'demo-video-details',
  templateUrl: './tpl/details.html',
  styleUrls: [
    './styles/index.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [DetailService, TimecodeProvider/*, EventsHandlerProvider, TimecodeControlsProvider*/]
})

export class DemoVideoDetailsComponent {
    private src: any; //= 'http://192.168.90.39/proxy_testing/DFA149697.mp4';
    private totalDuration: any = 0;
    private som = '00:00:00:00';
    private somMs = 0;
    private somMsForConvert = 0;
    private timecodeformat = 'Pal';
    private timecodeformat2text = 'Pal';
    private timecodeformat2id: number = 0;
    private Milliseconds = 0;
    private Milliseconds1 = 0;
    private Frames = 0;
    private Timecode = '00:00:00:00';
    private millisecFromTimecode;
    private timecodeFromMillisec;
    private framesFromMillisec;
    private timecodeFromFrames;
    private file = {
        ID: 291743,
        MEDIA_TYPE: null,
        SOM_text: '00:00:00:00'
    }
    private videoDetails = null;
    private timecodeProvider;
    private urls = [
        'http://192.168.90.39/proxy_testing/M0017035.mp4',
        'http://192.168.90.39/proxy_testing/ESDSDAUDIO dan fin fre hun int ita nor pol shorter 2.m3u8',
        'http://192.168.90.39/proxy_testing/feelings_vp9-20130806-manifest.mpd',
        'https://origin01-stream.aviion.tv/kaltura/multiaudio2.mp4/manifest.mpd'//,'http://192.168.90.39/proxy_testing/TMD53194.ism/Manifest'
    ];
    private files = [
        291743, //123578,
        313243, /*133211,*/
        311982 //66321
    ]
    private selectedId = 0;
    @ViewChild('playerWrapper', {static: false}) playerWrapper: ElementRef;
    @ViewChild('video', {static: false}) player: IMFXHtmlPlayerComponent;
    @ViewChild('select2Control', {static: false}) private select2Control: IMFXControlsSelect2Component;
    @ViewChild('select2Control2', {static: false}) private select2Control2: IMFXControlsSelect2Component;
    @ViewChild('userId', {static: false}) private userId: ElementRef;
    constructor(private cdr: ChangeDetectorRef,
                private route: ActivatedRoute,
                private detailService: DetailService,
                public injector: Injector
                /*private eventsHandlerProvider: EventsHandlerProvider,
                 private timecodeControlsProvider: TimecodeControlsProvider*/) {
        (<any>window).demoPlayer = this;
    }

    ngOnInit() {
        this.timecodeProvider = this.injector.get(TimecodeProvider);
    }
    ngAfterViewInit() {
        let select2data = [{
                id: 0,
                text: "Pal"
            },
            {
                id: 1,
                text: "NTCS_DF"
            },
            {
                id: 2,
                text: "NTCS_NDF"
            },
            {
                id: 3,
                text: "FPS24"
            },
            {
                id: 4,
                text: "HD60p_DF"
            },
            {
                id: 5,
                text: "HD60p_NDF"
            },
            {
                id: 6,
                text: "HD50p"
            },
            {
                id: 7,
                text: "Film2398"
            }];

        this.select2Control.setData(select2data, true);
        this.select2Control.setSelectedByIds([0]);
        this.select2Control2.setData(select2data, true);
        this.select2Control2.setSelectedByIds([0]);

        // this.initPlayer('', 100);
    }

    initPlayer(src, type) {
        let res = [
            {
                ID: 132448,
                PROXY_URL: "http://192.168.90.39/proxy_testing/NatGeoArmyAnts.m3u8",
                IsLive: false,
                som: '00:00:00;00',
                duration: '00:00:07;04',
                TimecodeFormat: "NTCS_DF"
            },
            {
                ID: 133211,
                PROXY_URL: "http://192.168.90.39/proxy_testing/ESDSDAUDIO dan fin fre hun int ita nor pol shorter 2.m3u8",
                IsLive: false,
                som: '00:00:07;04',
                duration: '00:02:01;14',
                TimecodeFormat: "NTCS_DF"
            },
            {
                ID: 116401,
                PROXY_URL: 'http://192.168.90.39/sanmedia/playlist.m3u8',
                IsLive: true,
                som: '00:02:08:18',
                duration: '00:01:42:18',
                TimecodeFormat: "Pal"
            }
        ]
        let srcs = <RCEArraySource>res.map(el => {
            let duration = TMDTimecode.fromString(
                el.duration,
                TimeCodeFormat[el.TimecodeFormat]
            ).toSeconds();
            let source: RCESource = {
                id: el.ID,
                restricted: false,
                src: el.PROXY_URL,
                seconds: duration,
                percent: 1,
                live: el.IsLive,
                som: TMDTimecode.fromString(el.som, TimeCodeFormat[el.TimecodeFormat]).toSeconds(),
                som_string: el.som
            };

            return source;
        });
        this.totalDuration = (<RCEArraySource>srcs).map(e => e.seconds).reduce((a, b) => a + b, this.somMs);
        srcs = (<RCEArraySource>srcs).map((el, idx) => {
            el.percent = ((<RCEArraySource>srcs).slice(0, idx).map(el => el.seconds)
                .reduce((a, b) => a + b, 0) + el.seconds) / (this.totalDuration - this.somMs);
            return el;
        });
        this.src = srcs;
        this.file.MEDIA_TYPE = type;
        this.file.SOM_text = this.som;
        this.videoDetails = {
            ProxyUrl: this.src[0],
            Som: this.som,
            SomMs: this.somMs,
            TimecodeFormat: this.timecodeformat,
            OriginalVideo: true,
            PlayerType: 'html5',
            FileSomMs: 0
        };
        (<any>this.player).first = true;

        (<any>this.player).refreshDemoPlayer(this.videoDetails);
    }

    savemediasrc(e) {
        this.src = e;
    }
    savemediasom(e) {
        this.som = e;
    }
    savemediasomMs(e) {
        this.somMs = e;
    }
    changeSomMsForConvert(e) {
        this.somMsForConvert = e;
    }
    changeTimecode(e) {
        this.Timecode = e;
    }
    changeMilliseconds(e) {
        this.Milliseconds = e;
    }
    onUpdateControl() {
        let selected = this.select2Control.getSelectedObject();
        this.timecodeformat = selected.text;
    }
    onUpdateControl2() {
        let selected = this.select2Control2.getSelectedObject();
        this.timecodeformat2text = selected.text;
        this.timecodeformat2id = parseInt(<any>selected.id, 10);
    }
    changeFrames(e) {
        this.Frames = e;
    }
    changeMilliseconds1(e) {
        this.Milliseconds1 = e;
    }
    convertTtoM() {
        this.millisecFromTimecode = this.timecodeProvider.getTimeFromTimecodeString(this.Timecode, this.timecodeformat2text, parseFloat(<any>this.somMsForConvert)) * 1000;
    }
    convertMtoT() {
        this.timecodeFromMillisec = this.timecodeProvider.getTimecodeString(this.Milliseconds / 1000, this.timecodeformat2id, parseFloat(<any>this.somMsForConvert));
    }
    convertMtoF() {
        this.framesFromMillisec = TMDTimecode.fromMilliseconds(parseFloat(<any>this.Milliseconds1), this.timecodeformat2id).toFrames();
    }
    convertFtoT() {
        this.timecodeFromFrames = TMDTimecode.fromFrames(parseFloat(<any>this.Frames), this.timecodeformat2id).toString();
        // this.timecodeFromMillisec = this.timecodeProvider.getTimecodeString(this.Milliseconds / 1000, this.timecodeformat2id, parseFloat(<any>this.somMsForConvert));
    }

    newInitPlayer() {
        // this.videoDetails = {
        //     ProxyUrl: url,
        //     Som: 0,
        //     SomMs: 0,
        //     TimecodeFormat: this.timecodeformat,
        //     OriginalVideo: true,
        //     PlayerType: 'html5',
        //     FileSomMs: 0
        // };
        (<any>this.player).first = true;

        setTimeout(() => {
            (<any>this.player).refresh();
        })
    }
    onSelectTrack(id) {
        this.videoDetails = null;
        (<any>this.player).isLive = false;
        (<any>this.player).first = true;
        (<any>this.player).externalVideoDetails = null;
        this.selectedId = id;
        this.file.ID = this.files[id];
        this.newInitPlayer();
    }
    isSelectedTrack(id){
        return this.selectedId == id;
    }
    onSelectLive(){
        this.videoDetails = {
            ProxyUrl: 'https://origin01-stream.aviion.tv/kaltura/multiaudio2.mp4/manifest.mpd',
            Som: '00:00:00:00',
            SomMs: 0,
            TimecodeFormat: this.timecodeformat,
            OriginalVideo: true,
            PlayerType: 'html5',
            FileSomMs: 0
        };
        this.selectedId = 4;
        (<any>this.player).first = true;
        (<any>this.player).isLive = true;

        (<any>this.player).refreshDemoPlayer(this.videoDetails);
    }
    LoadVideoByID(){
        debugger
        if(!this.userId.nativeElement.value) return;
        this.videoDetails = null;
        (<any>this.player).isLive = false;
        (<any>this.player).first = true;
        (<any>this.player).externalVideoDetails = null;
        this.file.ID = this.userId.nativeElement.value;
        this.newInitPlayer();
    }
}
