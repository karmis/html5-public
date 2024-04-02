import {IMFXHtmlPlayerComponent} from "../imfx.html.player";
import {ItemTypes} from "../item.types";
import {Injectable} from "@angular/core";
import {AbstractPlayerProvider} from "./abstract.player.provider";
@Injectable()
export class ThumbnailsProvider extends AbstractPlayerProvider {

  public addThumbnails(videoDetails) {
    let thumbnailsConfig = this.componentRef.type == ItemTypes.MEDIA
      ? videoDetails.Smudge : /*this.componentRef.type == ItemTypes.AUDIO
        ? videoDetails.AudioWaveform :*/ null;
    if (thumbnailsConfig) {
      thumbnailsConfig.EventData.FrameWidth *= 1.5;
      thumbnailsConfig.EventData.FrameHeight *= 1.5;
      this.componentRef.player.thumbnails(this.getThumbnails(thumbnailsConfig));
    } else {
    }
  }

  public clearThumbnails() {
    this.componentRef.player.thumbnails([{src: ""}]);
  }

  private getThumbnails(sm: any) {
    let t: any = {};
    if (!(<HTMLVideoElement>$("video")[0])) return t;
    let totalSeconds = (<HTMLVideoElement>$("video")[0]).duration;
    for (var currentFrameNumber = 0; currentFrameNumber < sm.EventData.TotalFrames; currentFrameNumber++) {
      let currentSecond = totalSeconds * currentFrameNumber / sm.EventData.TotalFrames;
      let j = currentFrameNumber;
      t[currentSecond] = {
        frame: currentFrameNumber,  // just for debug purposes
        j: j,                       // just for debug purposes
        style: {
          left: '-' + (sm.EventData.FrameWidth * (j + 0.5)) + 'px',
          clip: 'rect(0, ' + (sm.EventData.FrameWidth * (j + 1)) + 'px,' + sm.EventData.FrameHeight + 'px, ' + (sm.EventData.FrameWidth * (j)) + 'px)'
        }
      };
    }
    if (t[0]) {
      t[0].src = sm.Url;
      t[0].style.height = sm.EventData.FrameHeight + 'px';
      t[0].style.width = sm.EventData.TotalFrames * sm.EventData.FrameWidth + 'px';
    }
    return t;
  }


  private getCurrentSmudge(smudges, currentFrame) {
    let cursor = 0;
    for (let sm of smudges) {
      cursor += sm.EventData.TotalFrames;
      if (currentFrame <= cursor) {
        return {
          smudge: sm,
          offset: cursor - sm.EventData.TotalFrames
        }
      }
    }
  }

  public addSegmentedThumbnails(resp) {
    if (!resp.length) {
      return
    }
    let totalSeconds = this.componentRef.player.duration();
    let $vjscb = $(".vjs-control-bar");
    let $prthumbs = $vjscb.append("<div class='preloaded-thumbnails'></div>")
    let smudges = resp.map(el=>{
      el.EventData.FrameWidth *= 1.5;
      el.EventData.FrameHeight *= 1.5;
      // setTimeout(()=>{ // prevent sync load
      $prthumbs.append('<img src="' + el.Url + '" style="display: none"> ')
      // },50);
      return el;
    });
    if (smudges.length == 0) {
      return;
    }
    let totalFrames = smudges.map(el => el.EventData.TotalFrames).reduce((a, b) => a + b, 0);
    let t: any = {};
    for (let currentFrameNumber = 0; currentFrameNumber < totalFrames; currentFrameNumber++) {
      let currentSecond = totalSeconds * currentFrameNumber / totalFrames;
      let currentSmudgeData = this.getCurrentSmudge(smudges, currentFrameNumber);
      if (!currentSmudgeData || !currentSmudgeData.smudge) {
        continue;
      }
      let currentSmudge = currentSmudgeData.smudge;
      let framesOffest = currentSmudgeData.offset;
      let j = currentFrameNumber - framesOffest;
      if ((<Array<any>>this.componentRef.src).filter(el=>!el.src).map(el=>el.id).indexOf(currentSmudge.MediaId) + 1) { // filled from the services
        t[currentSecond] = {
          src: "./assets/img/dpsinvert.png",
          // src: "http://localhost:3000/assets/img/dpsinvert.png",
          style: {
            left: '-45px',
            clip: 'rect(0, ' + currentSmudge.EventData.FrameWidth + 'px,' + currentSmudge.EventData.FrameHeight + 'px, ' + 0 + 'px)',
            width: '90px'
          }
        };
      } else {
        t[currentSecond] = {
          src: currentSmudge.Url,
          frame: currentFrameNumber,  // just for debug purposes
          j: j,                       // just for debug purposes
          style: {
            left: '-' + (currentSmudge.EventData.FrameWidth * (j + 0.5)) + 'px',
            clip: 'rect(0, ' + (currentSmudge.EventData.FrameWidth * (j + 1)) + 'px,' + currentSmudge.EventData.FrameHeight + 'px, ' + (currentSmudge.EventData.FrameWidth * (j)) + 'px)',
            width: 'auto'
          }
        };
      }
    }
    if (t[0]) {
      t[0].style.height = smudges[0].EventData.FrameHeight + 'px';
      // t[0].style.width = totalFrames * smudges[0].EventData.FrameWidth + 'px';
    }
    this.componentRef.player.thumbnails(t);
    return t;
  }
}
