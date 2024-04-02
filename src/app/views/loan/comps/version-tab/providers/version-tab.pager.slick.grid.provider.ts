import { Inject, Injectable, Injector } from "@angular/core";

import { SlickGridPagerProvider } from "../../../../../modules/search/slick-grid/comps/pager/providers/pager.slick.grid.provider";

@Injectable()
export class VersionTabPagerSlickGridProvider extends SlickGridPagerProvider {
    constructor(@Inject(Injector) public injector: Injector) {
        super();
    }

    isDisabledNextBtn = false;
    isDisabledPrevBtn = true;

    nextPage() {
        const {currentPage, countPage} = this.provider.config.componentContext;
        this.isDisabledPrevBtn = false;

        if (currentPage === countPage - 2) {
            this.isDisabledNextBtn = true;
        }
        this.provider.config.componentContext.nextPage();
    }

    prevPage() {
        const {currentPage} = this.provider.config.componentContext;
        this.isDisabledNextBtn = false;

        if (currentPage <= 1) {
            this.isDisabledPrevBtn = true;
        }
        this.provider.config.componentContext.prevPage();
    }

    public isLastPage(): boolean {
        return this.isDisabledNextBtn;
    }

    public isFirstPage(): boolean {
        return this.isDisabledPrevBtn;
    }
}

