import {ViewsProvider} from "../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../modules/search/views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {SettingsFormatter} from "../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import {BasketFormatter} from "../../../modules/search/slick-grid/formatters/basket/basket.formatter";

export class CarrierViewsProvider extends ViewsProvider {
    config: ViewsConfig;
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }
    /**
     * @inheritDoc
     * @returns {Array}
     */
    getCustomColumns() {
        const columns = [];

        // Basket
        columns.unshift({
            isFrozen: true,
            id: -1,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: BasketFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'basket',
            __deps: {
                injector: this.injector,
                data: {
                    itemType: 'Tape'
                }
            }
        });

        // settings
        columns.unshift({
            isFrozen: true,
            id: -2,
            name: '',
            field: '*',
            width: 50,
            minWidth: 50,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: SettingsFormatter,
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
