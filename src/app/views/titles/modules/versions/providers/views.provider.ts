/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ViewsConfig} from "../../../../../modules/search/views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TreeFormatter} from "../../../../../modules/search/slick-grid/formatters/tree/tree.formatter";
import {ThumbnailFormatter} from "../../../../../modules/search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import {VersionViewsProvider} from '../../../../version/providers/views.provider';
import {SettingsFormatter} from '../../../../../modules/search/slick-grid/formatters/settings/settings.formatter';

export class TitlesVersionViewsProvider extends VersionViewsProvider {
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
        let columns = [];
        columns.push({
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
            id: -5,
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

        // thumbs
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
