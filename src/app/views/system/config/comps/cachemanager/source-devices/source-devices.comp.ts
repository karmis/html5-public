import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { CacheManagerSourceDevicesViewsProvider } from './providers/cm.sd.views.provider';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { IMFXModalProvider } from '../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from '../../../../../../app.routes';
import { CacheManagerCommonComponent } from '../common/cm.common';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../modules/controls/select2/imfx.select2.lookups';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from '../common/cm.common.service';
import { CacheManagerSourceDevicesModal } from './modals/cm.sd.modal/cm.sd.modal';
import { CacheManagerCommonProvider } from '../common/cm.common.provider';
import { CacheManagerCommonViewsProvider } from '../common/cm.common.views.provider';
import { CacheManagerCommonSlickGridProvider } from '../common/cm.common.slickgrid.provider';
import { CacheManagerDestinationDevicesViewsProvider } from '../destination-devices/providers/cm.dd.views.provider';

@Component({
    selector: 'cm-sd-comp',
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
        CacheManagerDestinationDevicesViewsProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: CacheManagerSourceDevicesViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
    ]
})
export class CacheManagerSourceDevicesComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChild('presetsControl', {static: false}) public presetsControl: IMFXControlsLookupsSelect2Component;
    public listName: CacheManagerAvailableTypes = 'sourcedevices';
    public saveName: CacheManagerAvailableTypes = 'sourcedevice';

    constructor(public injector: Injector) {
        super(injector);
    };

    showModal(data = null) {
        super._showModal(lazyModules.cm_sd_modal, CacheManagerSourceDevicesModal, data, this.getModalTitle);
    }


    getModalTitle(data) {
        return data.isNew ? 'cachemanager.sd.add_title' : 'cachemanager.sd.edit_title';
    }
}
