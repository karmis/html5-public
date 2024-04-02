import {AbstractPlayerProvider} from "./abstract.player.provider";
import {Injectable} from "@angular/core";
import {ItemTypes} from "../item.types";
import {HelperProvider} from "./helper.provider";

@Injectable()
export class WaveformProvider extends AbstractPlayerProvider {

  constructor(private helperProvider: HelperProvider) {
    super();
  }

  disconnect() {
    if (this.componentRef.player.waveform) {
      this.componentRef.player.waveform.surfer.destroy();
      if (this.componentRef.player.waveform && this.componentRef.type == ItemTypes.AUDIO && this.helperProvider.doesBrowserSupportWebAudioAPI()) {
        this.componentRef.player.waveform.setupUI();
        this.componentRef.player.waveform.show();
      } else {
        this.componentRef.player.waveform.hide();
      }
    }
  }

  destroy() {
    if (this.componentRef.player.waveform) {
      this.componentRef.player.waveform.hide();
      this.componentRef.player.waveform.surfer.destroy();
    }
  }

  tryLoad(src) {
    if (this.componentRef.player.waveform && this.componentRef.type == ItemTypes.AUDIO && this.helperProvider.doesBrowserSupportWebAudioAPI()) {
      this.componentRef.player.waveform.load(src);
      this.componentRef.player.waveform.surfer.backend.setVolume(0);
    }
  }

  resetPlaybackRate() {
    if (this.componentRef.player.waveform && this.componentRef.player.waveform.surfer && this.componentRef.player.waveform.surfer.backend) {
      this.componentRef.player.waveform.surfer.backend.playbackRate = 1;
    }
  }

}


