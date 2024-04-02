import {Injectable} from "@angular/core";
import {IMFXHtmlPlayerComponent} from "../imfx.html.player";
import {ResizeProvider} from "./resize.provider";
import {AbstractPlayerProvider} from "./abstract.player.provider";

@Injectable()
export class SubControlBarProvider extends AbstractPlayerProvider {


  constructor(private resizeProvider: ResizeProvider) {
    super();
  }

  initSubControlBar() {
      let cBar = this.componentRef.player.controlBar.addChild(
          'component', {
              text: '',
              id: 'sub_control_bar'
          })
      cBar.addClass('sub-control-bar');
      cBar.setAttribute('id', 'sub_control_bar');
      setTimeout(() => this.resizeProvider.onResize());
  }

}
