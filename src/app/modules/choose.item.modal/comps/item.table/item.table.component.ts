import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter, Injector,
    Input, OnChanges, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ViewsProvider } from '../../../search/views/providers/views.provider';
import { ItemTableViewsProvider } from './providers/item.table.views.provider';
import { MediaAppSettings } from '../../../../views/media/constants/constants';
import { SearchThumbsProvider } from '../../../search/thumbs/providers/search.thumbs.provider';
import { SearchSettingsProvider } from '../../../search/settings/providers/search.settings.provider';
import { SlickGridProvider } from '../../../search/slick-grid/providers/slick.grid.provider';
import { ItemTableSlickGridProvider } from './providers/item.table.slick.grid.provider';
import { SearchFormProvider } from '../../../search/form/providers/search.form.provider';
import { SlickGridService } from '../../../search/slick-grid/services/slick.grid.service';
import { CoreSearchComponent } from '../../../../core/core.search.comp';
import { SlickGridComponent } from '../../../search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../search/slick-grid/slick-grid.config';
import { SearchViewsComponent } from '../../../search/views/views';
import { SearchThumbsComponent } from '../../../search/thumbs/search.thumbs';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../../search/thumbs/search.thumbs.config';
import { SearchFormConfig } from '../../../search/form/search.form.config';
import { AppSettingsInterface } from '../../../common/app.settings/app.settings.interface';
import { ViewsConfig } from '../../../search/views/views.config';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../../../services/security/security.service';
import { TreeFormatter } from '../../../search/slick-grid/formatters/tree/tree.formatter';


@Component({
    selector: 'item-table',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ViewsProvider,
        {provide: ViewsProvider, useClass: ItemTableViewsProvider},
        MediaAppSettings,
        SearchThumbsProvider,
        SearchSettingsProvider,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: ItemTableSlickGridProvider},
        SearchFormProvider,
        SlickGridService
    ]
})

export class ItemTableComponent extends CoreSearchComponent implements OnChanges {
    @Input('typeGrid') typeGrid = '';

    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                overlay: {
                    zIndex: 250
                },
                showMediaLogger: true,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                searchType: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                externalWrapperEl: '.media-wizzard-grid #externalWrapperClipEditorMedia',
                isThumbnails: true,
                isTree: {
                    enabled: false,
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
                displayNoRowsToShowLabel: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true
            }
        })
    });

    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('searchThumbsComp', {static: true}) searchThumbsComp: SearchThumbsComponent;
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
     * Form
     * @type {SearchFormConfig}
     */
    public searchFormConfig = <SearchFormConfig>{
        componentContext: this,
        options: {
            currentMode: 'Titles',
            arraysOfResults: ['titles', 'series', 'contributors'],
            appSettings: <AppSettingsInterface>null,
            provider: <SearchFormProvider>null
        }
    };
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
        }
    };

    constructor(protected appSettings: MediaAppSettings,
                protected router: Router,
                protected route: ActivatedRoute,
                protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected searchSettingsProvider: SearchSettingsProvider,
                protected injector: Injector) {
        super(injector);

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.typeGrid) {
            switch (changes.typeGrid.currentValue) {
                case "media":
                    this.searchViewsConfig.options.type = 'MediaGrid';
                    this.searchGridConfig.options.module.searchType = 'Media';
                    break;
                case "versions":
                    this.searchViewsConfig.options.type = 'VersionGrid';
                    this.searchGridConfig.options.module.searchType = 'versions';
                    this.searchGridConfig.options.module.isTree.enabled = true;
                    this.searchGridConfig.options.module.exportPath = 'Version';
                    break;
                case "carriers":
                    this.searchViewsConfig.options.type = 'TapeGrid';
                    this.searchGridConfig.options.module.searchType = 'carriers';
                    break;
                case "titles":
                    this.searchViewsConfig.options.type = 'TitleTree';
                    this.searchGridConfig.options.module.searchType = 'title';
                    break;
                case "production":
                    this.searchViewsConfig.options.type = 'production';
                    this.searchGridConfig.options.module.searchType = 'production';
                    break;
            }
        }
    }

    ngAfterViewInit() {
        let self = this;
        this.slickGridComp.onGridReady.subscribe(() => {
            self.cdr.detectChanges();
        });
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    public getSelectedRows() {
        return this.slickGridComp.provider.getSelectedRows();
    }
}
