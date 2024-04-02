import {
    ChangeDetectorRef, Component, Injectable, Input, ViewEncapsulation, ElementRef,
    EventEmitter, Output, Injector, Inject, ViewChild
} from '@angular/core';

import * as $ from 'jquery';
import {Subject} from "rxjs";
import { SlickGridProvider } from '../../search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../search/slick-grid/services/slick.grid.service';
import { TaskHistorySlickGridProvider } from './providers/slick.grid.provider';
import { TaskHistoryViewsProvider } from './providers/views.provider';
import { ViewsProvider } from '../../search/views/providers/views.provider';
import { SlickGridComponent } from '../../search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../search/slick-grid/slick-grid.config';
import { WorkflowService } from '../../../services/workflow/workflow.service';
import { map } from 'rxjs/operators';


@Component({
    selector: 'imfx-history-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        TaskHistorySlickGridProvider,
        {provide: SlickGridProvider, useClass: TaskHistorySlickGridProvider},
        SlickGridService,
        ViewsProvider,
        TaskHistoryViewsProvider,
        {provide: ViewsProvider, useClass: TaskHistoryViewsProvider}]
})
@Injectable()
export class IMFXTaskHistoryGridComponent {
    // @Input() config: any;
    @Input() taskId: number;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;



    protected slickGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                },
                externalWrapperEl: '#historySlickGridExternalWrapper',
                selectFirstRow: false,
                clientSorting: true,
                overlay:{
                    zIndex:250
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '#copyPopup'
                    }
                },
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 30,
                fullWidthRows: true,
                multiAutoHeight: true,
                forceFitColumns: false
            }
        })
    });

    constructor(private cdr: ChangeDetectorRef,
                @Inject(Injector) public injector: Injector,
                protected workflowService: WorkflowService,
                private elementRef: ElementRef) {
    }

    ngOnInit() {
        // if(this.config){
        //     $.extend(true, this.historyGridConfig, this.config);
        // }
    }

    ngAfterViewInit() {
        this.slickGridComp.provider.showOverlay();
        let tableColumns = this.injector.get(TaskHistoryViewsProvider).getCustomColumns();
        this.slickGridComp.provider.setGlobalColumns(tableColumns);
        this.slickGridComp.provider.setDefaultColumns(tableColumns, [], true);
        this.bindData();
    };


    bindData(){
        let self = this;
        this.workflowService.getWorkflowTaskDetails(this.taskId).subscribe((res: any) => {
            let tableRows = res.map((el) => {
                return {
                    NOTES: el.NOTES,
                    OPERATOR_ID: el.OPERATOR_ID,
                    DATE: el.TIMESTAMP,
                    ActionText: el.ActionText
                }
            });

            self.slickGridComp.provider.buildPageByData({Data: tableRows});
            self.slickGridComp.provider.hideOverlay();
            self.cdr.detectChanges();
        });
    }

}
