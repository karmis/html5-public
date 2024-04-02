import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {ItemTypes} from "../item.types";
import {Injectable} from "@angular/core";
import {AbstractPlayerProvider} from "./abstract.player.provider";
import {TimecodeProvider} from "./timecode.provider";
import {TimecodeControlsProvider} from "./timecode.controls.provider";
import {HelperProvider} from "./helper.provider";
import {ThumbnailsProvider} from "./thumbnails.provider";
import {SmoothStreamingProvider} from "./smooth.streaming.provider";
import {DetailService} from "../../../search/detail/services/detail.service";
import { MediaDetailMediaVideoResponse } from '../../../../models/media/detail/mediavideo/media.detail.mediavideo.response';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class EventsHandlerProvider extends AbstractPlayerProvider {

  private imfxloadedmediaFired: boolean;
  private timeCodeEventInited: boolean = false;
  private onceFiredDurationchangeEvent: boolean = false;

  constructor(private helperProvider: HelperProvider,
              private timecodeProvider: TimecodeProvider,
              private timecodeControlsProvider: TimecodeControlsProvider,
              private detailService: DetailService,
              private smoothStreamingProvider: SmoothStreamingProvider,
              private thumbnailsProvider: ThumbnailsProvider) {
    super();
  }

  init() {
      this.imfxloadedmediaFired = false;
      let providerRef = this;

      if (this.componentRef.simpleMode) {
          this.showPlayer();
          if (this.componentRef.isThumb && this.componentRef.currentTime === 0) {
              this.componentRef.player.on('loadeddata', () => {
                  if (providerRef.componentRef.destroyed$.isStopped) {
                      return;
                  }
                  providerRef.setPlayerSomAfterLoadSimpleMode();
              })
          }
      } else {
          this.componentRef.player.on("timeupdate", () => {
              this.emitEvents();
          })

          this.componentRef.player.on("error", (e) => {
              console.log('error!')
              setTimeout(() => providerRef.showPlayer(), 500);
          })

          this.componentRef.player.on('loadedmetadata', () => {
              console.log('loadedmetadata!')
              providerRef.showPlayer();
              // multi source RCE, used in videojs.markers plugin
              if (this.imfxloadedmediaFired) {
                  this.componentRef.player.trigger('imfxloadedmedia');
                  this.imfxloadedmediaFired = true;
              }

              // for media clip editor
              if (Array.isArray(this.componentRef.src) && this.componentRef.src.length === 1) {
                  this.componentRef.src[0].seconds = this.componentRef.player.duration();
              }
              this.componentRef.player.qualityMenu.update();
          });

          this.componentRef.player.on(['waiting', 'pause'], function () {
              if (providerRef.componentRef)
                  providerRef.componentRef.isPlaying = false;
              if (providerRef.componentRef.audioPlayer) {
                  providerRef.componentRef.pauseAudio();
              }
          });
          this.componentRef.player.on('playing', function () {
              if (providerRef.componentRef)
                  providerRef.componentRef.isPlaying = true;

              if (providerRef.componentRef) {
                  providerRef.componentRef.resumeAudioContext();
              }
          });

          this.componentRef.player.on('loadeddata', () => {
              if (providerRef.componentRef.destroyed$.isStopped) {
                  return;
              }
              console.log('loadeddata!')
              console.log("i-mediaflex v3 player  > media item loaded: " + providerRef.componentRef.id);
              providerRef.preventVideoRightClick();
              providerRef.showPlayer();
              providerRef.getVideoInfo();
          });

          this.componentRef.player.on('waiting', () => {
              $(providerRef.componentRef.player.el()).find('.vjs-loading-spinner').removeClass('show-loader');
              setTimeout((e) => { // delay for loader
                  $(providerRef.componentRef.player.el()).find('.vjs-loading-spinner').addClass('show-loader');
              }, 600);
          });
          this.componentRef.player.on(['canplay', 'playing'], () => {
              $(providerRef.componentRef.player.el()).find('.vjs-loading-spinner').removeClass('show-loader');
          });

          this.componentRef.player.audioTracks().addEventListener('change', function () {
              let tracks = providerRef.componentRef.player.audioTracks();
              for (var i = 0; i < tracks.length; i++) {
                  var track = tracks[i];
                  if (track.enabled) {
                      // select audioTrack
                      providerRef.componentRef.showAudioTrackOverlay(track.label);
                      return;
                  }
              }
          });
          this.componentRef.player.on('durationchange', () => {
              if (providerRef.componentRef.player.duration() !== Infinity && this.timeCodeEventInited) {
                  (<any>providerRef.componentRef).timecodeControlsProvider.updateTimecode(true, false, true);
                  (<any>providerRef.componentRef).markersProvider.updateIntervalMarker();
                  (<any>providerRef.componentRef).clipsProvider.clearPlayerMarkers(3);
                  // providerRef.componentRef.player.markers.updateTime();
              } else if (providerRef.componentRef.isLive && providerRef.componentRef.type == 100 && !this.onceFiredDurationchangeEvent) {
                  this.onceFiredDurationchangeEvent = true;
                  providerRef.getVideoInfo();
              }
          });
          this.componentRef.player.on('playerresize', () => {
              (<any>providerRef.componentRef).resizeProvider.onResize();
          });
          this.componentRef.player.on('fullscreenchange', () => {
              (<any>providerRef.componentRef).isFullscreen = !(<any>providerRef.componentRef).isFullscreen;
          });
      }
  }

  public getVideoInfo() {
      this.timeCodeEventInited = false;
      let providerRef = this;
      let isSmooth = false;
      if (providerRef.componentRef.src instanceof Array) {
          isSmooth = providerRef.helperProvider.checkFileType('ism', providerRef.componentRef.src[0].src);
      }
      else {
          isSmooth = providerRef.helperProvider.checkFileType('ism', providerRef.componentRef.src);
      }
      if (isSmooth) {
          //add audiotracks
          providerRef.smoothStreamingProvider.addTextAndAudiotracksIntoSSPlayer();
      }
      if (providerRef.componentRef.type == ItemTypes.MEDIA || providerRef.componentRef.type == ItemTypes.AUDIO) {
          if (providerRef.componentRef.src instanceof Array && (!providerRef.componentRef.isLive && !isSmooth)) {
              providerRef.detailService.getMediaSmudges((<Array<any>>providerRef.componentRef.src).map(el => el.id))
                  .pipe(
                      takeUntil(providerRef.componentRef.destroyed$)
                  )
                  .subscribe(
                      (resp) => {
                          providerRef.thumbnailsProvider.addSegmentedThumbnails(resp);
                          providerRef.setPlayerConstants();
                          this.timecodeControlsProvider.initTimecodeEvents();
                          this.timeCodeEventInited = true;
                          providerRef.componentRef.isPlayerDataLoaded = true;
                          providerRef.componentRef.playerReady.emit(providerRef.componentRef.videoDetails);
                          providerRef.setPlayerSomAfterLoad();
                      });
          } else {
              if (providerRef.componentRef.externalDownload) {
                  providerRef.setPlayerConstants();
                  if (typeof this.componentRef.src == "string") { // do not add thumbnails for multisegments player // src: Array
                      providerRef.thumbnailsProvider.addThumbnails(providerRef.componentRef.videoDetails);
                  }
                  this.timecodeControlsProvider.initTimecodeEvents();
                  this.timeCodeEventInited = true;
              }
              else {
                  providerRef.setPlayerConstants();
                  if (typeof this.componentRef.src == "string") { // do not add thumbnails for multisegments player // src: Array
                      providerRef.thumbnailsProvider.addThumbnails(providerRef.componentRef.videoDetails);
                  }
                  if (providerRef.componentRef.type == ItemTypes.AUDIO && !!providerRef.componentRef.videoDetails.AudioWaveform) {
                      providerRef.componentRef.addAudioWaveformImage(providerRef.componentRef.videoDetails.AudioWaveform);
                  }
                  this.timecodeControlsProvider.initTimecodeEvents();
                  this.timeCodeEventInited = true;
                  providerRef.componentRef.isPlayerDataLoaded = true;
                  providerRef.componentRef.playerReady.emit(providerRef.componentRef.videoDetails);
                  providerRef.setPlayerSomAfterLoad();
              }
          }
      } else {
          delete providerRef.componentRef.videoDetails;
          new Promise((resolve, reject) => {
              resolve();
          }).then(
              () => {
                  this.timecodeControlsProvider.initTimecodeEvents();
                  this.timeCodeEventInited = true;
              },
              (err) => {
                  console.log(err);
              }
          );
      }
  }

  private setPlayerConstants() {
    this.componentRef.som = this.componentRef.ignoreSom
                              ? 0
                              : this.componentRef.videoDetails.FileSomFrames
                                  ? this.componentRef.videoDetails.FileSomFrames
                                  : 0;
    this.componentRef.eom = this.componentRef.videoDetails.EomFrames
        ? this.componentRef.videoDetails.EomFrames
        : 0;

    this.componentRef.frameRate = this.componentRef.videoDetails.frameRate = TMDTimecode.getFrameRate(TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat]).frameRate;
  }

  private setPlayerSomAfterLoadSimpleMode() {
      let timecodeFormat = TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat];
      // do  SomFrames - FileSomFrames
      let time = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.videoDetails.SomFrames, timecodeFormat, this.componentRef.som) / 1000;
      let eom = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.eom, timecodeFormat, this.componentRef.som) / 1000;

      if (time > 0) {
          if (time <= this.componentRef.player.duration()) {
              this.componentRef.player.currentTime(time);
          } else {
              // this.componentRef.player.currentTime( Math.floor(this.componentRef.player.duration()) );
          }
      }

      if(this.componentRef.videoDetails.FirstTxPartSom && this.componentRef.videoDetails.FirstTxPartSomFrames > 0) {
          const time2 = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.videoDetails.FirstTxPartSomFrames, timecodeFormat, this.componentRef.som) / 1000;
          setTimeout(()=>{
              this.componentRef.player.currentTime(time2);
          });
      }
      else if(this.componentRef.videoDetails.Som && this.componentRef.videoDetails.SomFrames > 0) {
          const time2 = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.videoDetails.SomFrames, timecodeFormat, this.componentRef.som) / 1000;
          setTimeout(()=>{
              this.componentRef.player.currentTime(time2);
          });
      }
  }
  private setPlayerSomAfterLoad() {
      let timecodeFormat = TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat];
      // do  SomFrames - FileSomFrames
      let time = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.videoDetails.SomFrames, timecodeFormat, this.componentRef.som) / 1000;
      let eom = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.eom, timecodeFormat, this.componentRef.som) / 1000;

      // playerTime -> frame

      // const playerTimeSOM =  this.timecodeProvider.getFramesFromTimecode(time, TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);


      if (time > 0) {
          if (time <= this.componentRef.player.duration()) {
              this.componentRef.player.currentTime(time);
          } else {
              // this.componentRef.player.currentTime( Math.floor(this.componentRef.player.duration()) );
          }
      }

      if(this.componentRef.videoDetails.FirstTxPartSom && this.componentRef.videoDetails.FirstTxPartSomFrames > 0) {
          const time2 = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.videoDetails.FirstTxPartSomFrames, timecodeFormat, this.componentRef.som) / 1000;
          setTimeout(()=>{
              this.componentRef.player.currentTime(time2);
          }, 100);
      }
      else if(this.componentRef.videoDetails.Som && this.componentRef.videoDetails.SomFrames > 0) {
          const time2 = (<any>this.timecodeControlsProvider).timecodeProvider.getMillisecondsFromFrames(this.componentRef.videoDetails.SomFrames, timecodeFormat, this.componentRef.som) / 1000;
          setTimeout(()=>{
              this.componentRef.player.currentTime(time2);
          }, 100);
      }

      (<any>this.componentRef).markersProvider.setMediaSomEom(time,
          eom,
          this.componentRef.videoDetails.Som,
          this.componentRef.videoDetails.Eom,
          this.componentRef.videoDetails.SomFrames,
          this.componentRef.videoDetails.EomFrames);
  }

  private showPlayer() {
      $('.player-wrapper').css('opacity', '1');
      $(this.componentRef.playerOpeningElement.nativeElement).hide();
  }

  private preventVideoRightClick() {
      $('video').bind('contextmenu', function (e) {
          return false;
      });
  }

  private emitEvents() {
    if (this.componentRef.videoDetails) {
      let tcStr = this.timecodeProvider.getTimecodeString(this.componentRef.player.currentTime(), TimeCodeFormat[this.componentRef.videoDetails.TimecodeFormat], this.componentRef.som);
      this.componentRef.timecodeChange.emit(tcStr);
      this.componentRef.percentChange.emit(this.componentRef.player.currentTime() / this.componentRef.player.duration());
    }
  }


}
