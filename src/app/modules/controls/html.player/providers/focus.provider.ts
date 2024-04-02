import {Injectable} from "@angular/core";
import {AbstractPlayerProvider} from "./abstract.player.provider";

@Injectable()
export class FocusProvider extends AbstractPlayerProvider {

  public isFocused: boolean = false;

  constructor() {
    super();
  }

  public onClick(event: MouseEvent): void {
      if (this.componentRef /*&& this.componentRef.clipBtns*/) {
          this.isFocused = this.componentRef.playerElement.nativeElement.contains(event.target);
      }
  }

}
