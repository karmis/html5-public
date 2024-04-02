import { ViewsProvider } from '../../../search/views/providers/views.provider';
import { ViewsConfig } from '../../../search/views/views.config';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injector } from '@angular/core';
import { ColorIndicatorFormatter } from '../../../search/slick-grid/formatters/color-indicator/color.indicator.formatter';
import { TagFormatter } from '../../../search/slick-grid/formatters/tag/tag.formatter';
import { TextFormatter } from '../../../search/slick-grid/formatters/text/text.formatter';
import { DeleteFormatter } from '../../../search/slick-grid/formatters/delete/delete.formatter';
import {TimecodeStringFormatter} from "../../../search/slick-grid/formatters/timecode-string/timecode.string.formatter";
import {TimecodeInputFormatter} from "../../../search/slick-grid/formatters/timecode-input/timecode.input.formatter";


export class LocatorsCommentsViewsProvider extends ViewsProvider {
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
    getCustomColumns(LocatorsCommentsViewsProvider, readOnly?: boolean) {
        let columns = [];

        columns.unshift({
            id: -1,
            field: "*",
            name: "",
            width: 28,
            sortable: false,
            resizable: false,
            formatter: ColorIndicatorFormatter,
            __deps: {
                injector: this.injector
            }
        });
        if (readOnly) {
            columns.unshift({
                id: 2,
                field: "InTc",
                name: "In",
                width: 110,
                formatter: TimecodeStringFormatter,
                sortable: false,
                resizable: true,
                __deps: {
                    injector: this.injector
                }
            });
        } else {
            columns.unshift({
                id: 2,
                name: 'In',
                field: 'InTc',
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
            columns.unshift({
                id: 3,
                field: "OutTc",
                name: "Out",
                width: 110,
                formatter: TimecodeStringFormatter,
                sortable: false,
                resizable: true,
                __deps: {
                    injector: this.injector
                }
            });
            columns.unshift({
                id: 4,
                field: "DurationTc",
                name: "Duration",
                width: 150,
                minWidth: 150,
                sortable: false,
                resizable: true
            });
        }
        else {
            columns.unshift({
                id: 3,
                name: 'Out',
                field: 'OutTc',
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
            columns.unshift({
                id: 4,
                field: "DurationTc",
                name: "Duration",
                width: 150,
                minWidth: 150,
                sortable: false,
                resizable: true,
                cssClass: 'like-input-font'
            });
        }

        if (readOnly) {
            columns.unshift({
                id: 5,
                field: "Notes",
                name: "Notes",
                minWidth: 150,
                resizable: true,
                sortable: true
            });
        } else {
        columns.unshift({
            id: 5,
            field: "Notes",
            name: "Notes",
            minWidth: 150,
            sortable: false,
            resizable: true,
            formatter: TextFormatter,
            __deps: {
                injector: this.injector,
                data: {
                    validationEnabled: false,
                    multiline: true
                }
            }
        });
        }

        columns.unshift({
            id: 6,
            field: "Tags",
            name: "Tags",
            minWidth: 200,
            sortable: false,
            resizable: true,
            formatter: TagFormatter,
            __isCustom: true,
            __text_id: 'tags',
            __deps: {
                injector: this.injector,
                data: {
                    tagsEditable: !readOnly,
                    // dropdownParentType: "canvas",
                }
            }
        });
        if (!readOnly) {
        columns.unshift({
            id: 7,
            field: "*",
            name: " ",
            width: 38,
            sortable: false,
            resizable: false,
            formatter: DeleteFormatter,
            __deps: {
                injector: this.injector
            }
        });
        }
        return columns;

    }
}
