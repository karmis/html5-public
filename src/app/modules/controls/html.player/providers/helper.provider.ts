import {AbstractPlayerProvider} from "./abstract.player.provider";
import {Injectable} from "@angular/core";

@Injectable()
export class HelperProvider extends AbstractPlayerProvider {

  public checkFileType(type, url) {
    let reg = new RegExp("^.*\.(" + type + ").*$", "i");
    return url && reg.test(url.toString())
  }

  public isSmoothStreaming(url) {
    return this.checkFileType("ism", url) || this.checkFileType("mxf", url) || this.checkFileType("isx", url) //|| this.checkFileType("smil", url)
  }

  public showPlayerError(type, msg) {
    this.componentRef.player.error({
      code: type, // custom code, does not affect to anything
      message: msg
    })
    this.componentRef.player.errorDisplay.fill();
  }

  public getParameterByName(name, url) {
    if (!url) return -1;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  public doesBrowserSupportMediaSource() {
    // return false;
    return !!(window["MediaSource"] || window["WebKitMediaSource"]);
  }

  public doesBrowserSupportWebAudioAPI() {
    // return false;
    return !!(window["AudioContext"] || window["webkitAudioContext"] || window["WebkitAudioContext"]); // not sure in lowercase 'webkit', check later
  }

}
