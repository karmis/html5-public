import {Component, EventEmitter, Injector, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import { VersionSearchModalViewsProvider } from './providers/views.provider';
import { VersionAppSettings } from 'app/views/version/constants/constants';
import { SearchThumbsProvider } from 'app/modules/search/thumbs/providers/search.thumbs.provider';
import { SearchFormProvider } from 'app/modules/search/form/providers/search.form.provider';
import { VersionSearchModalSearchFormProvider } from './providers/search.form.provider';
import { SearchSettingsProvider } from 'app/modules/search/settings/providers/search.settings.provider';
import { SlickGridProvider } from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import { VersionSearchModalSlickGridProvider } from './providers/slick.grid.provider';
import { SlickGridService } from 'app/modules/search/slick-grid/services/slick.grid.service';
import { CoreSearchComponent } from 'app/core/core.search.comp';
import { SlickGridComponent } from 'app/modules/search/slick-grid/slick-grid';
import { SearchViewsComponent } from 'app/modules/search/views/views';
import { SearchFormConfig } from 'app/modules/search/form/search.form.config';
import { AppSettingsInterface } from 'app/modules/common/app.settings/app.settings.interface';
import { SearchThumbsComponent } from 'app/modules/search/thumbs/search.thumbs';
import { SearchThumbsConfig, SearchThumbsConfigOptions, SearchThumbsConfigModuleSetups } from 'app/modules/search/thumbs/search.thumbs.config';
import {
    SlickGridConfig,
    SlickGridConfigOptions,
    SlickGridConfigModuleSetups,
    SlickGridConfigPluginSetups
} from 'app/modules/search/slick-grid/slick-grid.config';
import { ViewsConfig } from 'app/modules/search/views/views.config';
import { IMFXModalComponent } from 'app/modules/imfx-modal/imfx-modal';
import { Router, ActivatedRoute } from '@angular/router';
import { IMFXModalEvent } from 'app/modules/imfx-modal/types';
import { UploadProvider } from 'app/modules/upload/providers/upload.provider';
import { Select2ItemType } from 'app/modules/controls/select2/types';
import { ViewsProvider } from 'app/modules/search/views/providers/views.provider';
import {SearchSettingsConfig} from "app/modules/search/settings/search.settings.config";
import {SlickGridRowData} from "app/modules/search/slick-grid/types";


@Component({
    selector: 'versions-search-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: ViewsProvider, useClass: VersionSearchModalViewsProvider},
        VersionAppSettings,
        SearchThumbsProvider,
        SearchFormProvider,
        VersionSearchModalSearchFormProvider,
        SearchSettingsProvider,
        {provide: SlickGridProvider, useClass: VersionSearchModalSlickGridProvider},
        SlickGridService
    ]
})

export class VersionSearchModalComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
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
            provider: <VersionSearchModalSearchFormProvider>null,
            searchType: 'Version'
        }
    };
    /**
     * Thumbs
     * @type {SearchThumbsConfig}
     */
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
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
    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };
    /**
     * Grid
     * @type {GridConfig}
     */
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: true,
                viewMode: 'table',
                savedSearchType: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                overlay: {
                    zIndex: 250
                },
                pager: {},
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                displayNoRowsToShowLabel: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
        }
    };
    // modal data
    private modalRef: IMFXModalComponent;
    protected expandedAll: boolean = true;

    constructor(
        public searchFormProvider: VersionSearchModalSearchFormProvider,
        protected appSettings: VersionAppSettings,
        protected router: Router,
        protected route: ActivatedRoute,
        protected injector: Injector) {
        super(injector);
        // modal reference
        this.modalRef = this.injector.get('modalRef');

        // app settings to search form
        this.searchFormConfig.options.appSettings = this.appSettings;
        this.searchFormConfig.options.provider = this.searchFormProvider;
    }
    ngAfterViewInit() {
        this.expandedAll = (this.slickGridComp.module as SlickGridConfigModuleSetups).isTree.expandMode !== 'allLevels';
    }

    @Output() rowDbClicked: EventEmitter<SlickGridRowData> = new EventEmitter<SlickGridRowData>();
    onRowDbClick(data: SlickGridRowData) {
        // let sgProvider = this.slickGridComp.provider;
        // let sR: SlickGridRowData = sgProvider.getSelectedRow();
        if (data) {
            this.rowDbClicked.emit(data);
        }
    }

}
