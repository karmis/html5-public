import {
    Component,
    EventEmitter,
    Injectable,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// Views
import {ViewsConfig} from '../../../../../modules/search/views/views.config';
// import {DetailTitlesTabViewsProvider} from "./providers/views.provider";
import {TitlesTabGridService} from './services/grid.service';
// Form
import {SearchFormProvider} from '../../../../../modules/search/form/providers/search.form.provider';

// constants
import {DetailTitlesTabGridProvider} from './providers/grid.provider';
import {CoreSearchComponent} from '../../../../../core/core.search.comp';
import { TranslateService } from '@ngx-translate/core';
import {SearchSettingsProvider} from "../../../settings/providers/search.settings.provider";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from "../../../slick-grid/slick-grid.config";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {SearchViewsComponent} from "../../../views/views";
import {ViewsProvider} from "../../../views/providers/views.provider";
import {SecurityService} from "../../../../../services/security/security.service";
import { TitlesSlickGridService } from '../../../../../views/titles/modules/versions/services/slickgrid.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {TitlesViewsProvider} from "../../../../../views/titles/providers/views.provider";
import {TitlesSlickGridProvider} from "../../../../../views/titles/providers/titles.slick.grid.provider";
import { Output } from '@angular/core';


@Component({
    selector: 'imfx-titles-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        TitlesTabGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: TitlesViewsProvider},
        SearchFormProvider,
        SearchSettingsProvider,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: DetailTitlesTabGridProvider},
        {provide: SlickGridService, useClass: TitlesTabGridService},

    ]
})
@Injectable()
export class IMFXTitlesTabComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
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
                    enabled: true
                },
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                bottomPanel: {
                    enabled: true
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.titleSettingsPopup'
                    }
                },
            }
        })
    });

    /**
     * Views
     * @type {ViewsConfig}
     */
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @Output() afterVersionCreation: EventEmitter<any> = new EventEmitter<any>();
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'TitleTree',
        }
    };
    public titlesId: number = 0;
    private rowIndex;
    @ViewChild('searchGridModule', {static: false}) private searchGridModule;
    private compIsLoaded = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(
        protected securityService: SecurityService,
        protected injector: Injector,
        private translate: TranslateService) {
        super(injector);
    }

    private _config: any;

    get config(): any {
        return this._config;
    }

    @Input('config') set config(_config: any) {
        this._config = _config;
    }

    ngOnInit() {}

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.buildGridByRowId();
        }
    };

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.buildGridByRowId();
        }
    }

    private buildGridByRowId() {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        this.slickGridComp.provider.resize();
        let id = this.config.titlesId;
        if (!this.config.titlesId) {
            id = this.config.file.PGM_ABS_ID;
        }
        if(this.config.isCarrierDetail) {
            id = this.config.file.ID;
        }
        (<DetailTitlesTabGridProvider>this.slickGridComp.provider).getRowsById(id, this.config.isCarrierDetail).pipe(
            takeUntil(this.destroyed$)
        ).subscribe(
            (resp) => {
                this.compIsLoaded = true;

                // If empty resp - build empty page
                if (!(<any>resp).Data || (<any>resp).Data.length === 0) {
                    this.slickGridComp.provider.clearData(true);
                    return;
                }

                this.slickGridComp.provider.buildPageByData((<any>resp));
                this.slickGridComp.provider.onGridEndSearch.emit(true);
                let selectedRow = (<any>this.slickGridComp.provider.getData()).filter( (el) => { return el.ID == this.config.titlesId; });
                if (selectedRow.length) {
                    this.slickGridComp.provider.setSelectedRow(selectedRow[0].indent);
                }
            }
        );
    }

    createVersion($event) {
        // (this.slickGridComp.provider as TitlesSlickGridProvider).createSubversion($event, (context) => {
        //
        // })
    }
    refresh(){
        this.buildGridByRowId();
    }
}
