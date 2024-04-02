import {
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    EventEmitter,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {SearchFormProvider} from "../../../form/providers/search.form.provider";
import {TabMisrSlickGridProvider} from "./providers/tab.misr.slick.grid.provider";
import {ViewsProvider} from '../../../views/providers/views.provider';
import {MisrAppSettings} from '../../../../../views/misr/constants/constants';
import {SearchColumnsProvider} from '../../../columns/providers/search.columns.provider';
import {SearchRecentProvider} from '../../../recent/providers/search.recent.provider';
import {SearchAdvancedProvider} from '../../../advanced/providers/search.advanced.provider';
import {MisrSearchAdvancedProvider} from '../../../../../views/misr/providers/misr.search.advanced.provider';
import {ChartProvider} from '../../../chart/providers/chart.provider';
import {SearchColumnsService} from '../../../columns/services/search.columns.service';
import {SearchSettingsProvider} from '../../../settings/providers/search.settings.provider';
import {ChartService} from '../../../chart/services/chart.service';
import {IMFXModalProvider} from '../../../../imfx-modal/proivders/provider';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {MisrService} from '../../../../../views/misr/services/service';
import {RaiseWorkflowWizzardProvider} from '../../../../rw.wizard/providers/rw.wizard.provider';
import {ExportProvider} from '../../../../export/providers/export.provider';
import {ActivatedRoute, Router} from '@angular/router';
import {SecurityService} from '../../../../../services/security/security.service';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../../slick-grid/slick-grid.config';
import {ViewsConfig} from '../../../views/views.config';
import {OverlayComponent} from '../../../../overlay/overlay';
import {MisrViewsProvider} from "../../../../../views/misr/providers/views.provider";
import {TabMisrViewsProvider} from "./providers/tab.misr.views.provider";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-misr-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        // '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: TabMisrSlickGridProvider},
        TabMisrViewsProvider,
        {provide: MisrViewsProvider, useClass: TabMisrViewsProvider},
        MisrAppSettings,
        MisrService,
        SlickGridService
    ]
})
@Injectable()
export class IMFXMisrTabComponent {
    @ViewChild('misrDetailWrapper', {static: false}) misrDetailWrapper: ElementRef;
    @ViewChild('overlay', {static: false}) overlay: OverlayComponent;
    config: any;
    compIsLoaded = false;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    @ViewChild('slickGridComp', {static: true}) slickGridComp: SlickGridComponent;
    public refreshOn = false;
    public refreshStarted = false;
    public searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                // searchType: 'ScheduleSearch',
                searchType: 'misr',
                exportPath: '-4008',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                clientSorting: true,
                pager: {enabled: false},
                search: {enabled:false},
                customProviders: {
                    viewsProvider: TabMisrViewsProvider
                },
                isTree: {
                    enabled: false,
                    startState: 'collapsed',
                    expandMode: 'firstLevel'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.misrSettingsPopup'
                    }
                },
                isExpandable: {
                    enabled: true,
                    startState: 'collapsed'
                },
            },
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: '-4008',
        }
    };

    private destroyed$: Subject<any> = new Subject();

    constructor(protected viewsProvider: ViewsProvider,
                protected cdr: ChangeDetectorRef,
                protected appSettings: MisrAppSettings,
                protected router: Router,
                protected misrService: MisrService,
                protected securityService: SecurityService,
                protected route: ActivatedRoute,
                protected injector: Injector) {
    }

    ngAfterViewInit() {
        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.selectComp();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectComp() {
        if(!this.overlay || !this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        this.overlay.show($(this.misrDetailWrapper.nativeElement));
        this.misrService.getMisrForMediaById(this.config.file.ID).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            this.slickGridComp.provider.clearData();
            this.slickGridComp.provider.buildPageByData({Data: res});
            // if (this.viewsProvider.ui.getData().length === 0) {
                this.viewsProvider.load().subscribe(view => {
                    const id = view.DefaultView.Id;
                    let selectedId = id;
                    if (id === -1 && view.UserViews.length > 0) {
                        selectedId = Number(view.UserViews[0].Id);
                        this.viewsProvider.onSelect(selectedId);
                    }
                    this.viewsProvider.ui.setSelected(selectedId);
                });
            // }
            this.cdr.markForCheck();
            this.overlay.hide($(this.misrDetailWrapper.nativeElement));
        })
    };

    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.selectComp();
        }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    // private fillColumns() {
    //     this.columns = [];
    //     let idx = 0;
    //     this.columns = this.injector.get(MisrViewsProvider).getCustomColumns();
    //     return this.columns;
    // }
}
