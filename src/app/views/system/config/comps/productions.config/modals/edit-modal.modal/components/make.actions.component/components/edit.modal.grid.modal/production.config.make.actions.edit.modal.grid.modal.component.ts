import {ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {IMFXModalComponent} from 'app/modules/imfx-modal/imfx-modal';

@Component({
    selector: 'production-config-make-actions-edit-modal-grid-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../../../../../../../../../../node_modules/codemirror/lib/codemirror.css'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
    ]
})

export class ProductionConfigMakeActionsEditModalGridModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;

    private modalRef: IMFXModalComponent;
    private readonly itemData;
    private context;
    private readonly isNew;
    private lookups = {};
    private readonly itemToSave: {
        DESCRIPTION?: string
        MANDATORY?: boolean
        SCHEMA_ID?: number
    } = {};
    private gridReady = false;
    private destroyed$: Subject<any> = new Subject();

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                private router: Router,
                protected translate: TranslateService
    ) {

        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.lookups = d.Lookups || {};
        this.itemData = d.itemData && d.itemData.data ? d.itemData.data : d.itemData && d.itemData.row ? d.itemData && d.itemData.row : {};
        this.context = d.context;
        this.isNew = d.isNew;

        this.itemToSave = (!this.isNew)
            ? $.extend(true, {}, this.itemData)
            : {
                DESCRIPTION: null,
                MANDATORY: false,
                SCHEMA_ID: null
            };
    }

    ngOnInit() {

    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    clickOk() {
        if (!this.validate()) {
            this.showOkAttepmtValidFlag();
            return;
        }
        this.modalRef.emitClickFooterBtn('ok');
        this.modalRef.hide();
        // this.closeModal();
    }

    closeModal() {
        this.modalRef.hide();
    }

    onSelect(data, fieldId) {
        var id = data.params.data[0] ? data.params.data[0].id : "";
        if (id != this.itemToSave[fieldId]) {
            this.itemToSave[fieldId] = id;
        }
    }

    getItemToSave() {
        delete (<any>this.itemToSave).$id;
        delete (<any>this.itemToSave).EntityKey;
        delete (<any>this.itemToSave).id;
        delete (<any>this.itemToSave).__contexts;

        return this.itemToSave;
    }

    okAttepmt = false;
    showOkAttepmtValidFlag() {
        this.okAttepmt = true;
        this.cd.markForCheck();
        setTimeout(() => {
            this.okAttepmt = false;
        }, 5000);
    }

    validateField(field): boolean {
        if (field == 'DESCRIPTION' && !this.itemToSave[field]) {
            return false;
        }

        return true;
    }

    validate(): boolean {
        if (!this.validateField('DESCRIPTION')) {
            return false;
        }

        return true;
    }
}
