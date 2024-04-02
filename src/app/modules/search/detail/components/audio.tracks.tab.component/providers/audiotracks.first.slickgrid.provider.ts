/**
 * Created by Sergey Trizna on 15.03.2018.
 */
import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Injectable, Injector} from "@angular/core";


@Injectable()
export class ATFirstSlickGridProvider extends SlickGridProvider {
    constructor(public injector: Injector) {
        super(injector);
    }

    onRowMousedown(data) {
        (<any>this.componentContext).setAudioTrackByIndex.emit(data.row.id);
    }

    onRowDoubleClicked() {
        return;
    }
}
