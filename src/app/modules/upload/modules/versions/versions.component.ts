import { Component, EventEmitter, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
// Views
import { ViewsConfig } from '../../../search/views/views.config';
// Grid
import { GridConfig } from '../../../../modules/search/grid/grid.config';
// Search Modal
import { VersionsUploadViewsProvider } from './providers/views.provider';
import { SearchThumbsProvider } from '../../../search/thumbs/providers/search.thumbs.provider';
import { VersionAppSettings } from '../../../../views/version/constants/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchFormConfig } from '../../../search/form/search.form.config';
import { AppSettingsInterface } from '../../../common/app.settings/app.settings.interface';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../../search/thumbs/search.thumbs.config';

import { VersionInsideUploadSearchFormProvider } from './providers/search.form.provider';
import { SearchThumbsComponent } from '../../../search/thumbs/search.thumbs';
// search component
import { SlickGridComponent } from '../../../search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../../search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../search/slick-grid/services/slick.grid.service';
import { VersionInsideUploadSlickGridProvider } from './providers/version.slick.grid.provider';
import { SearchFormProvider } from '../../../search/form/providers/search.form.provider';
import { UploadProvider } from '../../providers/upload.provider';
import { CoreSearchComponent } from '../../../../core/core.search.comp';
import { IMFXModalComponent } from '../../../imfx-modal/imfx-modal';
import { IMFXModalEvent } from '../../../imfx-modal/types';
import { SearchSettingsProvider } from '../../../search/settings/providers/search.settings.provider';
import { SearchViewsComponent } from '../../../search/views/views';
import { ViewsProvider } from '../../../search/views/providers/views.provider';
import { Select2ItemType } from "../../../controls/select2/types";
import { SecurityService } from '../../../../services/security/security.service';
import { SearchSettingsConfig } from '../../../search/settings/search.settings.config';
import { VersionsInsideTitlesComponent } from '../../../../views/titles/modules/versions/versions.component';
import { VersionsInTitlesComponent } from '../versions-in-titles/versions-in-titles.component';
import { TitlesVersionsSlickGridProvider } from '../../../../views/titles/modules/versions/providers/titles.versions.slickgrid.provider';
import { TitlesSlickGridService } from '../../../../views/titles/modules/versions/services/slickgrid.service';

@Component({
    selector: 'versions-inside-upload',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ViewsProvider,
        {provide: ViewsProvider, useClass: VersionsUploadViewsProvider},
        VersionAppSettings,
        SearchThumbsProvider,
        SearchFormProvider,
        VersionInsideUploadSearchFormProvider,
        SearchSettingsProvider,
        SlickGridProvider,
        TitlesSlickGridService,
        {provide: SlickGridProvider, useClass: VersionInsideUploadSlickGridProvider},
        SlickGridService
    ]
})

export class VersionsInsideUploadComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('versionsInTitlesComponent', {static: false}) versionsInTitlesComp: VersionsInTitlesComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;

    searchFormConfig = <SearchFormConfig>{
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
    searchThumbsConfig = <SearchThumbsConfig>{
        componentContext: this,
        providerType: SearchThumbsProvider,
        appSettingsType: VersionAppSettings,
        options: new SearchThumbsConfigOptions(<SearchThumbsConfigOptions>{
            module: <SearchThumbsConfigModuleSetups>{
                enabled: false,
            }
        })
    };
    searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                overlay: {
                    zIndex: 250
                },
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
    searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'TitleTree',
        }
    };
    // versions
    protected searchViewsConfigVersions = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
        }
    };
    protected searchSettingsConfigVersions = <SearchSettingsConfig>{
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
    protected searchGridConfigVersions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
    // modal data
    modalRef: IMFXModalComponent;
    expandedAll: boolean = true;

    constructor(
        public searchFormProvider: VersionInsideUploadSearchFormProvider,
        public slickGridProvider: SlickGridProvider,
        protected appSettings: VersionAppSettings,
        protected router: Router,
        protected titlesSlickGridService: TitlesSlickGridService,
        protected route: ActivatedRoute,
        protected securityService: SecurityService,
        protected injector: Injector) {
        super(injector);
        // modal reference
        this.modalRef = this.injector.get('modalRef');

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;
    }

    ngOnInit() {
        this.slickGridProvider.onSelectRow.subscribe(rowId => {
            const data = this.slickGridProvider.getSelectedRowData();
            if (data) {

                let provider: TitlesVersionsSlickGridProvider = (this.versionsInTitlesComp.slickGridComp.provider as TitlesVersionsSlickGridProvider);
                const extendColumns = this.versionsInTitlesComp.slickGridComp.provider.extendedColumns;
                provider.showOverlay();
                this.titlesSlickGridService.getRowsByIdTitlesToVersions(data.ID, extendColumns)
                    .subscribe((resp: any) => {
                        provider.buildPageByData(resp);
                    }, () => {
                        provider.hideOverlay();
                    }, () => {
                        provider.hideOverlay();
                    });
            }

            console.log(data);
        })
        super.ngOnInit();
    }

    ngAfterViewInit() {
        this.expandedAll = (this.slickGridComp.module as SlickGridConfigModuleSetups).isTree.expandMode !== 'allLevels';
        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name === 'ok') {
                this.ok();
            }
            if (e.name === 'shown') {
                this.searchFormConfig.options.provider
                    .config.moduleContext.searchStringEl.nativeElement.focus();
            }
        });
    }

    ok() {
        let sgProvider : TitlesVersionsSlickGridProvider = (this.versionsInTitlesComp.slickGridComp.provider as TitlesVersionsSlickGridProvider);
        let data = sgProvider.getSelectedRow();
        if (data) {
            const up: UploadProvider = this.injector.get(UploadProvider);
            up.onSelectVersion({id: data.ID, text: data.FULLTITLE} as Select2ItemType, data);
            this.modalRef.hide('autohide');
        }
    }

    onDoubleClick() {
        this.ok();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }
}
