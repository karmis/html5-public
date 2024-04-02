import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injectable,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {SearchFormProvider} from 'app/modules/search/form/providers/search.form.provider';
import {SlickGridService} from 'app/modules/search/slick-grid/services/slick.grid.service';
import {SlickGridProvider} from 'app/modules/search/slick-grid/providers/slick.grid.provider';
import {ViewsProvider} from 'app/modules/search/views/providers/views.provider';
import {CarrierDetailAppSettings} from 'app/views/detail/carrier/constants/constants';
import {IMFXFileExplorerTabSlickGridProvider} from './providers/slickgrid.provider';
import {IMFXFileExplorerTabViewsProvider} from './providers/views.provider';
import {SlickGridComponent} from 'app/modules/search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from 'app/modules/search/slick-grid/slick-grid.config';
import {Observable, Subject} from 'rxjs';
import {HttpService} from 'app/services/http/http.service';
import {SecurityService} from 'app/services/security/security.service';
import {map} from 'rxjs/operators';
import {CarrierDetailFileBrowseResponseType, CarrierDetailFileType} from 'app/models/carrier/types';
import {ViewsConfig} from 'app/modules/search/views/views.config';


@Component({
    selector: 'imfx-file-browser-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SearchFormProvider,
        SlickGridService,
        {provide: SlickGridProvider, useClass: IMFXFileExplorerTabSlickGridProvider},
        {provide: ViewsProvider, useClass: IMFXFileExplorerTabViewsProvider},
        CarrierDetailAppSettings
    ]
})
@Injectable()
export class IMFXFileExplorerTabComponent {
    config: any;
    compIsLoaded = false;
    carrierId;
    lastResponse = null;
    // @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('slickGrid', {static: true}) slickGridComp: SlickGridComponent;

    private searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                clientSorting: true,
                isThumbnails: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                fullWidthRows: true
            }
        })
    });

    protected viewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'FileGrid',
        }
    };

    private showOverlay: boolean = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private httpService: HttpService,
                private viewsProvider: ViewsProvider,
                private securityService: SecurityService
    ) {
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.viewsProvider.config = this.viewsConfig;
        this.slickGridComp.provider.setDefaultColumns(
            this.fillColumns(),
            this.columns.map(function(el) { return el.field; } ),
            true
        );

        // if (this.config.elem && !this.config.elem._config._isHidden) {
        //     this.selectFileExplorer();
        // }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    getListOfFilesByCarrierId(carrierId: number, UId: number = 1): Observable<CarrierDetailFileBrowseResponseType> {
        return this.httpService
            .get(
                `/api/v3/carrier/${carrierId}/filebrowser/${UId}`
            ).pipe(
                map(res => res.body)
            );
    }

    bindDataToGrid(data) {
        // const _data = {
        //     Rows: data.length,
        //     Data: data
        // };
        // this.slickGridComp.provider.buildPageByData(_data);
        (this.slickGridComp.provider as IMFXFileExplorerTabSlickGridProvider).buildPageByResponseData(data);
        this.slickGridComp.provider.onGridEndSearch.emit(true);
    }

    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.selectFileExplorer();
        }
    }

    columns = [];
    private fillColumns() {
        this.columns = [];
        let idx = 0;
        this.columns = this.viewsProvider.getCustomColumns();
        return this.columns;
    }

    getParentDirEl(parentUId) {
        const oooGridEl: CarrierDetailFileType = {
            Id: -1,
            IsFolder: true,
            Name: '[parent folder]',
            UId: parentUId,
        }

        return oooGridEl;
    }

    selectFileExplorer(UId = 1) {
        this.toggleOverlay(true);
        this.getListOfFilesByCarrierId(this.carrierId, UId).subscribe((res) => {
            let _files = $.extend(true, [], res && res.Files || []);
            this.lastResponse = res;

            //todo maybe implement slick-grid folderMode
            if (UId !== 1) {
                _files.unshift(this.getParentDirEl(res.ParentUid));
            }
            _files = _files.map(el => {
                if(el.IsFolder) {
                    el.SizeString = '';
                }
                return el;
            });
            this.bindDataToGrid(_files);
            this.toggleOverlay(false);
        }, error => {

        });
    }

    toggleOverlay(show) {
        this.showOverlay = show;
        this.cdr.detectChanges();
    }

    // hasPermissionByName(name) {
    //     return this.securityService.hasPermissionByName(name);
    // }
    //
    // hasPermission(path) {
    //     return this.securityService.hasPermissionByPath(path);
    // }
}
