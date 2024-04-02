import {AbstractPlayerProvider} from "./abstract.player.provider";
import {Injectable} from "@angular/core";
import {RCEArraySource} from "../../../../views/clip-editor/rce.component";
@Injectable()

export class SegmentsProvider extends AbstractPlayerProvider {

  constructor() {
    super();
  }

  isSegmented(): boolean {
    return this.componentRef.src instanceof Array;
  }

  getSegmentByRelativeTimeSeconds(sec: number) {
    if (this.isSegmented()) {
      let srcArr: RCEArraySource = <RCEArraySource>this.componentRef.src;
      let percent = (sec) / (this.componentRef.player.duration());
      for (let i = 0; i < srcArr.length; i++) {
        if (percent <= srcArr[i].percent) {
          return srcArr[i];
        }
      }
    }
  }

}
