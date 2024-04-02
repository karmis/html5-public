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
import {TranslateService} from '@ngx-translate/core';
import {Subject} from "rxjs";
import {IMFXModalComponent} from "../../imfx-modal/imfx-modal";
import {NotificationService} from "../../notification/services/notification.service";
import {IMFXMLTreeComponent} from "../xml.tree/imfx.xml.tree";
import {IMFXSchemaTreeComponent} from "../../../views/system/config/comps/xml/components/schema.tree/schema.tree.component";
import {XmlSchemaListTypes} from "../xml.tree/types";
import {XMLService} from "../../../services/xml/xml.service";
import {any} from "codelyzer/util/function";
import {map} from "rxjs/operators";
import {XmlSchemaListPipe, XMLSchemasPipeType} from "../../pipes/xml.schema.list/xml.schema.list.pipe";

@Component({
    selector: 'add-custom-column-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: []
})

export class AddCustomColumnModalComponent {

    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('xmlTree', {static: false}) public xmlTree: IMFXMLTreeComponent;
    @ViewChild('schemaTree', {static: false}) public schemaTree: IMFXSchemaTreeComponent;
    @ViewChild('modalOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;
    private modalRef: IMFXModalComponent;
    private currentStep = 1;
    private processStatus = true;
    private selectedFields = [];
    private resultColumns = null;

    private xmlLoading: boolean = false;
    private xmlEmpty: boolean = true;
    // private schemas: any = [];
    // private schemaTypes: any = [];
    private selectedSchemaModel = {};
    private selectedXmlModel = {};
    private selectedSchemaFormList: any = null;
    // private originSchemas: any[] = [];
    private originSchemaTypes: any[] = [];
    private selectedSchemaId: number = -1;

    private destroyed$: Subject<any> = new Subject();

    constructor(protected injector: Injector,
                protected cdr: ChangeDetectorRef,
                protected xmlService: XMLService,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService,
                public xmlSchemaListPipe: XmlSchemaListPipe) {
//this.notificationService.notifyShow(1, this.translate.instant("config_tables.save_success"));
//this.notificationService.notifyShow(2, this.translate.instant("config_tables.save_error"));
        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    ngAfterViewInit() {
        this.toggleOverlay(true);
        this.loadStep();
        if (this.schemaTree) {
            setTimeout(() => {
                this.schemaTree.setFocus();
            }, 0);
        }
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.cdr.markForCheck();
    }

    saveColumns() {
        this.modalRef.modalEvents.emit({
            name: 'ok', state: this.resultColumns
        });
        this.closeModal();
    }

    closeModal() {
        this.toggleOverlay(true);
        this.modalRef.hide();
    }

    loadStep() {
        const self = this;
        if (this.currentStep === 1) {
            // Load schemas
            this.xmlService.getSchemaList()
                .pipe(
                    map((res: XmlSchemaListTypes) => {
                        return self.xmlSchemaListPipe.transform(res);
                    })
                ).subscribe((pd: XMLSchemasPipeType) => {
                    if (self.schemaTree) {  // && false === $.isEmptyObject(pd.originSchemaTypes)) {
                        self.schemaTree.initManually(pd.originSchemaTypes);
                        setTimeout(() => {
                            self.schemaTree.setFocus();
                        }, 0);
                    }
                    self.toggleOverlay(false);
                    self.cdr.detectChanges();
                    // return this.mediaVideoPipe.transform(res);
                }
            );
        } else if (this.currentStep === 2) {
            //Set friendly names
            this.changeModalSize('md');
            this.toggleOverlay(false);
        } else if (this.currentStep === 3) {
            this.toggleOverlay(false);
        }
        this.cdr.detectChanges();
    }

    goToPreviousStep() {
        this.currentStep--;
    }

    goToNextStep() {
        this.currentStep++;
        this.loadStep();
    }

    validFriendlyNames() {
        if (this.resultColumns) {
            for (let i = 0; i < this.resultColumns.length; i++) {
                if (this.resultColumns[i].Name.trim().length == 0)
                    return false;
            }
            return true;
        }
        return false;
    }

    changeModalSize(size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full-size') {
        this.modalRef.getModalOptions().size = size;
        this.modalRef.applyCustomCss();
    }

    onSelectNodes(nodes) {
        this.selectedFields = nodes;
        this.resultColumns = this.selectedFields.map((val) => {
            return {
                Name: (val.Data.DisplayName ? val.Data.DisplayName : val.Data.Name),
                Label: (val.Data.DisplayName ? val.Data.DisplayName : val.Data.Name),
                Path: val.Path,
                SchemaId: this.selectedSchemaId
            }
        })
    }

    onSelectTree(data = null) {
        this.selectedSchemaId = data.item.Id;
        this.selectedSchemaFormList = data.item;
        this.xmlLoading = true;
        this.xmlEmpty = true;
        this.toggleOverlay(true);
        this.changeModalSize('xl');
        let self = this;

        this.xmlService.getXmlData(this.selectedSchemaId, false)
            .subscribe((result: any) => {
                self.selectedSchemaModel = result.SchemaModel;
                self.selectedXmlModel = result.XmlModel;
                let selected = {
                    schema: this.selectedSchemaFormList,
                    result: result,
                    groupData: data
                };
                this.xmlLoading = false;
                this.xmlEmpty = false;
                this.toggleOverlay(false);
                self.cdr.markForCheck();
            }, (err) => {
                this.xmlLoading = false;
                this.xmlEmpty = true;
                this.toggleOverlay(false);
                self.cdr.markForCheck();
            });
    }
}
