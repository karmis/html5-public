import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import { Observable } from 'rxjs';
import { SlickGridRowData } from 'app/modules/search/slick-grid/types';

export class ProductionMakeActionsTabEditModalSlickGridProvider extends SlickGridProvider {
    router: Router;
    compFactoryResolver?: ComponentFactoryResolver;
    appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }

    deleteFromServer(data): Observable<any> {
        return new Observable((observer) => {
            observer.next();
            observer.complete();
        });
    }
}
