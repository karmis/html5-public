import {ViewsProvider} from "../../../../views/providers/views.provider";
import {ViewsConfig} from "../../../../views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {TimecodeInputFormatter} from "../../../../slick-grid/formatters/timecode-input/timecode.input.formatter";
import {Select2Formatter} from "../../../../slick-grid/formatters/select2/select2.formatter";
import {DeleteFormatter} from "../../../../slick-grid/formatters/delete/delete.formatter";
import {TextFormatter} from "../../../../slick-grid/formatters/text/text.formatter";
import {HiddenContentFormatter} from "../../../../slick-grid/formatters/hidden-content/hidden.content.formatter";
import {SlickGridProvider} from '../../../../slick-grid/providers/slick.grid.provider';
import {SettingsFormatter} from "../../../../slick-grid/formatters/settings/settings.formatter";
import { ExpandContentFormatter } from '../../../../slick-grid/formatters/expand/expand.content.formatter';
import { ExpandControlFormatter } from '../../../../slick-grid/formatters/expand/expand.control.formatter';

export class SegmentsViewsProvider extends ViewsProvider {
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
    getCustomColumns(sgp: SlickGridProvider = null, readOnly?: boolean) {
        let columns = [];
        // for credits
        // columns.unshift({
        //     isFrozen: true,
        //     id: -11,
        //     name: '',
        //     field: '*',
        //     width: 0.1,
        //     minWidth: 0.1,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: ExpandContentFormatter,
        //     headerCssClass: "disable-reorder hidden",
        //     cssClass: 'expand-content-formatter',
        //     __isCustom: true,
        //     __text_id: 'expand-content',
        //     __deps: {
        //         injector: this.injector
        //     }
        // });
        //
        // columns.unshift({
        //     isFrozen: false,
        //     id: -10,
        //     name: '',
        //     field: '*',
        //     width: 40,
        //     minWidth: 40,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: ExpandControlFormatter,
        //     headerCssClass: "border-none disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'expand-control',
        //     __deps: {
        //         injector: this.injector
        //     }
        // });
        if (!readOnly) {
            columns.push({
                isFrozen: false,
                id: -3,
                name: '',
                field: '*',
                width: 50,
                minWidth: 50,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: SettingsFormatter,
                headerCssClass: "disable-reorder cell-reorder-w",
                // behavior: "selectAndMove",
                __isCustom: true,
                __text_id: 'settings',
                __deps: {
                    injector: this.injector
                }
            });
        }

        columns.push({
            id: 1,
            name: 'Part#',
            field: 'PRT_NUM',
            minWidth: 50,
            width: 50,
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            formatter: HiddenContentFormatter,
            __deps: {
                injector: this.injector,
                data: []
            }
        });
        columns.push({
            id: 2,
            name: 'Seq#',
            field: 'SQ_NUM',
            minWidth: 50,
            width: 50,
            resizable: true,
            sortable: false,
            multiColumnSort: false
        });
        if (readOnly) {
            columns.push({
                id: 3,
                name: 'Type',
                field: 'TYPE_text',
                minWidth: 300,
                width: 300,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
        } else {
            columns.push({
                id: 3,
                name: 'Type',
                field: 'TYPE',
                minWidth: 300,
                width: 300,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: Select2Formatter,
                __deps: {
                    injector: this.injector,
                    data: []
                }
            });
        }
        if (readOnly) {
            columns.push({
                id: 4,
                name: 'In',
                field: 'SOMS',
                minWidth: 190,
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
            columns.push({
                id: 5,
                name: 'Out',
                field: 'EOMS',
                minWidth: 190,
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
        } else {
            columns.push({
                id: 4,
                name: 'In',
                field: 'SOMS',
                minWidth: 190,
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: TimecodeInputFormatter,
                __deps: {
                    injector: this.injector,
                    data: []
                }
            });
            columns.push({
                id: 5,
                name: 'Out',
                field: 'EOMS',
                minWidth: 190,
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: TimecodeInputFormatter,
                __deps: {
                    injector: this.injector,
                    data: []
                }
            });
        }
        if (readOnly) {
            columns.push({
                id: 6,
                name: 'Duration',
                field: 'DURATION_text',
                minWidth: 190,
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
            columns.push({
                id: 7,
                name: 'Title',
                field: 'PRT_TTL',
                minWidth: 300,
                width: 300,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            });
        } else {
            columns.push({
                id: 6,
                name: 'Duration',
                field: 'DURATION_text',
                minWidth: 190,
                width: 190,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                cssClass: 'like-input-font'
            });
            columns.push({
                id: 7,
                name: 'Title',
                field: 'PRT_TTL',
                minWidth: 300,
                width: 300,
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                formatter: TextFormatter,
                __deps: {
                    injector: this.injector,
                    data: {
                        validationEnabled: false
                    }
                }
            });
            columns.push({
                id: 8,
                field: "Delete",
                name: "",
                width: 50,
                resizable: false,
                sortable: false,
                multiColumnSort: false,
                formatter: DeleteFormatter,
                __deps: {
                    injector: this.injector
                }
            });
        }

        return columns;
    }
}
