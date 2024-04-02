import { Inject, Injector, Injectable } from '@angular/core';
import {TasksSlickGridProvider} from "../../../../../../views/tasks/providers/tasks.slick.grid.provider";

@Injectable()
export class DetailTasksSlickGridProvider extends TasksSlickGridProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
    }
    refreshGrid() {
        (<any>this.componentContext).loadTasks();
    }
}
