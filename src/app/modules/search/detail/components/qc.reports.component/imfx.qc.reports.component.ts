import {ChangeDetectorRef, Component, EventEmitter, Inject, ViewChild, ViewEncapsulation,} from '@angular/core';
import {QcReportsService} from './services/qc.reports.service';
import {IMFXControlsTreeComponent} from '../../../../controls/tree/imfx.tree';
import {Subject} from 'rxjs';
import {TreeStandardListTypes} from '../../../../controls/tree/types';
import {TranslateService} from '@ngx-translate/core';
import xml2js from 'xml2js';

@Component({
    selector: 'qc-reports',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        QcReportsService
    ]
})

export class IMFXQcReportsComponent {
    onReady: EventEmitter<void> = new EventEmitter<void>();
    file: any;
    media: any;
    lat: number = 0;
    lng: number = 0;
    compIsLoaded = false;
    config: any;
    selectedSchemaModel: any;
    selectedXmlModel: any;
    qcReport: any;
    compRef: any
    @ViewChild('tree', {static: false}) private _tree: IMFXControlsTreeComponent;
    private reports: TreeStandardListTypes = [];
    private destroyed$: Subject<any> = new Subject();
    // private qcreportsAvailable: boolean = false;
    private data = null;

    constructor(
        @Inject(TranslateService) protected translate: TranslateService,
        private service: QcReportsService,
        private cdr: ChangeDetectorRef,
        private qcReportsService: QcReportsService,
    ) {
    }

    // tslint:disable-next-line:use-lifecycle-interface no-empty
    ngOnInit() {
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngAfterViewInit() {
        this.loadQcReports();
        // @ts-ignore
        // this.qcReportsService.getQcReports(this.media.MI_LINK_ID)
        //     .subscribe(
        //         (data: LocationsListLookupTypes) => {
        //             const normData: TreeStandardListTypes = this._tree.turnArrayOfObjectToStandart(
        //                 data,
        //                 {
        //                     key: 'ID',
        //                     title: 'Title',
        //                     children: 'Childs'
        //                 }
        //             );
        //             this.reports = normData;
        //             this._tree.setSource(this.reports);
        //             setTimeout(() => {
        //                 this.onReady.emit();
        //             });
        //         },
        //         (error: any) => {
        //             console.error('Failed', error);
        //         }
        //     );
    }

    loadComponentData() {
        if (!this.compIsLoaded) {
            this.loadQcReports();
        }
    }

    filterTree($event) {
        const filterStr = $event ? $event.target.value : '';
        // qcReport
        // this._tree.filterCallback(filterStr, function (str, node) {
        //     if (node.title != null) {
        //         const normTitle = str.toLowerCase();
        //         const normNodeTitle = node.title.toLowerCase();
        //         return (normNodeTitle.indexOf(normTitle) !== -1);
        //     }
        //
        //     return false;
        // });
    }

    private filteredQcReport: any[] = [];
    filterData($event) {
        const filterStr = $event ? $event.target.value : '';
        this.filteredQcReport = this.qcReport.filter((x) => {
            return x
                .toString()
                .toLowerCase()
                .includes(filterStr.trim().toLowerCase());
        });
        // this.cdr.detectChanges();
    }

    selectRow(clickedIndex) {
        for (let i = 0; i < this.data.rows.length; i++) {
            this.data.rows[i].selected = i == clickedIndex;
        }
    }

    private selectedId: number;
    onSelectReport(report) {
        this.data = null;
        this.parseXML(report.ReportXml).then((res) => {
            this.data = res;
            this.selectedId = report.Id;
            this.cdr.markForCheck();
        });

    }

    parseXML(data) {
        return new Promise(resolve => {
            const parser = new xml2js.Parser(
                    {
                        trim: true,
                        explicitArray: true
                    });
            parser.parseString(data, function (err, result) {
                resolve({
                    events: result.mfxAssistedQCReport.aqcReport[0].aqcReportDetails[0].event,
                    headers: result.mfxAssistedQCReport.aqcReport[0].aqcReportHeader[0]
                })
                // var obj = result.Employee;
                // for (k in obj.emp) {
                //     var item = obj.emp[k];
                //     arr.push({
                //         id: item.id[0],
                //         name: item.name[0],
                //         gender: item.gender[0],
                //         mobile: item.mobile[0]
                //     });
                // }
                // resolve(arr);
            });
        });
    }

    private loadQcReports() {
        this.filteredQcReport = [...this.qcReport];
        this.compIsLoaded = true;
        this.cdr.detectChanges();
        // debugger;
        // const normData: TreeStandardListTypes = this._tree.turnArrayOfObjectToStandart(
        //     this.qcReport,
        //     {
        //         key: 'ID',
        //         title: 'Title',
        //         children: 'Childs'
        //     }
        // );
        // this.reports = normData;
        // this._tree.setSource(this.reports);
        // this.service.getQcReports(this.media.MI_LINK_ID).pipe(
        //     takeUntil(this.destroyed$)
        // ).subscribe((res: any) => {
        //         if (res) {
        //             this.lat = parseFloat(res.Lat);
        //             this.lng = parseFloat(res.Lon);
        //             this.qcreportsAvailable = true;
        //         } else {
        //             this.qcreportsAvailable = false;
        //         }
        //         this.compIsLoaded = true;
        //         this.cdr.detectChanges();
        //     }
        // );
    }

    private selectedErrorId: number;
    private qcReportClick(error) {
        this.selectedErrorId = error.errorIdx;
        if (!error.inTC || error.inTC.length === 0) {
            return
        }
        this.compRef.mediaPlayerCompRef.instance.setTimecode(error.inTC[0]);
        this.cdr.markForCheck();
    }
}
