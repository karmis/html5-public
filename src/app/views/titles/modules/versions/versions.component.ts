import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// Views
import { ViewsConfig } from '../../../../modules/search/views/views.config';
import { TitlesVersionViewsProvider } from './providers/views.provider';
// Grid
// Search Settings
import { SearchSettingsConfig } from '../../../../modules/search/settings/search.settings.config';
// Search Modal
import { SearchColumnsProvider } from '../../../../modules/search/columns/providers/search.columns.provider';
// Modal
// Search Columns
import { SearchColumnsService } from '../../../../modules/search/columns/services/search.columns.service';

import { SearchSettingsProvider } from '../../../../modules/search/settings/providers/search.settings.provider';
import { TitlesVersionsSlickGridProvider } from './providers/titles.versions.slickgrid.provider';
import { SlickGridProvider } from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../modules/search/slick-grid/services/slick.grid.service';
import { CoreSearchComponent } from '../../../../core/core.search.comp';
import { SlickGridComponent } from '../../../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../../../modules/search/slick-grid/slick-grid.config';
import { ViewsProvider } from "../../../../modules/search/views/providers/views.provider";
import { SearchViewsComponent } from "../../../../modules/search/views/views";
import { SecurityService } from "../../../../services/security/security.service";
import { SearchThumbsProvider } from "../../../../modules/search/thumbs/providers/search.thumbs.provider";
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../../modules/search/thumbs/search.thumbs.config";
import { VersionAppSettings } from "../../../version/constants/constants";
import { SearchThumbsComponent } from "../../../../modules/search/thumbs/search.thumbs";
import { TitlesSlickGridService } from './services/slickgrid.service';
import {
    SlickGridRowData,
    SlickGridTreeRowData
} from "../../../../modules/search/slick-grid/types";
import { UploadProvider } from "../../../../modules/upload/providers/upload.provider";
import {UploadComponent, UploadMethod} from "../../../../modules/upload/upload";
import {AsperaUploadService} from "../../../../modules/upload/services/aspera.upload.service";


@Component({
    selector: 'versions-inside-titles',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SearchColumnsProvider,
        SearchColumnsService,
        SearchSettingsProvider,
        {provide: SlickGridProvider, useClass: TitlesVersionsSlickGridProvider},
        ViewsProvider,
        {provide: ViewsProvider, useClass: TitlesVersionViewsProvider},
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        VersionAppSettings
    ]
})

export class VersionsInsideTitlesComponent extends CoreSearchComponent {
    @Input('moduleTitleContext') public moduleTitleContext: any;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;

    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    searchThumbsConfig = new SearchThumbsConfig(<SearchThumbsConfig>{
        componentContext: this,
        providerType: SearchThumbsProvider,
        appSettingsType: VersionAppSettings,
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
    /**
     * SlickGrid
     * @type {SlickGridConfig}
     */
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                enableSorting: false,
                viewModeSwitcher: false,
                viewMode: 'table',
                exportPath: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                pager: {
                    enabled: false,
                },
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.versionSettingsPopup'
                    }
                },
                bottomPanel: {
                    enabled: false
                },
                availableContextMenu: true,
                refreshOnNavigateEnd: true
            },
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
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
                    enabled: true,
                    useCustomApi: true
                }
            }
        }
    };
    public readonly _expandedAllDefault = false;
    public expandedAll: boolean = false;

    constructor(protected injector: Injector,
                protected appSettings: VersionAppSettings,
                private uploadProvider: UploadProvider,
                private cdr: ChangeDetectorRef,
                protected securityService: SecurityService) {
        super(injector);
    }

    ngAfterViewInit() {
        this.bindUploadEvents();
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

    private bindUploadEvents() {
        this.slickGridComp.provider.onGridAndViewReady.subscribe(() => {
            this.uploadProvider.fetchUploadMethod().subscribe((method: UploadMethod) => {
                if (method === 'aspera') {
                    // this.slickGridComp.provider.onDropCell.subscribe((data: { row: SlickGridRowData }) => {
                    const asperaService: AsperaUploadService = this.uploadProvider.getService(this.uploadProvider.getUploadMethod()) as AsperaUploadService;
                    this.slickGridComp.provider.onGridEndSearch.subscribe(() => {
                        asperaService.initAspera({rebindEvents: true, externalContext: this});
                    });
                    this.slickGridComp.provider.onScrollGrid.subscribe(() => {
                        setTimeout(() => {
                            asperaService.initAspera({rebindEvents: true, externalContext: this});
                        })
                    });
                } else {
                    this.slickGridComp.provider.onDropCell.subscribe((data: { row: SlickGridRowData }) => {
                        if (data && data.row && data.row.ID) {
                            const up: UploadProvider = this.injector.get(UploadProvider);
                            up.forcedUploadMode = 'version';
                            const upr = up.onReady.subscribe(() => {
                                if (up.droppedToBlock === 'version-row') {
                                    const uc: UploadComponent = up.moduleContext;
                                    uc.setVersion({id: data.row.ID, text: data.row.FULLTITLE}, data);
                                    uc.changeAssociateMode(up.forcedUploadMode);
                                    uc.disableMedia();
                                    // upr.unsubscribe();
                                }
                            });
                        }
                    });
                }
            })
        });
    }

    onInitCustomIfExist() {
        this.refreshSpecComps('versionGrid', () => {
            this.slickGridComp.provider.refreshGrid();
        });
    }
}
