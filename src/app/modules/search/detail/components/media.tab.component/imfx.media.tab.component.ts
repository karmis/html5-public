
import {debounceTime,  takeUntil } from 'rxjs/operators';
import {
    ChangeDetectorRef,
    Component, ComponentRef,
    EventEmitter,
    Injectable,
    Injector,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
// Views
import {ViewsConfig} from '../../../../../modules/search/views/views.config';
import {DetailMediaTabViewsProvider} from './providers/views.provider';
// Grid
import {MediaGridService} from '../../../../../views/titles/modules/media/services/grid.service';
// Form
import {SearchFormProvider} from '../../../../../modules/search/form/providers/search.form.provider';
// Search Modal
// Modal
// Search Columns
// Info Modal
// Thumbs
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../../../../modules/search/thumbs/search.thumbs.config';
import {SearchThumbsProvider} from '../../../../../modules/search/thumbs/providers/search.thumbs.provider';
// constants
import {MediaAppSettings} from '../../../../../views/titles/modules/media/constants/constants';
import {DetailMediaTabGridProvider} from './providers/grid.provider';
import {SearchThumbsComponent} from '../../../thumbs/search.thumbs';
import {CoreSearchComponent} from '../../../../../core/core.search.comp';
import { TranslateService } from '@ngx-translate/core';
import {SearchSettingsProvider} from "../../../settings/providers/search.settings.provider";
import {SlickGridProvider} from "../../../slick-grid/providers/slick.grid.provider";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import {SlickGridService} from "../../../slick-grid/services/slick.grid.service";
import {SlickGridComponent} from "../../../slick-grid/slick-grid";
import {SearchViewsComponent} from "../../../views/views";
import {ViewsProvider} from "../../../views/providers/views.provider";
import {SlickGridButtonFormatterEventData, SlickGridResp} from "../../../slick-grid/types";
import {SecurityService} from "../../../../../services/security/security.service";
import { TitlesSlickGridService } from '../../../../../views/titles/modules/versions/services/slickgrid.service';
import { Subject } from 'rxjs';
import {VersionsTabSlickGridProvider} from "../versions.tab.component/providers/versions.tab.slickgrid.provider";
import {UploadProvider} from "../../../../upload/providers/upload.provider";
import {UploadModel} from "../../../../upload/models/models";
import {appRouter} from "../../../../../constants/appRouter";
import {IMFXModalComponent} from "../../../../imfx-modal/imfx-modal";
import {lazyModules} from "../../../../../app.routes";
import {ExportComponent} from "../../../../export/export";
import {IMFXModalProvider} from "../../../../imfx-modal/proivders/provider";

import { SearchSettingsConfig } from '../../../../../modules/search/settings/search.settings.config';
@Component({
    selector: 'imfx-media-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        MediaGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: DetailMediaTabViewsProvider},
        MediaAppSettings,
        SearchFormProvider,
        SearchThumbsProvider,
        SearchSettingsProvider,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: DetailMediaTabGridProvider},
        {provide: SlickGridService, useClass: TitlesSlickGridService},
        IMFXModalProvider
    ]
})
@Injectable()
export class IMFXMediaTabComponent extends CoreSearchComponent {
    /**
     * Thumbs
     * @type {SearchThumbsConfig}
     */
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

    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                exportPath: 'Media',
                searchType: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                clientSorting: true,
                selectFirstRow: false,
                externalWrapperEl: '#externalWrapperSlickGridForMediaTab',
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                pager: {
                    enabled: false,
                }
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
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
        }
    };
    private detailContext;
    private assocMedia;

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
                },
                forDetail: true
            }
        }
    };
    private rowIndex;
    @ViewChild('searchGridModule', {static: false}) private searchGridModule;
    private compIsLoaded = false;
    @Output() onSetTaggingNode: EventEmitter<any> = new EventEmitter();
    private destroyed$: Subject<any> = new Subject();


    constructor(
        protected securityService: SecurityService,
        protected appSettings: MediaAppSettings,
        protected injector: Injector,
        private translate: TranslateService,
        private uploadProvider: UploadProvider,
        private cdr: ChangeDetectorRef,
        public modalProvider: IMFXModalProvider) {
        super(injector);
        this.viewsProvider = this.injector.get(ViewsProvider);
    }

    private _config: any;

    get config(): any {
        return this._config;
    }

    @Input('config') set config(_config: any) {
        this._config = _config;
    }

    ngOnInit() {
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    ngAfterViewInit() {
        if (this.config.contextFromDetail) {
            this.detailContext = this.config.contextFromDetail;
        }
        this.slickGridComp.provider.getSlick().setOptions(this.slickGridComp.options.plugin);

        if (this.config.elem && !this.config.elem._config._isHidden) {
            this.compIsLoaded = true;
            setTimeout(()=>{
                (<DetailMediaTabGridProvider>this.slickGridComp.provider).getRowsById(this.config.file.ID, this.config.assocMedia, this.config.isCarrierDetail, this.config.isLinkedMedia, this.config.isChildMedia).pipe(
                    takeUntil(this.destroyed$)
                ).subscribe(
                    (resp: SlickGridResp) => {
                        this.slickGridComp.provider.buildPageByData(resp);
                    }
                )
            });
        }
        this.slickGridComp.provider.formatterPlayButtonOnClick.pipe(debounceTime(500)).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((d: SlickGridButtonFormatterEventData) => {
            this.setVideoBlock(d.data.data, d.data.rowNumber);

            //toDo toggle play after init player may be async (probably)
            let htmlPlayer = this.detailContext.playerComponents
                && this.detailContext.playerComponents.compRef.instance
                || null;

            if(!htmlPlayer) {
                return;
            }

            htmlPlayer.togglePlay(d.value);
        });


        if(this.uploadProvider.baseUploadMenuRef) {
            this.uploadProvider.baseUploadMenuRef.notifyUpload.subscribe((data: {model: UploadModel, models: UploadModel[]}) => {
                if(window.location.hash.indexOf(appRouter.versions.detail.split(':')[0]) > -1) {
                    // if(this.config.file && this.config.file.ID === data.model.meta.version.id) {
                        this.needUpdateGrid = true;
                        this.cdr.detectChanges();
                    // }
                }
            });
        }


        //this.buildGridByRowId();
    }

    private needUpdateGrid: boolean = false;

    onClickRefreshGrid() {
        this.loadComponentData(true);
        this.needUpdateGrid = false;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    checkObjectExistance(obj): boolean {
        if (Object.keys(obj).length) {
            return true;
        }
        return false;
    };

    setNode(o) {
        this.onSetTaggingNode.emit(o);
    };

    setVideoBlock(data, index) {
        let mediaSubtypes = this.detailContext.config.appSettings.getMediaSubtypes();
        this.detailContext.config.options.params.mediaType = '';
        this.detailContext.config.options.params.addMedia = false;
        let mType = data['MEDIA_TYPE'];
        if (this.checkObjectExistance(mediaSubtypes) || data.IsLive) {
            if (typeof(data['PROXY_URL']) === 'string'
                && data['PROXY_URL'].match(/(?:http)|(?:https)/g)) {
                this.detailContext.config.options.params.addMedia = true;
                if (mType === mediaSubtypes.Media || mType === mediaSubtypes.Audio || data.IsLive) {
                    this.detailContext.config.options.params.mediaType = 'htmlPlayer';
                } else if (mType === mediaSubtypes.Subtile) {
                    this.detailContext.config.options.params.mediaType = 'subtitle';
                } else if (mType === mediaSubtypes.Image) {
                    let fileExtension = data['PROXY_URL'].match(/\.[0-9A-Za-z]+$/g);
                    if (fileExtension && fileExtension[0].toLocaleLowerCase() === '.tif' ||
                        fileExtension && fileExtension[0].toLocaleLowerCase() === '.tiff') {
                        this.detailContext.config.options.params.mediaType = 'tifViewer';
                    }
                    else if (fileExtension && fileExtension[0].toLocaleLowerCase() === '.tga') {
                        this.detailContext.config.options.params.mediaType = 'tgaViewer';
                    }
                    else {
                        this.detailContext.config.options.params.mediaType = 'image';
                    }
                }
                else if (mediaSubtypes.Doc.filter(el => {
                    return el === mType;
                }).length > 0) {
                    let fileExtension = data['PROXY_URL'].match(/\.[0-9A-Za-z]+$/g);
                    switch (fileExtension[0].toLocaleLowerCase()) {
                        case '.tif': {
                            this.detailContext.config.options.params.mediaType = 'tifViewer';
                            break;
                        }
                        case '.tiff': {
                            this.detailContext.config.options.params.mediaType = 'tifViewer';
                            break;
                        }
                        case '.tga': {
                            this.detailContext.config.options.params.mediaType = 'tgaViewer';
                            break;
                        }
                        case '.docx': {
                            this.detailContext.config.options.params.mediaType = 'docxViewer';
                            break;
                        }
                        case '.pdf': {
                            this.detailContext.config.options.params.mediaType = 'pdfViewer';
                            break;
                        }
                        case '.xml': {
                            this.detailContext.config.options.params.mediaType = 'xmlViewer';
                            break;
                        }
                        default: {
                            this.detailContext.config.options
                                .params.mediaType = 'downloadFileViewer';
                            break;
                        }
                    }
                }
            }
            else { // if media block must to say 'not available'
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || mType == mediaSubtypes.Image || mediaSubtypes.Doc.filter(el => {
                    return el === mType;
                }).length > 0) {
                    this.detailContext.config.options.params.addMedia = true;
                    this.detailContext.config.options.params.mediaType = 'defaultViewer';
                } else if (mType === mediaSubtypes.Subtile) {
                    this.detailContext.config.options.params.addMedia = true;
                    this.detailContext.config.options.params.mediaType = 'subtitle';
                }
            }
        }
        this.detailContext.refreshLayout({
            'Data': data,
            'RowIndex': index,
            'MediaType': this.detailContext.config.options.params.mediaType
        });
    };

    public loadComponentData(forced: boolean = false) {
        if(!this.slickGridComp || !this.slickGridComp.provider) {
            return;
        }
        if (!this.compIsLoaded || forced) {
            (<DetailMediaTabGridProvider>this.slickGridComp.provider).getRowsById(this.config.file.ID, this.config.assocMedia, this.config.isCarrierDetail, this.config.isLinkedMedia, this.config.isChildMedia).pipe(
                takeUntil(this.destroyed$)
            ).subscribe(
                (resp: SlickGridResp) => {
                    this.slickGridComp.provider.buildPageByData(resp);
                    this.compIsLoaded = true;
                }
            )
        }
    }
}
