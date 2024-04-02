/**
 * Created by Sergey Trizna on 30.03.2017.
 */
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXModalComponent} from '../../../imfx-modal/imfx-modal';
import {UploadProvider} from "../../providers/upload.provider";

import {NotificationService} from "../../../notification/services/notification.service";
import {UploadModel} from "../../models/models";

@Component({
    selector: 'modal-require-file-comp',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./styles/index.scss'],
})
export class IMFXRequireFileComp {
    public onSelectFile: EventEmitter<UploadModel> = new EventEmitter<UploadModel>();
    private modalRef: IMFXModalComponent;
    private um: UploadModel;
    private uploadProvider: UploadProvider;
    private notificator: NotificationService;
    @ViewChild('file', {static: false}) private fileRef: ElementRef;

    constructor(protected injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.um = this.modalRef.getData().um;
        this.uploadProvider = injector.get(UploadProvider);
        this.notificator = this.injector.get(NotificationService);
    }

    ngAfterViewInit() {
    }

    select($event) {
        const file: File = $event.target.files[0];
        if (file.name === this.um.name && file.size === this.um.size) {
            this.um.file = file;
            this.modalRef.hide();
            this.notificator.notifyHide();
            this.onSelectFile.emit(this.um);
        } else {
            this.notificator.notifyShow(2, 'Wrong file selected');
            this.fileRef.nativeElement.value = null;
        }
    }
}
