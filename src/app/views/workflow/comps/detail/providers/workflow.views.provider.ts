import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from "@angular/core";
import { ViewsConfig } from "../../../../../modules/search/views/views.config";
import { ViewsProvider } from "../../../../../modules/search/views/providers/views.provider";
import { SettingsFormatter } from "../../../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import { DoActionFormatterComp } from "../../../../../modules/search/slick-grid/formatters/doaction/doaction.formatter";


export class WorkflowViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    /**versiove
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        console.log('columns');

        let columns = [];

        // // settings
        columns.unshift({
            isFrozen: true,
            id: -6,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: DoActionFormatterComp,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'settings',
            __deps: {
                injector: this.injector
            }
        });

        return columns;
    }

}
