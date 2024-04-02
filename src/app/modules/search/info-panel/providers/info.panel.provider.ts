/**
 * Created by Ivan Banan on 12.01.2019.
 */
import { EventEmitter, Injectable, Injector } from '@angular/core';
import { Subscription } from 'rxjs';
import { DetailConfig, GoldenConfig } from '../detail.config';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Cookie } from 'ng2-cookies';
import { SessionStorageService } from "ngx-webstorage";
import { MediaDetailDetailsViewResponse } from '../../../../models/media/detail/detailsview/media.detail.detailsview.response';
import { MediaDetailMediaCaptionsResponse } from '../../../../models/media/detail/caption/media.detail.media.captions.response';
import { MediaDetailPacSubtitlesResponse } from '../../../../models/media/detail/pacsubtitles/media.detail.pac.subtitiles.response';
import { SlickGridProvider } from '../../slick-grid/providers/slick.grid.provider';
import { SlickGridEventData } from '../../slick-grid/types';
import { TranslateService } from "@ngx-translate/core";
import { InfoPanelConfig } from '../info.panel.config';
import { InfoPanelThumbProvider } from './info.panel.thumb.provider';
import {NotificationService} from "../../../notification/services/notification.service";
import { InfoPanelComponent } from '../info.panel.component';
import {debounceTime} from "rxjs/operators";
import {IMFXSubtitlesGrid} from "../../detail/components/subtitles.grid.component/subtitles.grid.component";

@Injectable()
export class InfoPanelProvider {
    public onToggle: EventEmitter<boolean> = new EventEmitter();
    lastDetailId: number = null;
    config: InfoPanelConfig;
    moduleContext: any;

    inducingComponent: string;
    // r_params: any;
    tabsData = [];
    file: Object = {};
    // _accordions: any = [];
    // userFriendlyNames: Object = {};

    params = {
        addPlayer: false,
        addMedia: false,
        addImage: false,
        showAllProperties: false,
        isSmoothStreaming: false,
        addViewer: false,
        mediaType: ''
    };

    timecodeFormatString: string = 'Pal';
    timecodeChangeUpdateInited: boolean = false;
    playerReadyInited: boolean = false;
    detailInfoForUpdate = null;
    currentParentGridProvider: any = SlickGridProvider;

    getSubsSubscription: Subscription;

    constructor(public route: ActivatedRoute,
                public location: Location,
                public storage: SessionStorageService,
                public router: Router,
                public translate: TranslateService,
                public injector: Injector,
                protected notificationService: NotificationService) {
    }

    infoPanelInit() {
        this.config.options.typeDetailsLocal = this.config.options.typeDetailsLocal || this.config.options.typeDetails.replace('-', '_');

        let arrSgp: SlickGridProvider[] = this.getSlickGridProviders();
        if (arrSgp && arrSgp.length > 0) {
            for (let sgp of arrSgp) {
                if(sgp && sgp.onDataUpdated){
                    sgp.onDataUpdated.pipe(debounceTime(300)).subscribe((data: SlickGridEventData) => {
                        const type = (sgp.config && sgp.config.options.searchType) || null;
                        if (type && data.row){
                            this.currentParentGridProvider = sgp;
                            this.switchInfoConfig(type);
                        }

                        // if(data.row) {
                            this.update(data.row);
                        // }
                    });
                }
            }
        }
    }

    /**
     * Use if have two (or more) types of content view kind (media item ,version item)
     * @param typeDetails
     */
    switchInfoConfig(typeDetails) {
        const infoConfigs = this.config.moduleContext.infoConfigs;
        if(!infoConfigs || !infoConfigs[typeDetails]) {
            return;
        }

        (this.config.moduleContext as InfoPanelComponent).publicSetConfig(infoConfigs[typeDetails]);
        this.config = this.config.moduleContext.config;
        this.config.options.typeDetailsLocal = this.config.options.typeDetailsLocal || this.config.options.typeDetails.replace('-', '_');
    }


    public getSlickGridProviders(): SlickGridProvider[] {
        let gridProviders = this.config.moduleContext.gridProviders;
        let sgc = (this.config && this.config.componentContext && this.config.componentContext.slickGridComp) || null;
        let providerType = (sgc && sgc.config) ? sgc.config.providerType : SlickGridProvider;
        let sgp = (sgc && sgc.provider) ? sgc.provider : this.injector.get(providerType);

        let arrSgp: SlickGridProvider[] = (gridProviders && gridProviders.length > 0)
            ? gridProviders
            : !!sgp
                ? [sgp]
                : [];

        return arrSgp;
    }

    update(detailInfo) {
        this.getSubsSubscription && this.getSubsSubscription.unsubscribe();
        this.detailInfoForUpdate = detailInfo;
        if (this.getStateForPanel() === false) {
            return;
        }
        let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        if (detailInfo && detailInfo.ID) {
            // not need for new implementation; it checked in slick grid (onDataUpdated)
            if (this.lastDetailId == detailInfo.ID) {
                if (this.config.options.file.MEDIA_TYPE == mediaSubtypes.Subtile) { // for checking external Search Text
                    if (Array.isArray(this.config.options.pacsubtitles) && this.config.options.pacsubtitles.length) {
                        this.config.moduleContext.subtitlesPacGrid.updateSubtitle();
                    }
                    if (Array.isArray(this.config.options.subtitles) && this.config.options.subtitles.length) {
                        this.config.moduleContext.subtitlesGrid.updateSubtitle();
                    }
                }
                return;
            } else {
                this.lastDetailId = detailInfo.ID;
            }
        }

        if(this.config.moduleContext.isSubtile() || this.config.moduleContext.isMedia() || this.config.moduleContext.isImage()) {
            this.config.moduleContext.activeTab = 0;
        }

        this.config.moduleContext.cd.detectChanges();
        if (!detailInfo) {
            this.config.options.file = {};
            this.lastDetailId = null;
            this.config.moduleContext.cd.detectChanges();
            return;
        }

        this.config.options.file = detailInfo;
        Cookie.set('id', this.config.options.file['ID'], 1, '/');
        this.setVideoBlock();
        this.config.moduleContext.cd.detectChanges();
        this.getColumnData();
        // get thumb url
        this.config.options.file = this.injector.get(InfoPanelThumbProvider).buildURL(
            this.config.options.file,
            this.config.options.appSettings
        );
        this.getColumnsFriendlyNames();
        //    this.refreshVideo();
        this.config.options.subtitles = null;
        this.config.options.pacsubtitles = null;
        // check presiganed url

        if (this.config.options.file.MEDIA_TYPE == mediaSubtypes.Image) {
            this.config.moduleContext.getMediaUrl(this.config.options.file).subscribe(url => {
                this.config.options.file.PROXY_URL = url;
            });
        }

        if (this.config.moduleContext.isMedia()) {
            this.config.moduleContext.showOverlayForSubtitles();

            this.getSubsSubscription = this.config.options.service.getSubtitles(this.config.options.file.ID)
                .subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
                        this.config.options.subtitles = res;
                        this.config.moduleContext.cd.detectChanges();
                        let compRef = this.config.moduleContext;
                        // compRef.subtitlesGrid && compRef.subtitlesGrid.textMarkerConfig && compRef.subtitlesGrid.textMarkerConfig.moduleContext.searchKeyUp();

                        if (!this.playerReadyInited) {
                            if (compRef.detailVideo) {
                                this.playerReadyInited = true;
                            }
                        }
                        this.initTimecodeChangeUpdate();
                        if (this.config.options.file.MEDIA_TYPE !== mediaSubtypes.Subtile) {
                            setTimeout(() => {
                                this.config.moduleContext.hideOverlayForSubtitles(res);
                            });
                        }
                    },
                    (error) => {
                        let message = this.translate.instant('details_item.subtitles_not_found');
                        this.notificationService.notifyShow(2, message, false);
                        if (this.config.options.file.MEDIA_TYPE !== mediaSubtypes.Subtile) {
                            setTimeout(() => {
                                this.config.moduleContext.hideOverlayForSubtitles();
                            });
                        }
                    });

            this.config.moduleContext.toggleOverlayForTagging(true);
            this.config.moduleContext.mediaTaggingConfig = {
                file: this.config.options.file,
                typeDetailsLocal: this.config.options.typeDetailsLocal,
                typeDetails: this.config.options.typeDetails,
                // elem: this.config.moduleContext.detailVideo,
                context: this,
                isSimpleDetail: true,
                detailContext: this.config.moduleContext
            };
            this.config.moduleContext.cd.detectChanges();
            if(this.config.moduleContext.mediaTaggingEl) {
                this.config.moduleContext.mediaTaggingEl.selectMediaTagging();
            }
        }

        if (this.config.moduleContext.isSubtile()) {
            this.config.moduleContext.showOverlayForSubtitles();

            this.config.options.service.getPacSubtitles(this.config.options.file.ID)
                .subscribe((res: Array<MediaDetailPacSubtitlesResponse>) => {
                        this.config.options.pacsubtitles = res;
                        this.config.moduleContext.cd.markForCheck();
                        setTimeout(() => {
                            this.config.moduleContext.hideOverlayForSubtitles(res);
                            this.config.moduleContext.cd.detectChanges();
                                setTimeout(() => {
                                    this.config.moduleContext.subtitlesPacGrid.updateSubtitle();
                                });
                        });
                    },
                    (error) => {
                        let message = this.translate.instant('details_item.subtitles_not_found');
                        this.notificationService.notifyShow(2, message, false);
                        setTimeout(() => {
                            this.config.moduleContext.hideOverlayForSubtitles();
                        });
                    });
        }

        //if (this.config.options.file.MEDIA_TYPE == mediaSubtypes.Media)
        {

            this.config.moduleContext.toggleOverlayForMetadata(true);
            var sType = 4000;
            switch (this.config.options.typeDetailsLocal) {
                case 'version_details':
                    sType = this.config.options.file['ITEM_TYPE'];
                    break;
                case 'title_details':
                    sType = this.config.options.file['ITEM_TYPE'];
                    break;
                case 'media_details':
                    sType = 4000;
                    break;
                // case 'carrier_details':
                //     sType = 4001;
                //     break;
                case 'eventreqs':
                    sType = 4001;
                    break;
                default:
                    console.log('ERROR: unknown detail type.');
            }
            if(this.config.moduleContext.defaultSchema && sType == 4000 && (!this.config.moduleContext.isDoc())) {
                this.config.options.service.getDefaultMetadata(this.config.moduleContext.defaultSchema.Id, sType, this.config.options.file.ID).subscribe((res)=>{
                    this.config.moduleContext.metadata_onAfterReceiveMetadata(res ? {
                        schemaModel: res.SchemaModel,
                        xmlModel: res.XmlModel,
                        friendlyName: res.FriendlyName
                    } : null);
                },
                    (err)=> {
                        let message = this.translate.instant('Metadata not found');
                        this.notificationService.notifyShow(2, message, false);
                        this.config.moduleContext.metadata_onAfterReceiveMetadata(null);
                    });
            }
            else {
                this.config.moduleContext.metadata_onAfterReceiveMetadata(null);
            }

        }
    };

    initTimecodeChangeUpdate() {
        let providerRef = this;
        let compRef = this.config.moduleContext;
        if (!this.timecodeChangeUpdateInited) {
            if (compRef.detailVideo) {
                compRef.detailVideo.timecodeChange.subscribe(tcStr => {
                    const comp: IMFXSubtitlesGrid = (compRef.subtitlesGrid as IMFXSubtitlesGrid);
                    if (comp && comp.searchTextComp) {
                        if (!comp.searchTextComp.mutedFollow) {
                            comp.selectRow(tcStr);
                        }
                    }
                });
                this.timecodeChangeUpdateInited = true;
            }
        }
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
        this.config.options.mediaParams.mediaType = 'defaultViewer';
        this.config.options.mediaParams.addMedia = false;
        let mType = file['MEDIA_TYPE'];
        if (this.checkObjectExistance(mediaSubtypes) || (file.IsLive ? true : false)) {
            if ((typeof(file['PROXY_URL']) == 'string' && file['PROXY_URL'].match(/(?:http)|(?:https)/g)) || (file.IsLive ? true : false) || (file.UsePresignedUrl ? true : false)) {
                this.config.options.mediaParams.addMedia = true;
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || (file.IsLive ? true : false)) {
                    this.config.options.mediaParams.mediaType = 'htmlPlayer';
                }
                else if (mType == mediaSubtypes.Image) {
                    let fileExtension = file.PROXY_URL.split('/').pop().split('?')[0].match(/\.[0-9A-Za-z]+$/g);
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
                }
                else if (mediaSubtypes.Doc.filter(el => { return el === mType; }).length > 0) {
                    let fileExtension = file['PROXY_URL'].split('/').pop().split('?')[0].match(/\.[0-9A-Za-z]+$/g);
                    switch (fileExtension[0].toLocaleLowerCase()) {
                        case '.tif': {
                            this.config.options.mediaParams.mediaType = 'tifViewer';
                            break;
                        }
                        case '.tiff': {
                            this.config.options.mediaParams.mediaType = 'tifViewer';
                            break;
                        }
                        case '.tga': {
                            this.config.options.mediaParams.mediaType = 'tgaViewer';
                            break;
                        }
                        // case '.docx': {  // IN THE 'INFO' PANEL DON'T SHOW DOCS
                        //     this.config.options.mediaParams.mediaType = 'docxViewer';
                        //     break;
                        // }
                        // case '.pdf': {
                        //     this.config.options.mediaParams.mediaType = 'pdfViewer';
                        //     break;
                        // }
                        // case '.xml': {
                        //     this.config.options.mediaParams.mediaType = 'xmlViewer';
                        //     break;
                        // }
                        case '.swf': {
                            this.config.options.mediaParams.mediaType = 'flashPlayerViewer';
                            break;
                        }
                        default: {
                            this.config.options.mediaParams.mediaType = 'downloadFileViewer';
                            break;
                        }
                    }
                } else if (mType == mediaSubtypes.Subtile) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'subtitle';
                    file.UsePresignedUrl = false; // ignore this parameter for subs
                }
            }
            else { // if media block must to say 'not available'
                if (mType == mediaSubtypes.Media || mType == mediaSubtypes.Audio || mType == mediaSubtypes.Image) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'defaultViewer';
                }
                else if (mType == mediaSubtypes.Subtile) {
                    this.config.options.mediaParams.addMedia = true;
                    this.config.options.mediaParams.mediaType = 'subtitle';
                }
            }
            return this.config.options.mediaParams;
        }
    };

    /**
     * Get friendly names from storage (if not -> load&save)
     */
    getColumnsFriendlyNames() {
        this.config.options.service.getLookups(this.config.options.friendlyNamesForDetail).subscribe(
            (resp) => {
                // this.config.options.userFriendlyNames = resp;
                this.config.moduleContext.cd.markForCheck();
            }
        );
    };

    /*
     * Check file properties
     */
    checkDetailExistance(file): boolean {
        if (file['ID'] != undefined) {
            return true;
        }
        return false;
    };

    /*
     * Check object properties
     */
    checkObjectExistance(obj): boolean {
        if (Object.keys(obj).length) {
            return true;
        }
        return false;
    };

    /*
     * Load detail view from REST or from session
     */
    getColumnData(): any {
        if (this.config.options.detailsviewType) {
            let self = this;
            let view_id = this.config.options.appSettings.getSubtype(this.config.options.file['MEDIA_TYPE']) || 0;
            this.config.options.service.getDetailsView(view_id, this.config.options.detailsviewType).subscribe(
                (resp: MediaDetailDetailsViewResponse) => {
                    self.config.options.columnData = resp.Groups;
                    const mc: InfoPanelComponent = self.config.moduleContext;
                    if(mc && mc.accordion) {
                        mc.accordion.refresh(self.config.options.file, self.config.options.columnData);
                    }
                });

        }
    };

    togglePanel(): void {
        this.setStateForPanel(!this.getStateForPanel());
    }

    getStateForPanel(): boolean {
        if (!this.config) {
            return false;
        }
        // let valFromStorage = this.storage.retrieve('tmd.detailbutton.state.' + this.config.moduleContext.config.options.typeDetails);
        // valFromStorage == 'false' ? valFromStorage = false : valFromStorage = true;
        // this.config.moduleContext.config.options.isOpenDetailPanel = valFromStorage;

        return this.config.moduleContext.config.options.isOpenDetailPanel;
    }

    setStateForPanel(state: boolean): void {
        if (!this.config) {
            return;
        }
        this.config.moduleContext.config.options.isOpenDetailPanel = state;
        if (state == true) {
            this.update(this.detailInfoForUpdate);
        } else {
            this.config.moduleContext.detailVideo && this.config.moduleContext.detailVideo.setPlayerOnPause.emit();
        }
        this.onToggle.emit(state)
        // this.storage.store('tmd.detailbutton.state.' + this.config.moduleContext.config.options.typeDetails, state.toString());
    }

    getIsReady(): boolean{
        return (this.config) ? this.config.moduleContext.isReady : false;
    }

    updateAndSaveMediaItems(data): void { }
}
