import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { IMFXModalProvider } from '../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from '../../../../../../app.routes';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../modules/controls/select2/imfx.select2.lookups';;
import { CacheManagerCommonProvider } from '../../cachemanager/common/cm.common.provider';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from '../../cachemanager/common/cm.common.service';
import { CacheManagerCommonViewsProvider } from '../../cachemanager/common/cm.common.views.provider';
import { CacheManagerCommonSlickGridProvider } from '../../cachemanager/common/cm.common.slickgrid.provider';
import { CacheManagerCommonComponent } from '../../cachemanager/common/cm.common';
import { MisrComponentsViewsProvider } from './providers/misr.components.views.provider';
import { MisrComponentsModal } from './modals/misr.components.modal/misr.components.modal';
import { MisrCommonService } from '../common/misr.common.service';

@Component({
    selector: 'misr-components-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        IMFXModalProvider,
        CacheManagerCommonProvider,
        CacheManagerCommonService,
        CacheManagerCommonViewsProvider,
        CacheManagerCommonSlickGridProvider,
        MisrComponentsViewsProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: MisrComponentsViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
        MisrCommonService,
        {provide: CacheManagerCommonService, useClass: MisrCommonService},
    ]
})
export class MisrComponentsComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChild('presetsControl', {static: false}) public presetsControl: IMFXControlsLookupsSelect2Component;
    public listName: CacheManagerAvailableTypes = 'TM_CFG_MISR_ITEMS';
    public saveName: CacheManagerAvailableTypes = 'TM_CFG_MISR_ITEMS';
    private storageMap: {[key:string]:any} = {};
    constructor(public injector: Injector) {
        super(injector);
    };

    processTable(res, self, isReload) {
        if (!isReload) {
            // Storage Devices
            (res.Data||[]).forEach((item, k) => {
                const storageDev = (res.Lookups.STORAGE_ID || []).find((lItem) => {
                    return lItem.ID == item.STORAGE_ID;
                });
                const mediaType = (res.Lookups.MEDIA_TYPE || []).find((lItem) => {
                    return lItem.ID == item.MEDIA_TYPE;
                });
                const mediaFileType = (res.Lookups.MI_FILE_TYPE || []).find((lItem) => {
                    return lItem.ID == item.MI_FILE_TYPE;
                });
                const usageType = (res.Lookups.USAGE_TYPE || []).find((lItem) => {
                    return lItem.ID == item.USAGE_TYPE;
                });
                const contentType = (res.Lookups.AUDIO_CONTENT_TYPE || []).find((lItem) => {
                    return lItem.ID == item.AUDIO_CONTENT_TYPE;
                });

                res.Data[k]['custom_STORAGE_ID_VAL'] = storageDev && storageDev.Name?storageDev.Name:'';
                res.Data[k]['custom_MEDIA_TYPE_VAL'] = mediaType && mediaType.Name?mediaType.Name:'';
                res.Data[k]['custom_MEDIA_FILE_TYPE_VAL'] = mediaFileType && mediaFileType.Name?mediaFileType.Name:'';
                res.Data[k]['custom_USAGE_TYPE_VAL'] = usageType && usageType.Name?usageType.Name:'';
                res.Data[k]['custom_AUDIO_CONTENT_TYPE_VAL'] = contentType && contentType.Name?contentType.Name:'';

            });
            //this.presetsControl.onReady.subscribe(() => {
            this.data.tableColumns = this.viewsProvider.getCustomColumns(null, res, {
                // purgePreset: this.presetsControl.getData(),
                context: this,
                injector: this.injector,
                translate: this.translate,
            });
            //});
        }

        this.data.tableRows = res.Data;
        this.bindDataToGrid(isReload);
    }

    showModal(data = null) {
        super._showModal(lazyModules.misr_components_modal, MisrComponentsModal, data, this.getModalTitle);
    }


    getModalTitle(data) {
        return data.isNew ? 'misrmanager.components.modal.add_title' : 'misrmanager.components.modal.edit_title';
    }
}
