import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { CacheManagerChannelTemplatesViewsProvider } from './providers/cm.ct.views.provider';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { IMFXModalProvider } from '../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from '../../../../../../app.routes';
import { CacheManagerChannelTemplatesModal } from './modals/cm.ct.modal/cm.ct.modal';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../modules/controls/select2/imfx.select2.lookups';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from '../common/cm.common.service';
import { CacheManagerCommonComponent } from '../common/cm.common';
import { CacheManagerCommonProvider } from '../common/cm.common.provider';
import { CacheManagerCommonViewsProvider } from '../common/cm.common.views.provider';
import { CacheManagerCommonSlickGridProvider } from '../common/cm.common.slickgrid.provider';

@Component({
    selector: 'ch_tmp_comp',
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
        CacheManagerChannelTemplatesViewsProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: CacheManagerChannelTemplatesViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
    ]
})
export class CacheManagerChannelTemplatesComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChild('presetsControl', {static: false}) public presetsControl: IMFXControlsLookupsSelect2Component;
    public listName: CacheManagerAvailableTypes = 'channeltemplates';
    public saveName: CacheManagerAvailableTypes = 'channeltemplate';
    public injectedDataMap: { [key: string]: any } = {};

    constructor(public injector: Injector) {
        super(injector);
    };

    processTable(res, self, isReload) {
        if (!isReload) {
            this.injectedDataMap = {
                context: this,
                injector: this.injector,
                translate: this.translate,
                TvStandardsLookup: this.res.TvStandardsLookup,
                MediaFileTypeLookup: this.res.MediaFileTypeLookup,
                SrcDevicesPromo: this.res.AvailableSourceDevices,
                SrcDevices: this.res.AvailableSourceDevices,
                DestDevices: this.res.AvailableDestDevices
            };
            this.data.tableColumns = this.viewsProvider.getCustomColumns(null, res, this.injectedDataMap);
        }

        this.data.tableRows = res.Templates;
        this.bindDataToGrid(isReload);
    }

    showModal(data = null) {
        super._showModal(lazyModules.cm_ct_modal, CacheManagerChannelTemplatesModal, data, this.getModalTitle, 'md');
    }


    getModalTitle(data) {
        return data.isNew ? 'cachemanager.ct.add_title' : 'cachemanager.ct.edit_title';
    }
}
