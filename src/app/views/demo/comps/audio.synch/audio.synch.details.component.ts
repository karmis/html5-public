import {Component, ViewChild, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import {XMLService} from "../../../../services/xml/xml.service";
import {ActivatedRoute} from "@angular/router";
import {IMFXHtmlPlayerComponent} from "../../../../modules/controls/html.player/imfx.html.player";
import {DetailService} from "../../../../modules/search/detail/services/detail.service";
import {AudioSynchProvider} from "../../../../modules/controls/html.player/providers/audio.synch.provider";
// import {EventsHandlerProvider} from "../../../../modules/controls/html.player/providers/events.handler.provider";
// import {TimecodeControlsProvider} from "../../../../modules/controls/html.player/providers/timecode.controls.provider";
// import {TimecodeProvider} from "../../../../modules/controls/html.player/providers/timecode.provider";



@Component({
  selector: 'demo-audio-synch-details',
  templateUrl: './tpl/details.html',
  styleUrls: [
    './styles/index.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [DetailService, AudioSynchProvider/*, EventsHandlerProvider, TimecodeControlsProvider, TimecodeProvider*/]
})

export class DemoAudioSynchDetailsComponent {
  private src;
  private audioSrc;
  private file = {
    ID: null,
    MEDIA_TYPE: null
  }
  @ViewChild('video', {static: false}) player: IMFXHtmlPlayerComponent;

  constructor(private cdr: ChangeDetectorRef,
              private route: ActivatedRoute,
              private detailService: DetailService,
              /*private eventsHandlerProvider: EventsHandlerProvider,
              private timecodeControlsProvider: TimecodeControlsProvider*/) {
    (<any>window).demoPlayer = this;
  }
  ngOnInit() {
  }

  //116465 h264
  //116466 wav
  //116467 wav
  initPlayer(id, type) {
    this.file.ID = id;
    this.file.MEDIA_TYPE = type;
  //  this.src = src; // 'http://192.168.90.39/proxy_testing/dne space h264.mov';
   // this.player.refresh();
    this.detailService.getVideoInfo(this.file.ID, {
      smudge: type === 100
    }).subscribe( resp => {
      this.src = resp.ProxyUrl;
      this.player.videoDetails = resp;
      this.player.refresh();
    });
  }

  updateAudio(src) {
    this.player.updateAudioSrc(src);
  }

}
