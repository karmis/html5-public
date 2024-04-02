import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from "rxjs";
import { IMFXModalComponent } from "../../imfx-modal/imfx-modal";
import { NotificationService } from "../../notification/services/notification.service";
import { XMLService } from "../../../services/xml/xml.service";

@Component({
    selector: 'add-custom-status-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: []
})

export class AddCustomStatusModalComponent {
    name = null;
    id = null;
    lookup = null;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    private modalRef: IMFXModalComponent;
    private resultColumns = null;

    private destroyed$: Subject<any> = new Subject();

    constructor(protected injector: Injector,
                protected cdr: ChangeDetectorRef,
                protected xmlService: XMLService,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {
        // modal data
        this.modalRef = this.injector.get('modalRef');
        // @ts-ignore
        switch (this.modalRef._data.data.context) {
            case '17':
                this.lookup = 'CustomMediaStatusTypes';
                break;
            case '28':
                this.lookup = 'CustomTitleStatusTypes';
                break;
            case '36':
                this.lookup = 'CustomVersionStatusTypes';
                break
        }

    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onSelect(ev) {
        this.id = ev.params.data[0].id;
        this.name = ev.params.data[0].text;
    }

    ngAfterViewInit() {
    }

    saveColumns() {
        this.modalRef.modalEvents.emit({
            name: 'ok', state: [{id: this.id, name: this.name}]
        });
        this.closeModal();
    }

    closeModal() {
        this.modalRef.hide();
    }

    changeModalSize(size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full-size') {
        this.modalRef.getModalOptions().size = size;
        this.modalRef.applyCustomCss();
    }

}
