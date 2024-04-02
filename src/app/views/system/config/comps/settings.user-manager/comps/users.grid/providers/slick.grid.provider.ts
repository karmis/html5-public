import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { Subscription ,  Observable } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { UserManagerService } from '../../../services/settings.user-manager.service';

export class UserManagerUsersSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public userManagerService: UserManagerService

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.userManagerService = injector.get(UserManagerService);
    }


    deleteFromServer(data) : Observable<Subscription>{
        var dataTable = data.columnDef.__deps.data.rows;
        var itemToDelete = {};
        for (var i = dataTable.length - 1; i >= 0; --i) {
            if (dataTable[i].ID == data.data.ID) {
                delete dataTable[i].__contexts
                delete dataTable[i].id;
                delete dataTable[i].$id;
                delete dataTable[i].EntityKey;
                dataTable[i].ID = -dataTable[i].ID;
                itemToDelete = dataTable[i];
                break;
            }
        }
        return this.userManagerService.changeUserItem(data.columnDef.__deps.data.tableId, itemToDelete);
    }
}
