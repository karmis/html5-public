import { Component, EventEmitter, Injector, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ViewsConfig } from '../../../../modules/search/views/views.config';
import { CoreSearchComponent } from '../../../../core/core.search.comp';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../../modules/search/slick-grid/slick-grid.config';
import { SearchThumbsProvider } from '../../../../modules/search/thumbs/providers/search.thumbs.provider';
import { TitlesVersionsSlickGridProvider } from '../versions/providers/titles.versions.slickgrid.provider';
import { SearchColumnsService } from '../../../../modules/search/columns/services/search.columns.service';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups, SearchThumbsConfigOptions
} from '../../../../modules/search/thumbs/search.thumbs.config';
import { SlickGridService } from '../../../../modules/search/slick-grid/services/slick.grid.service';
import { SecurityService } from '../../../../services/security/security.service';
import { SearchViewsComponent } from '../../../../modules/search/views/views';
import { SearchFormProvider } from '../../../../modules/search/form/providers/search.form.provider';
import { ViewsService } from '../../../../modules/search/views/services/views.service';
import { ViewsProvider } from '../../../../modules/search/views/providers/views.provider';
import { SearchColumnsProvider } from '../../../../modules/search/columns/providers/search.columns.provider';
import { appRouter } from '../../../../constants/appRouter';
import { MediaService } from '../../../../services/media/media.service';
import { SearchThumbsComponent } from '../../../../modules/search/thumbs/search.thumbs';
import { UploadModel } from '../../../../modules/upload/models/models';
import { UploadProvider } from '../../../../modules/upload/providers/upload.provider';
import { MisrService } from '../../../misr/services/service';
import { SlickGridProvider } from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridComponent } from '../../../../modules/search/slick-grid/slick-grid';
import { SearchSettingsConfig } from '../../../../modules/search/settings/search.settings.config';
import { CarrierTitlesSGProvider } from './providers/carrier.titles.slickgrid.provider';
import { CarrierTitlesViewsProvider } from './providers/views.provider';
import { MediaAppSettings } from './constants/constants';
import { TitlesMediaSearchSettingsProvider } from './providers/carrier.titles.search.settings.provider';
import { TitlesComponent } from '../../titles.component';
import { CarriesInsideTitlesService } from './services/carries-inside-titles.service';
import { ViewsOriginalType } from '../../../../modules/search/views/types';


@Component({
    selector: 'carrier-inside-titles',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: SlickGridProvider, useClass: CarrierTitlesSGProvider},
        // TitlesMediaViewsProvider,
        {provide: ViewsProvider, useClass: CarrierTitlesViewsProvider},
        MediaAppSettings,
        SearchFormProvider,
        SearchColumnsProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        TitlesMediaSearchSettingsProvider,
        ViewsService,
        MisrService,
        MediaService
    ]
})

export class CarrierInsideTitlesComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @Input('moduleTitleContext') protected moduleTitleContext: TitlesComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['U_ID_PFIX', 'FORMAT', 'LI_TTL_text', 'LI_VERS_text'],
                exportPath: 'Tape',
                searchType: 'carriers',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                pager: {},
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.carrierSettingsPopup'
                    }
                },
                // tileParams: { // from css
                //     tileWidth: 267 + 24,
                //     tileHeight: 276 + 12,
                //     isThumbnails: false,
                //     isIcons: true,
                // },
                displayNoRowsToShowLabel: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });

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
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'DigitalCarriers',
        }
    };
    lastView = 'DigitalCarriers';
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };

    private needUpdateGrid: boolean = false;

    constructor(public viewsProvider: ViewsProvider,
                protected securityService: SecurityService,
                protected searchSettingsProvider: TitlesMediaSearchSettingsProvider,
                protected injector: Injector,
                protected carriesInsideTitlesService: CarriesInsideTitlesService,
                protected uploadProvider: UploadProvider,) {
        super(injector);


    }

    onClickRefreshGrid() {
        // @ts-ignore
        // const prvdr: TitlesVersionsSlickGridProvider = this.moduleTitleContext.mediaGridRef.slickGridComp.provider;
        // prvdr.onRowChanged({row: prvdr.getSelectedRow(), cell: null});
        // this.needUpdateGrid = false;
    }

    ngAfterViewInit() {
        if (this.uploadProvider.baseUploadMenuRef) {
            this.uploadProvider.baseUploadMenuRef.notifyUpload.subscribe((data: { model: UploadModel, models: UploadModel[] }) => {
                if (window.location.hash.indexOf(appRouter.title.search) > -1) {
                    const ssp = this.moduleTitleContext.versionsGridRef.slickGridComp.provider;
                    if (ssp.getSelectedRow() && data.model.meta.version && ssp.getSelectedRow().ID === data.model.meta.version.id) {
                        this.needUpdateGrid = true;
                        if (this.moduleTitleContext && this.moduleTitleContext.mediaGridRef && this.moduleTitleContext.mediaGridRef.cdr) {
                            // @ts-ignore
                            this.moduleTitleContext.mediaGridRef.cdr.detectChanges();
                        }
                    }
                }
            });
        }

        //reset button activation after search
        // @ts-ignore
        const prvdr: TitlesVersionsSlickGridProvider = this.moduleTitleContext.mediaGridRef.slickGridComp.provider;
        prvdr.onDataUpdated.subscribe(data => {
            this.needUpdateGrid = false;
            if (data.row === null || data.row === undefined) {
                this.slickGridComp.provider.buildPageByData({Data: []});
                return
            }

            this.slickGridComp.provider.showOverlay();
            if ((data.row.MEDIA_TYPE > 49) && !(data.row.MEDIA_TYPE === 110)) {

                if (this.lastView !== 'DigitalCarriers') {
                    this.viewsComp.provider._originalViews = null;
                    this.searchViewsConfig.options.type = 'DigitalCarriers';
                    this.viewsComp.config.options.type = 'DigitalCarriers';
                    this.viewsComp.provider.load().subscribe((originalView: ViewsOriginalType | null) => {
                        if (originalView === null) {
                            return;
                        }

                        this.viewsComp.provider.build(originalView.DefaultView, originalView.ViewColumns);
                        this.viewsComp.provider.setViewForUI(originalView.DefaultView);
                        this.carriesInsideTitlesService.getDigital(data.row.ID).subscribe(dataGrid => {
                            this.setData(dataGrid.Data);
                            this.slickGridComp.provider.hideOverlay();
                        })
                    });
                } else {
                    this.carriesInsideTitlesService.getDigital(data.row.ID).subscribe(dataGrid => {
                        this.setData(dataGrid.Data);
                        this.slickGridComp.provider.hideOverlay();
                    })
                }

                this.lastView = 'DigitalCarriers';
            } else {
                if (this.lastView !== 'TapeGrid') {
                    this.viewsComp.provider._originalViews = null;
                    this.searchViewsConfig.options.type = 'TapeGrid';
                    this.viewsComp.config.options.type = 'TapeGrid';
                    this.viewsComp.provider.load().subscribe((originalView: ViewsOriginalType | null) => {
                        if (originalView === null) {
                            return;
                        }

                        this.viewsComp.provider.build(originalView.DefaultView, originalView.ViewColumns);
                        this.viewsComp.provider.setViewForUI(originalView.DefaultView);
                        this.carriesInsideTitlesService.getPhysical(data.row.ID).subscribe(dataGrid => {
                            this.setData(dataGrid.Data);
                            this.slickGridComp.provider.hideOverlay();
                        })
                    });
                } else {
                    this.carriesInsideTitlesService.getPhysical(data.row.ID).subscribe(dataGrid => {
                        this.setData(dataGrid.Data);
                        this.slickGridComp.provider.hideOverlay();
                    })
                }

                this.lastView = 'TapeGrid';
            }
        });
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    setData(dataGrid) {
        // this.slickGridComp.provider.setGlobalColumns(columns);
        // this.slickGridComp.provider.setDefaultColumns(columns, [], true);
        this.slickGridComp.provider.buildPageByData({Data: dataGrid});
        this.slickGridComp.provider.resize();
    }
}
