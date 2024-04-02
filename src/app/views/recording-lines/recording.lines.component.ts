import {Component, EventEmitter, ViewChild, ViewEncapsulation} from '@angular/core';
import { Subject} from "rxjs";
import {IMFXRouteReuseStrategy} from "../../strategies/route.reuse.strategy";
import {Location} from "@angular/common";
import {Router} from "@angular/router";
import {SecurityService} from "../../services/security/security.service";
import {ViewsConfig} from "../../modules/search/views/views.config";
import {SearchSettingsConfig} from "../../modules/search/settings/search.settings.config";
import {SearchViewsComponent} from "../../modules/search/views/views";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../modules/search/slick-grid/slick-grid.config";
import {SlickGridProvider} from "../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../modules/search/slick-grid/services/slick.grid.service";
import {SlickGridComponent} from "../../modules/search/slick-grid/slick-grid";
import {ViewsProvider} from "../../modules/search/views/providers/views.provider";
import {takeUntil} from "rxjs/operators";
import {RecordingLinesService} from "./services/recording.lines.service";
import {RecordingLinesSlickGridProvider} from "./providers/recording.lines.slick.grid.provider";
import {SearchFormProvider} from '../../modules/search/form/providers/search.form.provider';

@Component({
    selector: 'recording-lines',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ViewsProvider,
        RecordingLinesSlickGridProvider,
        {provide: SlickGridProvider, useClass: RecordingLinesSlickGridProvider},
        RecordingLinesService,
        SearchFormProvider
    ]
})
export class RecordingLinesComponent {
    @ViewChild('recordingLines', {static: true}) private recordingLines: any;
    @ViewChild('overlay', {static: true}) private overlay: any;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
        }
    };
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: RecordingLinesSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                searchType: 'Media',
                exportPath: 'Media',
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                isTree: {
                    enabled: false,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                displayNoRowsToShowLabel: true,
                pager: {
                    enabled: false
                },
                bottomPanel: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true,
                rowHeight: 35
            }
        })
    });

    /**
     * Settings
     * @type {SearchSettingsConfig}
     */
    searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
    };

    error: boolean = false;
    text: string = '';
    private destroyed$: Subject<any> = new Subject();

    constructor(
        public location: Location,
        protected securityService: SecurityService,
        private router: Router) {
    }


    public ngOnInit(): void {
    }
    ngAfterViewInit() {
        this.loadGrid();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    clickBack() {
        this.location.back();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    private loadGrid() {
        (<RecordingLinesSlickGridProvider>this.slickGridComp.provider).getRowsById(65203)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(res => {
                (<SlickGridProvider>this.slickGridComp.provider).buildPageByData(res);
                // this.cdr.detectChanges();
            });
    }
}
