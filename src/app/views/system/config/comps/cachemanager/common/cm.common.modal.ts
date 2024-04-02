import { ChangeDetectorRef, ElementRef, Injector } from '@angular/core';
import { IMFXControlsLookupsSelect2Component } from '../../../../../../modules/controls/select2/imfx.select2.lookups';
import { TranslateService } from '@ngx-translate/core';
import { CacheManagerCommonService } from './cm.common.service';
import { NotificationService } from '../../../../../../modules/notification/services/notification.service';
import { SlickGridRequestError } from '../../../../../../modules/search/slick-grid/types';
import { CacheManagerCommonComponent } from './cm.common';

export class CacheManagerCommonModal {
    public self = this;
    public modalRef: any;
    public context: CacheManagerCommonComponent;
    public isNew;
    public itemData;
    public freeFields: string[] = [];
    public translate: TranslateService;
    public cdr: ChangeDetectorRef;
    public service: CacheManagerCommonService;
    public notificationService: NotificationService;
    public modalWrapperEl: ElementRef;
    constructor(public injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.cdr = this.injector.get(ChangeDetectorRef);
        this.translate = this.injector.get(TranslateService);
        this.notificationService = this.injector.get(NotificationService);
        this.service = this.injector.get(CacheManagerCommonService);
        this.translate = this.injector.get(TranslateService);
        let d = this.modalRef.getData();
        this.itemData = d.isNew ? {} : {...d.itemData.data};
        this.isNew = d.isNew;
        this.context = d.context;
    }

    ngOnInit() {
        if (!this.isNew) {
            this.toggleOverlay(true);
        } else {
            this.toggleOverlay(false);
        }
    }

    ngAfterViewInit() {
        this.toggleOverlay(false);
        this.cdr.markForCheck();
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalWrapperEl.nativeElement).show();
        } else {
            $(this.modalWrapperEl.nativeElement).hide();
        }
        this.cdr.markForCheck();
    }

    closeModal() {
        this.modalRef.hide();
    }

    isValid(): boolean {
        return true;
    }

    saveData() {
        if (!this.isValid()) {
            return;
        }
        if (this.itemData['ID'] == null) {
            this.itemData['ID'] = 0;
        }
        this.toggleOverlay(true);
        this.service.save(this.context.saveName, this.itemData).subscribe(() => {
            this.toggleOverlay(true);
            this.context.getTable(true);
            this.closeModal();
        }, (err: { error: SlickGridRequestError }) => {
            this.toggleOverlay(false);
            this.notificationService.notifyShow(2, err.error.Error + '(' + err.error.ErrorDetails + ')');
        });
    }

    public onUpdateControl(controlRefStr, field: string) {
        this.itemData[field] = (this[controlRefStr] as IMFXControlsLookupsSelect2Component).getSelectedId();
    }
}
