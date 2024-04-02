import {
    ChangeDetectorRef,
    Component,
    Injectable,
    Injector,
    ViewEncapsulation,
    Input, Output, EventEmitter, SimpleChanges
} from '@angular/core';
import {Subject} from 'rxjs';
import {Select2EventType} from "../../../../../../../../../modules/controls/select2/imfx.select2";

@Component({
    selector: 'production-make-workflows',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
    ],
    entryComponents: []
})
@Injectable()
export class ProductionMakeWorkflowsTabComponent {
    @Input('data') data: any = null;
    @Output('updateData') updateData: EventEmitter<any> = new EventEmitter<any>();
    @Output('isDataValid') isDataValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    protected _lookups = [];
    private lookups: any = null;
    @Input('lookups') set setLookups(lookups) {
        this.lookups = lookups;
        this.prepareLookups();
    }

    protected controlsConst = [
        {   //<!--Wish Approval Workflow-->
            title: 'production.production_templates.edit_modal.wish-approval',
            field: 'APPROVAL_WORKFLOW_ID'
        },
        {   //<!--Approval Naming Rule-->
            title: 'production.production_templates.edit_modal.approval-naming',
            field: 'APPROVAL_NAMING_RULE_ID'
        },
        {   //<!--Production Workflow-->
            title: 'production.production_templates.edit_modal.production-wf',
            field: 'PROD_WORKFLOW_ID'
        },
        {   //<!--Publish EDL Workflow-->
            title: 'production.production_templates.edit_modal.edl',
            field: 'PUB_WORKFLOW_ID'
        },
        {   //<!--Complete Workflow-->
            title: 'production.production_templates.edit_modal.complete-wf',
            field: 'COMPLETE_WORKFLOW_ID'
        }
    ];

    private destroyed$: Subject<any> = new Subject();

    constructor(
        protected cdr: ChangeDetectorRef,
        protected injector: Injector
    ) {
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.validate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.data && changes.data.firstChange == false) {
            // console.log('ngOnChanges MakeWorkflowsTabComponent', changes);
            this.validate();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    prepareLookups() {
        this._lookups = [];

        if (!this.lookups) {
            return;
        }

        for (const item of this.controlsConst) {
            const lookupItem = this.lookups[item.field];
            if (lookupItem) {
                this._lookups[item.field] = lookupItem.map(el => ({id: el.ID, text: el.Name}));
            }
        }
    }

    onSelectWorkflow(val: Select2EventType, field: string) {
        let value = val.params.data[0] && val.params.data[0].id || null;
        this.data[field] = value;
        this.onChange(value, field);
    }

    onChange($event, field) {
        this.updateData.emit({value: this.data[field], field});
    }

    validate() {
        let isValid = true;
        this.isDataValid.emit(isValid);
    }
}
