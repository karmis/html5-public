import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import { ProductionConfigTabGridComponent } from '../production.config.tab.grid.component';
import {Observable} from "rxjs";

export class ProductionConfigTabSlickGridProvider extends SlickGridProvider {
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
        const comp = (this.componentContext as ProductionConfigTabGridComponent);
        comp.updateGridRows.emit({
            value: this.deleteUnnecessaryDataBeforeSaving($.extend(true, [], this.getData())),
            field: comp.field
        });
    }
}
