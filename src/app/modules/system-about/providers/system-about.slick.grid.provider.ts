import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { SlickGridProvider } from "../../search/slick-grid/providers/slick.grid.provider";
import { SlickGridPagerProvider } from "../../search/slick-grid/comps/pager/providers/pager.slick.grid.provider";

@Injectable()
export class SystemAboutSlickGridProvider extends SlickGridProvider {
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
        this.PagerProvider = injector.get(SlickGridPagerProvider); //toDo for parent SlickGridProvider and provide client pager via slick.grid.dataview.js
    }
}
