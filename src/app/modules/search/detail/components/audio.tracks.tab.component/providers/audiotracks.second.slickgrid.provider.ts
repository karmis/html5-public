/**
 * Created by Sergey Trizna on 15.03.2018.
 */
import {SlickGridProvider} from "../../../../slick-grid/providers/slick.grid.provider";
import {Injectable, Injector} from "@angular/core";
import {SlickGridEventData} from "../../../../slick-grid/types";

@Injectable()
export class ATSecondSlickGridProvider extends SlickGridProvider {
    constructor(public injector: Injector) {
        super(injector);
    }
    onRowDoubleClicked(data: SlickGridEventData) {
        return
    }
}
