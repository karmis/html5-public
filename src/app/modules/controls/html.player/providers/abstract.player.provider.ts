import {IMFXHtmlPlayerComponent} from "../imfx.html.player";
export abstract class AbstractPlayerProvider {

  protected componentRef: IMFXHtmlPlayerComponent;

  public setComponentRef(ref: IMFXHtmlPlayerComponent) {
    this.componentRef = ref;
  }

}
