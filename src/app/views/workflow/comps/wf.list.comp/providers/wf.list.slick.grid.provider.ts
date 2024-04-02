/**
 * Created by Sergey Trizna on 13.01.2018.
 */
import { Inject, Injector } from "@angular/core";
import { WorkflowSlickGridProvider } from "../../../providers/workflow.slick.grid.provider";

// export type SlickExpandedRowsType = {id: string|number};

export class WorkflowListSlickGridProvider extends WorkflowSlickGridProvider  {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    refreshGrid(withOverlays: boolean = false) {
        (this.componentContext as any).loadData();
    }

    deleteMulti() {
        super.deleteMulti()
    }
}
