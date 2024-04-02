import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {Injectable, Injector} from "@angular/core";
@Injectable()
export class WorkflowSubtitleSlickGridProvider extends SlickGridProvider {
    constructor(public injector: Injector) {
        super(injector);
    }
}
