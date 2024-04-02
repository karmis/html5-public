import {
    Component, Inject, Injector, TemplateRef, ViewChild, ViewEncapsulation, ChangeDetectorRef, ElementRef,
    ChangeDetectionStrategy
} from '@angular/core';
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'copy-from-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CopyFromModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalCopyFromOverlayWrapper', {static: false}) private modalCopyFromOverlayWrapper: ElementRef;

    private modalRef: any;
    private context;

    private types = [
        {
            type: "Media_Tape",
            title: "Carrier Based"
        },
        {
            type: "Media_ServerClip",
            title: "Digital File"
        },
        {
            type: "Media_ServerArchived",
            title: "Archived File"
        },
        {
            type: "Media_DigitalImages",
            title: "Digital Images"
        },
        {
            type: "Media_Subtitles",
            title: "Subtitles"
        }
    ];
    private selected = null;

    constructor(private injector: Injector,
                private cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
        this.types = d.types;
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalCopyFromOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.modalCopyFromOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    selectItem(item) {
        this.selected = item;
    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        this.modalRef.emitClickFooterBtn('ok', this.selected);
        this.modalRef.hide();
    }
}
