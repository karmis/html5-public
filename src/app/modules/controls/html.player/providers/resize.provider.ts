import { AbstractPlayerProvider } from "./abstract.player.provider";
import { Injectable } from "@angular/core";
import {ItemTypes} from "../item.types";

@Injectable()
export class ResizeProvider extends AbstractPlayerProvider {
    constructor() {
        super();
    }
public eventSet = false;
  setResizeEvent() {
  }

  public onResize() {
      let _player = $($('[data-imfx-id=' + 'imfx-video-' + this.componentRef.internalId + ']')[0]);
      let controlBarHeight = _player.find('#sub_control_bar').height();
      if (controlBarHeight > 35) {
          _player.find('#center_control_bar').css('order', 1);
      }
      else {
          _player.find('#center_control_bar').css('order', 0);
      }
      const videoWrapperHeight = Math.trunc(_player.height());
      controlBarHeight = _player.find('.vjs-control-bar').height();
      _player.find('.vjs-control-bar .vjs-progress-control').css('borderBottomWidth', (this.componentRef.simpleMode ? 0 : controlBarHeight) + 'px');
      // _player.find('video.vjs-tech').height(videoWrapperHeight - controlBarHeight - 9);
      this.calcVideoHeightWidth(videoWrapperHeight, controlBarHeight);
      _player.find('.imfx-big-play-btn').height(videoWrapperHeight - controlBarHeight - 9);
      _player.find('.vjs-loading-spinner-wrapper').height(videoWrapperHeight - controlBarHeight - 9);

      _player.find('.vjs-text-track-display').height(_player.find('video.vjs-tech').height());
      _player.find('.vjs-text-track-display').width(_player.find('video.vjs-tech').width());
      _player.find('.vjs-text-track-display').css('top', _player.find('video.vjs-tech').css('top'));
      _player.find('.vjs-text-track-display').css('left', _player.find('video.vjs-tech').css('left'));

      let font = videoWrapperHeight * 3 / 100; // timed text size
      _player.find('.vjs-text-track-display').css('font-size', (font < 13 ? 13 : font) + 'px');

      if (this.componentRef.type == ItemTypes.AUDIO && _player.find('.imfx-audio-wave')[0]) {
          _player.find('.imfx-audio-wave').height(videoWrapperHeight - controlBarHeight - 9);
      }
      if (this.componentRef.type == ItemTypes.MEDIA || this.componentRef.type == ItemTypes.AUDIO) {
          $('.player-wrapper .png-overlay').height(videoWrapperHeight - controlBarHeight - 9);
          $('.player-wrapper #settings-modal-wrapper').height(videoWrapperHeight - controlBarHeight - 9);
      }
      if(this.componentRef.type == ItemTypes.AUDIO) {
          _player.find('.imfx-audio-icon').height(videoWrapperHeight - controlBarHeight - 9);
      }
  };
  resizePlayerChildByClass(_class) {
      let _player = $($('[data-imfx-id=' + 'imfx-video-' + this.componentRef.internalId + ']')[0]);
      let controlBarHeight = _player.find('#sub_control_bar').height();
      const videoWrapperHeight = Math.trunc(_player.height());
      controlBarHeight = _player.find('.vjs-control-bar').height();
      _player.find('.' + _class).height(videoWrapperHeight - controlBarHeight - 9);
  }
  private calcVideoHeightWidth(videoWrapperHeight, controlBarHeight) {
      const indent = 9;
      let _player = $($('[data-imfx-id=' + 'imfx-video-' + this.componentRef.internalId + ']')[0]);
      if (this.componentRef.player.customAspect) {
          let height = videoWrapperHeight - controlBarHeight - indent;
          let width = (height / this.componentRef.player.customAspect.h) * this.componentRef.player.customAspect.w;
          let top = 0;
          let left = (_player.width() - width) / 2;
          if (_player.width() <= width) {
              width = _player.width();
              height = (width * this.componentRef.player.customAspect.h) / this.componentRef.player.customAspect.w;
              top = (videoWrapperHeight - controlBarHeight - indent - height) / 2;
              left = 0;
          }
          _player.find('video.vjs-tech').height(height);
          _player.find('video.vjs-tech').width(width);
          _player.find('video.vjs-tech').addClass('stretch-video');
          _player.find('video.vjs-tech').css('top', top);
          _player.find('video.vjs-tech').css('left', left);
      } else {
          if(this.componentRef.simpleMode) {
              _player.find('video.vjs-tech').height(videoWrapperHeight - controlBarHeight);
          } else {
              _player.find('video.vjs-tech').height(videoWrapperHeight - controlBarHeight - indent);
          }
          _player.find('video.vjs-tech').width('');
          _player.find('video.vjs-tech').css('top', 0);
          _player.find('video.vjs-tech').css('left', 0);
      }
  };
}
