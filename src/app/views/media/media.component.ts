import { ChangeDetectorRef, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
// Views
import { ViewsConfig } from '../../modules/search/views/views.config';
import { MediaViewsProvider } from './providers/views.provider';
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
import { MediaSlickGridProvider } from './providers/media.slick.grid.provider';
import { CoreSearchComponent } from '../../core/core.search.comp';
import { ViewsProvider } from '../../modules/search/views/providers/views.provider';
import { IMFXModalProvider } from "../../modules/imfx-modal/proivders/provider";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
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

@Component({
    selector: 'media',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: MediaSlickGridProvider},
        SlickGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: MediaViewsProvider},
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
export class MediaComponent extends CoreSearchComponent {
    localStorageService: any;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('imfxInfoPanel', {static: false}) imfxInfoPanel: InfoPanelComponent;
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
            searchType: 'Media'
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
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
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
                displayNoRowsToShowLabel: true,
                refreshOnNavigateEnd: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
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
                public baseProvider: BaseProvider
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

        this.isDevMode = this.baseProvider.isDevServer;
        this.cdr.markForCheck();
    }
    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

}
