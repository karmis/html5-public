import {EventEmitter, Injectable} from "@angular/core";
@Injectable()
export class RouteReuseProvider {
  public clearRouteRequest: EventEmitter<string> = new EventEmitter<string>();
}
