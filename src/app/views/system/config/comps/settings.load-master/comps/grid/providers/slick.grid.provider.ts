import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { Subscription ,  Observable } from 'rxjs';
import { SlickGridProvider } from '../../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {LoadMasterService} from "../../../services/settings.load-master.service";

export class LoadMasterSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public configService: LoadMasterService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.configService = injector.get(LoadMasterService);
    }


    deleteFromServer(data) : Observable<Subscription>{
        var dataTable = data.columnDef.__deps.data.rows;
        var itemToDelete = {};
        for (var i = dataTable.length - 1; i >= 0; --i) {
            if (dataTable[i].Id == data.data.Id) {
                delete dataTable[i].__contexts;
                delete dataTable[i].id;
                delete dataTable[i].$id;
                delete dataTable[i].EntityKey;
                dataTable[i].Id = -dataTable[i].Id;
                itemToDelete = dataTable[i];
                break;
            }
        }
        if($.isEmptyObject(itemToDelete)) {
            delete data.data.__contexts;
            delete data.data.id;
            delete data.data.$id;
            delete data.data.EntityKey;
            data.data.Id = -data.data.Id;
            itemToDelete = data.data;
        }

        return new Observable((observer: any) => {
            this.configService.deleteTask(itemToDelete).subscribe((res: any) => {
                observer.next(res);
                data.columnDef.__deps.data.component.getLoadMasterTable(false);
            }, (err) => {
                observer.error(err);
            }, () => {
                observer.complete();
            });
        });
    }
}
