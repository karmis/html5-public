import {
    Component, Inject, Injector, TemplateRef, ViewChild, ViewEncapsulation, ChangeDetectorRef, ElementRef
} from '@angular/core';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'load-master-change-queue-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class LoadMasterChangeQueueModalComponent  {

    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;

    private modalRef: IMFXModalComponent;
    private data;
    private itemData;
    private context;
    private readonly isNew;
    private readonly itemToSave;

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.itemData = d.isNew ? null : d.queueData;
        this.context = d.context;
        this.isNew = d.isNew;

        if(this.isNew) {
            this.itemToSave = {
                ID: 0,
                Size: null,
                IsEnabled: false,
                Name: null,
                internalId: this.context.lastInternalId
            };
        }
        else {
            this.itemToSave = {
                ID: this.itemData.ID,
                Size: this.itemData.Size,
                IsEnabled: this.itemData.IsEnabled,
                Name: this.itemData.Name,
                internalId: this.itemData.internalId
            };
        }

        this.inLoad = false;
    }

    private inLoad = true;
    toggleOverlay(show) {
        if(show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.inLoad = show;
    }

    closeModal() {
        this.toggleOverlay(true);
        this.modalRef.hide();
    }

    saveData() {
        var valid = true;
        if(!this.itemToSave.ID || this.itemToSave.ID && this.itemToSave.ID < 0) {
            this.notificationService.notifyShow(2, this.translate.instant("Invalid ID value!"));
            valid = false;
        }

        if(!this.itemToSave.Size || this.itemToSave.Size && this.itemToSave.Size < 0) {
            this.notificationService.notifyShow(2, this.translate.instant("Invalid Size value!"));
            valid = false;
        }
        if(!valid)
            return;

        this.toggleOverlay(true);
        this.modalRef.emitClickFooterBtn('ok', this.itemToSave);
        this.modalRef.hide();
    }
}
