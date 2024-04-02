import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { Subscription, Observable, Subscriber } from 'rxjs';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';

export class CommonTablesSlickGridProvider extends SlickGridProvider {
    router: Router;
    compFactoryResolver?: ComponentFactoryResolver;
    appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }


    deleteFromServer(data) : Observable<Subscription>|null{
        const dataTable = data.columnDef.__deps.data.rows;
        let itemToDelete = {};
        for (let i = dataTable.length - 1; i >= 0; --i) {
            if (dataTable[i].ID == data.data.ID) {
                delete dataTable[i].__contexts;
                delete dataTable[i].id;
                delete dataTable[i].$id;
                delete dataTable[i].EntityKey;
                dataTable[i].ID = -dataTable[i].ID;
                itemToDelete = dataTable[i];
                break;
            }
        }
        if($.isEmptyObject(itemToDelete)) {
            delete data.data.__contexts;
            delete data.data.id;
            delete data.data.$id;
            delete data.data.EntityKey;
            data.data.ID = -data.data.ID;
            itemToDelete = data.data;
        }

        return new Observable((observer: Subscriber<any>) => {
            (this.componentContext as any).deleteItem(itemToDelete, observer);
        });
    }
}
