import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
import { FolderViewsProvider } from './providers/views.provider';
// Form
import { SearchFormConfig } from '../../modules/search/form/search.form.config';
import { SearchFormProvider } from '../../modules/search/form/providers/search.form.provider';
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../modules/search/thumbs/search.thumbs.config';
import { SearchThumbsProvider } from '../../modules/search/thumbs/providers/search.thumbs.provider';
// Search Settings
import { SearchSettingsConfig } from '../../modules/search/settings/search.settings.config';
import { SearchColumnsService } from '../../modules/search/columns/services/search.columns.service';
import { SearchColumnsProvider } from '../../modules/search/columns/providers/search.columns.provider';
// Search Detail
import { DetailConfig } from '../../modules/search/detail/detail.config';
// Search Settings
import { SearchRecentConfig } from '../../modules/search/recent/search.recent.config';
import { SearchRecentProvider } from '../../modules/search/recent/providers/search.recent.provider';

import { SearchAdvancedConfig } from '../../modules/search/advanced/search.advanced.config';
import { SearchAdvancedProvider } from '../../modules/search/advanced/providers/search.advanced.provider';
// constants
import { MediaAppSettings } from './constants/constants';
import { AppSettingsInterface } from '../../modules/common/app.settings/app.settings.interface';
// search component
import { ConsumerSettingsTransferProvider } from '../../modules/settings/consumer/consumer.settings.transfer.provider';
import { TransferdSimplifedType } from '../../modules/settings/consumer/types';
import { ExportProvider } from '../../modules/export/providers/export.provider';
import { SearchSettingsProvider } from '../../modules/search/settings/providers/search.settings.provider';
import { SearchThumbsComponent } from '../../modules/search/thumbs/search.thumbs';
import { SlickGridComponent } from '../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../modules/search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../modules/search/slick-grid/services/slick.grid.service';
import { FolderSlickGridProvider } from './providers/folder.slick.grid.provider';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { IMFXModalProvider } from "../../modules/imfx-modal/proivders/provider";
import {AlertComponent, BsModalRef, BsModalService} from "ngx-bootstrap";
import { ViewsService } from "../../modules/search/views/services/views.service";
import { SearchViewsComponent } from "../../modules/search/views/views";
import { SecurityService } from "../../services/security/security.service";
import { InfoPanelProvider } from '../../modules/search/info-panel/providers/info.panel.provider';
import { InfoPanelConfig } from '../../modules/search/info-panel/info.panel.config';
import { InfoPanelComponent } from '../../modules/search/info-panel/info.panel.component';
import { RaiseWorkflowWizzardProvider } from '../../modules/rw.wizard/providers/rw.wizard.provider';
import { MediaService } from '../../services/media/media.service';
import { FacetsConfig } from '../../modules/search/facets1/models/facets.config';
import { FacetsService } from '../../modules/search/facets1/facets.service';
import { FacetsStore } from '../../modules/search/facets1/store/facets.store';
import { SearchGroupProvider } from '../../modules/search/group/providers/search.group.provider';
import { SearchGroupComponent, SearchGroupItem } from '../../modules/search/group/search.group.component';
import { Observable, Subject, Subscription } from 'rxjs';
import { BaseProvider } from '../base/providers/base.provider';
import { SearchFormComponent } from '../../modules/search/form/search.form';
import {SearchModel} from "../../models/search/common/search";
import {AdvancedSearchModel} from "../../models/search/common/advanced.search";
import {FoldersTopPanelComp} from "./comp/top.panel/folders.top.panel.comp";
import {HttpService} from "../../services/http/http.service";

@Component({
    selector: 'folders',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        // FolderSlickGridProvider,
        {provide: SlickGridProvider, useClass: FolderSlickGridProvider},
        SlickGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: FolderViewsProvider},
        MediaAppSettings,
        // ClipEditorDetailProvider,
        // {provide: DetailProvider, useClass: ClipEditorDetailProvider},
        InfoPanelProvider,
        SearchThumbsProvider,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        MediaService,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        ViewsService,
        RaiseWorkflowWizzardProvider,
        FacetsService,
        FacetsStore,
    ]
})
export class FoldersComponent extends CoreSearchComponent {
    localStorageService: any;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('imfxInfoPanel', {static: false}) imfxInfoPanel: InfoPanelComponent;
    @ViewChild('groupRows', {static: false}) groupRows: SearchGroupComponent;

    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null,
            forbiddenTags: ['CONTRIBUTOR_ID'],
            searchType: 'Media',
            searchButtonAlwaysEnabled: true
        }
    };
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    searchThumbsConfig = new SearchThumbsConfig(<SearchThumbsConfig>{
        componentContext: this,
        providerType: SearchThumbsProvider,
        appSettingsType: MediaAppSettings,
        options: new SearchThumbsConfigOptions(<SearchThumbsConfigOptions>{
            module: <SearchThumbsConfigModuleSetups>{
                enabled: false,
            }
        })
    });
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'Media',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder',
            commonData: {
                disabledOperators: ['TAXONOMY_ID', 'CC_TEXT', 'TAGS_TEXT']
            }
        }
    };
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    searchString: string;
    @ViewChild('searchFormComponent', {static: false}) public searchFormComponent: SearchFormComponent;
    @ViewChild('treeGroup', {static: false}) public treeGroup: SearchGroupComponent;
    protected facetsConfig: FacetsConfig = {
        parentContext: this,
        service: this.facetsService,
        store: this.facetsStore,
        searchForm: this.searchFormProvider,
    };
    protected isDevMode: boolean = false;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                searchType: 'Media',
                exportPath: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                // topPanel: {
                //     enabled: true,
                //     typeComponent: FoldersTopPanelComp
                // },
                isTree: {
                    enabled: false,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                tileParams: { // from media css
                    tileWidth: 267 + 24,
                    tileHeight: 276 + 12
                },
                headerButtons: true,
                displayNoRowsToShowLabel: true,
                refreshOnNavigateEnd: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true,
            }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
        }
    };
    private flagHide = true;
    private openFacets = false;
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    private searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };
    /**
     * Detail
     * @type {DetailConfig}
     */
    private infoPanelConfig = <InfoPanelConfig>{
        componentContext: this,
        options: {
            provider: <InfoPanelProvider>null,
            // needApi: false,
            typeDetails: 'media-details',
            // showInDetailPage: false,
            showAccordions: false,
            detailsviewType: 'MediaDetails',
            friendlyNamesForDetail: 'FriendlyNames.TM_MIS',
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            externalSearchTextForMark: null,
            isOpenDetailPanel: false,
            tabsLayoutSettings: 'mediaSearch',
            searchType: 'media'
        },
    };
    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    private searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.media',
            itemsLimit: 10
        }
    };
    private destroyed$: Subject<any> = new Subject();
    private oldModeForSearch;
    private readonly _stateGroupPanel: boolean = true;
    public folderDetails;
    constructor(protected searchThumbsProvider: SearchThumbsProvider,
                protected infoPanelProvider: InfoPanelProvider,
                public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: MediaAppSettings,
                protected securityService: SecurityService,
                protected router: Router,
                protected route: ActivatedRoute,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                public exportProvider: ExportProvider,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected injector: Injector,
                private facetsService: FacetsService,
                private facetsStore: FacetsStore,
                public searchGroupProvider: SearchGroupProvider,
                public baseProvider: BaseProvider,
                public httpService: HttpService
    ) {
        super(injector);
        // super(router, route);
        this.simpleTransferProvider.updated.subscribe((setups: TransferdSimplifedType) => {
            /*debugger*/
        });

        // detail provider
        this.infoPanelConfig.options.provider = infoPanelProvider;
        // infoPanelProvider.config = this.infoPanelConfig;
        // debugger;
        this.infoPanelConfig.options.appSettings = this.appSettings;

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        // thumbnails provider
        // this.searchThumbsConfig.options.provider = this.searchThumbsProvider;
        // this.searchThumbsConfig.options.appSettings = this.appSettings;

        // recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        // advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;

        // export
        this.exportProvider.componentContext = (<CoreSearchComponent>this);

        const self = this;
        this.searchGroupProvider.clickByCollection.subscribe((node: any) => {
            const sm: SearchModel = this.searchFormProvider.getModel(false, true);
            const asm_id = new AdvancedSearchModel();
            asm_id.setDBField('GROUP_IDS');
            asm_id.setField('Groups Ids');
            asm_id.setOperation('=');
            asm_id.setValue(node.key);
            asm_id.setGroupId(sm.getNextAvailableGroupId());
            if (!sm.hasAdvancedItem(asm_id)) {
                sm.addAdvancedItem(asm_id);
            }
            this.slickGridComp.provider.buildPage(sm);
            this.httpService.get('/api/v3/search/folder-details/' + node.key)
                .map(res => res.body)
                .subscribe((folderDetails) => {
                this.folderDetails = folderDetails;
                this.folderDetails['Name'] = node.data.dirtyObj.Name
                this.cdr.markForCheck();
            })
        });


        this.isDevMode = this.baseProvider.isDevServer;
        this.cdr.markForCheck();
    }

    get stateGroupPanel(): boolean {
        return this._stateGroupPanel;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    searchWithGroups(data: SearchGroupItem): Observable<Subscription> {
        return new Observable((observer: any) => {
            // if (this.stateGroupPanel) {
            //     let searchModel: SearchModel = new SearchModel();
            //     let asm_id = new AdvancedSearchModel();
            //     asm_id.setDBField('GROUP_IDS');
            //     asm_id.setField('Groups Ids');
            //     asm_id.setOperation('=');
            //     asm_id.setHumanValue(data.Id);
            //     asm_id.setValue(data.Id);
            //     asm_id.setGroupId(9999);
            //     searchModel.addAdvancedItem(asm_id);
            //     this.slickGridComp.provider.buildPage(searchModel, true, true);
            // }

            // this.slickGridComp.service.search(
            //     (<any>this.slickGridComp.config.options).searchType,
            //     searchModel,
            //     1, null, null, null
            // ).pipe(
            //     takeUntil(this.destroyed$)
            // ).subscribe((res: any) => {
            //     if (res.Data.length) {
            //         observer.next(res);
            //         observer.complete();
            //     }
            // });
        });
    }

    // changeStateGroupButton(silent: boolean = false) {
    //     if (!silent) {
    //         this.stateGroupPanel = !this.stateGroupPanel;
    //     }
    //
    //     this.searchFormComponent.provider.setStateForForm(!this.stateGroupPanel);
    //     if (this.stateGroupPanel) {
    //         this.searchFormComponent.config.options.searchButtonAlwaysEnabled = false;
    //         // this.oldModeForSearch = this.searchFormComponent.config.options.currentMode
    //         // this.searchFormComponent.config.options.currentMode = 'Groups';
    //         // this.searchFormComponent.config.options.searchButtonAlwaysEnabled = true;
    //     } else {
    //         this.searchFormComponent.config.options.searchButtonAlwaysEnabled = true;
    //         // this.searchFormComponent.config.options.currentMode = 'Titles';
    //         // this.searchFormComponent.config.options.searchButtonAlwaysEnabled = false;
    //         // this.treeGroup.provider.selectedGroupId = null;
    //     }
    //     // this.searchFormComponent.config.options.currentMode = 'Groups'
    //     // this.searchFormComponent.set(!this.stateGroupPanel);
    //     if (this.stateGroupPanel) {
    //         if(!this.treeGroup.isBuilt) {
    //             this.treeGroup.buildChildren(0, false);
    //         }
    //     }
    //     this.cdr.markForCheck();
    // }

    ngAfterViewInit() {
        // if (this.stateGroupPanel) {
        if (!this.treeGroup.isBuilt) {
            this.treeGroup.buildChildren(0, false);
        }
        // }
        // this.changeStateGroupButton(true);
        // const dataView = this.slickGridComp.provider.getDataView();
        this.searchFormComponent.config.options.onSubmitEmitter.subscribe((data: any) => {
            this.groupRows.search(data.searchString)
        });

        // dataView.beginUpdate();
        // dataView.setFilterArgs({
        //     searchString: ''
        // });
        // dataView.setFilter(this.groupModeFilter);
        // dataView.endUpdate();
    }

}
