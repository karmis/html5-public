import { SlickGridProvider } from '../../../../slick-grid/providers/slick.grid.provider';
import { Router } from '@angular/router';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector, Injectable } from '@angular/core';
import {SlickGridEventData} from "../../../../slick-grid/types";

@Injectable()
export class ClipCommentSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }
    onRowMouseclick(data: SlickGridEventData) {
        (this.componentContext as any).commentRowSelected.emit(data.row.id);
    }
}
