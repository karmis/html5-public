import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { IMFXModalProvider } from '../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { IMFXModalEvent } from '../imfx-modal/types';
import { Subject } from 'rxjs';
import { NotificationService } from '../notification/services/notification.service';
import { IMFXControlsSelect2Component } from '../controls/select2/imfx.select2';
import { VersionService } from '../../services/version/version.service';
import { IMFXControlsLookupsSelect2Component } from '../controls/select2/imfx.select2.lookups';
import { ServerGroupStorageService } from '../../services/storage/server.group.storage.service';
import { Router } from '@angular/router';
import { IMFXRouteReuseStrategy } from '../../strategies/route.reuse.strategy';
import { HttpErrorResponse } from '@angular/common/http';
import { TitleService } from '../../services/title/title.service';
import { CreateEpisodeTitleModalProvider } from "./providers/create.episode.title.modal.provider";

@Component({
    selector: 'create-episode-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush, // noway
    providers: [
        VersionService
    ]
})

export class CreateEpisodeTitleModalComponent {
    @ViewChild('ownersSelect', {static: false}) private ownersSelect: IMFXControlsLookupsSelect2Component;
    public modalRef: IMFXModalComponent;
    public title = {value: '', notvalid: false };
    public number = {value: '', notvalid: false };
    public letter = {value: '', notvalid: false };
    protected data: any;
    private destroyed$ = new Subject();
    private contextItem = null;
    private modalMode = 1;
    private ownersNotValid = false;
    updateGrid = new Subject();

    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider,
                public translate: TranslateService,
                public cdr: ChangeDetectorRef,
                public titleService: TitleService,
                public notificationService: NotificationService,
                public createEpisodeTitleModalProvider: CreateEpisodeTitleModalProvider,
    ) {

        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();
        let mode = {
            'episode': 1,
            'season': 2,
            'title': 3,
            'series': 4
        }
        this.contextItem = this.data.item;
        this.modalMode = mode[this.data.mode];
    }

    ngOnInit() {
        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name.indexOf('ok') > -1) {
                switch (this.modalMode) {
                    case 1:
                        if (this.title.value.length > 0 && this.number.value !== null && String(this.number.value).length > 0) {
                            this.createEpisodeTitle();
                        } else {
                            if (this.title.value.length == 0) {
                                this.title.notvalid = true;
                            }
                            if (String(this.number.value).length == 0 || this.number.value === null) {
                                this.number.notvalid = true;
                            }
                        }
                        break;
                    case 2:
                        if (this.title.value.length > 0) {
                            this.createSeasonName();
                        } else {
                            this.title.notvalid = true;
                        }
                        break;
                    case 3:
                        if (this.title.value.length > 0 && this.ownersSelect.getSelected().length) {
                            this.createTitle();
                        } else {
                            if (this.title.value.length == 0) {
                                this.title.notvalid = true;
                            }
                            if (this.ownersSelect.getSelected().length == 0) {
                                this.ownersNotValid = true;
                            }
                        }
                        break;
                    case 4:
                        if (this.title.value.length > 0 && this.number.value !== null && String(this.number.value).length > 0 && this.letter.value.length && this.ownersSelect.getSelected().length) {
                            this.createSeries();
                        } else {
                            if (this.title.value.length == 0) {
                                this.title.notvalid = true;
                            }
                            if (String(this.number.value).length == 0 || this.number.value === null) {
                                this.number.notvalid = true;
                            }
                            if (this.letter.value.length == 0) {
                                this.letter.notvalid = true;
                            }
                            if (this.ownersSelect.getSelected().length == 0) {
                                this.ownersNotValid = true;
                            }
                        }
                        break;
                    default:
                        if (this.title.value.length > 0 && this.number.value !== null && String(this.number.value).length > 0) {
                            this.createEpisodeTitle();
                        } else {
                            if (this.title.value.length == 0) {
                                this.title.notvalid = true;
                            }
                            if (String(this.number.value).length == 0 || this.number.value === null) {
                                this.number.notvalid = true;
                            }
                        }
                        break;
                }
                this.cdr.detectChanges();
            }
        });
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
    onSelect() {
        this.ownersNotValid = false;
    }

    createEpisodeTitle() {
        this.titleService.createEpisodeTitle({
            "parent": `${this.contextItem.Title_Type.toLowerCase()}/${this.contextItem.ID}`, //"season/86153"
            "title": this.title.value,
            "episodeNumber": this.number.value,
            "episodeSequence": this.number.value

        }).subscribe((res: any) => {
            this.onCreateSuccess(res);
        }, (err: HttpErrorResponse) => {
            this.onCreateError(err);
        });
    }
    createSeasonName() {
        this.titleService.createSeasonName({
            "parent": `${this.contextItem.Title_Type.toLowerCase()}/${this.contextItem.ID}`, //"series/86153"
            "seasonName": this.title.value
        }).subscribe((res: any) => {
            this.onCreateSuccess(res);
        }, (err: HttpErrorResponse) => {
            this.onCreateError(err);
        });
    }
    createTitle() {
        this.titleService.createTitle({
            "title": this.title.value,
            "owners": this.ownersSelect.getSelected()
        }).subscribe((res: any) => {
            this.onCreateSuccess(res);
        }, (err: HttpErrorResponse) => {
            this.onCreateError(err);
        });
    }
    createSeries() {
        this.titleService.createSeries({
            "seriesTitle": this.title.value,
            "seriesNumber": this.number.value,
            "seriesLetter": this.letter.value,
            "owners": this.ownersSelect.getSelected()
        }).subscribe((res: any) => {
            this.onCreateSuccess(res);
        }, (err: HttpErrorResponse) => {
            this.onCreateError(err);
        });
    }

    onCreateSuccess(res) {
        if (!res.Result) {
            const message = this.translate.instant('titles.create_title.error_message',{errMessage:(<any>res).Error});
            this.notificationService.notifyShow(2, message, true);
        } else {
            this.createEpisodeTitleModalProvider.addedTitleSub.next(this.title.value);
            this.updateGrid.next();
            const message = this.translate.instant('titles.create_title.success_created',{paramId:(<any>res).ID});
            this.notificationService.notifyShow(1, message, true);
            this.modalRef.hide();
        }
    }

    onCreateError(err) {
        const errMes = err.error.Error || err.error.Message || '';
        const message = this.translate.instant('version.create_version.error_message',{errMessage:errMes});
        this.notificationService.notifyShow(2, message, false);
    }
}
