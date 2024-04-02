import {ApplicationRef, ComponentFactoryResolver, ComponentRef, Inject, Injector} from "@angular/core";
import { SlickGridProvider } from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import { SlickGridEventData, SlickGridRowData } from "../../../modules/search/slick-grid/types";
import { QueuesService } from '../services/queue.service';
import { NotificationService } from '../../../modules/notification/services/notification.service';
import { SecurityService } from '../../../services/security/security.service';
import {IMFXModalProvider} from "../../../modules/imfx-modal/proivders/provider";
import {IMFXModalComponent} from "../../../modules/imfx-modal/imfx-modal";
import {lazyModules} from "../../../app.routes";
import {WorkflowWizardPriorityComponent} from "../../workflow/comps/wizards/priority/wizard";
import {IMFXModalEvent} from "../../../modules/imfx-modal/types";
import {ChangeQueueIdModalComponent} from "../components/change.queue.id.modal/change.queue.id.modal";
import {IMFXModalAlertComponent} from "../../../modules/imfx-modal/comps/alert/alert";

export class QueueSlickGridProvider extends SlickGridProvider {
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;

    private queueService: QueuesService;
    private securityService: SecurityService;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
        this.queueService = injector.get(QueuesService);
        this.securityService = injector.get(SecurityService);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
    }

    onChangeRowOrder(currentRow: SlickGridRowData, beforeRow: SlickGridRowData) {
        // console.log('Current row1: ', currentRow);
        // console.log('Inserted before1: ', beforeRow);
        if (!this.hasPermissionsToPopup()) {
            return;
        }

        if (!beforeRow) {
            this.savePositionLast();
        } else {
            this.queueService.savePositionBefore(currentRow.Id, beforeRow.Id).subscribe(() => {
                this.refreshGrid();
                this.notificationService.notifyShow(1, 'queue.reorder_success');
            }, () => {
                this.notificationService.notifyShow(2, 'queue.reorder_fail');
            });
        }
    }

    savePositionFirst() {
        if (!this.hasPermissionsToPopup()) {
            return;
        }
        const row = this.getSelectedRow();
        // this.moveToTopRow(row.$id);
        this.queueService.savePositionFirst(row.Id).subscribe(() => {
            this.refreshGrid();
            this.notificationService.notifyShow(1, 'queue.reorder_success');
        }, () => {
            this.notificationService.notifyShow(2, 'queue.reorder_fail');
        });
    }

    savePositionLast() {
        if (!this.hasPermissionsToPopup()) {
            return;
        }
        const row = this.getSelectedRow();

        this.queueService.savePositionLast(row.Id).subscribe(() => {
            this.refreshGrid();
            this.notificationService.notifyShow(1, 'queue.reorder_success');
        }, () => {
            this.notificationService.notifyShow(2, 'queue.reorder_fail');
        });
    }

    setPriority(p: number) {
        if (!this.hasPermissionsToPopup()) {
            return;
        }
        const row = this.getSelectedRow();

        if(this.isDisabledByStatus(row)){
            return;
        }
        this.queueService.setPriority(row.Id, p).subscribe(() => {
            this.notificationService.notifyShow(1, 'queue.priority_success');
        }, () => {
            this.notificationService.notifyShow(2, 'queue.priority_fail');
        });
    }

    copyToClipboard() {
        this.copyToClipboardViewRow();
        this.notificationService.notifyShow(1, 'common.copied');
    }

    hasPermissionsToPopup() {
        return this.securityService.hasPermissionByName('queues-search');
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    isDisabledByStatus(_row: SlickGridRowData) {
        const row = _row || this.getSelectedRow();

        return row && (row.Status === 5 || row.Status === 4 || row.Status === 2);
    }

    clearQueueId() {
        const row = this.getSelectedRow();
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr =>{
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                "queue.clear_queue_id_confirm"
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.queueService.clearQueueId(row.Id).subscribe(() => {
                        this.notificationService.notifyShow(1, 'queue.clear_queue_id_success');
                        this.refreshGrid();
                    }, () => {
                        this.notificationService.notifyShow(2, 'queue.clear_queue_id_fail');
                    });
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }
    setQueueId() {
        const row = this.getSelectedRow();
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(
            lazyModules.queue_set_id,
            ChangeQueueIdModalComponent, {
                size: 'sm',
                title: 'queue.table.dropdown.row.set_queue_id',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                queueId: (<any>row).QueueId
            });
        modal.load().then((compRef: ComponentRef<ChangeQueueIdModalComponent>) => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok') {

                    this.queueService.setQueueId(row.Id, e.state.queueId).subscribe(() => {
                        this.notificationService.notifyShow(1, 'queue.set_queue_id_success');
                        this.refreshGrid();
                    }, () => {
                        this.notificationService.notifyShow(2, 'queue.set_queue_id_fail');
                    });
                }
            });
        });
    }
}
