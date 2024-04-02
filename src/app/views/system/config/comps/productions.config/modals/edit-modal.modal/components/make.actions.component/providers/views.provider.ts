import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ViewsConfig } from 'app/modules/search/views/views.config';
import { ViewsProvider } from 'app/modules/search/views/providers/views.provider';
import {IconsFormatter} from "../../../../../../../../../../modules/search/slick-grid/formatters/icons/icons.formatter";
import {ThumbnailFormatter} from "../../../../../../../../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import {LookupFormatter} from "../../../../../../../../../../modules/search/slick-grid/formatters/lookup/lookup.formatter";

export class ProductionMakeActionsTabViewsProvider extends ViewsProvider {
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
        const columns = [];

        return columns;
    }

}
