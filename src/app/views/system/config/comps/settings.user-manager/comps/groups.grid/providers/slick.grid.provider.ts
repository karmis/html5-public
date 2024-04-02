import { Router } from "@angular/router";
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { Observable } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { UserManagerService } from '../../../services/settings.user-manager.service';
import {
    SlickGridEventData,
    SlickGridRowData
} from "../../../../../../../../modules/search/slick-grid/types";
import { UserManagerGroupsGridComponent } from "../groups.grid.component";

export class UserManagerGroupsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public userManagerService: UserManagerService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.userManagerService = injector.get(UserManagerService);
    }


    deleteFromServer(data): Observable<any> {
        let row: SlickGridRowData = this.getSelectedRow();
        return this.userManagerService.deleteGroup(row.ID);

    }

    deleteRow(){
        (<any>this.componentContext).getGroupsTable();
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        (<UserManagerGroupsGridComponent>this.config.componentContext).showModal(data.row.ID);
    }
}
