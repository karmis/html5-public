/**
 * Created by Sergey Trizna on 22.05.2017.
 */
import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ReportService } from '../../services/reports/report.service';
import { SplashProvider } from '../../providers/design/splash.provider';
import { IMFXModalProvider } from 'app/modules/imfx-modal/proivders/provider';
import { IMFXModalEvent } from '../../modules/imfx-modal/types';
import { ActivatedRoute, Router } from '@angular/router';
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import { ReportParamsModalComponent } from './modules/report.params';
import { BaseProvider } from '../base/providers/base.provider';
import { IMFXControlsTreeComponent } from '../../modules/controls/tree/imfx.tree';
import { PDFViewerComponent } from '../../modules/viewers/pdf/pdf';
import { IMFXModalComponent } from '../../modules/imfx-modal/imfx-modal';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import {lazyModules} from "../../app.routes";

@Component({
    selector: 'reports',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        ReportService,
        BaseProvider,
        BsModalRef,
        BsModalService
    ]
})

export class ReportsComponent {
    public data: any;
    protected errDescr: string;
    @ViewChild('tree', {static: false}) private tree: IMFXControlsTreeComponent;
    @ViewChild('pdfViewer', {static: false}) private pdfViewer: PDFViewerComponent;
    @ViewChild('overlayReports', {static: false}) private overlay: any;
    @ViewChild('list', {static: false}) private list: any;
    // @ViewChild('report', {static: false}) private report: any;
    @ViewChild('filterInput', {static: false}) private filterInput: ElementRef;
    // private defaultDate = new Date();
    private error: boolean = false;
    private currentNode = null;
    private _listhandler: any;
    // private waitedReports: Array<{guid: string, state: boolean}> = [];
    private reportHandler;
    private blobOfReport: any;

    constructor(private reportService: ReportService,
                private splashProvider: SplashProvider,
                private modalProvider: IMFXModalProvider,
                private cdr: ChangeDetectorRef,
                private injector: Injector) {
        this._listhandler = reportService.getListOfReports();
    }

    ngOnInit() {
        const route = this.injector.get(ActivatedRoute);

        route.parent && route.parent.url.subscribe((data) => {
            this.commonInitActions(data);
        }, error => console.error(error));
    }

    commonInitActions(data) {
        const router = this.injector.get(Router)
            , url = data.join('/');

        this.onInitCustomAlways();

        // if component not ready
        if (!(<IMFXRouteReuseStrategy>router.routeReuseStrategy).initedComponents[url]) {
            return;
        }

        this.onInitCustomIfExist();
    }

    onInitCustomAlways() {

    }

    onInitCustomIfExist() {
        this.focusToFilterInput();
    }

    focusToFilterInput() {
        setTimeout(() => {
            this.filterInput.nativeElement.focus();
        });
    }

    ngAfterViewInit() {
        this.focusToFilterInput();
        this.overlay.showWhole();
        this._listhandler.subscribe(
            (listOfReports: any) => {
                let normData = this.tree.turnArrayOfObjectToStandart(listOfReports, {
                    key: 'Id',
                    title: 'Name',
                    children: 'Children'
                });
                this.tree.setSource(normData);
                this.overlay.hideWhole();
            },
            () => {
                this.error = true;
                this.overlay.hideWhole();
            });
    }

    isError($event) {
        if ($event) {
            this.error = true;
        }
    }

    /**
     * Filter of data
     * @param $event
     */
    filter($event) {
        this.tree.filterCallback($event.target.value, function (str, node) {
            let normTitle = str.toLowerCase();
            let normNodeTitle = node.title.toLowerCase();
            if (normNodeTitle.indexOf(normTitle) !== -1 || node.selected === true) {
                return true;
            }
            return false;
        });
    }

    onClickByTreeItem($event) {
        let node = $event.data.node;
        if ($event.event.originalEvent.target.className !== 'fancytree-expander') {
            if (!node.children) {
                this.onDblClickByTreeItem($event);
            } else {
                node = $event.data.node;
                node.setExpanded(!node.expanded);
            }
        }
    }

    onDblClickByTreeItem($event) {
        let node = $event.data.node;
        if (node.children) return false;
        this.overlay.showWhole();
        this.error = false;
        let self = this;
        this.currentNode = node;
        if(this.pdfViewer){
            this.pdfViewer.clear();
        }
        // get parameters
        this.reportService.getParamsByReport(node.key)
            .subscribe(
                (paramsForReport: any[]) => {
                    if (paramsForReport && paramsForReport.length > 0) {
                        const modal: IMFXModalComponent = self.modalProvider.showByPath(
                            lazyModules.report_params,
                            ReportParamsModalComponent, {
                                size: 'lg',
                                title: 'reports.select_params',
                                position: 'center',
                                footer: 'cancel|ok'
                            });

                        modal.load().then(
                            (ref: ComponentRef<ReportParamsModalComponent>) => {
                                const comp: ReportParamsModalComponent = ref.instance;
                                comp.buildParams = paramsForReport.slice();
                                modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                                    if (e.name === 'ok') {
                                        this.startGenerateReport(comp.buildParams);
                                        modal.hide('hide');
                                    }
                                });
                                this.overlay.hideWhole();
                            });
                    } else {
                        this.startGenerateReport();
                        // this.overlay.hideWhole();
                    }
                },
                () => {
                    self.error = true;
                    self.overlay.hideWhole();
                });
    }

    startGenerateReport(params = []) {
        this.overlay.showWhole();
        if (!this.currentNode) return;
        this.reportService.generateReport(this.currentNode.key, params)
            .subscribe((guid) => {
                    this.reportService.moduleContext = this;
                    this.tryGetReport(guid);
                },
                (err) => {
                    this.error = true;
                    this.errDescr = err.message ? err.message : err;
                    this.cdr.detectChanges();
                    this.overlay.hideWhole();
                });
    }

    tryGetReport(guid) {
        this.reportHandler = this.reportService.getReportByGUID(guid).subscribe(
            (report: any) => {
                // this.blobOfReport = report.blob(); //legacy
                this.blobOfReport = report.body;
                this.pdfViewer.renderPDFFromContent(this.blobOfReport);
                this.finishWaitReport();
            }, (err) => {
                this.error = true;
                this.errDescr = err.message ? err.message : err;
                this.finishWaitReport();
            }, (resp) => {
                this.finishWaitReport(true);
            });
    }

    private finishWaitReport(onlyHandler: boolean = false) {
        this.reportHandler.unsubscribe();

        if (onlyHandler) {
            return;
        }
        this.cdr.detectChanges();
        this.overlay.hideWhole();
        this.overlay.hide(this.list.nativeElement);
        // this.error = true;
        // this.overlay.hide(this.report.nativeElement);
    }
}
