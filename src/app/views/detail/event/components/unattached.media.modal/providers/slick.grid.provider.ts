import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {UnattachedMediaSearchModalSearchFormProvider} from './search.form.provider';

export class UnattachedMediaSearchModalSlickGridProvider extends SlickGridProvider {
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public searchFormProvider?: UnattachedMediaSearchModalSearchFormProvider;
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.searchFormProvider = injector.get(UnattachedMediaSearchModalSearchFormProvider);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }
    /**
     * On double click by row
     * @param $event
     */
    onRowDoubleClicked(data) {
        // (<any>this).componentContext.ok();
        (<any>this).componentContext.onRowDbClick(data.row);
    }
}
