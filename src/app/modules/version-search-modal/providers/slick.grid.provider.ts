import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {VersionSearchModalSearchFormProvider} from './search.form.provider';

export class VersionSearchModalSlickGridProvider extends SlickGridProvider {
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public searchFormProvider?: VersionSearchModalSearchFormProvider;
    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.searchFormProvider = injector.get(VersionSearchModalSearchFormProvider);
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
