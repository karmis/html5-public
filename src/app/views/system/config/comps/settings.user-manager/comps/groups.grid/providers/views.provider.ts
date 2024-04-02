import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import {ViewsProvider} from '../../../../../../../../modules/search/views/providers/views.provider';

export class UserManagerGroupsViewsProvider extends ViewsProvider {
    // config: ViewsConfig;

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

        columns.push({
            id: 1,
            name: 'Name',
            field: 'NAME',
            width: 200,
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        columns.push({
            id: 2,
            name: 'Description',
            field: 'DESCRIPTION',
            resizable: true,
            sortable: true,
            multiColumnSort: false,
        });

        return columns;
    }


}
