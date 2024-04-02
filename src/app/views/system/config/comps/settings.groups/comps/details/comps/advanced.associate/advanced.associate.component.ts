/**
 * Created by IvanBanan 10.10.2019.
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SearchAdvancedConfig } from '../../../../../../../../../modules/search/advanced/search.advanced.config';
import { SearchAdvancedProvider } from '../../../../../../../../../modules/search/advanced/providers/search.advanced.provider';
import { SlickGridResp } from '../../../../../../../../../modules/search/slick-grid/types';
import { forkJoin, Subscription } from 'rxjs';
import { AdvancedSearchGroupRef } from '../../../../../../../../../modules/search/advanced/types';
import { SearchModel } from '../../../../../../../../../models/search/common/search';
import { BaseSearchModel } from '../../../../../../../../../models/search/common/base.search';
import { AdvancedSearchModel } from '../../../../../../../../../models/search/common/advanced.search';

import { NotificationService } from '../../../../../../../../../modules/notification/services/notification.service';
import { SlickGridService } from '../../../../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { MappingSlickGridProvider } from '../../../../../../../../mapping/providers/mapping.slick.grid.provider';
import { SettingsGroupsService } from '../../../../../../../../../services/system.config/settings.groups.service';
import { SearchAdvancedComponent } from '../../../../../../../../../modules/search/advanced/search.advanced';
import { MappingAdvSetupProvider } from "./providers/mapping.adv.provider";
import { lazyModules } from '../../../../../../../../../app.routes';
import { UsersComponent } from '../../../../../../../../../modules/search/users/users';
import { IMFXModalEvent } from '../../../../../../../../../modules/imfx-modal/types';
import { IMFXModalProvider } from '../../../../../../../../../modules/imfx-modal/proivders/provider';
import { ColumnsOrderComponent } from '../../../../../../../../../modules/search/columns-order/columns.order';
import { ColumnsOrderService } from '../../../../../../../../../modules/search/columns-order/services/columns.order.service';
import { SettingsGroupType } from '../../../../../../types';
import { SearchTypesType } from '../../../../../../../../../services/system.config/search.types';


@Component({
    selector: 'settings-groups-advanced-associate',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SettingsGroupsService,
        SearchAdvancedProvider,
        MappingAdvSetupProvider,
        SlickGridService,
        // {provide: SearchAdvancedProvider, useClass: MappingAdvSetupProvider},
        {provide: 'MappingAdvSetupMediaProvider', useClass: MappingAdvSetupProvider},
        {provide: 'MappingAdvSetupVersionProvider', useClass: MappingAdvSetupProvider},
        MappingSlickGridProvider,
        ColumnsOrderService
    ]
})

export class SettingsGroupsAdvancedAssociateComponent {
    get associateMediaMediaColumnsOrderSettings() {
        return this._associateMediaMediaColumnsOrderSettings;
    }

    get associateMediaVersionColumnsOrderSettings() {
        return this._associateMediaVersionColumnsOrderSettings;
    }
    public activeTab: 'version' | 'media' = 'version';
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
    public searchAdvancedConfigVersion = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'Version',
            enabledQueryByExample: false,
            enabledAddMultipleGroups: true,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder',
            allowSaveSearchParams: false,
            allowClearSearchParams: false
        }
    };
    public isDataLoaded: boolean = true; // then async calls have ended.
    @Input('advancedSchemaSettings') public advancedSchemaSettings;
    public searchAdvancedComponent: SearchAdvancedComponent;
    public searchAdvancedConfig: SearchAdvancedConfig;
    // @Output('changedAdvancedAssociateSettings') private changedAdvancedAssociateSettings: EventEmitter<any> = new EventEmitter<any>();
    @Input('advancedMediaAssociateSettings') private advancedMediaAssociateSettings;
    @Input('advancedVersionAssociateSettings') private advancedVersionAssociateSettings;
    @Input('advancedMediaAssociateSavedSearchId') private advancedMediaAssociateSavedSearchId;
    @Input('advancedVersionAssociateSavedSearchId') private advancedVersionAssociateSavedSearchId;
    @Input('wfRiseSettings') private wfRiseSettings;
    @Input('settingsGroup') private settingsGroup: SettingsGroupType;
    @Input('associateMediaVersionColumnsOrderSettings') private _associateMediaVersionColumnsOrderSettings;
    @Input('associateMediaMediaColumnsOrderSettings') private _associateMediaMediaColumnsOrderSettings;
    @ViewChild('resultPanelMedia', {static: false}) private resultPanelMediaEl: ElementRef;
    @ViewChild('resultPanelVersion', {static: false}) private resultPanelVersionEl: ElementRef;
    @ViewChild('searchAdvancedComponentMedia', {static: false}) private searchAdvancedComponentMedia: SearchAdvancedComponent;
    @ViewChild('searchAdvancedComponentVersion', {static: false}) private searchAdvancedComponentVersion: SearchAdvancedComponent;
    private dataMedia: SlickGridResp;
    private dataVersion: SlickGridResp;
    // private adv_key: string = 'associate.advanced_search.version.setups';
    private wf_key: string = null;
    private readonly emptyData: SlickGridResp = {
        Rows: 0,
        Data: []
    };
    private onSelectSavedSearchMediaSbs: Subscription;
    private onSelectSavedSearchVersionSbs: Subscription;

    constructor(private cdr: ChangeDetectorRef,
                private notificationRef: NotificationService,
                @Inject('MappingAdvSetupMediaProvider') private msap: MappingAdvSetupProvider,
                @Inject('MappingAdvSetupVersionProvider') private vsap: MappingAdvSetupProvider,
                private injector: Injector,
                private sgs: SlickGridService,
                private mappingProvider: MappingSlickGridProvider,
                private modalProvider: IMFXModalProvider,
    ) {
        this.wf_key = this.mappingProvider.wf_key;
        this.resetData('media');
        this.resetData('version');
        this.searchAdvancedConfigMedia.options.provider = msap;
        this.searchAdvancedConfigVersion.options.provider = vsap;
    };

    ngOnInit() {

    }

    ngOnChanges(simpleChangesObj) {
        if (simpleChangesObj.versionCreationSettings) {
            // this.advancedAssociateSettings = (!$.isEmptyObject(simpleChangesObj.versionCreationSettings.currentValue))
            //     ? simpleChangesObj.versionCreationSettings.currentValue
            //     : this.getDefault();
            // this.availableVersionNames = this.advancedAssociateSettings.availableVersionNames;
        }
    }

    getDefault() {
        return {
            availableVersionNames: []
        };
    }

    public getAdvancedAssociateSettings(type: 'media' | 'version') {
        const advProvider = type === 'media' ? this.msap : this.vsap;
        const advancedAssociateSettings = advProvider.getModelsPreparedToRequest();
        return (this.getIsValidAdvSchema(type)) ? advancedAssociateSettings : null;
    }

    public getAdvancedAssociateSavedSearchSettings(): { media: number, version: number } {
        return {
            version: this.advancedVersionAssociateSavedSearchId,
            media: this.advancedMediaAssociateSavedSearchId
        }
    }

    public getWfRiseSettings() {
        return this.mappingProvider.raiseWFsettings
    }

    ngAfterViewInit() {
        const advMedia = this.searchAdvancedComponentMedia;
        const advVersion = this.searchAdvancedComponentVersion;
        this.tab('version');
        if (advMedia.isDataLoaded && advVersion.isDataLoaded) {
            this.doInit();
        } else {
            forkJoin([advMedia.onReady, advVersion.onReady]).subscribe(() => {
                this.doInit();
            });
        }
    }

    doInit() {
        const mediaAdvSetups = this.advancedMediaAssociateSettings;
        const versionAdvSetups = this.advancedVersionAssociateSettings;
        if (!$.isEmptyObject(mediaAdvSetups)) {
            // advSetups = <LoggerData>JSON.parse(advSetups.DATA);
            let structs: Array<AdvancedSearchGroupRef> = this.msap.turnCriteriasToStructures(mediaAdvSetups);
            this.msap.buildStructure(structs);
            if (this.advancedMediaAssociateSavedSearchId != undefined) {
                this.searchAdvancedComponentMedia.searchSavedModuleRef.setSelected(this.advancedMediaAssociateSavedSearchId);
            }

            this.cdr.markForCheck();
        }
        if (!$.isEmptyObject(versionAdvSetups)) {
            // advSetups = <LoggerData>JSON.parse(advSetups.DATA);
            let structs: Array<AdvancedSearchGroupRef> = this.vsap.turnCriteriasToStructures(versionAdvSetups);
            this.vsap.buildStructure(structs);
            if (this.advancedVersionAssociateSavedSearchId != undefined) {
                this.searchAdvancedComponentVersion.searchSavedModuleRef.setSelected(this.advancedVersionAssociateSavedSearchId);
            }
            this.cdr.markForCheck();
        }

        let wfSetups = this.wfRiseSettings;
        if (!$.isEmptyObject(wfSetups)) {
            this.mappingProvider.raiseWFsettings = $.extend(true, {}, wfSetups);
            this.cdr.markForCheck();
        }


        if (this.onSelectSavedSearchVersionSbs && this.onSelectSavedSearchVersionSbs.unsubscribe) {
            this.onSelectSavedSearchVersionSbs.unsubscribe();
        }
        if (this.onSelectSavedSearchMediaSbs && this.onSelectSavedSearchMediaSbs.unsubscribe) {
            this.onSelectSavedSearchMediaSbs.unsubscribe();
        }
        this.onSelectSavedSearchMediaSbs = this.searchAdvancedComponentMedia.searchSavedModuleRef.onSelect.subscribe((data: { id: number }) => {
            this.advancedMediaAssociateSavedSearchId = data.id;
        });

        this.onSelectSavedSearchVersionSbs = this.searchAdvancedComponentVersion.searchSavedModuleRef.onSelect.subscribe((data: { id: number }) => {
            this.advancedVersionAssociateSavedSearchId = data.id;
        });

        this.cdr.detectChanges();
    }

    refreshData(type: 'media' | 'version') {
        const advProvider = type === 'media' ? this.msap : this.vsap;
        const searchType = type === 'media' ? 'Media' : 'versions';
        // if (!advProvider.isValidStructureFlag.builder) {
        //     return false;
        // }
        if (!this.getIsValidAdvSchema(type)) {
            return;
        }

        let searchModel = new SearchModel();
        let baseSearchModel = new BaseSearchModel();
        baseSearchModel.setValue('');
        searchModel.setBase(baseSearchModel);
        searchModel.setAdvanced(advProvider.getModels());

        if (type === 'media') {
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
            if (type === 'media') {
                this.dataMedia = {...resp};
            } else {
                this.dataVersion = {...resp};
            }
            // this.data = {...resp};
            this.isDataLoaded = true;
            this.cdr.detectChanges();
        }, () => {
        });
    }

    public getIsValidAdvSchema(type: 'media' | 'version') {
        const advProvider = type === 'media' ? this.msap : this.vsap;
        return advProvider.isValidStructureFlag.builder === true || advProvider.isValidStructureFlag.builder === null;
    }

    public onOkChooseModalCallBack = () => {
        this.cdr.detectChanges();
    };

    chooseModalCallBacks = {
        'ok': this.onOkChooseModalCallBack
    };

    setupColumns(searchType: string, prefix: 'associate.version'|'associate.media') {
        let setups = null;
        if (prefix === 'associate.version') {
            setups = this._associateMediaVersionColumnsOrderSettings;
        } else if (prefix === 'associate.media') {
            setups = this._associateMediaMediaColumnsOrderSettings;
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
                    if (prefix === 'associate.version') {
                        this._associateMediaVersionColumnsOrderSettings = comp.config.selected;
                    } else if (prefix === 'associate.media') {
                        this._associateMediaMediaColumnsOrderSettings = comp.config.selected;
                    }

                    modal.hide();
                }
            })
        });
    }

    tab(tab: 'version' | 'media') {
        this.activeTab = tab;
        if (tab === 'version') {
            this.searchAdvancedComponent = this.searchAdvancedComponentVersion;
            this.searchAdvancedConfig = this.searchAdvancedConfigVersion;
            // this.loadComponent();
        } else if (tab === 'media') {
            this.searchAdvancedComponent = this.searchAdvancedComponentMedia;
            this.searchAdvancedConfig = this.searchAdvancedConfigMedia;
            // this.loadComponent();
        }
    }

    private resetData(type: 'media' | 'version') {
        if (type === 'media') {
            this.dataMedia = {...this.emptyData};
        } else {
            this.dataVersion = {...this.emptyData};
        }
    }

    private clearParams(type: 'media' | 'version') {
        const compRef: SearchAdvancedComponent = type === 'media' ? this.searchAdvancedComponentMedia : this.searchAdvancedComponentVersion;
        compRef.clearParams();
    }
}
