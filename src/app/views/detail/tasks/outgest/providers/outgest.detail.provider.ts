import {DetailProvider} from "../../../../../modules/search/detail/providers/detail.provider";
import {ActivatedRoute, Router} from "@angular/router";
import {Inject, Injector} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {SessionStorageService} from "ngx-webstorage";
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import { Location } from '@angular/common';

export class OutgestDetailProvider extends DetailProvider {
    constructor(@Inject(ActivatedRoute) public route: ActivatedRoute,
                @Inject(Location) public location: Location,
                @Inject(SessionStorageService) public storage: SessionStorageService,
                @Inject(TranslateService)public translate: TranslateService,
                @Inject(Router)public router: Router,
                public injector: Injector,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationRef);
    }
    /**
     *Set video block visible
     *
     */
    setVideoBlock(file?: any) {
        if (!file) {
            file = this.config.options.file;
        }
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        this.config.options.mediaParams.mediaType = '';
        this.config.options.mediaParams.addMedia = false;
        let mType = file['MEDIA_TYPE'];
        if (this.checkObjectExistance(mediaSubtypes) || (!!file.IsLive)) {
            if ((typeof(file['PROXY_URL']) == 'string' && file['PROXY_URL'].match(/(?:http)|(?:https)/g)) || (file.IsLive ? true : false) || (file.UsePresignedUrl ? true : false)) {
                this.config.options.mediaParams.addMedia = true;
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || (file.IsLive ? true : false)) {
                    this.config.options.mediaParams.mediaType = 'htmlPlayer';
                }
                else if (mType == mediaSubtypes.Image) {
                    let fileExtension = file.PROXY_URL.match(/\.[0-9A-Za-z]+$/g);
                    if (fileExtension && fileExtension[0].toLocaleLowerCase() == '.tif' ||
                        fileExtension && fileExtension[0].toLocaleLowerCase() == '.tiff') {
                        this.config.options.mediaParams.mediaType = 'tifViewer';
                    }
                    else if (fileExtension && fileExtension[0].toLocaleLowerCase() === '.tga') {
                        this.config.options.mediaParams.mediaType = 'tgaViewer';
                    }
                    else {
                        this.config.options.mediaParams.mediaType = 'image';
                    }
                } else if (mType == mediaSubtypes.Subtile) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'subtitle';
                    file.UsePresignedUrl = false; // ignore this parameter for subs
                }
            }
            else { // if media block must to say 'not available'
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || mType == mediaSubtypes.Image || mediaSubtypes.Doc.filter(el => {
                        return el === mType;
                    }).length > 0) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'defaultViewer';
                }
                else if (mType == mediaSubtypes.Subtile) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'subtitle';
                }
            }
            if (!file || Object.keys(file).length === 0) {
                this.config.options.mediaParams.addMedia = true;
                this.config.options.mediaParams.mediaType = 'defaultViewer';
            }
            return this.config.options.mediaParams;
        }
    };
}
