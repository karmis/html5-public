/**
 * Created by Sergey Trizna on 05.03.2017.
 */
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import {ViewsProvider} from '../../../modules/search/views/providers/views.provider';

import {ViewsConfig} from "../../../modules/search/views/views.config";
import {RESTColumSetup, SlickGridColumn} from "../../../modules/search/slick-grid/types";
import {StatusFormatter} from "../../../modules/search/slick-grid/formatters/status/status.formatter";
import {ProgressFormatter} from "../../../modules/search/slick-grid/formatters/progress/progress.formatter";
import {SettingsFormatter} from '../../../modules/search/slick-grid/formatters/settings/settings.formatter';
import { LinkFormatter } from '../../../modules/search/slick-grid/formatters/link/link.formatter';
import { appRouter } from '../../../constants/appRouter';


export class QueueViewsProvider extends ViewsProvider {
    config: ViewsConfig;

    constructor(@Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
        super(compFactoryResolver, appRef, injector);
    }

    getFormatterByName(bindingName: string, col: RESTColumSetup, colDef: SlickGridColumn): SlickGridColumn {
        if (bindingName) {
            let bn = bindingName.toLowerCase();
            switch (bn) {
                // Loc status
                case 'status_text':
                    colDef = $.extend(true, {}, colDef, {
                        isFrozen: false,
                        minWidth: 60,
                        formatter: StatusFormatter,
                        enableColumnReorder: true,
                        // __text_id: 'status',
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                case 'progress':
                    colDef = $.extend(true, {}, colDef, {
                        formatter: ProgressFormatter,
                        multiColumnSort: false,
                        __deps: {
                            injector: this.injector
                        }
                    });
                    break;
                case 'jobid':
                case 'jobreference':
                    colDef = $.extend(true, {}, colDef, {
                        formatter: LinkFormatter,
                        multiColumnSort: false,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.workflow.detail,
                                valueField: 'JobId'
                            }
                        }
                    });
                    break;
                case 'taskid':
                    colDef = $.extend(true, {}, colDef, {
                        formatter: LinkFormatter,
                        multiColumnSort: false,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: 'customTaskId',
                                valueField: 'TaskId',
                                valueJobField: 'JobId',
                                linkJobTemp: appRouter.workflow.detail,
                            }
                        }
                    });
                    break;
                case 'mediatitle':
                    colDef = $.extend(true, {}, colDef, {
                        formatter: LinkFormatter,
                        multiColumnSort: false,
                        __deps: {
                            injector: this.injector,
                            data: {
                                linkTemp: appRouter.media.detail,
                                valueField: 'MediaId'
                            }
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        return colDef;
    }

    getCustomColumns() {
        let columns = [];
        columns.unshift({
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
            headerCssClass: "disable-reorder cell-header-reorder-w ",
            cssClass:'cell-body-reorder-w',
            __isCustom: true,
            __text_id: 'settings',
            __deps: {
                injector: this.injector
            }
        });


        columns.unshift({
            isFrozen: false,
            id: -4,
            name: '',
            field: '*',
            width: 15,
            minWidth: 15,
            resizable: false,
            sortable: false,
            behavior: "selectAndMove",
            multiColumnSort: false,
            headerCssClass: "disable-reorder border-hidden",
            cssClass: "cell-reorder skipSelection",
            __isCustom: true,
            __deps: {}
        });


        return columns;
    }
}
