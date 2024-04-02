import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import { Observable } from 'rxjs';
import { SlickGridRowData } from 'app/modules/search/slick-grid/types';

export class ProductionMakeActionsTabSlickGridProvider extends SlickGridProvider {
    router: Router;
    compFactoryResolver?: ComponentFactoryResolver;
    appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    deleteRow(data, _id: number = null) {
        super.deleteRow(data, _id);
        this.updateGridRows();
    }

    deleteFromServer(data): Observable<any> {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
        });
    }

    updateGridRows() {
        // @ts-ignore
        const comp = (this.componentContext as ProductionMakeActionsTabComponent);
        const obj = $.extend(true, {}, comp.data['MadeWorkflowTiers']);
        obj[comp.activeGridType] = this.deleteUnnecessaryDataBeforeSaving($.extend(true, [], this.getData()));
        comp.updateData.emit({
            value: obj,
            field: 'MadeWorkflowTiers'
        });
    }

    onChangedRowOrder(newDataOrdering: SlickGridRowData) {
        this.updateGridRows();
    }
}
