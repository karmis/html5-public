import {AbstractPlayerProvider} from "./abstract.player.provider";
import {HelperProvider} from "./helper.provider";
import {ConfigService} from "../../../../services/config/config.service";
import {ItemTypes} from "../item.types";
import {Injectable} from "@angular/core";

@Injectable()
export class PosterProvider extends AbstractPlayerProvider {

  constructor(private helperProvider: HelperProvider) {
    super();
  }

  public getPosterUrl() {
    if (this.componentRef.file.ThumbUrl) {
      let id = this.helperProvider.getParameterByName('id', this.componentRef.file.ThumbUrl);
      if (id !== '-1')
        return this.componentRef.file.ThumbUrl;
      else {
        return this.getDefaultPosterUrl();
      }
    }
    if (this.componentRef.file.THUMBID == -1 || !this.componentRef.file.THUMBID) {
      return this.getDefaultPosterUrl();
    } else {
      return ConfigService.getAppApiUrl() + "/getfile.aspx?id=" + this.componentRef.file.THUMBID;
    }
  }

  public getDefaultPosterUrl() {
    // if (this.componentRef.type == ItemTypes.AUDIO) {   // extra request 'host/audio'
    //   return 'audio';
    // }
    return './assets/img/default-thumb.png';
  }

  public setPoster() {
    this.componentRef.player.poster(this.getPosterUrl());
  }

}
