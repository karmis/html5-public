import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injector, OnDestroy, OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
//  Views
import {ViewsConfig} from '../../modules/search/views/views.config';
import {TitlesViewsProvider} from './providers/views.provider';
//  Grid
import {TitlesSlickGridProvider} from './providers/titles.slick.grid.provider';
//  Form
import {SearchFormConfig} from '../../modules/search/form/search.form.config';
import {SearchFormProvider} from '../../modules/search/form/providers/search.form.provider';
// Search Settings
import {SearchSettingsConfig} from '../../modules/search/settings/search.settings.config';
// Search Modal
import {SearchColumnsProvider} from '../../modules/search/columns/providers/search.columns.provider';
//  Modal
// Search Columns
import {SearchColumnsService} from '../../modules/search/columns/services/search.columns.service';
// Search Settings
import {SearchRecentConfig} from '../../modules/search/recent/search.recent.config';
import {SearchRecentProvider} from '../../modules/search/recent/providers/search.recent.provider';
//  Advanced search
import {SearchAdvancedConfig} from '../../modules/search/advanced/search.advanced.config';
import {SearchAdvancedProvider} from '../../modules/search/advanced/providers/search.advanced.provider';
//  constants
import {TitlesAppSettings} from './constants/constants';
import {AppSettingsInterface} from '../../modules/common/app.settings/app.settings.interface';
import {ActivatedRoute, Router} from '@angular/router';
import {SearchSettingsProvider} from '../../modules/search/settings/providers/search.settings.provider';
import {SlickGridComponent} from '../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../modules/search/slick-grid/slick-grid.config';
import {SlickGridProvider, SlickGridSearchData} from '../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../modules/search/slick-grid/services/slick.grid.service';
import {VersionsInsideTitlesComponent} from './modules/versions/versions.component';
import {MediaInsideTitlesComponent} from './modules/media/media.component';
import {TitlesSlickGridService} from './modules/versions/services/slickgrid.service';
import {TitlesVersionsSlickGridProvider} from './modules/versions/providers/titles.versions.slickgrid.provider';
import {TitlesMediaSlickGridProvider} from './modules/media/providers/titles.media.slickgrid.provider';
import {CoreSearchComponent} from '../../core/core.search.comp';
import {ViewsProvider} from '../../modules/search/views/providers/views.provider';
import {IMFXModalProvider} from '../../modules/imfx-modal/proivders/provider';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {ViewsService} from "../../modules/search/views/services/views.service";
import {SearchViewsComponent} from "../../modules/search/views/views";
import {SecurityService} from "../../services/security/security.service";
import {TranslateService} from '@ngx-translate/core';
import {SlickGridTreeRowData} from '../../modules/search/slick-grid/types';
import {IMFXRouteReuseStrategy} from '../../strategies/route.reuse.strategy';
import {NotificationService} from "../../modules/notification/services/notification.service";
import { CreateEpisodeTitleModalProvider } from "../../modules/create.episode.title.modal/providers/create.episode.title.modal.provider";
import { Subscription } from "rxjs";
import { SearchFormComponent } from "../../modules/search/form/search.form";
import { CarrierInsideTitlesComponent } from './modules/carrier/carrier-inside-titles.component';

@Component({
    selector: 'titles',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: SlickGridProvider, useClass: TitlesSlickGridProvider},
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        ViewsProvider,
        {provide: ViewsProvider, useClass: TitlesViewsProvider},
        TitlesAppSettings,
        SearchFormProvider,
        SearchRecentProvider,
        SearchAdvancedProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        IMFXModalProvider,
        BsModalRef,
        BsModalService,
        ViewsService,
    ]
})

export class TitlesComponent extends CoreSearchComponent implements AfterViewInit, OnInit, OnDestroy {
    /**
     * Reference to versions table
     */
    @ViewChild('versionsGrid', {static: false}) public versionsGridRef: VersionsInsideTitlesComponent;
    /**
     * Reference to media table
     */
    @ViewChild('mediaGrid', {static: false}) public mediaGridRef: MediaInsideTitlesComponent;
    @ViewChild('carriesGridRef', {static: false}) public carriesGridRef: CarrierInsideTitlesComponent;
    @ViewChild('tableSplit', {static: false}) public tableSplitRef: ElementRef;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('searchFormComp', {static: false}) searchFormComp: SearchFormComponent;
    /**
     * Advanced search
     * @type {SearchAdvancedConfig}
     */
    public searchAdvancedConfig = <SearchAdvancedConfig>{
        componentContext: this,
        options: {
            provider: <SearchAdvancedProvider>null,
            restIdForParametersInAdv: 'TitleSearch',
            enabledQueryByExample: false,
            enabledQueryBuilder: true,
            advancedSearchMode: 'builder'
        }
    };
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    // protected detectSearch: EventEmitter<any> = new EventEmitter<any>();
    /**
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            // currentMode: 'Titles',
            arraysOfResults: ['titles', 'series'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null,
            searchType: 'Version'
            // onSubmitEmitter: this.detectSearch
        }
    };
    protected moduleTitleContext = this;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                searchType: 'title',
                exportPath: 'TitleSearch',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                enableSorting: false,
                pager: {
                    enabled: true,
                    mode: 'small'
                },
                info: {
                    enabled: false
                },
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                bottomPanel: {
                    enabled: true
                }, popupsSelectors: {
                    'settings': {
                        'popupEl': '.titleSettingsPopup'
                    }
                },
                availableContextMenu: true,
                displayNoRowsToShowLabel: true
                // popupsSelectors: {
                //     'settings': {
                //         'popupEl': '.mediaSettingsPopup'
                //     }
                // }
            },
            // plugin: <SlickGridConfigPluginSetups>{
            //     suppressCleanup: true
            // }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'TitleTree',
        }
    };


    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            available: {
                export: {
                    enabled: true
                }
            }
        }
    };
    protected expandedAll: boolean = true;
    /**
     * Recent searches
     * @type {SearchRecentConfig}
     */
    private searchRecentConfig = <SearchRecentConfig>{
        componentContext: this,
        options: {
            provider: <SearchRecentProvider>null,
            viewType: 'adv.recent.searches.titles',
            itemsLimit: 10
        }
    };
    @ViewChild('selectViewControl', {static: false}) private selectViewControl;
    private isVisibleTitles: boolean = true;
    private isVisibleVersions: boolean = true;
    private isVisibleMedia: boolean = true;
    private isVisibleCarrier: boolean = false;
    addedTitleSub: Subscription;

    constructor(public searchFormProvider: SearchFormProvider,
                public searchRecentProvider: SearchRecentProvider,
                protected searchAdvancedProvider: SearchAdvancedProvider,
                protected appSettings: TitlesAppSettings,
                protected securityService: SecurityService,
                protected cdr: ChangeDetectorRef,
                protected router: Router,
                protected route: ActivatedRoute,
                protected injector: Injector,
                protected translate: TranslateService,
                protected createEpisodeTitleModalProvider: CreateEpisodeTitleModalProvider,
                protected notificationService: NotificationService) {
        super(injector);
        //  app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;

        //  recent searches
        this.searchRecentConfig.options.provider = this.searchRecentProvider;

        //  advanced search
        this.searchAdvancedConfig.options.provider = this.searchAdvancedProvider;
    }

    ngOnInit() {
        super.ngOnInit();

        this.addedTitleSub = this.createEpisodeTitleModalProvider.addedTitleSub.subscribe(query => {
            // this.searchFormComp.searchStringEl.nativeElement.value = query;
            this.searchFormComp.setSearchValue(query);
            this.searchFormComp.doSearch({
                "searchString": query,
                "suggestionSearchData": {}
            });
        })
    }

    ngAfterViewInit() {
        const tsgp: TitlesSlickGridProvider | any = this.slickGridComp.provider;
        this.selectViewControl.setData([
            {id: 't-v-m', text: this.translate.instant('titles.display_views_mode.tvm')},
            {id: 't-v', text: this.translate.instant('titles.display_views_mode.tv')},
            {id: 't-v-m-c', text: this.translate.instant('titles.display_views_mode.tvmc')}
        ]);
        this.selectViewControl.setSelectedByIds(['t-v-m']);
        tsgp.onGridStartSearch.subscribe((d: SlickGridSearchData) => {
            // this.slickGridComp.provider.clearData(true);
            if (!d.newModel.isEqual(tsgp.lastSearchModel)) {
                if (this.versionsGridRef) {
                    this.clearResultForVersionsGrid();
                }
                if (this.mediaGridRef) {
                    this.clearResultForMediaGrid();
                }
            }
        });


        tsgp.onGridEndSearch.subscribe(() => {
            this.expandCollapseAll(!this.expandedAll, false);
        });

        this.expandedAll = (this.slickGridComp.module as SlickGridConfigModuleSetups).isTree.expandMode !== 'allLevels';

        // let sap = this.injector.get(SearchAdvancedProvider);
        // sap.onToggle.subscribe(() => {
        //     this.versionsGridRef.slickGridComp.provider.resize();
        //     this.mediaGridRef.slickGridComp.provider.resize();
        // })

       // this.mediaGridRef.slickGridComp.provider.onDataUpdated.subscribe(data => {
       //     if (data.row === null) {
       //         this.carriesGridRef.slickGridComp.provider.buildPageByData({Data: []});
       //         return
       //     }
       //     console.log(data.row.MEDIA_TYPE);
       //     this.carriesGridRef.slickGridComp.provider.showOverlay();
       //     setTimeout(() => {
       //
       //         this.carriesGridRef.slickGridComp.provider.buildPageByData({Data: []});
       //         this.carriesGridRef.slickGridComp.provider.hideOverlay();
       //     }, 800)
       //      console.log(data, 'onDataUpdated');
       //  });
        // @ts-ignore
        this.versionsGridRef.slickGridComp.provider.versionsUpdate.subscribe(data => {
            console.log(data, 'versionsUpdate');
        })
        //

    }

    ngOnDestroy() {
        this.addedTitleSub.unsubscribe();
    }

    get VisibleTitles() {
        return this.isVisibleTitles;
    }

    set VisibleTitles(isVisible: boolean) {
        this.isVisibleTitles = isVisible;
    }

    get VisibleVersions() {
        return this.isVisibleVersions;
    }

    set VisibleVersions(isVisible: boolean) {
        this.isVisibleVersions = isVisible;
    }

    get VisibleMedia() {
        return this.isVisibleMedia;
    }

    set VisibleMedia(isVisible: boolean) {
        this.isVisibleMedia = isVisible;
    }

    set VisibleCarrier(isVisible: boolean) {
        this.isVisibleCarrier = isVisible;
    }

    get VisibleCarrier() {
        return this.isVisibleCarrier;
    }

    clearResultForVersionsGrid() {
        let verGridProvider: TitlesVersionsSlickGridProvider = (
            (<SlickGridComponent>this.versionsGridRef.slickGridComp).provider as TitlesVersionsSlickGridProvider
        );
        if (verGridProvider.getData().length > 0) {
            verGridProvider.clearData(true);
        }

        verGridProvider.setPlaceholderText('ng2_components.ag_grid.noRowsToShow', true, {});
        verGridProvider.showPlaceholder();
    }

    clearResultForMediaGrid() {
        let medGridProvider: TitlesMediaSlickGridProvider = ((
            <SlickGridComponent>this.mediaGridRef.slickGridComp
        ).provider as TitlesMediaSlickGridProvider);
        if (medGridProvider.getData().length > 0) {
            medGridProvider.clearData(true);
        }
        medGridProvider.setPlaceholderText('ng2_components.ag_grid.noRowsToShow', true, {});
        medGridProvider.showPlaceholder();
        // For carriesGridRef
        let carriesGridRef: TitlesMediaSlickGridProvider = ((
            <SlickGridComponent>this.carriesGridRef.slickGridComp
        ).provider as TitlesMediaSlickGridProvider);
        if (carriesGridRef.getData().length > 0) {
            carriesGridRef.clearData(true);
        }
        carriesGridRef.setPlaceholderText('ng2_components.ag_grid.noRowsToShow', true, {});
        carriesGridRef.showPlaceholder();
    }

    //need for correct 'overflow:visible' logic for splitters
    doStateOverflow(state) {
        let arrSplitters = this.tableSplitRef.nativeElement.querySelectorAll('split-area.titles-splitter');
        arrSplitters = Array.from(arrSplitters);

        if (state == 'hidden') {
            $(arrSplitters).addClass('overflow-hidden-splitter');
        } else if (state == 'visible') {
            $(arrSplitters).addClass('overflow-hidden-splitter');

            if (!this.VisibleMedia) {
                arrSplitters.pop();
            }
            if (!this.VisibleVersions) {
                arrSplitters.pop();
            }
            if (!this.VisibleTitles) {
                arrSplitters.pop();
            }
            if (!this.VisibleCarrier) {
                arrSplitters.pop();
            }

            $(arrSplitters).removeClass('overflow-hidden-splitter');
        } else {
            return;
        }
    }

    /**
     * On change view mode for current display
     */
    onChangeViewMode() {
        let flags: Array<string> = this.selectViewControl.getSelected().split('-');
        this.VisibleTitles = flags.indexOf('t') > -1;
        this.VisibleVersions = flags.indexOf('v') > -1;
        this.VisibleMedia = flags.indexOf('m') > -1;
        this.VisibleCarrier = flags.indexOf('c') > -1;

        this.doStateOverflow('visible');


        // setImmediate(() => {
        //     // titles
        //     this.slickGridComp.provider.resize();
        //
        //     // versions
        //     let verGridProvider: TitlesVersionsSlickGridProvider = (
        //         <SlickGridComponent>this.versionsGridRef.slickGridComp
        //     ).provider;
        //     verGridProvider.resize();
        //
        //     // media
        //     if (this.VisibleMedia) {
        //         let medGridProvider: TitlesMediaSlickGridProvider = (
        //             <SlickGridComponent>this.mediaGridRef.slickGridComp
        //         ).provider;
        //         medGridProvider.resize();
        //     }
        // });
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    expandCollapseAll(expandedAll: boolean, withSwitch: boolean = true) {
        if (!this.slickGridComp || this.slickGridComp.provider.getData().length === 0)
            return;
        if (withSwitch) {
            this.expandedAll = !expandedAll;
        }

        const provider: SlickGridProvider = this.slickGridComp.provider;
        let dataView = provider.getDataView();
        dataView.beginUpdate();
        if (expandedAll) {
            $.each(provider.getData(), (i, row: SlickGridTreeRowData) => {
                provider.collapseTreeRow(row);
            });
        } else {
            $.each(provider.getData(), (i, row: SlickGridTreeRowData) => {
                provider.expandTreeRow(row);
            });
        }
        dataView.endUpdate();
        provider.resize();
    }

    onInitCustomIfExist() {
        const router = this.injector.get(Router)
            , strategy = (<IMFXRouteReuseStrategy>router.routeReuseStrategy);
        strategy.currentComponentInstance = this;//dirty hack
        this.refreshSpecComps('versionGrid', () => {
            this.versionsGridRef.slickGridComp.provider.refreshGrid();
        });
    }
}

