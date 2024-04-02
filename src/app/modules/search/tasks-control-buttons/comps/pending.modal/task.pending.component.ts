import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {IMFXModalComponent} from "../../../../imfx-modal/imfx-modal";
import {NotificationService} from "../../../../notification/services/notification.service";
import {TaskPendingComponentProvider} from "./providers/task.pending.provider";
import { Subscription } from 'rxjs';
import {TranslateService} from "@ngx-translate/core";
import { IMFXControlsSelect2Component } from '../../../../controls/select2/imfx.select2';
import { TaxonomyService } from '../../../taxonomy/services/service';
import { LookupSearchService } from '../../../../../services/lookupsearch/common.service';

@Component({
    selector: 'task-pending-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TaskPendingComponentProvider, TaxonomyService]
})

export class TaskPendingComponent {
    @ViewChild('modalFooterTemplate', {static: true}) private modalFooterTemplate;
    @ViewChild('reasonTextArea', {static: false}) private reasonTextArea;
    @ViewChild('select', {static: false}) private select: IMFXControlsSelect2Component;
    private modalRef: IMFXModalComponent;
    private reasonText: string = '';
    public routerEventsSubscr: Subscription;

    private valid: boolean = true;
    private valid_error: string = '';
    assignToUser: boolean = true;
    users: any[] = [];
    private taskFile: any = null;
    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                public provider: TaskPendingComponentProvider,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                @Inject(TranslateService) protected translate: TranslateService,
                private lookupSearchService: LookupSearchService,
                private taxonomyService: TaxonomyService) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.modalRef = this.injector.get('modalRef');
        this.taskFile = this.modalRef.getData().taskFile;

    }

    ngOnInit() {
    }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }

    onShow() {}
    ngAfterViewInit() {
        this.reasonTextArea.nativeElement.focus();
        this.lookupSearchService.getLookup('job-schedule-nodes')
            .subscribe(
                (data: any[]) => {
                    let usrs = [];
                    data.forEach((node) => {
                        const lowerUsers = this.taxonomyService.getLowerLevelValuesOfTaxonomy([node]).filter((node) => {
                            return node.NodeType === 'User';
                        })
                        usrs = usrs.concat(lowerUsers)
                    })
                    // const sortedData = data.sort((a, b) => a.Id < b.Id ? -1 : a.Id > b.Id ? 1 : 0)
                    this.users = usrs;
                    this.select.setData(this.select.turnArrayOfObjectToStandart(this.users, {
                        key: 'Id',
                        text: 'NodeName'
                    }));

                    if (this.taskFile['LAST_OP_ID']) {
                        this.select.setSelected(this.taskFile['LAST_OP_ID']);
                    }
                });
    }

    /**
     * Hide modal
     */
    closeModal() {
        this.modalRef.hide();
        this.provider.modalIsOpen = false;
        this.reasonTextArea.nativeElement.blur();
    }
    doTextareaValueChange($event) {
        this.reasonText = $event.currentTarget.value;
        this.valid = true;
    }
    sendStatus() {
        if(this.validate()) {
            this.modalRef.modalEvents.emit({
                name: 'ok', state: {status: 'PEND', reasonText: this.reasonText, assignTo: this.assignToUser?this.select.getSelected():null}
            });
            this.closeModal();
        }
    }
    validate() {
        this.valid = true;
        this.valid_error = '';
        if (!this.reasonText || this.reasonText == ''){
            this.valid = false;
            this.valid_error = this.translate.instant('component_qc.empty_message_error');
        }
        this.cdr.detectChanges();
        return this.valid;
    }

    onSelect() {

    }
}
