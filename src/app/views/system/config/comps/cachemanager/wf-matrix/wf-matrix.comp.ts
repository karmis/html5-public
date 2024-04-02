import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Injector,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {SlickGridProvider} from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import {ViewsProvider} from '../../../../../../modules/search/views/providers/views.provider';
import {CacheManagerWfMatrixViewsProvider} from './providers/cm.wf_matrix.views.provider';
import {CacheManagerCommonComponent} from '../common/cm.common';
import {CacheManagerAvailableTypes, CacheManagerCommonService} from '../common/cm.common.service';
import {CacheManagerCommonProvider} from '../common/cm.common.provider';
import {CacheManagerCommonViewsProvider} from '../common/cm.common.views.provider';
import {CacheManagerCommonSlickGridProvider} from '../common/cm.common.slickgrid.provider';
import {SlickGridComponent} from '../../../../../../modules/search/slick-grid/slick-grid';
import {IMFXModalProvider} from '../../../../../../modules/imfx-modal/proivders/provider';
import {Select2ItemType} from '../../../../../../modules/controls/select2/types';
import {BasketService} from '../../../../../../services/basket/basket.service';
import {IMFXControlsSelect2Component} from '../../../../../../modules/controls/select2/imfx.select2';
import {NotificationService} from '../../../../../../modules/notification/services/notification.service';
import {takeUntil} from 'rxjs/operators';
import {ReplaySubject} from 'rxjs';
import {LookupReturnTypeForSelect2} from '../../../../../../services/lookup/lookup.service';

// {CM_DEST_ALIST: }
export type CMWFMatrixStruct = {};

@Component({
    selector: 'cm-wfmatrix-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        IMFXModalProvider,
        CacheManagerCommonProvider,
        CacheManagerCommonService,
        CacheManagerCommonViewsProvider,
        CacheManagerCommonSlickGridProvider,
        CacheManagerWfMatrixViewsProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: CacheManagerWfMatrixViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
    ]
})
export class CacheManagerWfMatrixComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChildren('controls') public controls: QueryList<IMFXControlsSelect2Component>;
    public listName: CacheManagerAvailableTypes = 'workflowmatrix';
    public saveName: CacheManagerAvailableTypes = 'workflowmatrix';
    public structRes: any = {};
    public destDevTexts: string[] = [];
    public presets: Select2ItemType[] = [];
    private slData = {};
    private dlData = {};
    private changes: { [key: string]: any } = {};
    private controlsObs: ReplaySubject<IMFXControlsSelect2Component>[] = [];

    constructor(public injector: Injector, public basketService: BasketService, public notificationRef: NotificationService) {
        super(injector);
    };

    ngAfterViewInit() {
        this.bindCustomScrollEvents();
        this.bindDataToGrid(false);
        this.getTable(false);
    }

    public getTable(isReload: boolean = false) {
        this.gridReady = false;
        this.toggleOverlay(true);
        if (!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.data.tableColumns = [];
        this.service.getList(this.listName)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                if (res) {
                    this.res = res;
                    this.tableData = res;
                    this.processTable(res, self, isReload);
                    this.onGridLoaded(res);
                }
            });
    }

    processTable(res, self, isReload) {
        this.lookupService.getLookupForSelect2Controls('order-presets', '/api/v3/').subscribe((res: LookupReturnTypeForSelect2) => {
            // this.data.tableRows = res;
            this.structRes = {};
            this.slData = this.res.SourceLookup || {};
            this.dlData = this.res.DestinationLookup || {};
            const matrix = this.res.Matrix || {};
            Object.keys(matrix).forEach((mKey) => {
                if (matrix[mKey] && matrix[mKey]['DST_ID'] != null && matrix[mKey]['SRC_ID'] != null) {
                    const mSrcId = matrix[mKey]['SRC_ID'];
                    const mDstId = matrix[mKey]['DST_ID'];
                    if (!this.structRes[mSrcId]) {
                        this.structRes[mSrcId] = [];
                    }
                    if (!this.structRes[mSrcId][mDstId]) {
                        this.structRes[mSrcId][mDstId] = [];
                    }
                    this.structRes[mSrcId][mDstId].push(matrix[mKey]);
                }
            });

            // this.destDevTexts = this.getDestDevs();
            //this.lookupService.getLookupForSelect2Controls('order-presets', '/api/v3/').subscribe((res: LookupReturnTypeForSelect2) => {
            this.presets = res.select2Items;
            this.toggleOverlay(false);
            this.cdr.markForCheck();
            //})


        })
    }

    save() {
        const data = [];
        this.controls.forEach((control: IMFXControlsSelect2Component, i) => {
            const additionalData = control.additionalData;
            const matrix = additionalData.matrix;
            matrix[additionalData.field] = control.getSelectedId();
            if (!data.includes(matrix)) { //exclude doubling
                data.push(matrix);
            }
        });
        if (!data.length) {
            this.notificationRef.notifyShow(1, this.translate.instant('cachemanager.common.save_success'));
            return;
        }

        this.service.save(this.saveName, data).subscribe((res) => {
            this.notificationRef.notifyShow(1, this.translate.instant('cachemanager.common.save_success'));
            this.changes = {};
        }, (err) => {
            this.notificationRef.notifyShow(1, this.translate.instant('cachemanager.common.save_error', {err: err.ErrorDetails}));
        });
    }

    public getAdditionalData(matrix, field) {
        return {
            matrix: matrix,
            field: field,
        }
    }

    @ViewChild('tableSideEl', {static: true}) tableSideEl: ElementRef;
    @ViewChild('contentSideEl', {static: true}) contentSideEl: ElementRef;
    @ViewChild('topSideEl', {static: true}) topSideEl: ElementRef;
    @ViewChild('leftSideEl', {static: true}) leftSideEl: ElementRef;

    bindCustomScrollEvents(){
        const tableEl = this.tableSideEl.nativeElement;
        const contentEl = this.contentSideEl.nativeElement;
        tableEl.addEventListener('wheel', (event => {
            event.stopPropagation();
            this.onTableSideWheel(event);
        }));
        contentEl.addEventListener('wheel', (event => {
            event.preventDefault();
            }));
        contentEl.addEventListener('scroll', (event => {
            this.onContentSideScroll(event);
        }));
    }

    onTableSideWheel(event) {
        const contentEl = this.contentSideEl.nativeElement;
        const leftEl = this.leftSideEl.nativeElement;
        const topEl = this.topSideEl.nativeElement;

        const deltaX = event.deltaX;
        const deltaY = event.deltaY;

        window.requestAnimationFrame(function() {
            contentEl.scrollLeft += deltaX;
            contentEl.scrollTop += deltaY;

            topEl.scrollLeft = contentEl.scrollLeft;
            leftEl.scrollTop = contentEl.scrollTop;
        });
    }

    onContentSideScroll(event) {
        const contentEl = this.contentSideEl.nativeElement;
        const leftEl = this.leftSideEl.nativeElement;
        const topEl = this.topSideEl.nativeElement;

        const deltaX = contentEl.scrollLeft - topEl.scrollLeft;
        const deltaY = contentEl.scrollTop - leftEl.scrollTop;

        contentEl.scrollLeft = topEl.scrollLeft;
        contentEl.scrollTop = leftEl.scrollTop;

        window.requestAnimationFrame(function() {
            contentEl.scrollLeft += deltaX;
            contentEl.scrollTop += deltaY;

            topEl.scrollLeft = contentEl.scrollLeft;
            leftEl.scrollTop = contentEl.scrollTop;
        });
    }
}
