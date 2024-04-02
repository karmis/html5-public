import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { SlickGridProvider } from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { IMFXModalProvider } from '../../../../../../modules/imfx-modal/proivders/provider';
import { lazyModules } from '../../../../../../app.routes';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../modules/controls/select2/imfx.select2.lookups';
import { CacheManagerCommonProvider } from '../../cachemanager/common/cm.common.provider';
import { CacheManagerAvailableTypes, CacheManagerCommonService } from '../../cachemanager/common/cm.common.service';
import { CacheManagerCommonViewsProvider } from '../../cachemanager/common/cm.common.views.provider';
import { CacheManagerCommonSlickGridProvider } from '../../cachemanager/common/cm.common.slickgrid.provider';
import { CacheManagerCommonComponent } from '../../cachemanager/common/cm.common';
import { MisrTemplatesViewsProvider } from './providers/misr.templates.views.provider';
import { MisrTemplatesModal } from './modals/misr.templates.modal/misr.templates.modal';
import { MisrCommonService } from '../common/misr.common.service';

@Component({
    selector: 'misr-templates-comp',
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
        CacheManagerCommonViewsProvider,
        CacheManagerCommonSlickGridProvider,
        MisrTemplatesViewsProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: MisrTemplatesViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
        MisrCommonService,
        {provide: CacheManagerCommonService, useClass: MisrCommonService},
    ]
})
export class MisrTemplateComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChild('presetsControl', {static: false}) public presetsControl: IMFXControlsLookupsSelect2Component;
    public listName: CacheManagerAvailableTypes = 'TM_CFG_MISR';
    public saveName: CacheManagerAvailableTypes = 'TM_CFG_MISR';

    constructor(public injector: Injector) {
        super(injector);
    };

    processTable(res, self, isReload) {
        if (!isReload) {
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
        super._showModal(lazyModules.misr_templates_modal, MisrTemplatesModal, data, this.getModalTitle, 'xl');
    }


    getModalTitle(data) {
        return data.isNew ? 'misrmanager.templates.title' : 'misrmanager.templates.title';
    }
}
