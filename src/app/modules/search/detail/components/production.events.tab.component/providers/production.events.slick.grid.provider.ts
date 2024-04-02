import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from "@angular/core";
import { SlickGridProvider } from "../../../../slick-grid/providers/slick.grid.provider";
import { Router } from "@angular/router";

@Injectable()
export class ProductionEventsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public rowCountForValidation: number = 0;
    public validGrid: boolean = true;


    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }


    clickOnIcon(event): boolean {
        return false
    }

    onRowDoubleClicked() {
        return
    }

}
