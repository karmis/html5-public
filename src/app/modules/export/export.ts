import {
    ChangeDetectorRef,
    Component,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ExportProvider } from './providers/export.provider';
import { ExportService } from './services/export.service';
import { Observable, Subscription } from 'rxjs';
import * as FileSaver from 'file-saver';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/services/notification.service';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { SlickGridProvider } from '../search/slick-grid/providers/slick.grid.provider';
import { ExportModelType } from './types';
import { ViewsProvider } from '../search/views/providers/views.provider';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { SlickGridColumn, SlickGridTreeRowData } from '../search/slick-grid/types';
import { SecurityService } from '../../services/security/security.service';
import { ViewType } from '../search/views/types';
import { HttpErrorResponse } from '@angular/common/http';

// import {} from '../error'
@Component({
    selector: 'export-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // IMFXModalProvider,
        // BsModalRef,
        // BsModalService,
    ]
})

export class ExportComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('overlayExport', {static: false}) private overlay;
    @ViewChild('overlayWrapper', {static: false}) private wrapper;
    private firstStep = 0;
    private lastStep = 1;
    private currentStep = 0;
    private modalRef: IMFXModalComponent;
    private formats = [];
    private selectedFormatObject; // first by default
    private blob: any;
    private selectedFormat = 'HTML';
    private defaultSelectedFormat = 'HTML';
    private isAllExport: boolean = true;
    private errorMsg = null;
    private modalData;
    private useCustomApiUrl = false;
    private customApiUrl = '';

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private provider: ExportProvider,
                private service: ExportService,
                private translate: TranslateService,
                private securityService: SecurityService,
                private router: Router,
                protected notificationRef: NotificationService) {
        // ref to component
        this.provider.moduleContext = this;
        // this.provider.componentContext;
        this.selectedFormatObject = this.formats[0];
        // modal data
        this.modalRef = this.injector.get('modalRef');
        this.modalData = this.modalRef.getData();

        if (this.modalData.context) { // for export from details tab
            this.useCustomApiUrl = this.modalData.context.useCustomApiUrl;
            this.customApiUrl = this.modalData.context.customApiUrl;
        }
        this.formats = [];
        if (this.hasPermissionByName('export-html')) {
            this.formats.push({name: 'HTML', type: 'text/html', ext: 'html'});
        }
        if (this.hasPermissionByName('export-excel')) {
            this.formats.push({
                name: 'Excel',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ext: 'xlsx'
            });
        }

        if (this.hasPermissionByName('export-csv')) {
            this.formats.push({name: 'CSV', type: 'text/csv', ext: 'csv'});
        }
    }

    ngAfterViewInit() {

        // this.data.refs.modal.onHide.subscribe((data) => {
        //     debugger;
        //     this.closeModal();
        // });
        this.reset();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    onShowModal() {
    }

    onShownModal() {
    }

    /**
     * Hide modal
     */
    closeModal() {
        this.modalRef.hide();
        this.reset();
    }

    reset() {
        this.toggleOverlay(false);
        this.blob = null;
        this.currentStep = this.firstStep;
        this.isAllExport = true;
        this.selectedFormat = this.defaultSelectedFormat;
        this.setFormat(this.selectedFormat);
        this.errorMsg = null;
    }

    setFormat(format) {
        this.selectedFormat = format;
        let sfo = this.formats.filter((el, k) => {
            return el.name === this.selectedFormat;
        });
        this.selectedFormatObject = sfo[0];
    }

    isAll(val: boolean) {
        this.isAllExport = val;
        this.cdr.markForCheck();
    }

    //
    loadStep(stepNumber): Observable<Subscription> {
        let self = this;

        return new Observable((observer: any) => {
            if (stepNumber === 0) {

            } else if (stepNumber === 1) {
                let model = this.getExportModel();
                if(!this.useCustomApiUrl) {
                    if (!model.Text && model.SearchCriteria.length === 0) {
                        self.errorMsg = self.translate.instant('export.empty_params');
                        observer.error();
                        return;
                    }
                }

                if (self.getSlickGridData().length === 0) {
                    self.errorMsg = self.translate.instant('export.empty_results');
                    observer.error();
                    return;
                }

                self.toggleOverlay(true);
                self.service.getExportData(model, {customApiUrl: this.customApiUrl, useCustomApiUrl: this.useCustomApiUrl}).subscribe((resp: Blob) => {
                    self.errorMsg = null;
                    self.blob = resp;
                    observer.next();
                }, (err: HttpErrorResponse) => {
                    self.toggleOverlay(false);
                    self.notificationRef.notifyShow(2, err.statusText);
                    // self.cdr.detectChanges();
                    self.closeModal();
                    observer.complete();
                    // observer.error(err.statysText);
                    // observer.error();
                    // return;
                    // let fr = new FileReader();
                    // let self = this;
                    // fr.onload = function () {
                    //     self.errorMsg = err.error.Message;
                    //     observer.error();
                    //     return;
                    // };
                    // fr.readAsText(err._body);
                }, () => {
                    observer.complete();
                });
            }
        });
    }

    getSlickGridData(): SlickGridTreeRowData[] {
        let sgp: SlickGridProvider;
        if (this.modalData.context) {
            sgp = this.modalData.context.slickGridProvider;
        } else {
            sgp = (<CoreSearchComponent>this.provider.componentContext).slickGridComp.provider;
        }
        let data: SlickGridTreeRowData[] = sgp ? sgp.getData() : [];

        return data;
    }

    getExportModel(): ExportModelType {
        let sgp: SlickGridProvider;
        let vp: ViewsProvider;
        if (this.modalData.context) {
            sgp = this.modalData.context.slickGridProvider;
            vp = this.modalData.context.viewsProvider;
        } else {
            sgp = (<CoreSearchComponent>this.provider.componentContext).slickGridComp.provider;
            vp = (<CoreSearchComponent>this.provider.componentContext).viewsComp.provider;
        }
        const searchType = sgp.module.exportPath;
        let model: any = sgp.lastRequestForSearch ? sgp.lastRequestForSearch : sgp.getRequestForSearch();
        model.ExportType = this.selectedFormat;
        model.View = this.getActualView(sgp, vp);
        model.SearchType = searchType;
        if (this.isAllExport) {
            model.Page = -1;
        } else {
            model.Page = sgp.PagerProvider.getCurrentPage();
        }

        return (<ExportModelType>model);
    }
    getExportModelFromDetail(): ExportModelType {
        let sgp: SlickGridProvider;
        let vp: ViewsProvider;
        if (this.modalData.context) {
            sgp = this.modalData.context.slickGridProvider;
            vp = this.modalData.context.viewsProvider;
        } else {
            sgp = (<CoreSearchComponent>this.provider.componentContext).slickGridComp.provider;
            vp = (<CoreSearchComponent>this.provider.componentContext).viewsComp.provider;
        }

        let model: any = {};
        model.ExportType = this.selectedFormat;
        model.View = this.getActualView(sgp, vp);

        return (<any>model);
    }

    downloadFile() {
        if (this.blob) {
            let date = new Date();
            let cDateStr = date.toString();
            let dateStr = date.getFullYear() +
                '-' + (date.getMonth() + 1) +
                '-' + date.getDate() +
                '-' + date.getHours() + 'h' +
                '-' + date.getMinutes() + 'm' +
                '-' + date.getSeconds() + 's' +
                '-' + cDateStr.substr(cDateStr.indexOf('GMT') + 4, 4);
            FileSaver.saveAs(this.blob, location.hash.substr(2) + '_export' + '_' + dateStr + '.' + this.selectedFormatObject.ext);
            this.modalRef.hide();
        } else {
            this.goToPreviousStep();
        }
    }

    //
    goToPreviousStep() {
        if (this.currentStep <= this.firstStep) {
            return;
        }

        this.currentStep--;
        this.toggleOverlay(false);
    }

    //
    goToNextStep() {
        if (this.currentStep >= this.lastStep) {
            return;
        }
        let nextStep = this.currentStep + 1;
        this.loadStep(nextStep).subscribe(() => {
            // success step
            this.currentStep++;
            this.toggleOverlay(false);
        }, () => {
            // error step
            this.toggleOverlay(false);
        });
    }

    toggleOverlay(bShow) {
        if (!bShow) {
            this.overlay.hide($(this.wrapper.nativeElement));
        } else {
            this.overlay.showWithoutButton($(this.wrapper.nativeElement));
        }
        this.cdr.markForCheck();
    }

    private getActualView(sgp: SlickGridProvider, vp: ViewsProvider): ViewType {
        const currentView: ViewType = vp.currentViewsState.viewObject;
        const actualColumns = sgp.getActualColumns();
        let actualView: ViewType = currentView;
        let tmp = [];
        actualView.ColumnData = {};
        $.each(actualColumns, (acKey: string, acCol: SlickGridColumn) => {
            if (acCol.field === '*') {
                return true;
            }

            tmp[acCol.id] = {
                Tag: acCol.field,
                Index: acCol.__col ? acCol.__col.Index : acCol.id,
                Width: acCol.width,
                Label: acCol.name
            };
        });

        $.each(tmp, (k, acCol) => {
            if(acCol) {
                actualView.ColumnData[acCol.Tag] = acCol;
            }
        });

        return actualView;

    }
}
