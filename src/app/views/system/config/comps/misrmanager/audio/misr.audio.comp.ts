import {Component, ElementRef, Injector, ViewChild, ViewEncapsulation} from '@angular/core';
import {SlickGridProvider} from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import {SlickGridComponent} from '../../../../../../modules/search/slick-grid/slick-grid';
import {IMFXModalProvider} from '../../../../../../modules/imfx-modal/proivders/provider';
import {lazyModules} from '../../../../../../app.routes';
import {IMFXControlsLookupsSelect2Component} from '../../../../../../modules/controls/select2/imfx.select2.lookups';
import {CacheManagerCommonProvider} from '../../cachemanager/common/cm.common.provider';
import {CacheManagerAvailableTypes, CacheManagerCommonService} from '../../cachemanager/common/cm.common.service';
import {CacheManagerCommonViewsProvider} from '../../cachemanager/common/cm.common.views.provider';
import {CacheManagerCommonSlickGridProvider} from '../../cachemanager/common/cm.common.slickgrid.provider';
import {CacheManagerCommonComponent} from '../../cachemanager/common/cm.common';
import {MisrAudioViewsProvider} from './providers/misr.audio.views.provider';
import {MisrAudioService} from './service/misr.audio.service';
import {MisrChannelScheduleModal} from "./modals/misr.channel.schedule.modal/misr.channel.schedule.modal";
import {map} from "rxjs/operators";
import {HttpService} from "../../../../../../services/http/http.service";

@Component({
    selector: 'misr-audio-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        IMFXModalProvider,
        CacheManagerCommonProvider,
        CacheManagerCommonSlickGridProvider,
        {provide: CacheManagerCommonViewsProvider, useClass: MisrAudioViewsProvider},
        {provide: SlickGridProvider, useClass: CacheManagerCommonSlickGridProvider},
        {provide: CacheManagerCommonService, useClass: MisrAudioService},
    ]
})
export class MisrAudioComponent extends CacheManagerCommonComponent {
    @ViewChild('wrapper', {static: false}) public wrapper: ElementRef;
    @ViewChild('datasetFilter', {static: false}) public datasetFilter: ElementRef;
    @ViewChild('overlayGroup', {static: true}) public overlayGroup: any;
    @ViewChild('slickGridWrapper', {static: true}) public slickGridWrapper: any;
    @ViewChild('slickGridComp', {static: false}) public slickGridComp: SlickGridComponent;
    @ViewChild('presetsControl', {static: false}) public presetsControl: IMFXControlsLookupsSelect2Component;
    public listName: CacheManagerAvailableTypes = 'channels';
    public saveName: CacheManagerAvailableTypes = 'channels';

    constructor(
        public httpService: HttpService,
        public injector: Injector
    ) {
        super(injector);
    };

    // private storageMap: {[key:string]:any} = {};
    processTable(res, self, isReload) {
        if (!isReload) {
            (res.Data || []).forEach((item, k) => {
                const cmTemplate = (res.Lookups.CM_TEMPLATE_ID || []).find((lItem) => {
                    return lItem.ID == item.CM_TEMPLATE_ID;
                });
                const misrTemplateId = (res.Lookups.MISR_TEMPLATE_ID || []).find((lItem) => {
                    return lItem.ID == item.MISR_TEMPLATE_ID;
                });

                res.Data[k]['custom_CM_TEMPLATE_ID_VAL'] = cmTemplate && cmTemplate.Name ? cmTemplate.Name : '';
                res.Data[k]['custom_MISR_TEMPLATE_ID_VAL'] = misrTemplateId && misrTemplateId.Name ? misrTemplateId.Name : '';

            });
            //this.presetsControl.onReady.subscribe(() => {
            this.data.tableColumns = this.viewsProvider.getCustomColumns(null, res, {
                // purgePreset: this.presetsControl.getData(),
                // storageMap: this.storageMap,
                context: this,
                injector: this.injector,
                translate: this.translate,
            });
            //});
        }


        this.data.tableRows = res.Data;
        this.data.lookups = res.Lookups;
        this.bindDataToGrid(isReload);
    }

    showModal(data = null) {
        if (data) {
            this.httpService
                .get(
                    `/api/v3/config/misr/channelschedule/${data.data['CH_CODE']}`
                )
                .pipe(map((res: any) => {
                    return res.body;
                }))
                .subscribe((res) => {
                    // console.log('channelschedule',res);
                    this.data.channelScheduleData = res;
                    super._showModal(lazyModules.misr_channel_schedule_modal, MisrChannelScheduleModal, data, this.getModalTitle, 'lg');
                });
        }
    }

    getModalTitle(data) {
        return 'misrmanager.audio_subs.modal.edit_title';
    }
}
