import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { SlickGridProvider } from '../../../search/slick-grid/providers/slick.grid.provider';
import { copyText } from "../../../../utils/imfx.guid";

export class TaskHistorySlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }
    /**
     * On double click by row
     * @param data
     */
    onRowDoubleClicked() {
        return;
    }

    copy(collName) {
        copyText(this.getSelectedRow()[collName]);
    }
}
