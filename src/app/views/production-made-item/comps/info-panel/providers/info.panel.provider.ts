/**
 * Created by Ivan Banan on 12.01.2019.
 */
import {EventEmitter, Injectable, Injector, Output, ViewChild} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';

import {SessionStorageService} from "ngx-webstorage";
import {InfoPanelProvider} from "../../../../../modules/search/info-panel/providers/info.panel.provider";
import {TranslateService} from "@ngx-translate/core";
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import {Subscription} from "rxjs/Rx";
import {IMFXAudioTracksTabComponent} from "../../../../../modules/search/detail/components/audio.tracks.tab.component/imfx.audio.tracks.tab.component";


@Injectable()
export class InfoProductionPanelProvider extends InfoPanelProvider {
    @Output('onUpdate') public onUpdate: EventEmitter<any> = new EventEmitter<any>();

    public audioTracksComp: IMFXAudioTracksTabComponent;
    private detailSbs$: Subscription;

    constructor(public route: ActivatedRoute,
                public location: Location,
                public storage: SessionStorageService,
                public router: Router,
                public translate: TranslateService,
                public injector: Injector,
                protected notificationService: NotificationService) {
        super(route, location, storage, router, translate, injector, notificationService)
    }

    ngAfterViewInit() {
        if (this.audioTracksComp) {
            this.audioTracksComp.config = {
                externalMode: true,
                // elem: this.audioTracksComp.
            }
        }

        // compRef.instance['config'] = {
        //     file: self.config.options.file,
        //     typeDetailsLocal: self.config.options.typeDetailsLocal,
        //     typeDetails: self.config.options.typeDetails,
        //     elem: container,
        //     context: this,
        //     readOnly: self.getReadOnlyModeForTab(self.config.options.file)
        // };

    }


    update(detailInfo) {
        this.detailSbs$ && this.detailSbs$.unsubscribe();
        if (!detailInfo) {
            return
        }
        debugger;
        this.detailSbs$ = this.config.options.service.getProductionDetails(detailInfo['ID']).subscribe((res: any) => {
            this.onUpdate.emit(res);
            const tracks = res.PreChecks.AudioTracks.map((o, i) => {
                if(o['LANGUAGE_ID']) {
                    o['LanguageId'] = o['LANGUAGE_ID'];
                    delete o['LANGUAGE_ID'];
                }

                return o;
            })
            if (this.audioTracksComp) {
                this.audioTracksComp.config = {
                    file: {AudioTracks: tracks},
                    typeDetailsLocal: 'production.',
                    typeDetails: 'media-details',
                    context: this,
                    readOnly: false,
                    externalMode: true,
                    elem: this.audioTracksComp
                }
                this.audioTracksComp.loadComponentData();
            }
            // this.data = res;
            // debugger
            // this.cdr.detectChanges();
        }, (err) => {
            this.onUpdate.emit({});
        });



        // this.getSubsSubscription && this.getSubsSubscription.unsubscribe();
        // this.detailInfoForUpdate = detailInfo;
        // if (this.getStateForPanel() === false) {
        //     return;
        // }
        // let mediaSubtypes = this.config.options.appSettings.getMediaSubtypes();
        // if (detailInfo && detailInfo.ID) {
        //     // not need for new implementation; it checked in slick grid (onDataUpdated)
        //     if (this.lastDetailId == detailInfo.ID) {
        //         if (this.config.options.file.MEDIA_TYPE == mediaSubtypes.Subtile) { // for checking external Search Text
        //             if (Array.isArray(this.config.options.pacsubtitles) && this.config.options.pacsubtitles.length) {
        //                 this.config.moduleContext.subtitlesPacGrid.updateSubtitle();
        //             }
        //             if (Array.isArray(this.config.options.subtitles) && this.config.options.subtitles.length) {
        //                 this.config.moduleContext.subtitlesGrid.updateSubtitle();
        //             }
        //         }
        //         return;
        //     } else {
        //         this.lastDetailId = detailInfo.ID;
        //     }
        // }
        //
        // if(this.config.moduleContext.isSubtile() || this.config.moduleContext.isMedia() || this.config.moduleContext.isImage()) {
        //     this.config.moduleContext.activeTab = 0;
        // }
        //
        // this.config.moduleContext.cd.detectChanges();
        // if (!detailInfo) {
        //     this.config.options.file = {};
        //     this.lastDetailId = null;
        //     this.config.moduleContext.cd.detectChanges();
        //     return;
        // }
        //
        // this.config.options.file = detailInfo;
        // Cookie.set('id', this.config.options.file['ID'], 1, '/');
        // this.setVideoBlock();
        // this.config.moduleContext.cd.detectChanges();
        // this.getColumnData();
        // // get thumb url
        // this.config.options.file = this.injector.get(InfoPanelThumbProvider).buildURL(
        //     this.config.options.file,
        //     this.config.options.appSettings
        // );
        // this.getColumnsFriendlyNames();
        // //    this.refreshVideo();
        // this.config.options.subtitles = null;
        // this.config.options.pacsubtitles = null;
        // // check presiganed url
        //
        // if (this.config.options.file.MEDIA_TYPE == mediaSubtypes.Image) {
        //     this.config.moduleContext.getMediaUrl(this.config.options.file).subscribe(url => {
        //         this.config.options.file.PROXY_URL = url;
        //     });
        // }
        //
        // if (this.config.moduleContext.isMedia()) {
        //     this.config.moduleContext.showOverlayForSubtitles();
        //
        //     this.getSubsSubscription = this.config.options.service.getSubtitles(this.config.options.file.ID)
        //         .subscribe((res: Array<MediaDetailMediaCaptionsResponse>) => {
        //                 this.config.options.subtitles = res;
        //                 this.config.moduleContext.cd.detectChanges();
        //                 let compRef = this.config.moduleContext;
        //                 // compRef.subtitlesGrid && compRef.subtitlesGrid.textMarkerConfig && compRef.subtitlesGrid.textMarkerConfig.moduleContext.searchKeyUp();
        //
        //                 if (!this.playerReadyInited) {
        //                     if (compRef.detailVideo) {
        //                         this.playerReadyInited = true;
        //                     }
        //                 }
        //                 this.initTimecodeChangeUpdate();
        //                 if (this.config.options.file.MEDIA_TYPE !== mediaSubtypes.Subtile) {
        //                     setTimeout(() => {
        //                         this.config.moduleContext.hideOverlayForSubtitles(res);
        //                     });
        //                 }
        //             },
        //             (error) => {
        //                 let message = this.translate.instant('details_item.subtitles_not_found');
        //                 this.notificationService.notifyShow(2, message, false);
        //                 if (this.config.options.file.MEDIA_TYPE !== mediaSubtypes.Subtile) {
        //                     setTimeout(() => {
        //                         this.config.moduleContext.hideOverlayForSubtitles();
        //                     });
        //                 }
        //             });
        //
        //     this.config.moduleContext.toggleOverlayForTagging(true);
        //     this.config.moduleContext.mediaTaggingConfig = {
        //         file: this.config.options.file,
        //         typeDetailsLocal: this.config.options.typeDetailsLocal,
        //         typeDetails: this.config.options.typeDetails,
        //         // elem: this.config.moduleContext.detailVideo,
        //         context: this,
        //         isSimpleDetail: true,
        //         detailContext: this.config.moduleContext
        //     };
        //     this.config.moduleContext.cd.detectChanges();
        //     if(this.config.moduleContext.mediaTaggingEl) {
        //         this.config.moduleContext.mediaTaggingEl.selectMediaTagging();
        //     }
        // }
        //
        // if (this.config.moduleContext.isSubtile()) {
        //     this.config.moduleContext.showOverlayForSubtitles();
        //
        //     this.config.options.service.getPacSubtitles(this.config.options.file.ID)
        //         .subscribe((res: Array<MediaDetailPacSubtitlesResponse>) => {
        //                 this.config.options.pacsubtitles = res;
        //                 this.config.moduleContext.cd.markForCheck();
        //                 setTimeout(() => {
        //                     this.config.moduleContext.hideOverlayForSubtitles(res);
        //                     this.config.moduleContext.cd.detectChanges();
        //                     setTimeout(() => {
        //                         this.config.moduleContext.subtitlesPacGrid.updateSubtitle();
        //                     });
        //                 });
        //             },
        //             (error) => {
        //                 let message = this.translate.instant('details_item.subtitles_not_found');
        //                 this.notificationService.notifyShow(2, message, false);
        //                 setTimeout(() => {
        //                     this.config.moduleContext.hideOverlayForSubtitles();
        //                 });
        //             });
        // }
        //
        // //if (this.config.options.file.MEDIA_TYPE == mediaSubtypes.Media)
        // {
        //
        //     this.config.moduleContext.toggleOverlayForMetadata(true);
        //     var sType = 4000;
        //     switch (this.config.options.typeDetailsLocal) {
        //         case 'version_details':
        //             sType = this.config.options.file['ITEM_TYPE'];
        //             break;
        //         case 'title_details':
        //             sType = this.config.options.file['ITEM_TYPE'];
        //             break;
        //         case 'media_details':
        //             sType = 4000;
        //             break;
        //         // case 'carrier_details':
        //         //     sType = 4001;
        //         //     break;
        //         case 'eventreqs':
        //             sType = 4001;
        //             break;
        //         default:
        //             console.log('ERROR: unknown detail type.');
        //     }
        //     if(this.config.moduleContext.defaultSchema && sType == 4000 && (!this.config.moduleContext.isDoc())) {
        //         this.config.options.service.getDefaultMetadata(this.config.moduleContext.defaultSchema.Id, sType, this.config.options.file.ID).subscribe((res)=>{
        //                 this.config.moduleContext.metadata_onAfterReceiveMetadata(res ? {
        //                     schemaModel: res.SchemaModel,
        //                     xmlModel: res.XmlModel,
        //                     friendlyName: res.FriendlyName
        //                 } : null);
        //             },
        //             (err)=> {
        //                 let message = this.translate.instant('Metadata not found');
        //                 this.notificationService.notifyShow(2, message, false);
        //                 this.config.moduleContext.metadata_onAfterReceiveMetadata(null);
        //             });
        //     }
        //     else {
        //         this.config.moduleContext.metadata_onAfterReceiveMetadata(null);
        //     }
        //
        // }
    };

}
