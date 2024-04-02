import {
    ChangeDetectorRef, Component, Injectable, Input, ViewEncapsulation, ElementRef,
    EventEmitter, Output, Injector, Inject, ViewChild
} from '@angular/core';

import * as $ from 'jquery';
import {Subject} from "rxjs";
import { SlickGridProvider } from '../../search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../search/slick-grid/services/slick.grid.service';
import {
    TaskAdvancedLogSlickGridProvider
} from './providers/slick.grid.provider';
import { TaskAdvancedLogViewsProvider } from './providers/views.provider';
import { ViewsProvider } from '../../search/views/providers/views.provider';
import { SlickGridComponent } from '../../search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../search/slick-grid/slick-grid.config';
import { WorkflowService } from '../../../services/workflow/workflow.service';


@Component({
    selector: 'imfx-task-advanced-log-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [SlickGridProvider
        ,TaskAdvancedLogSlickGridProvider
        ,{provide: SlickGridProvider, useClass: TaskAdvancedLogSlickGridProvider}
        ,SlickGridService
        ,ViewsProvider
        ,TaskAdvancedLogViewsProvider
        ,{provide: ViewsProvider, useClass: TaskAdvancedLogViewsProvider}]
})
@Injectable()
export class IMFXTaskAdvancedLogGridComponent {
    // @Input() config: any;
    @Input() taskId: number;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    private data = [];
    private lastEndpoint = 0;



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
                externalWrapperEl: '#advancedLogSlickGridExternalWrapper',
                selectFirstRow: false,
                clientSorting: true,
                overlay:{
                    zIndex:250
                }
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
        let tableColumns = this.injector.get(TaskAdvancedLogViewsProvider).getCustomColumns();
        this.slickGridComp.provider.setGlobalColumns(tableColumns);
        this.slickGridComp.provider.setDefaultColumns(tableColumns, [], true);
        this.bindData();
        this.slickGridComp.provider.getSlick().onScroll.subscribe((event,data) => {
            this.onScrollGridCB(event,data);
        });
    };


    bindData(up = false){

        let self = this
            ,d = (up) ? "up" : undefined;
        this.slickGridComp.provider.showOverlay();
        this.workflowService.getWorkflowTaskAdvancedLog(this.taskId, this.lastEndpoint, d).subscribe((res: any) => {
            let tableRows = res.map((el) => {
                // return;
                return {
                    DATE: el.Dt,
                    timeStamp: (new Date(el.Dt)).getTime(),
                    SERVICE: el.Service,
                    Level: el.Level,
                    LOG: el.Log,
                    logType: this.getCssClass(el.Level)
                }
            });

            tableRows.reverse();

            self.data = (up) ? self.data.concat(tableRows) : tableRows;

            if(self.data.length != 0){
                self.lastEndpoint = self.data[self.data.length - 1].timeStamp;
            }

            self.slickGridComp.provider.buildPageByData({Data: self.data});
            self.slickGridComp.provider.hideOverlay();
            self.cdr.detectChanges();
        });
    }

    onScrollGridCB(event, data){
        let vnObj = data.grid.getViewportNode()
            ,sh = vnObj.scrollHeight
            ,ch = vnObj.clientHeight
            ,st = data.scrollTop;
        if ((ch < sh) && (sh == (st + ch))){
             this.bindData(true);
        }
        return;
    }

    getCssClass(level?: number) {
        let cssClass = ''
            ,title = ''
            , LogLevel = {
            '10': 'Error',
            '20': 'Warning',
            '30': 'Info',
            '50': 'Debug'
        }, LevelColorList = {
            'Error' : 'remove',
            'Warning' : 'statusred',
            'Info' : 'status',
            'Debug' : "status"
        };



        title = LogLevel[level.toString()] ? LogLevel[level.toString()] : level.toString();
        cssClass = LevelColorList[title] ? LevelColorList[title] : '';

        return {cssClass: cssClass, title: title};
    }

}
