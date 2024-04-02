import { Inject, Injectable } from '@angular/core';
import { ModalPreviewPlayerComponent } from '../modal.preview.player';
import { MediaClip, RCEArraySource } from '../../../views/clip-editor/rce.component';
import {TimeCodeFormat, TMDTimecode} from "../../../utils/tmd.timecode";

@Injectable()
export class ModalPreviewPlayerProvider {
  // ref to module
  public moduleContext: ModalPreviewPlayerComponent;
  public previewModal: any;
  public modallIsOpen: boolean = false;
  public subscribersReady: boolean = false;

  private workflowParams: {
    file: any,
    clips: Array<MediaClip>,
    src: RCEArraySource
  };
  /**
   * On open modal
   */
  public open(o: {
    file: any,
    clips: Array<MediaClip>,
    src: RCEArraySource
  }) {
      let providerRef = this;

      this.modallIsOpen = true;
      let modalComponent: ModalPreviewPlayerComponent = this.previewModal.getContent();
      let p = modalComponent.playerWrapper;
      p.srcs = [];
      if(o.clips.length > 0) {
          o.clips.map(el => {
              var start = TMDTimecode.fromString(
                  el.start,
                  TimeCodeFormat[o.file.TimecodeFormat]
              ).toSeconds() - TMDTimecode.fromString(
                  o.file.SOM_text,
                  TimeCodeFormat[o.file.TimecodeFormat]
              ).toSeconds();
              var end = TMDTimecode.fromString(
                  el.end,
                  TimeCodeFormat[o.file.TimecodeFormat]
              ).toSeconds() - TMDTimecode.fromString(
                  o.file.SOM_text,
                  TimeCodeFormat[o.file.TimecodeFormat]
              ).toSeconds();
             var src = o.src.filter(el2=>el2.id == el.mediaId)[0].src;

              p.srcs.push(
                  {"s": src,
                      "d":[start, end]}
              )
          });
      }
      else {
          o.src.map(el => {
              p.srcs.push(
                  {"s": el.src,
                      "d":[0, el.seconds]}
              )
          });
      }

      p.updatePlayer();
    this.workflowParams = {
      file: o.file,
      clips: o.clips,
      src: o.src
    };
    if (!this.subscribersReady) {
      this.subscribersReady = true;
      this.previewModal.onShown.subscribe(() => {
        modalComponent.onShow.emit(providerRef.workflowParams);
      });
    }
    this.previewModal.show();
  }
}
