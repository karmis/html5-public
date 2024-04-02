import { ChangeDetectionStrategy, Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { IMFXModalProvider } from '../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from '../../../../../../app.routes';
import { CacheManagerDestinationDevicesViewsProvider } from './providers/cm.dd.views.provider';
import { CacheManagerDestinationDevicesModal } from './modals/cm.dd.modal/cm.dd.modal';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../modules/controls/select2/imfx.select2.lookups';
import { CacheManagerCommonComponent } from '../common/cm.common';
import { CacheManagerCommonSlickGridProvider } from '../common/cm.common.slickgrid.provider';
import { CacheManagerCommonProvider } from '../common/cm.common.provider';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from '../common/cm.common.service';
import { CacheManagerCommonViewsProvider } from '../common/cm.common.views.provider';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'cm-dd-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridProvider,
        SlickGridService,
        IMFXModalProvider,
        CacheManagerCommonProvider,
        CacheManagerCommonService,
        CacheManagerCommonSlickGridProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: CacheManagerDestinationDevicesViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
    ]
})
export class CacheManagerDestinationDevicesComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChild('presetsControl', {static: false}) public presetsControl: IMFXControlsLookupsSelect2Component;
    public listName: CacheManagerAvailableTypes = 'destinationdevices';
    public saveName: CacheManagerAvailableTypes = 'destinationdevice';

    constructor(public injector: Injector) {
        super(injector);
    };

    processTableObs(res, self, isReload): Observable<any> {
        return new Observable((observer: any) => {
            if (!isReload) {
                this.presetsControl.onReady.subscribe(() => {
                    observer.next();
                    observer.complete()
                })
            }

            this.data.tableRows = res;
            this.bindDataToGrid(isReload);
        });
    }

    ngAfterViewInit() {
        this.bindDataToGrid(false);
        this.getTable(false);
        if (!this.slickGridComp) {
            return;
        }
        this.slickGridComp.onGridReady
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.slickGridComp.provider.onRowMouseDblClick.subscribe((data) => {
                    delete data.row.id;
                    this.doAction({
                        data: data.row
                    });
                });
                this.slickGridComp.provider.onSelectRow.subscribe((data) => {
                    if (data && data.length > 0 && this.gridReady) {
                        let row = this.slickGridComp.provider.getSelectedRow();
                        if (row) {
                            this.selectedData = {
                                field: "ID",
                                value: row["ID"]
                            }
                        }

                    }
                });
            });
    }

    public getTable(isReload: boolean = false) {
        this.gridReady = false;
        if (!isReload) {
            this.selectedData = null;
            this.cdr.detectChanges();
        }
        this.toggleOverlay(true);
        if (this.slickGridComp) {
            this.slickGridComp.provider.dataView.beginUpdate();
            if (this.datasetFilter && this.datasetFilter.nativeElement) {
                this.slickGridComp.provider.dataView.setFilter(this.filterByValue);
                this.slickGridComp.provider.dataView.setFilterArgs({
                    filter: $(this.datasetFilter.nativeElement).val().trim()
                });
            }
        }

        this.data.tableColumns = [];
        this.service.getList(this.listName)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                if (res) {
                    this.res = res;
                    this.tableData = res;
                    this.data.tableColumns = this.viewsProvider.getCustomColumns(null, res, {
                        purgePreset: this.presetsControl.getData(),
                        context: this,
                        injector: this.injector,
                        translate: this.translate,
                    });
                    this.processTableObs(res, self, isReload).subscribe(() => {
                        this.onGridLoaded(res);
                        this.toggleOverlay(false);
                        this.cdr.detectChanges();
                    });
                }
            });
    }


    showModal(data = null) {
        super._showModal(lazyModules.cm_dd_modal, CacheManagerDestinationDevicesModal, data, this.getModalTitle);
    }


    getModalTitle(data) {
        return data.isNew ? 'cachemanager.dd.add_title' : 'cachemanager.dd.edit_title';
    }
}
