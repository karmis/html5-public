import {Injectable} from "@angular/core";
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";
import {MediaClip, RCEArraySource, RCEComponent} from "../rce.component";
@Injectable()
export class SegmentetClipsProvider {

  public componentRef: RCEComponent

  constructor() {

  }

  private getMultiSourceOwnerIndexBySeconds(srcArr: RCEArraySource, sec) {
      if (!this.componentRef.totalDuration) {
          this.componentRef.totalDuration = 0;
          for (let i = 0; i < this.componentRef.src.length; i++) {
              this.componentRef.totalDuration += (<any>this.componentRef.src[i]).seconds;
          }
      }
      let percent = (sec - this.componentRef.som) / (this.componentRef.totalDuration - this.componentRef.som);
      if (percent == NaN) {
          //TODO dirty hack for incorrect backend duration data
          return 0;
      }
      else {
          for (let i = 0; i < srcArr.length; i++) {
              if (percent <= srcArr[i].percent) {
                  return i;
              }
          }
      }
  }

  public getClips(clips: Array<any>) {
    if (this.componentRef.src instanceof Array) {
        if(this.componentRef.clipEditorService.getClipEditorType() == "Media") {
            let clipsWithSeconds = clips.map((el) => {
                return {
                    in: TMDTimecode.fromString(el.in, TimeCodeFormat[this.componentRef.timecodeFormatString]).toSeconds(),
                    out: TMDTimecode.fromString(el.out, TimeCodeFormat[this.componentRef.timecodeFormatString]).toSeconds(),
                    file: el.file
                }
            });

            let exportClips = [];

            for (let clip of clipsWithSeconds) {
                let exportClip: MediaClip = {};

                // let totalDurationBeforeStartOwnerSec = this.componentRef.src.map(el => el.seconds).slice(0, startOwnerIdx).reduce((a, b) => a + b, 0);
                let startMs = (clip.in) * 1000;
                exportClip.start = TMDTimecode.fromMilliseconds(startMs, TimeCodeFormat[clip.file.TimecodeFormat]).toString();
                exportClip.mediaId = clip.file.ID;
                exportClip.file = clip.file;
                // let totalDurationBeforeEndOwnerSec = this.componentRef.src.map(el=>el.seconds).slice(0,endOwnerIdx).reduce((a,b)=>a+b,0);
                let endMs = (clip.out ) * 1000;
                exportClip.end = TMDTimecode.fromMilliseconds(endMs, TimeCodeFormat[clip.file.TimecodeFormat]).toString();
                exportClips.push(exportClip)

            }

            return exportClips;
        }
        else {
            let duration = this.componentRef.golden.playerComponents.compRef.instance.player.duration();
            let clipsWithSeconds = clips.map((el) => {
                return {
                    in: TMDTimecode.fromString(el.in, TimeCodeFormat[this.componentRef.timecodeFormatString]).toSeconds(),
                    out: TMDTimecode.fromString(el.out, TimeCodeFormat[this.componentRef.timecodeFormatString]).toSeconds()
                }
            });

            let exportClips = [];

            for (let clip of clipsWithSeconds) {
                let exportClip: MediaClip = {};
                let startOwnerIdx = null;
                let endOwnerIdx = null;

                startOwnerIdx = this.getMultiSourceOwnerIndexBySeconds(<RCEArraySource>this.componentRef.src, clip.in);
                endOwnerIdx = this.getMultiSourceOwnerIndexBySeconds(<RCEArraySource>this.componentRef.src, clip.out);

                // let totalDurationBeforeStartOwnerSec = this.componentRef.src.map(el => el.seconds).slice(0, startOwnerIdx).reduce((a, b) => a + b, 0);
                let startMs = (clip.in) * 1000;
                exportClip.start = TMDTimecode.fromMilliseconds(startMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();
                exportClip.mediaId = this.componentRef.src[startOwnerIdx].id;


                if (startOwnerIdx == endOwnerIdx) {
                    // let totalDurationBeforeEndOwnerSec = this.componentRef.src.map(el=>el.seconds).slice(0,endOwnerIdx).reduce((a,b)=>a+b,0);
                    let endMs = (clip.out ) * 1000;
                    exportClip.end = TMDTimecode.fromMilliseconds(endMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();
                    exportClips.push(exportClip)
                } else {
                    // close current
                    // let totalDurationForEndOwnerSec = this.componentRef.src.map(el => el.seconds).slice(0, startOwnerIdx + 1).reduce((a, b) => a + b, 0);
                    let totalDurationForEndOwnerSec = this.componentRef.src[startOwnerIdx].seconds;
                    let endMs = (totalDurationForEndOwnerSec + this.componentRef.src[startOwnerIdx].som) * 1000;
                    exportClip.end = TMDTimecode.fromMilliseconds(endMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();
                    // push to array
                    exportClips.push(exportClip)

                    //check next
                    let nextOwner = startOwnerIdx;
                    while (++nextOwner < endOwnerIdx) {
                        // create new clip
                        let internalExportClip: MediaClip = {};
                        // start = chunk start
                        // end = chunk end
                        let startMs = this.componentRef.src[nextOwner].som * 1000;
                        let endMs = (this.componentRef.src[nextOwner].seconds + this.componentRef.src[nextOwner].som) * 1000;
                        internalExportClip.start = TMDTimecode.fromMilliseconds(startMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();
                        internalExportClip.end = TMDTimecode.fromMilliseconds(endMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();
                        internalExportClip.mediaId = this.componentRef.src[nextOwner].id;
                        // push
                        exportClips.push(internalExportClip);
                    }

                    let lastExportClip: MediaClip = {};
                    let startMs = this.componentRef.src[endOwnerIdx].som * 1000;
                    lastExportClip.start = TMDTimecode.fromMilliseconds(startMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();

                    lastExportClip.mediaId = this.componentRef.src[endOwnerIdx].id;
                    // let totalDurationBeforeEndOwnerSec = this.componentRef.src.map(el=>el.seconds).slice(0,endOwnerIdx).reduce((a,b)=>a+b,0);
                    let lastEndMs = (clip.out) * 1000;
                    lastExportClip.end = TMDTimecode.fromMilliseconds(lastEndMs, TimeCodeFormat[this.componentRef.timecodeFormatString]).toString();
                    exportClips.push(lastExportClip);
                }
            }

            exportClips = exportClips.filter(el => {
                // exclude restricted
                let originalMedia = (<RCEArraySource>this.componentRef.src).filter(srcEl => srcEl.id == el.mediaId)[0];
                return originalMedia && originalMedia.src;
            });
            console.log(exportClips);
            return exportClips;
        }
    } else {
      return clips;
    }

  }

}
