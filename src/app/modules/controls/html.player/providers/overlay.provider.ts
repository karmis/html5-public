import {AbstractPlayerProvider} from "./abstract.player.provider";
import {HelperProvider} from "./helper.provider";
import {Injectable} from "@angular/core";

@Injectable()
export class OverlayProvider extends AbstractPlayerProvider {

  constructor(private helperProvider: HelperProvider) {
    super();
  }

  public getOverlayUrl() {

  }

}
