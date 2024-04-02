import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    Inject,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DetailService } from '../../../../../modules/search/detail/services/detail.service';
import { MediaDetailReportsResponse } from '../../../../../models/media/detail/reports/media.detail.reports.response';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import { SlickGridService } from "../../../slick-grid/services/slick.grid.service";
import { SlickGridProvider } from "../../../slick-grid/providers/slick.grid.provider";
import { SlickGridComponent } from "../../../slick-grid/slick-grid";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {TasksViewsProvider} from "./providers/views.provider";
import {WorkflowProvider} from "../../../../../providers/workflow/workflow.provider";
import {DetailTasksSlickGridProvider} from "./providers/tasks.slick.grid.provider";

@Component({
    selector: 'imfx-tasks-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        TasksViewsProvider,
        {provide: SlickGridProvider, useClass: DetailTasksSlickGridProvider},
        WorkflowProvider
    ]
})
@Injectable()
export class IMFXTasksTabComponent {
    config: any;
    private compIsLoaded = false;
    private destroyed$: Subject<any> = new Subject();

    @ViewChild('tasksGrid', {static: false}) private slickGridComp: SlickGridComponent;
    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 30,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });


    constructor(private cdr: ChangeDetectorRef,
                private detailService: DetailService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {
    }

    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            let globalColsView = this.injector.get(TasksViewsProvider).getCustomColumns();
            this.slickGridComp.provider.setGlobalColumns(globalColsView);
            this.slickGridComp.provider.setDefaultColumns(globalColsView, [], true);

            this.loadTasks();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    loadTasks() {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        let globalColsView = this.injector.get(TasksViewsProvider).getCustomColumns();
        this.slickGridComp.provider.setGlobalColumns(globalColsView);
        this.slickGridComp.provider.setDefaultColumns(globalColsView, [], true);
        this.compIsLoaded = true;
        this.detailService.getDetailTasks(this.config.file.ID).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: Array<any>) => {
                let tableRows = [];
                res.forEach(function(el) {
                    tableRows.push({
                        ID: el.Id,
                        JobId: el.JobId,
                        JobRef: el.JobRef,
                        TSK_TYPE_text: (el.FriendlyName && (el.FriendlyName + ' [')) + el.TaskTypeText + (el.FriendlyName && ']'),
                        StatusText: el.StatusText,
                        TSK_STATUS: el.Status,
                        TSK_PROGRSS: el.Progress,
                        StartDate: el.StartDate,
                        EndDate: el.EndDate,
                        CreatedDate: el.CreatedDate,
                        Preset: el.Preset,
                        FRIENDLY_NAME: el.FriendlyName,
                        TSK_TYPE: el.TaskType,
                        SUBTYPE: el.SUBTYPE,
                        TechReportSubtype: el.TechReportSubtype
                    });
                });
                this.slickGridComp.provider.buildPageByData({Data: tableRows});
                this.cdr.detectChanges();
            });
    };
    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.loadTasks();
        }
    }
}
