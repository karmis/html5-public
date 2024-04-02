import {AbstractPlayerProvider} from "./abstract.player.provider";
import {HelperProvider} from "./helper.provider";
import { TranslateService } from '@ngx-translate/core';
import {SmoothStreamingProvider} from "./smooth.streaming.provider";
import {Injectable} from "@angular/core";
@Injectable()

export class ErrorProvider extends AbstractPlayerProvider {

  constructor(private helperProvider: HelperProvider,
              private translate: TranslateService,
              private smoothStreamingProvider: SmoothStreamingProvider) {
    super();
  }

  handleEmptySrc() {
      let originalCallback = this.componentRef.player.error;
      let isSmoothStreaming = (<any>this.componentRef).helperProvider.isSmoothStreaming(this.componentRef.src)
      this.componentRef.player.error = (err) => {
          if (!!err) {
              this.componentRef.playerError.emit(err.message);
          } else {
              this.componentRef.playerError.emit(null);
          }

          if (err && err.code == 4 && isSmoothStreaming) { // MEDIA_ELEMENT_ERROR: Empty src attribute
              console.log(err);
              return;
          }

          originalCallback.call(this.componentRef.player, err);

          if (!!err) {
              let _player = $($('[data-imfx-id=' + 'imfx-video-' + this.componentRef.internalId + ']')[0]);
              let urlRegex = /\?tkn(.*?)(\s|$)/; // regex for cutting token from url
              _player.find('.vjs-error-display .vjs-control-text').text(this.componentRef.player.error_.message.replace(urlRegex, ' '));
          }
      };
  }

}
