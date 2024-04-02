import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import {ViewsProvider} from "../../../../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../../../../modules/search/views/views.config";

export class SettingsXSLTViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector,
                @Inject(TranslateService) public translate: TranslateService) {
        super(compFactoryResolver, appRef, injector);
    }

    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        let columns = [];
        return columns;
    }


}
