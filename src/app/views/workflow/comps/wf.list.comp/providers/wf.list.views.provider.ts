import { WorkflowViewsProvider } from '../../../providers/views.provider';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { SettingsFormatter } from '../../../../../modules/search/slick-grid/formatters/settings/settings.formatter';
import { ExpandContentFormatter } from '../../../../../modules/search/slick-grid/formatters/expand/expand.content.formatter';
import { ExpandControlFormatter } from '../../../../../modules/search/slick-grid/formatters/expand/expand.control.formatter';
import { EmptyFormatter } from '../../../../../modules/search/slick-grid/formatters/empty/empty.formatter';

@Injectable()
export class WorkflowListViewsProvider extends WorkflowViewsProvider {
    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getCustomColumns() {
        let columns = [];

        columns.unshift({
            isFrozen: true,
            id: -3,
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

        columns.unshift({
            isFrozen: true,
            id: -4,
            name: '',
            field: '*',
            width: 0.1,
            minWidth: 0.1,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ExpandContentFormatter,
            headerCssClass: "disable-reorder hidden",
            cssClass: '',
            __isCustom: true,
            __text_id: 'expand-content',
            __deps: {
                injector: this.injector
            }
        });

        columns.unshift({
            isFrozen: false,
            id: -5,
            name: '',
            field: '*',
            width: 40,
            minWidth: 40,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ExpandControlFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'expand-control',
            __deps: {
                injector: this.injector
            }
        });

        columns.unshift({
            isFrozen: false,
            id: -6,
            name: '',
            field: '*',
            width: 10,
            minWidth: 10,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: EmptyFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'empty-control',
            __deps: {
                injector: this.injector
            }
        });

        // columns.unshift({
        //     isFrozen: false,
        //     id: -7,
        //     name: '',
        //     field: '*',
        //     width: 10,
        //     minWidth: 10,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: DragDropFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'drag-drop-control',
        //     __deps: {

        //
        //
        //         injector: this.injector,
        //         data: {
        //             ddSelector: 'workflow-dd-users'
        //         }
        //     }
        // });


        return columns;
    }
}
