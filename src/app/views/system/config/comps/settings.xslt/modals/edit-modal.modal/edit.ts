import {
    Component, Inject, Injector, TemplateRef, ViewChild, ViewEncapsulation, ChangeDetectorRef, ElementRef,
    ChangeDetectionStrategy
} from '@angular/core';
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import {XMLService} from "../../../../../../../services/xml/xml.service";
import {LookupService} from "../../../../../../../services/lookup/lookup.service";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'edit-xslt-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditXsltModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalEditXsltOverlayWrapper', {static: true}) private modalEditXsltOverlayWrapper: ElementRef;

    private modalRef: any;
    private context;
    private readonly isNew;
    private data;
    private itemData;
    private schemasLookup = [];

    constructor(private injector: Injector,
                private cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService,
                private xmlService: XMLService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
        this.itemData = d.isNew ? null : d.itemData.data;
        this.isNew = d.isNew;
        this.schemasLookup = d.schemasLookup;

        if (!this.isNew) {
            this.xmlService.getSettingsXsltSchema(this.itemData.ID).subscribe((res: any) => {
                this.data = res;
                this.toggleOverlay(false);
                this.cd.markForCheck();
            });
        }
        else {
            this.data = {
                ID: 0,
                XSLDATA: null,
                NAME: null,
                DESCRIPTION: null,
                SCHEMA_ID: null,
                FILE_NAMING: null,
                SAVE_EXPORTS_IN_DB: false
            };
        }
        this.cd.markForCheck();
    }

    ngOnInit() {
        if (!this.isNew) {
            this.toggleOverlay(true);
        } else {
            this.toggleOverlay(false);
        }
        this.cd.detectChanges();
    }

    ngAfterViewInit() {

    }

    onSelectSchema(data) {
        this.data.SCHEMA_ID = data.params.data.length == 0 ? null : data.params.data[0].id;
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalEditXsltOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalEditXsltOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        var valid = true;

        if (this.data.NAME == null || this.data.NAME != null && this.data.NAME.trim().length == 0) {
            valid = false;
            this.notificationService.notifyShow(2, "Name is required field", true, 1000);
        }
        if (this.data.XSLDATA == null || this.data.XSLDATA != null && this.data.XSLDATA.trim().length == 0) {
            valid = false;
            this.notificationService.notifyShow(2, "XSLT is required field", true, 1000);
        }

        if (valid) {
            this.toggleOverlay(true);
            if (!this.isNew) {
                this.xmlService.editSettingsXsltSchema(this.data, this.data.ID).subscribe((res: any) => {
                        this.modalRef.emitClickFooterBtn('ok', null);
                        this.modalRef.hide();
                    },
                    (err: HttpErrorResponse) => {
                        this.notificationService.notifyShow(2, err.error.Message, false, 1000);
                        this.toggleOverlay(false);
                    });
            } else {
                this.xmlService.addSettingsXsltSchema(this.data).subscribe((res: any) => {
                        this.modalRef.emitClickFooterBtn('ok', null);
                        this.modalRef.hide();
                    },
                    (err: HttpErrorResponse) => {
                        this.notificationService.notifyShow(2, err.error.Message, false, 1000);
                        this.toggleOverlay(false);
                    });
            }

        }
    }

    openFile(data) {
        var input = data.target;
        var self = this;
        var reader = new FileReader();
        reader.onload = () => {
            self.data.XSLDATA = reader.result;
            self.cd.detectChanges();
        };
        reader.readAsText(input.files[0]);
    }
}
