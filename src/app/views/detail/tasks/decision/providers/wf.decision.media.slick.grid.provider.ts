import {ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector} from "@angular/core";
import {Router} from "@angular/router";
import {BasketService} from "../../../../../services/basket/basket.service";
import {SlickGridEventData} from "../../../../../modules/search/slick-grid/types";
import {appRouter} from "../../../../../constants/appRouter";
import {IMFXModalComponent} from "../../../../../modules/imfx-modal/imfx-modal";
import {WorkflowProvider} from "../../../../../providers/workflow/workflow.provider";
import {SlickGridProvider} from "../../../../../modules/search/slick-grid/providers/slick.grid.provider";

@Injectable()
export class WorkflowDecisionMediaSlickGridProvider extends SlickGridProvider {
    private wfProvider: WorkflowProvider;
    private modalRef: IMFXModalComponent;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        // this.basketService = injector.get(BasketService);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.wfProvider = injector.get(WorkflowProvider);
    }

    setModalRef(ref: IMFXModalComponent) {
        this.modalRef = ref;
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type && data && (data.row as any)) {
            const destination = this.config.options.type.replace('inside-', '').toLowerCase();
            this.modalRef.hide()
            this.wfProvider.decisionIsOpen = false;
            this.router.navigate([
                appRouter[destination].detail.substr(0, appRouter[destination].detail.lastIndexOf('/')),
                (data.row as any).ID
            ]);
        }
    }

    // onRowDoubleClicked() {
    //     return false;
    // }
}
