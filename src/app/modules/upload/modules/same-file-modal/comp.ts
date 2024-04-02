/**
 * Created by Sergey Trizna on 30.03.2017.
 */
import {ChangeDetectionStrategy, Component, EventEmitter, Injector, ViewChild, ViewEncapsulation} from '@angular/core';
import {IMFXModalComponent} from '../../../imfx-modal/imfx-modal';
import {SlickGridProvider} from '../../../search/slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../../../search/slick-grid/services/slick.grid.service';
import {ViewsProvider} from '../../../search/views/providers/views.provider';
import {MediaViewsProvider} from '../../../../views/media/providers/views.provider';
import {SearchViewsComponent} from '../../../search/views/views';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from '../../../search/slick-grid/slick-grid.config';
import {SlickGridComponent} from '../../../search/slick-grid/slick-grid';
import {SecurityService} from '../../../../services/security/security.service';
import {ViewsConfig} from '../../../search/views/views.config';
import {SearchThumbsComponent} from '../../../search/thumbs/search.thumbs';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../../search/thumbs/search.thumbs.config';
import {SearchThumbsProvider} from '../../../search/thumbs/providers/search.thumbs.provider';
import {MediaAppSettings} from '../../../../views/media/constants/constants';
import {CoreComp} from '../../../../core/core.comp';
import {MediaSameFilesSlickGridProvider} from "./provders/media.same.files.slickgrid.provider";
import {UploadProvider} from "../../providers/upload.provider";

@Component({
    selector: 'modal-same-file-comp',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./styles/index.scss'],
    providers: [
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: MediaSameFilesSlickGridProvider},
        SlickGridService,
        ViewsProvider,
        {provide: ViewsProvider, useClass: MediaViewsProvider},
        MediaAppSettings,
    ]
})
export class IMFXListOfSameFilesComponent extends CoreComp {
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
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
    // @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public modalRef: IMFXModalComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                viewMode: 'table',
                tileSource: ['TITLE', 'MEDIA_TYPE_text', 'MEDIA_FORMAT_text', 'DURATION_text'],
                // searchType: 'title',
                searchType: 'Media',
                exportPath: 'Media',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: true,
                isTree: {
                    enabled: false,
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.mediaSettingsPopup'
                    }
                },
                search: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                multiSelect: true,
            }
        })
    });
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'MediaGrid',
        }
    };
    private medias: any[] = [];

    constructor(protected injector: Injector, private securityService: SecurityService, public uploadProvider: UploadProvider) {
        super(injector);
        this.modalRef = this.injector.get('modalRef');
        this.medias = this.modalRef.getData().medias;
    }

    ngAfterViewInit() {
        this.slickGridComp.provider.buildPageByData({
            Data: this.medias
        });
        // setTimeout(() => {
        //     return new Promise((resolve) => {
        //         resolve();
        //     }).then(() => {
        //         this.slickGridComp.provider.resize();
        //     });
        // });

    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    // navigateToMedia(id) {
    //     return this.router.navigate(
    //         [
    //             appRouter.media.detail.substr(
    //                 0,
    //                 appRouter.media.detail.lastIndexOf('/')
    //             ),
    //             id
    //         ]
    //     );
    // }

}
