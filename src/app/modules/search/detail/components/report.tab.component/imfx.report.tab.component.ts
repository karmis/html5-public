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
import { ReportViewsProvider } from "./providers/views.provider";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-report-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ReportViewsProvider
    ]
})
@Injectable()
export class IMFXReportTabComponent {
    config: any;
    private compIsLoaded = false;
    private destroyed$: Subject<any> = new Subject();

    @ViewChild('reportGrid', {static: false}) private slickGridComp: SlickGridComponent;
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
            this.selectReport();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectReport() {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        let globalColsView = this.injector.get(ReportViewsProvider).getCustomColumns();
        this.slickGridComp.provider.setGlobalColumns(globalColsView);
        this.slickGridComp.provider.setDefaultColumns(globalColsView, [], true);
        let self = this;
        this.detailService.getDetailReport(this.config.file["ID"]).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: Array<MediaDetailReportsResponse>) => {
                let tableRows = [];
                res.forEach(function (el) {
                    tableRows.push({
                        ReportName: el.ReportName,
                        ReportType: el.ReportType,
                        JobRef: el.JobRef,
                        GeneratedDate: el.GeneratedDate,
                        IsReportAvailable: el.IsReportAvailable,
                        Url: el.Url
                    });
                });
                this.slickGridComp.provider.buildPageByData({Data: tableRows});
                this.compIsLoaded = true;
                this.cdr.detectChanges();
            });
    };

    /*
    *Table methods
    */
    // onReady($event) {};
    // onBodyScroll($event) {};
    // onCellFocused($event): any {
    //     if ($event.column) {
    //         let model = this.gridOptions.api.getModel();
    //         let node = model.getRow($event.rowIndex);
    //         if (node) {
    //             node.setSelected(true);
    //         }
    //     }
    // }
    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.selectReport();
        }
    }
}
