import { AbstractPlayerProvider } from './abstract.player.provider';
import { Injectable } from '@angular/core';
import { IMFXHtmlPlayerComponent } from '../imfx.html.player';
@Injectable()
export class AudioSynchProvider extends AbstractPlayerProvider {

  public comp: IMFXHtmlPlayerComponent;
  constructor() {
    super();
  }

  public updateAudioSrc(src: string) {
    this.comp.updateAudioSrc(src);
  }
  public getErrorMessage(code: number) {
      let defaultMessages = {
          1: 'You aborted the media playback',
          2: 'A network error caused the media download to fail part-way.',
          3: 'The media playback was aborted due to a corruption problem or because the media used features your browser did not support.',
          4: 'The media could not be loaded, either because the server or network failed or because the format is not supported.',
          5: 'The media is encrypted and we do not have the keys to decrypt it.'
      };
      return defaultMessages[code];
  }
}
