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
    selector: 'edit-xml-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditXmlModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalEditXmlOverlayWrapper', {static: true}) private modalEditXmlOverlayWrapper: ElementRef;

    private modalRef: any;
    private context;
    private readonly isNew;
    private data;
    private xmlSchemaId;
    private typesData = [];

    constructor(private injector: Injector,
                private cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService,
                protected lookupService: LookupService,
                private xmlService: XMLService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
        this.xmlSchemaId = d.xmlSchemaId;
        this.isNew = d.isNew;
    }

    ngOnInit() {
        this.toggleOverlay(true);
        this.lookupService.getLookups("XmlSchemaType")
            .subscribe(
                (lookup: any) => {
                    this.typesData = lookup.map((x) => {
                        return {id: x["ID"], text: x["Name"]};
                    });

                    if (!this.isNew) {
                        this.xmlService.getSettingsXmlSchema(this.xmlSchemaId).subscribe((res: any) => {
                            this.data = res;
                            this.toggleOverlay(false);
                            this.cd.detectChanges();
                            setTimeout(()=>{
                                this.cd.detectChanges();
                            });
                        });
                    }
                    else {
                        this.data = {
                            Id: 0,
                            Type: null,
                            XmlSchema: null,
                            Name: null
                        };
                        this.toggleOverlay(false);
                    }
                    this.cd.detectChanges();
                }
            );
    }

    onSelectType(data) {
        this.data.Type = data.params.data[0].id;
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalEditXmlOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalEditXmlOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    closeModal() {
        this.modalRef.hide();
    }

    flagActive(val) {
        return (this.data.InheritedBy & val) == val;
    }

    toggleBit(val) {
        this.data.InheritedBy ^= val;
    }

    saveData() {
        var valid = true;
        if (this.data.Type == null) {
            valid = false;
            this.notificationService.notifyShow(2, "Type is required field", true, 1000);
        }
        if (this.data.Name == null || this.data.Name != null && this.data.Name.trim().length == 0) {
            valid = false;
            this.notificationService.notifyShow(2, "Name is required field", true, 1000);
        }

        if (valid) {
            this.toggleOverlay(true);
            this.xmlService.addSettingsXmlSchema(this.data).subscribe((res: any) => {
                    this.modalRef.emitClickFooterBtn('ok', null);
                    this.modalRef.hide();
                },
                (err: HttpErrorResponse) => {
                    this.notificationService.notifyShow(2, err.error.Message, false, 1000);
                    this.toggleOverlay(false);
                });
        }
    }

    openFile(data) {
        var input = data.target;
        var self = this;
        var reader = new FileReader();
        reader.onload = () => {
            self.data.XmlSchema = reader.result;
            self.cd.detectChanges();
        };
        reader.readAsText(input.files[0]);
    }
}
