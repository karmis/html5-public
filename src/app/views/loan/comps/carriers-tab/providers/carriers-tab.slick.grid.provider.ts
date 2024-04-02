import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";

import { SlickGridProvider } from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridPagerProvider } from "../../../../../modules/search/slick-grid/comps/pager/providers/pager.slick.grid.provider";
import { LoanService } from "../../../../../services/loan/loan.service";
import * as $ from "jquery";

@Injectable()
export class CarriersTabSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public rowCountForValidation: number = 0;
    public validGrid: boolean = true;

    constructor(@Inject(Injector) public injector: Injector, private loanService: LoanService) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.PagerProvider = injector.get(SlickGridPagerProvider); //toDo for parent SlickGridProvider and provide client pager via slick.grid.dataview.js
    }

    remove(event) {
        this.loanService.deleteItems({
            type: 'carriers',
            items: this.getSelectedRows()
        })
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).parent().parent().parent().hasClass('selected') ||
            $(event.target).parent().parent().hasClass('selected');
    }

    isEditMode() {
        return this.loanService.isEditMode;
    }
}
