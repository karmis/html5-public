/**
 * Created by Sergey Trizna on 13.01.2018.
 */
import { ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { BasketService } from "../../../services/basket/basket.service";
import { Router } from "@angular/router";
import { TasksMyComponent } from "../tasks.my.component";
import { WorkflowSlickGridProvider } from '../../workflow/providers/workflow.slick.grid.provider';
import { SlickGridEventData } from '../../../modules/search/slick-grid/types';
import {TasksSlickGridProvider} from "../../tasks/providers/tasks.slick.grid.provider";


export class TasksMySlickGridProvider extends TasksSlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }

    afterRequestData(resp, searchModel) {
        super.afterRequestData(resp, searchModel);
        if ((<TasksMyComponent>this.componentContext).refreshStarted) {
            this.getSlick().setSelectedRows(this.selectedRows);
        }
        (<TasksMyComponent>this.componentContext).refreshStarted = false;
    }
}
