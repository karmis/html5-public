import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { DetailService } from "../../../../modules/search/detail/services/detail.service";
import { AssessmentProvider } from "./providers/assessment.provider";
import { ActivatedRoute, Router } from "@angular/router";
import { MediaAppSettings } from "../../../media/constants/constants";
import { NotificationService } from "../../../../modules/notification/services/notification.service";
import { TimecodeProvider } from "../../../../modules/controls/html.player/providers/timecode.provider";
import { AssessmentService } from "./services/assessment.service";
import { Location } from '@angular/common';
import { LocatorsProvider } from "../../../../modules/controls/locators/providers/locators.provider";
import { AudioSynchProvider } from "../../../../modules/controls/html.player/providers/audio.synch.provider";
import { TranslateService } from "@ngx-translate/core";
import { SplashProvider } from "../../../../providers/design/splash.provider";
import { TcbProvider } from "../../../../modules/search/tasks-control-buttons/providers/tcb.provider";
import { Observable, Subscription } from "rxjs";
import { DetailProvider } from '../../../../modules/search/detail/providers/detail.provider';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { LocalStorageService } from "ngx-webstorage";
import { GoldenProvider } from "../../../../modules/search/detail/providers/gl.provider";
import {
    IMFXAccordionComponent
} from '../../../../modules/search/detail/components/accordion.component/imfx.accordion.component';
import { IMFXHtmlPlayerComponent } from '../../../../modules/controls/html.player/imfx.html.player';
import { StatusPlayerProvider } from '../../../../modules/controls/html.player/providers/status.player.provider';
import { SimpleGoldenComponent } from '../../../../modules/abstractions/simple.golden.component';

@Component({
    selector: 'simple-assessment',
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
        AssessmentProvider,
        {provide: TcbProvider, useClass: AssessmentProvider},
        MediaAppSettings,
        DetailService,
        {provide: DetailService, useClass: AssessmentService},
        DetailProvider,
        AssessmentService,
        TimecodeProvider,
        LocatorsProvider,
        AudioSynchProvider,
        GoldenProvider
        // Location
    ]
})

export class AssessmentComponent extends SimpleGoldenComponent {
    changedSomEomSub = new Subscription();
    public taskCallback: any = {
        btnComp: {
            callback: this.beforeComplete,
            context: this
        }
    };

    constructor(public route: ActivatedRoute,
                public appSettings: MediaAppSettings,
                public detailService: DetailService,
                public service: AssessmentService,
                public cd: ChangeDetectorRef,
                public location: Location,
                public provider: AssessmentProvider,
                public router: Router,
                public injector: Injector,
                public translate: TranslateService,
                public splashProvider: SplashProvider,
                public localStorage: LocalStorageService,
                public statusPlayerProvider: StatusPlayerProvider,
                @Inject(LocatorsProvider) public locatorsProvider: LocatorsProvider,
                @Inject(NotificationService) public notificationRef: NotificationService) {
        super({
                titleForStorage: 'assessment',
                typeDetailsLocal: 'simple_assessment',
            }, provider,
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
                this.isDisabledEditSom = data.IsGanged && data.IsGangedMain === false;
                let isSet = false;
                const interval = setInterval(() => {
                    if (isSet) {
                        clearInterval(interval);
                        return
                    }
                    if (this.glComponent.playerComponents && (this.glComponent.playerComponents.compRef._component as IMFXHtmlPlayerComponent).setDisablesStatusSomEomBtns) {
                        isSet = true;
                        (this.glComponent.playerComponents.compRef._component as IMFXHtmlPlayerComponent).setDisablesStatusSomEomBtns(this.isDisabledEditSom);
                    }
                }, 500)
            }
        })
    };

    ngOnDestroy() {
        super.ngOnDestroy();
        this.changedSomEomSub.unsubscribe();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit('assessment');
        this.statusPlayerProvider.onAfterViewInit.subscribe(() => {
            // @TODO recheck px-6078
            if(!this.glComponent.playerComponents.compRef.instance || !(this.glComponent.playerComponents.compRef.instance as IMFXHtmlPlayerComponent).clipsProvider) {
                return;
            }
            this.changedSomEomSub = (this.glComponent.playerComponents.compRef.instance as IMFXHtmlPlayerComponent).clipsProvider.changedSomEom.subscribe(somEomObj => {
                this.onEditSomEom(somEomObj);
            })

        });
    }

    beforeComplete(status): Observable<boolean> {
        return new Observable((observer) => {
            (<any>this.glComponent).ValidateAndUpdateTabs(status).subscribe((data) => {
                if (data && data.valid == false) {
                    observer.next(false);
                    observer.complete();
                } else {
                    super.setErrors(observer, data);
                }
            });

        });
    }


    onEditSomEom(somEomObj) {
        const mediaItem = this.provider.selectedMediaItem.value;
        const ID = mediaItem.ID;
        const SOM = somEomObj.som.timeCode;
        const EOM = somEomObj.eom.timeCode;

        this.detailService.editSomEom(ID, {
            SOM,
            EOM
        }).subscribe(resp => {
                const message = this.translate.instant('media.table.modal_edit_som_eom.edit_success');
                this.notificationRef.notifyShow(1, message, true);
                this.updateMediaItems();
            },
            error => {
                const message = this.translate.instant('media.table.modal_edit_som_eom.edit_error');
                this.notificationRef.notifyShow(2, message, false);
            });
    }

    updateMediaItems() {
        const id = this.provider.getDetailId();
        this.service.getDetail(id).subscribe(data => {
            let uptItem = this.provider.mediaItems.find(el => el.ID === this.provider.selectedMediaItem.value.ID);
            let newItem = data.Medias.find(el => el.ID === this.provider.selectedMediaItem.value.ID);
            uptItem.EOM = newItem.EOM;
            uptItem.EOM_text = newItem.EOM_text;
            uptItem.SOM = newItem.SOM;
            uptItem.SOM_text = newItem.SOM_text;
            uptItem.DURATION_text = newItem.DURATION_text;
            this.provider.selectedMediaItem.next(uptItem);


            (this.glComponent.mediaDataComponent.compRef._component as IMFXAccordionComponent).file = uptItem;
            (this.glComponent.mediaDataComponent.compRef._component as IMFXAccordionComponent).cd.detectChanges();
        });
    }
}
