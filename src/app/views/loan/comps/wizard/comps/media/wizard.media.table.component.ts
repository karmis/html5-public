import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ViewsConfig } from '../../../../../../modules/search/views/views.config';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../../../../../modules/search/thumbs/search.thumbs.config';
import {
    SearchThumbsProvider
} from '../../../../../../modules/search/thumbs/providers/search.thumbs.provider';
import { MediaAppSettings } from '../../../../../media/constants/constants';
import {
    SearchSettingsProvider
} from '../../../../../../modules/search/settings/providers/search.settings.provider';
import { ActivatedRoute, Router } from '@angular/router';
import { VersionWizardMediaViewsProvider } from './providers/wizard.views.media.provider';
import { SearchFormConfig } from '../../../../../../modules/search/form/search.form.config';
import {
    AppSettingsInterface
} from '../../../../../../modules/common/app.settings/app.settings.interface';
import {
    SearchFormProvider
} from '../../../../../../modules/search/form/providers/search.form.provider';
import { SearchThumbsComponent } from '../../../../../../modules/search/thumbs/search.thumbs';
import { CoreSearchComponent } from '../../../../../../core/core.search.comp';
import { SearchViewsComponent } from '../../../../../../modules/search/views/views';
import {
    SlickGridProvider
} from '../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../../../../modules/search/slick-grid/slick-grid.config';
import {
    SlickGridService
} from '../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../../../../modules/search/slick-grid/slick-grid';
import { ClipEditorMediaSlickGridProvider } from './providers/clipedtor.slick.grid.provider';
import { ViewsProvider } from '../../../../../../modules/search/views/providers/views.provider';
import { SecurityService } from "../../../../../../services/security/security.service";
import { LoanService } from "../../../../../../services/loan/loan.service";

@Component({
    selector: 'wizard-loan-table',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ViewsProvider,
        {provide: ViewsProvider, useClass: VersionWizardMediaViewsProvider},
        MediaAppSettings,
        SearchThumbsProvider,
        SearchSettingsProvider,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: ClipEditorMediaSlickGridProvider},
        SearchFormProvider,
        SlickGridService
    ]
})

export class WizardMediaTableComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                overlay: {
                    zIndex: 100
                },
                showMediaLogger: true,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                searchType: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                externalWrapperEl: '.media-wizzard-grid #externalWrapperClipEditorMedia',
                isThumbnails: true,
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
                protected injector: Injector,
                private loanService: LoanService) {
        super(injector);
        switch (this.loanService.typeGrid) {
            case "media":
                this.searchViewsConfig.options.type = 'MediaGrid';
                this.searchGridConfig.options.module.searchType = 'Media';
                break;
            case "versions":
                this.searchViewsConfig.options.type = 'VersionGrid';
                this.searchGridConfig.options.module.searchType = 'versions';
                break;
            case "carriers":
                this.searchViewsConfig.options.type = 'TapeGrid';
                this.searchGridConfig.options.module.searchType = 'carriers';
                break;
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
