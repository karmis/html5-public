import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Inject,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { DetailService } from "../../../../modules/search/detail/services/detail.service";
import { SegmentingProvider } from "./providers/segmenting.provider";
import { ActivatedRoute, Router } from "@angular/router";
import { MediaAppSettings } from "../../../media/constants/constants";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { TimecodeProvider } from "../../../../modules/controls/html.player/providers/timecode.provider";
import { SegmentingService } from "./services/segmenting.service";
import { Location } from '@angular/common';
import { LocatorsProvider } from "../../../../modules/controls/locators/providers/locators.provider";
import { AudioSynchProvider } from "../../../../modules/controls/html.player/providers/audio.synch.provider";
import { TranslateService } from "@ngx-translate/core";
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { SplashProvider } from "../../../../providers/design/splash.provider";
import { TcbProvider } from "../../../../modules/search/tasks-control-buttons/providers/tcb.provider";
import { Observable } from "rxjs";
import { DetailProvider } from '../../../../modules/search/detail/providers/detail.provider';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LocalStorageService } from "ngx-webstorage";
import { GoldenProvider } from "../../../../modules/search/detail/providers/gl.provider";
import { lazyModules } from "../../../../app.routes";
import {
    EditSomEomModalComponent
} from '../../../../modules/search/detail/components/modals/edit.som.eom.modal/edit.som.eom.modal.component';
import { IMFXModalEvent } from '../../../../modules/imfx-modal/types';
import {
    IMFXAccordionComponent
} from '../../../../modules/search/detail/components/accordion.component/imfx.accordion.component';
import {
    IMFXMediaInfoComponent
} from '../../../../modules/search/detail/components/mediainfo.tab.component/imfx.mediainfo.tab.component';
import { IMFXHtmlPlayerComponent } from '../../../../modules/controls/html.player/imfx.html.player';
import { SimpleGoldenComponent } from '../../../../modules/abstractions/simple.golden.component';

@Component({
    selector: 'simple-segmenting',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../modules/search/detail/styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        BsModalRef,
        BsModalService,
        SegmentingProvider,
        {provide: TcbProvider, useClass: SegmentingProvider},
        MediaAppSettings,
        DetailService,
        {provide: DetailService, useClass: SegmentingService},
        DetailProvider,
        SegmentingService,
        TimecodeProvider,
        LocatorsProvider,
        AudioSynchProvider,
        GoldenProvider
        // Location
    ]
})

export class SegmentingComponent extends SimpleGoldenComponent {
    versions = [];
    public taskCallback: any = {
        btnComp: {
            callback: this.beforeComplete,
            context: this
        }
    };

    constructor(public route: ActivatedRoute,
                public appSettings: MediaAppSettings,
                public detailService: DetailService,
                public service: SegmentingService,
                public cd: ChangeDetectorRef,
                public location: Location,
                public provider: SegmentingProvider,
                public router: Router,
                public injector: Injector,
                public translate: TranslateService,
                public splashProvider: SplashProvider,
                public localStorage: LocalStorageService,
                @Inject(LocatorsProvider) public locatorsProvider: LocatorsProvider,
                @Inject(NotificationService) public notificationRef: NotificationService) {
        super({
                titleForStorage: 'segmenting',
                typeDetailsLocal: 'segmenting',
            },
            provider,
            detailService,
            appSettings,
            localStorage,
            notificationRef,
            router,
            route,
            injector,
            service,
            translate,
            splashProvider,
            cd
        );
    }

    ngOnInit() {
        this.provider.selectedMediaItem.subscribe(data => {
            if (data) {
                this.isDisabledEditSom = data.IsGangedMain === false;
                if (this.glComponent.playerComponents && (this.glComponent.playerComponents.compRef._component as IMFXHtmlPlayerComponent).setDisablesStatusSomEomBtns) {
                    (this.glComponent.playerComponents.compRef._component as IMFXHtmlPlayerComponent).setDisablesStatusSomEomBtns(this.isDisabledEditSom);
                }
            }
        })
    };

    ngAfterViewInit() {
        super.ngAfterViewInit('segmenting');
    }

    beforeComplete(status): Observable<boolean> {
        return new Observable((observer) => {
            (<any>this.glComponent).ValidateAndUpdateTabs(status).subscribe((data) => {
                if (data == false) {
                    observer.next(false);
                    observer.complete();
                } else {
                    super.setErrors(observer, data);
                }
            });

        });
    }


    onEditSomEom() {
        const mediaItem = this.provider.selectedMediaItem.value;
        const TimecodeFormat = mediaItem.TimecodeFormat;
        const ID = mediaItem.ID;
        const SOM_text = mediaItem.SOM_text;
        const EOM_text = mediaItem.EOM_text;
        let modalProvider = this.injector.get(IMFXModalProvider);

        let editSomEomModal = modalProvider.showByPath(lazyModules.edit_som_eom_modal,
            EditSomEomModalComponent, {
                size: "sm",
                title: 'media.table.modal_edit_som_eom.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {context: self, isSelectAll: false, isSelectedAll: false, isMultiSelect: false});

        editSomEomModal.load().then((cr: ComponentRef<EditSomEomModalComponent>) => {
            let content: EditSomEomModalComponent = cr.instance;
            content.setData(
                {
                    TimecodeFormat: TimecodeFormat,
                    SOMtext: SOM_text,
                    EOMtext: EOM_text
                }
            );
            editSomEomModal.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length !== 0) {
                        this.detailService.editSomEom(ID, res.$event).subscribe(resp => {
                                const message = this.translate.instant('media.table.modal_edit_som_eom.edit_success');
                                this.notificationRef.notifyShow(1, message, true);
                                this.updateMediaItems();
                            },
                            error => {
                                const message = this.translate.instant('media.table.modal_edit_som_eom.edit_error');
                                this.notificationRef.notifyShow(2, message, false);
                            });
                    }
                }
            });
        });
    }

    updateMediaItems() {
        const id = this.provider.getDetailId();
        this.service.getDetail(id).subscribe(data => {
            this.versions = data.Versions;
            data.Medias.forEach(el => {
                el._hasAcceptBnts = !(el.IsGanged && !el.IsGangedMain);
                el._disableAcceptBnts = this.glComponent.getDisableForMediaListRadioBtns();
                el._isVersionSegmentsAdded = el._isVersionSegmentsAdded ? el._isVersionSegmentsAdded : false;
            });
            const selectedId = this.provider.selectedMediaItem.value.ID;
            const selectedItem = data.Medias.find(el => el.ID === selectedId);

            this.provider.selectedMediaItem.next(selectedItem);
            this.provider.mediaItems = data.Medias;


            (this.glComponent.mediaDataComponent.compRef._component as IMFXAccordionComponent).file = data.Medias[0];
            (this.glComponent.mediainfoComponent.compRef.instance as IMFXMediaInfoComponent).config = data.Medias[0];
            this.glComponent.config.options.file = data.Medias[0];
            this.glComponent.config.moduleContext.config.options.file = data.Medias[0];
            this.glComponent.config.moduleContext.mediaItems = data.Medias;
            this.glComponent.updateMediaInfo();
            this.glComponent.mediaListComponent.compRef._component.setItems(data.Medias);
            this.glComponent.mediaListComponent.compRef._component.cdr.detectChanges();
        });
    }
}
