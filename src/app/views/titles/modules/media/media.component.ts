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
import {ViewsConfig} from '../../../../modules/search/views/views.config';
import {TitlesMediaViewsProvider} from './providers/views.provider';
// Grid
// Form
import {SearchFormProvider} from '../../../../modules/search/form/providers/search.form.provider';
// Search Settings
import {SearchSettingsConfig} from '../../../../modules/search/settings/search.settings.config';
// Search Modal
import {SearchColumnsProvider} from '../../../../modules/search/columns/providers/search.columns.provider';
// Modal
// Search Columns
import {SearchColumnsService} from '../../../../modules/search/columns/services/search.columns.service';
// constants
import {MediaAppSettings} from './constants/constants';
import {SlickGridComponent} from '../../../../modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../../modules/search/slick-grid/slick-grid.config';
import {SlickGridProvider} from '../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../../../modules/search/slick-grid/services/slick.grid.service';
import {TitlesMediaSlickGridProvider} from './providers/titles.media.slickgrid.provider';
import {CoreSearchComponent} from '../../../../core/core.search.comp';
import {ViewsProvider} from "../../../../modules/search/views/providers/views.provider";
import {MediaSearchSettingsProvider} from "./providers/search.settings.provider";
import {ViewsService} from "../../../../modules/search/views/services/views.service";
import {SearchViewsComponent} from "../../../../modules/search/views/views";
import {SecurityService} from "../../../../services/security/security.service";
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from "../../../../modules/search/thumbs/search.thumbs.config";
import {SearchThumbsProvider} from "../../../../modules/search/thumbs/providers/search.thumbs.provider";
import {SearchThumbsComponent} from "../../../../modules/search/thumbs/search.thumbs";
import {MisrService} from '../../../misr/services/service';
import {MediaService} from '../../../../services/media/media.service';
import {appRouter} from "../../../../constants/appRouter";
import {UploadProvider} from "../../../../modules/upload/providers/upload.provider";
import {UploadModel} from "../../../../modules/upload/models/models";
import {TitlesVersionsSlickGridProvider} from "../versions/providers/titles.versions.slickgrid.provider";

@Component({
    selector: 'media-inside-titles',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        {provide: SlickGridProvider, useClass: TitlesMediaSlickGridProvider},
        // TitlesMediaViewsProvider,
        {provide: ViewsProvider, useClass: TitlesMediaViewsProvider},
        MediaAppSettings,
        SearchFormProvider,
        SearchColumnsProvider,
        SearchColumnsProvider,
        SearchColumnsService,
        MediaSearchSettingsProvider,
        ViewsService,
        MisrService,
        MediaService
    ]
})

export class MediaInsideTitlesComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @Input('moduleTitleContext') protected moduleTitleContext: any;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                clientSorting: true,
                searchType: 'Media',
                exportPath: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                pager: {
                    enabled: true,
                },
                bottomPanel: {
                    enabled: true
                },
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
                refreshOnNavigateEnd: true
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
            type: 'MediaGrid',
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

    private needUpdateGrid: boolean = false;

    constructor(public viewsProvider: ViewsProvider,
                protected searchColumnsModalProvider: SearchColumnsProvider,
                protected searchColumnsModalService: SearchColumnsService,
                protected securityService: SecurityService,
                protected searchSettingsProvider: MediaSearchSettingsProvider,
                protected injector: Injector,
                protected uploadProvider: UploadProvider,
                public cdr: ChangeDetectorRef) {
        super(injector);


    }

    onClickRefreshGrid() {
        const prvdr: TitlesVersionsSlickGridProvider = this.moduleTitleContext.versionsGridRef.slickGridComp.provider;
        prvdr.onRowChanged({row: prvdr.getSelectedRow(), cell: null});
        this.needUpdateGrid = false;
    }

    ngAfterViewInit() {
        if (this.uploadProvider.baseUploadMenuRef) {
            this.uploadProvider.baseUploadMenuRef.notifyUpload.subscribe((data: { model: UploadModel, models: UploadModel[] }) => {
                if (window.location.hash.indexOf(appRouter.title.search) > -1) {
                    const ssp = this.moduleTitleContext.versionsGridRef.slickGridComp.provider;
                    if (ssp.getSelectedRow() && data.model.meta.version && ssp.getSelectedRow().ID === data.model.meta.version.id) {
                        this.needUpdateGrid = true;
                        if (this.moduleTitleContext && this.moduleTitleContext.versionsGridRef) {
                            this.moduleTitleContext.versionsGridRef.cdr.detectChanges();
                        }
                    }
                }
            });
        }

        //reset button activation after search
        const prvdr: TitlesVersionsSlickGridProvider = this.moduleTitleContext.versionsGridRef.slickGridComp.provider;
        prvdr.onDataUpdated.subscribe(data => {
            this.needUpdateGrid = false;
        });
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }
}
