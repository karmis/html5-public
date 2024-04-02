/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ViewsProvider} from "../../../../search/views/providers/views.provider";
import {ViewsConfig} from "../../../../search/views/views.config";
import {ThumbnailFormatter} from "../../../../search/slick-grid/formatters/thumbnail/thumbnail.formatter";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TreeFormatter} from "../../../../search/slick-grid/formatters/tree/tree.formatter";

export class VersionsUploadViewsProvider extends ViewsProvider {
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

        // columns.push({
        //     cellRendererFramework: ThumbColumnComponent,
        //     $$id: -2,
        //     field: "THUMBURL",
        //     headerName: "Thumbnail", // TODO Translates ?
        //     width: 175,
        //     sortable: false,
        //     suppressMenu: true,
        //     suppressSorting: true,
        //     hide: !this.config.componentContext.searchGridProvider.config.options.isThumbnails,
        //     suppressMovable: true,
        //     pinned: this.shouldPinColumn(),
        //     setupCol: false
        // });
        //
        // columns.unshift({
        //     cellRendererFramework: null,
        //     $$id: 0,
        //     cellRenderer: 'group',
        //     field: "_tree",
        //     headerName: "",
        //     width: 55,
        //     sortable: false,
        //     resizeable: false,
        //     pinned: this.shouldPinColumn(),
        //     suppressMovable: true,
        //     setupCol: false,      //for setup modal
        //     suppressSorting: true //can't sort
        // });
        //
        // columns.unshift({
        //     cellRendererFramework: null,
        //     $$id: 0,
        //     cellRenderer: 'group',
        //     field: "_tree",
        //     headerName: "",
        //     width: 55,
        //     sortable: false,
        //     resizeable: false,
        //     pinned: this.shouldPinColumn(),
        //     suppressMovable: true,
        //     setupCol: false,      //for setup modal
        //     suppressSorting: true //can't sort
        // });
        //
        // columns.push({
        //   cellRendererFramework: ThumbColumnComponent,
        //   $$id: -2,
        //   field: "THUMBURL",
        //   headerName: "Thumbnail", // TODO Translates ?
        //   width: 175,
        //   sortable: false,
        //   suppressMenu: true,
        //   suppressSorting: true,
        //   hide: !this.config.componentContext.searchGridProvider.config.options.isThumbnails,
        //   suppressMovable: true,
        //   pinned: this.shouldPinColumn(),
        //   setupCol: false
        // });

        return columns;
    }
}
