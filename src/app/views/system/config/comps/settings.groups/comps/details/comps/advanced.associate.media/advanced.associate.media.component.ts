/**
 * Created by IvanBanan 05.03.2020.
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentRef,
    ElementRef,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SearchAdvancedConfig} from '../../../../../../../../../modules/search/advanced/search.advanced.config';
import {SearchAdvancedProvider} from '../../../../../../../../../modules/search/advanced/providers/search.advanced.provider';
import {SlickGridResp} from '../../../../../../../../../modules/search/slick-grid/types';
import {forkJoin, Subscription} from 'rxjs';
import {AdvancedSearchGroupRef} from '../../../../../../../../../modules/search/advanced/types';
import {SearchModel} from '../../../../../../../../../models/search/common/search';
import {BaseSearchModel} from '../../../../../../../../../models/search/common/base.search';
import {AdvancedSearchModel} from '../../../../../../../../../models/search/common/advanced.search';

import {NotificationService} from '../../../../../../../../../modules/notification/services/notification.service';
import {SlickGridService} from '../../../../../../../../../modules/search/slick-grid/services/slick.grid.service';
import {SettingsGroupsService} from '../../../../../../../../../services/system.config/settings.groups.service';
import {SearchAdvancedComponent} from '../../../../../../../../../modules/search/advanced/search.advanced';
import {AssociateMediaAdvSetupProvider} from "./providers/associate.media.adv.provider";
import { MediaAssociateSlickGridProvider } from '../../../../../../../../media-associate/providers/media-associate.slick.grid.provider';
import { lazyModules } from '../../../../../../../../../app.routes';
import {
    ColumnsOrderComponent,
    ColumnsOrderModalConfigType
} from '../../../../../../../../../modules/search/columns-order/columns.order';
import { IMFXModalProvider } from '../../../../../../../../../modules/imfx-modal/proivders/provider';
import { SettingsGroupType } from '../../../../../../types';
import { IMFXModalEvent } from '../../../../../../../../../modules/imfx-modal/types';


@Component({
    selector: 'settings-groups-advanced-associate-media',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SettingsGroupsService,
        SearchAdvancedProvider,
        AssociateMediaAdvSetupProvider,
        SlickGridService,
        // {provide: SearchAdvancedProvider, useClass: MappingAdvSetupProvider},
        {provide: 'AssociateMediaAdvSetupMediaProvider', useClass: AssociateMediaAdvSetupProvider},
        {provide: 'AssociateMediaAdvSetupUnassociatedMediaProvider', useClass: AssociateMediaAdvSetupProvider},
        MediaAssociateSlickGridProvider
    ]
})

export class SettingsGroupsAdvancedAssociateMediaComponent {
    get associateMediaAssocColumnsOrderSettings() {
        return this._associateMediaAssocColumnsOrderSettings;
    }
    get associateMediaUnAssocColumnsOrderSettings() {
        return this._associateMediaUnAssocColumnsOrderSettings;
    }
    public activeTab: 'version' | 'unassociated-media' | 'media' | string = 'media';
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfigUnassociatedMedia = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'Media',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            enabledAddMultipleGroups: true,
            advancedSearchMode: 'builder',
            allowSaveSearchParams: false,
            allowClearSearchParams: false
        }
    };
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfigMedia = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'Media',
            enabledQueryByExample: false,
            enabledAddMultipleGroups: true,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder',
            allowSaveSearchParams: false,
            allowClearSearchParams: false
        }
    };
    public isDataLoaded: boolean = true; // then async calls have ended.
    // @Output('changedAdvancedAssociateSettings') public changedAdvancedAssociateSettings: EventEmitter<any> = new EventEmitter<any>();
    @Input('advancedUnasMediaAssociateMediaSettings') public advancedUnasMediaAssociateMediaSettings;
    @Input('advancedMediaAssociateMediaSettings') public advancedMediaAssociateMediaSettings;
    @Input('advancedUnasMediaAssociateMediaSavedSearchId') public advancedUnasMediaAssociateMediaSavedSearchId;
    @Input('advancedMediaAssociateMediaSavedSearchId') public advancedMediaAssociateMediaSavedSearchId;
    @Input('associateMediaWFRiseSettings') public associateMediaWFRiseSettings;
    @Input('associateMediaUnAssocColumnsOrderSettings') public _associateMediaUnAssocColumnsOrderSettings;
    @Input('associateMediaAssocColumnsOrderSettings') public _associateMediaAssocColumnsOrderSettings;
    @Input('settingsGroup') public settingsGroup: SettingsGroupType;
    // @ViewChild('resultPanelUnassociatedMedia') public resultPanelUnassociatedMediaEl: ElementRef;
    // @ViewChild('resultPanelMedia') public resultPanelMediaEl: ElementRef;
    @ViewChild('searchAdvancedComponentUnassociatedMedia', {static: false}) public searchAdvancedComponentUnassociatedMedia: SearchAdvancedComponent;
    @ViewChild('searchAdvancedComponentMedia', {static: false}) public searchAdvancedComponentMedia: SearchAdvancedComponent;
    public dataUnassociatedMedia: SlickGridResp;
    public dataMedia: SlickGridResp;
    // private adv_key: string = 'associate.advanced_search.version.setups';
    public wf_key: string = null;
    public readonly emptyData: SlickGridResp = {
        Rows: 0,
        Data: []
    };

    constructor(public cdr: ChangeDetectorRef,
                public notificationRef: NotificationService,
                @Inject('AssociateMediaAdvSetupUnassociatedMediaProvider') public umasp: AssociateMediaAdvSetupProvider,
                @Inject('AssociateMediaAdvSetupMediaProvider') public masp: AssociateMediaAdvSetupProvider,
                public injector: Injector,
                public sgs: SlickGridService,
                public mediaAssociateProvider?: MediaAssociateSlickGridProvider,
                public modalProvider?: IMFXModalProvider,
    ) {
        if(this.mediaAssociateProvider)
            this.wf_key = this.mediaAssociateProvider.wf_key;
        this.resetData('media');
        this.resetData('unassociated-media');
        this.searchAdvancedConfigUnassociatedMedia.options.provider = umasp;
        this.searchAdvancedConfigMedia.options.provider = masp;
    };

    ngOnInit() {

    }

    public getAdvancedAssociateMediaSettings(type: 'media' | 'unassociated-media') {
        const advProvider = type === 'unassociated-media' ? this.umasp : this.masp;
        const advancedAssociateSettings = advProvider.getModelsPreparedToRequest();
        return (this.getIsValidAdvSchema(type)) ? advancedAssociateSettings : null;
    }

    public getAdvancedAssociateMediaSavedSearchSettings(): {'media': number, 'unassociated-media': number} {
        return {
            'unassociated-media': this.advancedUnasMediaAssociateMediaSavedSearchId,
            'media': this.advancedUnasMediaAssociateMediaSavedSearchId,
        }
    }

    public getAssociatedMediaWFRiseSettings() {
        return this.mediaAssociateProvider.raiseWFsettings
    }

    ngAfterViewInit() {
        const advUnasMedia = this.searchAdvancedComponentUnassociatedMedia;
        const advMedia = this.searchAdvancedComponentMedia;
        this.tab('media');
        if (advUnasMedia.isDataLoaded && advMedia.isDataLoaded) {
            this.doInit();
        } else {
            forkJoin([advUnasMedia.onReady, advMedia.onReady]).subscribe(() => {
                this.doInit();
            });
        }
    }


    public onSelectSavedSearchUnassociatedMediaSbs: Subscription;
    public onSelectSavedSearchMediaSbs: Subscription;
    doInit() {
        const unasMediaAdvSetups = this.advancedUnasMediaAssociateMediaSettings;
        const mediaAdvSetups = this.advancedMediaAssociateMediaSettings;
        if (!$.isEmptyObject(unasMediaAdvSetups)) {
            // advSetups = <LoggerData>JSON.parse(advSetups.DATA);
            let structs: Array<AdvancedSearchGroupRef> = this.umasp.turnCriteriasToStructures(unasMediaAdvSetups);
            this.umasp.buildStructure(structs);
            if(this.advancedUnasMediaAssociateMediaSavedSearchId != undefined) {
                this.searchAdvancedComponentUnassociatedMedia.searchSavedModuleRef.setSelected(this.advancedUnasMediaAssociateMediaSavedSearchId);
            }

            this.cdr.markForCheck();
        }
        if (!$.isEmptyObject(mediaAdvSetups)) {
            // advSetups = <LoggerData>JSON.parse(advSetups.DATA);
            let structs: Array<AdvancedSearchGroupRef> = this.masp.turnCriteriasToStructures(mediaAdvSetups);
            this.masp.buildStructure(structs);
            if(this.advancedMediaAssociateMediaSavedSearchId != undefined) {
                this.searchAdvancedComponentMedia.searchSavedModuleRef.setSelected(this.advancedMediaAssociateMediaSavedSearchId);
            }
            this.cdr.markForCheck();
        }

        let wfSetups = this.associateMediaWFRiseSettings;
        if (!$.isEmptyObject(wfSetups)) {
            this.mediaAssociateProvider.raiseWFsettings = $.extend(true, {}, wfSetups);
            this.cdr.markForCheck();
        }


        if(this.onSelectSavedSearchMediaSbs && this.onSelectSavedSearchMediaSbs.unsubscribe){
            this.onSelectSavedSearchMediaSbs.unsubscribe();
        }
        if(this.onSelectSavedSearchUnassociatedMediaSbs && this.onSelectSavedSearchUnassociatedMediaSbs.unsubscribe){
            this.onSelectSavedSearchUnassociatedMediaSbs.unsubscribe();
        }
        this.onSelectSavedSearchUnassociatedMediaSbs = this.searchAdvancedComponentUnassociatedMedia.searchSavedModuleRef.onSelect.subscribe((data: {id: number}) => {
            this.advancedUnasMediaAssociateMediaSavedSearchId = data.id;
        });

        this.onSelectSavedSearchMediaSbs = this.searchAdvancedComponentMedia.searchSavedModuleRef.onSelect.subscribe((data: {id: number}) => {
            this.advancedMediaAssociateMediaSavedSearchId = data.id;
        });

        this.cdr.detectChanges();
    }

    refreshData(type: 'media' | 'unassociated-media'| string) {
        const advProvider = type === 'unassociated-media' ? this.umasp : this.masp;
        const searchType = 'Media';
        // if (!advProvider.isValidStructureFlag.builder) {
        //     return false;
        // }
        if(!this.getIsValidAdvSchema(type)) {
            return;
        }

        let searchModel = new SearchModel();
        let baseSearchModel = new BaseSearchModel();
        baseSearchModel.setValue('');
        searchModel.setBase(baseSearchModel);
        searchModel.setAdvanced(advProvider.getModels());

        if (type === 'unassociated-media') {
            // common adv model for media
            let advModel = new AdvancedSearchModel();
            advModel.setDBField('pgm_parent_id');
            advModel.setField('pgm_parent_id');
            advModel.setOperation('=');
            advModel.setValue(0);
            searchModel.addAdvancedItem(advModel);
        }

        this.resetData(type);
        this.isDataLoaded = false;
        let obs = this.sgs.search(searchType, searchModel, 1).subscribe((resp: SlickGridResp) => {
            if (type === 'unassociated-media') {
                this.dataUnassociatedMedia = {...resp};
            } else {
                this.dataMedia = {...resp};
            }
            // this.data = {...resp};
            this.isDataLoaded = true;
            this.cdr.detectChanges();
        }, () => {
        });
    }

    public getIsValidAdvSchema(type: 'media' | 'unassociated-media' | string) {
        const advProvider = type === 'unassociated-media' ? this.umasp : this.masp;
        if (advProvider.isValidStructureFlag.builder === true || advProvider.isValidStructureFlag.builder === null) {
            return true;
        } else {
            return false;
        }
    }

    public onOkChooseModalCallBack = () => {
        this.cdr.detectChanges();
    };

    chooseModalCallBacks = {
        'ok': this.onOkChooseModalCallBack
    };


    public searchAdvancedComponent: SearchAdvancedComponent;
    public searchAdvancedConfig: SearchAdvancedConfig;
    tab(tab: 'media' | 'unassociated-media' | string) {
        this.activeTab = tab;
        if (tab === 'media') {
            this.searchAdvancedComponent = this.searchAdvancedComponentMedia;
            this.searchAdvancedConfig = this.searchAdvancedConfigMedia;
            // this.loadComponent();
        } else if (tab === 'unassociated-media') {
            this.searchAdvancedComponent = this.searchAdvancedComponentUnassociatedMedia;
            this.searchAdvancedConfig = this.searchAdvancedConfigUnassociatedMedia;
            // this.loadComponent();
        }
    }

    resetData(type: 'media' | 'unassociated-media' | string) {
        if (type === 'unassociated-media') {
            this.dataUnassociatedMedia = {...this.emptyData};
        } else {
            this.dataMedia = {...this.emptyData};
        }
    }

    clearParams(type: 'media' | 'unassociated-media' | string) {
        const compRef: SearchAdvancedComponent = type === 'unassociated-media' ? this.searchAdvancedComponentUnassociatedMedia : this.searchAdvancedComponentMedia;
        compRef.clearParams();
    }

    setupColumns(searchType: string, prefix: 'associate_media.associated'|'associate_media.unassociated' | string) {
        let setups = null;
        if (prefix === 'associate_media.associated') {
            setups = this._associateMediaAssocColumnsOrderSettings
        } else if (prefix === 'associate_media.unassociated') {
            setups = this._associateMediaUnAssocColumnsOrderSettings
        }
        const modal = this.modalProvider.showByPath(lazyModules.columns_order, ColumnsOrderComponent, {
            size: 'md',
            title: 'Select columns',
            position: 'center',
            footer: 'cancel|ok'
        }, {
            searchType: searchType,
            prefix: 'columns.order' + '.' + prefix + '.' + this.settingsGroup.ID,
            selected: setups||{}
        });

        modal.load().then((cr: ComponentRef<ColumnsOrderComponent>) => {
            const comp: ColumnsOrderComponent = cr.instance;
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    if (prefix === 'associate_media.associated') {
                        this._associateMediaAssocColumnsOrderSettings = comp.config.selected;
                    } else if (prefix === 'associate_media.unassociated') {
                        this._associateMediaUnAssocColumnsOrderSettings = comp.config.selected;
                    }

                    modal.hide();
                }
            })
        });
    }
}
