/**
 * Created by IvanBanan 30.09.2019
 */
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

@Component({
    selector: 'create-subversion-modal',
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

export class CreateSubversionModalComponent {
    @ViewChild('wrapper', {static: true}) wrapper: ElementRef;
    @ViewChild('nameSelect', {static: true}) nameSelect: IMFXControlsSelect2Component;
    @ViewChild('pgmStatusSelect', {static: false}) pgmStatusSelect: IMFXControlsLookupsSelect2Component;
    public modalRef: IMFXModalComponent;
    protected data: any;
    private destroyed$ = new Subject();
    private availableVersionNames = [];
    private contextItem = null;
    private itemType = null;
    private successCB = null;
    private isBlockOk = false;
    private isSibling = true;

    constructor(public injector: Injector,
                public modalProvider: IMFXModalProvider,
                public translate: TranslateService,
                public cdr: ChangeDetectorRef,
                public serverGroupStorageService: ServerGroupStorageService,
                public versionService: VersionService,
                public notificationService: NotificationService
    ) {
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData();
    }

    ngOnInit() {
        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name.indexOf('ok') > -1) {
                if (this.checkCommonValidation() && !this.isBlockOk) {
                    this.createSubversion();
                }
            }
        });

        this.serverGroupStorageService.retrieve({
            global:['versionCreationSettings'],
            local: ['versionCreationSettings']
        }).subscribe((res: any) => {
            let versionCreationSettings = JSON.parse(res.global.versionCreationSettings || null);
            if (!versionCreationSettings) {
                return;
            }

            this.availableVersionNames = versionCreationSettings && versionCreationSettings.availableVersionNames || [];

            this.prepareAndSetNameSelectData();
        });
    }

    ngAfterViewInit() {

    }

    prepareAndSetNameSelectData() {
        let arr = this.availableVersionNames.map((el,i) => {return {
            id: i,
            text: el
        }});

        let items = this.nameSelect.turnArrayOfObjectToStandart(arr, {
            key: 'id',
            text: 'text'
        });

        this.nameSelect.onReady.subscribe(() => {
            setTimeout(() => {
                this.nameSelect.setData(items, true);
                this.nameSelect.refresh();
            })
        });

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    setContextItem(item) {
        this.contextItem = item;
    }

    setItemType(type: 'Version' | 'Title') {
        this.itemType = type;
    }

    calcIsAvailableSibling() {
        if (this.itemType === 'Version') {
            return true;
        } else {
            this.isSibling = false;
            return false;
        }
    }

    setSuccessCB(f) {
        this.successCB = f;
    }

    onUpdateNameValue($event, nameSelect) {
        this.nameSelect.checkValidation(this.nameSelect.getSelectedId());
    }

    onUpdatePgmStatusValue($event, pgmStatusSelect) {
        this.pgmStatusSelect.checkValidation(this.pgmStatusSelect.getSelectedId());
    }

    checkCommonValidation() {
        if(!this.contextItem.ID
            || !this.itemType
            || !this.nameSelect.getValidation()
            || !this.pgmStatusSelect.getValidation()
        ) {
            return false;
        }
        return true;
    }

    getFinalType(): 'Version' | 'Title' {
        if (!this.isSibling) {
            return this.itemType;
        }

        if (this.contextItem && this.contextItem['TREE_LEVEL'] == 1) {
            return 'Title';
        } else {
            return this.itemType;
        }
    }

    getFinalParentId(): number {
        if (!this.isSibling) {
            return this.contextItem['ID'];
        } else {
            return this.contextItem['PARENT_ID'] ;
        }
    }

    createSubversion() {
        const itemType = this.getFinalType();
        const parentId = this.getFinalParentId();

        this.isBlockOk = true;
        this.versionService.createSubversion({
            ParentId: parentId,
            ParentType: itemType,
            Version: this.nameSelect.getSelectedText()[0],
            ProgStatus: (this.pgmStatusSelect.getSelectedId() as number)
        }).subscribe((res: any) => {
            const message = this.translate.instant('version.create_version.success_message',{paramId:(<any>res).ID});
            this.notificationService.notifyShow(1, message, true);
            if (typeof this.successCB == 'function') {
                this.successCB();
            }
            this.storeCompArrToRefresh();
            this.modalRef.hide();
            this.isBlockOk = false;
        }, (err: HttpErrorResponse) => {
            const errMes = err.error.Error || err.error.Message || '';
            const message = this.translate.instant('version.create_version.error_message',{errMessage:errMes});
            this.notificationService.notifyShow(2, message, false);
            this.isBlockOk = false;
        });
    }

    storeCompArrToRefresh() {
        const router = this.injector.get(Router);
        (<IMFXRouteReuseStrategy>router.routeReuseStrategy).storeInitedCompInstances('versionGrid', true);
    }
}
