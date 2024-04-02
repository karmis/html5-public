import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { ViewsConfig } from 'app/modules/search/views/views.config';
import { ViewsProvider } from 'app/modules/search/views/providers/views.provider';
import { ThumbnailFormatter } from 'app/modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter';
import {TreeFormatter} from "../../search/slick-grid/formatters/tree/tree.formatter";

export class VersionSearchModalViewsProvider extends ViewsProvider {
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
        columns.unshift({
            id: -99,
            name: '',
            field: '*',
            width: 80,
            isFrozen: false,
            resizable: false,
            __isCustom: true,
            __text_id: 'tree',
            sortable: false,
            multiColumnSort: false,
            cssClass: 'overflow-visible',
            formatter: TreeFormatter,
            enableColumnReorder: false,
            headerCssClass: "disable-reorder",
            __deps: {
                injector: this.injector
            }
        });
        columns.unshift({
            isFrozen: true,
            id: -4,
            name: 'Thumbnail',
            field: '*',
            width: 175,
            minWidth: 175,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ThumbnailFormatter,
            headerCssClass: "disable-reorder",
            cssClass: 'thumb-wrapper',
            __isCustom: true,
            __text_id: 'thumbnails',
            __deps: {
                injector: this.injector
            }
        });

        return columns;
    }
}
