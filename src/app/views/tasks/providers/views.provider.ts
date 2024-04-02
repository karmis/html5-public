/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ViewsProvider} from "../../../modules/search/views/providers/views.provider";
import {ViewsConfig} from "../../../modules/search/views/views.config";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {SlickGridColumn} from "../../../modules/search/slick-grid/types";
import {DragDropFormatter} from "../../../modules/search/slick-grid/formatters/dragdrop/dragdrop.formatter";
import {DatetimeFormatter} from "../../../modules/search/slick-grid/formatters/datetime/datetime.formatter";
import {TaskStatusFormatter} from "../../../modules/search/slick-grid/formatters/task-status/task-status";
import {TaskProgressFormatter} from "../../../modules/search/slick-grid/formatters/task-progress/task-progress";
import { TaskInfoFormatter } from '../../../modules/search/slick-grid/formatters/task-info/task.info.formatter';
import {SettingsFormatter} from "../../../modules/search/slick-grid/formatters/settings/settings.formatter";
import {LinkFormatter} from "../../../modules/search/slick-grid/formatters/link/link.formatter";
import {appRouter} from "../../../constants/appRouter";
export class TasksViewsProvider extends ViewsProvider {
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
        //     isFrozen: true,
        //     id: -4,
        //     name: '',
        //     field: '*',
        //     width: 1,
        //     minWidth: 1,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: ExpandContentFormatter,
        //     headerCssClass: "disable-reorder hidden",
        //     cssClass: 'hidden',
        //     __isCustom: true,
        //     __text_id: 'expand-content',
        //     __deps: {

        //
        //
        //         injector: this.injector
        //     }
        // });
        //
        // columns.unshift({
        //     isFrozen: false,
        //     id: -5,
        //     name: '',
        //     field: '*',
        //     width: 40,
        //     minWidth: 40,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: ExpandControlFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'expand-control',
        //     __deps: {

        //
        //
        //         injector: this.injector
        //     }
        // });

        // columns.unshift({
        //     isFrozen: false,
        //     id: -6,
        //     name: '',
        //     field: '*',
        //     width: 10,
        //     minWidth: 10,
        //     resizable: false,
        //     sortable: false,
        //     multiColumnSort: false,
        //     formatter: EmptyFormatter,
        //     headerCssClass: "disable-reorder",
        //     __isCustom: true,
        //     __text_id: 'empty-control',
        //     __deps: {

        //
        //
        //         injector: this.injector
        //     }
        // });

        columns.unshift({
            isFrozen: false,
            id: -7,
            name: '',
            field: '*',
            width: 13,
            minWidth: 13,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            cssClass: 'absolute-w100-h100',
            formatter: DragDropFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'drag-drop-control',
            __deps: {
                injector: this.injector,
                data: {
                    ddSelector: 'workflow-dd-users'
                }
            }
        });

        columns.unshift({
            isFrozen: false,
            id: -6,
            name: '',
            field: '*',
            width: 32,
            minWidth: 32,
            resizable: false,
            sortable: false,
            multiColumnSort: false,
            formatter: TaskInfoFormatter,
            headerCssClass: "disable-reorder",
            __isCustom: true,
            __text_id: 'task-info-control',
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

        return columns;
    }

    getFormatterByName(bindingName, col, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            switch (bindingName) {
                // Loc status
                case 'TSK_STATUS_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 80,
                        formatter: TaskStatusFormatter,
                        enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;

                case 'TSK_PROGRSS':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 150,
                        formatter: TaskProgressFormatter,
                        enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                case 'J_REF':
                    colDef = $.extend(true, {}, colDef, {
                        field: "J_REF",
                        isFrozen: false,
                        formatter: LinkFormatter,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.workflow.detail,
                                valueField: 'J_ID'
                            }
                        }
                    });
                    break;
                // case '':
                //     item._detailContent
                //     break;
                default:
                    break;
            }
            if (bindingName == 'CREATED'
                || bindingName == 'MODIFIED'
                || bindingName == 'TSK_START_DT'
                || bindingName == 'TSK_END_DT'
                || bindingName == 'TSK_COMPL_BY'
                || bindingName == 'JOB_COMPL_BY'
                || bindingName == 'TSK_ACT_DUR') {
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
        }

        return colDef;
    }
}
