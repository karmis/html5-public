/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ViewsProvider} from "../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../modules/search/views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {SlickGridColumn} from "../../../modules/search/slick-grid/types";
import {JobStatusFormatter} from "../../../modules/search/slick-grid/formatters/job-status/job-status";
import {ExpandControlFormatter} from "../../../modules/search/slick-grid/formatters/expand/expand.control.formatter";
import {ExpandContentFormatter} from "../../../modules/search/slick-grid/formatters/expand/expand.content.formatter";
import {DragDropFormatter} from "../../../modules/search/slick-grid/formatters/dragdrop/dragdrop.formatter";
import {EmptyFormatter} from "../../../modules/search/slick-grid/formatters/empty/empty.formatter";
import {DatetimeFormatter} from "../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";
import { SettingsFormatter } from '../../../modules/search/slick-grid/formatters/settings/settings.formatter';
import { CheckBoxFormatter } from '../../../modules/search/slick-grid/formatters/checkBox/checkbox.formatter';
export class WorkflowViewsProvider extends ViewsProvider {
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
        // columns.unshift({
        //     id: -3,
        //     field: "Delete",
        //     name: "",
        //     width: 50,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: DeleteFormatter,
        //     __deps: {

        //
        //
        //         injector: this.injector,
        //         data: {
        //             withModal: true,
        //             modalData: {
        //                 text: 'workflow.modal_remove_conformation',
        //                 textParams: {jobName: 'CMB_IN_TTLS_text'},
        //                 message: 'workflow.remove_success'
        //             }
        //         }
        //     }
        // });

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
            width: 0,
            minWidth: 0,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: ExpandContentFormatter,
            headerCssClass: "disable-reorder hidden",
            cssClass: 'expand-content-formatter',
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
            headerCssClass: "border-none disable-reorder",
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
            headerCssClass: "border-none disable-reorder",
            __isCustom: true,
            __text_id: 'empty-control',
            __deps: {
                injector: this.injector
            }
        });

        columns.unshift({
            isFrozen: false,
            id: -7,
            name: '',
            field: '*',
            width: 10,
            minWidth: 10,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: EmptyFormatter,
            cssClass: '',
            headerCssClass: "border-none disable-reorder",
            __isCustom: true,
            __text_id: 'empty-control',
            // __text_id: 'drag-drop-control',
            // __deps: {
            //     injector: this.injector,
            //     data: {
            //         ddSelector: 'workflow-dd-users'
            //     }
            // }
        });



        return columns;
    }

    getFormatterByName(bindingName, col, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            switch (bindingName) {
                // Loc status
                case 'CMB_STAT_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 80,
                        formatter: JobStatusFormatter,
                        enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                // case '':
                //     item._detailContent
                //     break;
                default:
                    break;
            }
            if (bindingName == 'NEXT_TX_DATE'
                || bindingName == 'MODIFIED'
                || bindingName == 'J_START_DT'
                || bindingName == 'J_END_DT'
                || bindingName == 'J_CREATED'
                || bindingName == 'J_COMPL_BY'
                || bindingName == 'CREATED') {
                colDef = $.extend(true, {}, colDef, {
                    isFrozen: false,
                    minWidth: 60,
                    formatter: DatetimeFormatter,
                    enableColumnReorder: true,
                    __deps: {
                        injector: this.injector,
                        datetimeFullFormatLocaldatePipe: this.datetimeFullFormatLocaldatePipe
                    }
                });
            }
            if (bindingName == 'J_FAILURE_RESOLVED') {

                colDef = $.extend(true, {}, colDef, {
                    isFrozen: false,
                    // minWidth: 60,
                    formatter: CheckBoxFormatter,
                    enableColumnReorder: true,
                    __deps: {
                        injector: this.injector,
                        data: {
                            messageTrue: 'Resolved',
                            messageFalse: ''
                        }
                    }
                });

            }
        }

        return colDef;
    }
}
