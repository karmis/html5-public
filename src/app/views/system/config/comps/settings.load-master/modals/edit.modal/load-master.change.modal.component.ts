import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {LookupService} from "../../../../../../../services/lookup/lookup.service";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {TranslateService} from '@ngx-translate/core';
import {LoadMasterService} from "../../services/settings.load-master.service";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {ChoosingRowsModalComponent} from "../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component";
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {LoadMasterChangeQueueModalComponent} from "../edit.queue/edit.queue.modal.component";
import {lazyModules} from "../../../../../../../app.routes";

@Component({
    selector: 'load-master-change-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        LoadMasterService
    ]
})

export class LoadMasterChangeModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    public lastInternalId: number = 0;
    @ViewChild('modalOverlayWrapper', {static: true}) private modalOverlayWrapper: ElementRef;
    private modalRef: IMFXModalComponent;
    private readonly data;
    private itemData;
    private context;
    private readonly isNew;
    private tasksLookup = [];
    private readonly presetsLookup = [];
    private readonly itemToSave;
    private selectedPresetsRows = [];
    private selectedQueuesRows = [];
    private addModal: IMFXModalComponent;
    private lastClickedPresetRow: number = 0;
    private lastClickedQueueRow: number = 0;
    private inLoad = true;

    constructor(protected injector: Injector,
                protected service: LoadMasterService,
                protected cd: ChangeDetectorRef,
                protected modalProvider: IMFXModalProvider,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService,
                protected lokupService: LookupService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.data = d.data;
        this.itemData = d.isNew ? null : d.itemData.data;
        this.tasksLookup = this.convertToSelect(d.tasksLookup);
        this.presetsLookup = d.presetsLookup.map((val) => {
            return {
                id: val.PresetId,
                text: val.PresetName
            }
        });
        this.context = d.context;
        this.isNew = d.isNew;

        if (this.isNew) {
            this.itemToSave = {
                Id: 0,
                IgnorePresets: false,
                Presets: [],
                Queues: [],
                TaskType: null
            };
        } else {
            this.itemToSave = {
                Id: this.itemData.Id,
                IgnorePresets: this.itemData.IgnorePresets,
                Presets: Array.from(this.itemData.Presets),
                Queues: Array.from(this.itemData.Queues).map((x) => {
                    (<any>x).internalId = this.lastInternalId;
                    this.lastInternalId++;
                    return x;
                }),
                TaskType: this.itemData.TaskType
            };
        }

        this.inLoad = false;
    }

    convertToSelect(values) {
        var result = [];
        var keys = Object.keys(values);
        for (var i = 0; i < keys.length; i++) {
            result.push({
                id: keys[i],
                text: values[keys[i]]
            });
        }
        return result;
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalOverlayWrapper.nativeElement).show();
        } else {
            $(this.modalOverlayWrapper.nativeElement).hide();
        }
        this.inLoad = show;
    }

    onSelect(data) {
        this.itemToSave.TaskType = data.params.data[0].id;
    }

    closeModal() {
        this.toggleOverlay(true);
        this.modalRef.hide();
    }

    validate(all, presetsLookup, tasksLookup, current) {
        return this.context.validate(all, presetsLookup, tasksLookup, current);
    }

    saveData() {
        if (!this.context.validate(this.data, this.presetsLookup, this.itemToSave))
            return;
        delete (<any>this.itemToSave).$id;
        delete (<any>this.itemToSave).EntityKey;
        delete (<any>this.itemToSave).id;
        delete (<any>this.itemToSave).__contexts;
        this.toggleOverlay(true);

        this.service.editTask(this.itemToSave).subscribe((res: any) => {
            this.notificationService.notifyShow(1, this.translate.instant("load_master.save_success"));
            this.modalRef.emitClickFooterBtn('ok');
            this.modalRef.hide();
        }, (err) => {
            this.toggleOverlay(false);
            this.notificationService.notifyShow(2, this.translate.instant("load_master.save_error"));
        });
    }

    processPresetRowClick(item, $event, i) {
        if ($event.shiftKey) {
            if (this.lastClickedPresetRow > i) {
                this.selectedPresetsRows = this.selectedPresetsRows.concat(this.data.slice(i, this.lastClickedPresetRow));
            } else {
                this.selectedPresetsRows = this.selectedPresetsRows.concat(this.data.slice(this.lastClickedPresetRow, i + 1));
            }

            return;
        }
        this.lastClickedPresetRow = i;
        if (this.selectedPresetsRows.length == 0) {
            this.selectedPresetsRows.push(item);
        } else {
            if ($event.ctrlKey) {
                if (this.selectedPresetsRows.indexOf(item) > -1) {
                    this.selectedPresetsRows.splice(this.selectedPresetsRows.indexOf(item), 1);
                } else {
                    this.selectedPresetsRows.push(item)
                }
            } else {
                if (this.selectedPresetsRows.length == 1 && this.selectedPresetsRows[0] == item) {
                    this.selectedPresetsRows = [];
                } else {
                    this.selectedPresetsRows = [];
                    this.selectedPresetsRows.push(item);
                }
            }
        }
    }

    deletePresets() {
        this.itemToSave.Presets = this.itemToSave.Presets.filter((val) => {
            for (var i = 0; i < this.selectedPresetsRows.length; i++) {
                if (val.Id === this.selectedPresetsRows[i].Id) {
                    return false;
                }
            }
            return true;
        });
        this.selectedPresetsRows = [];
    }

    addPresets() {
        this.addModal = this.modalProvider.showByPath(lazyModules.choose_rows_modal, ChoosingRowsModalComponent, {
            size: "sm",
            title: 'user_management.users.modal.add_new',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, isSelectAll: false, isSelectedAll: false, primaryKeyField: 'id'});

        this.addModal.load().then((cr: ComponentRef<ChoosingRowsModalComponent>) => {
            this.addModal.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length !== 0) {
                        for (var i = 0; i < res.$event.length; i++) {
                            this.itemToSave.Presets.push({
                                Id: res.$event[i].id,
                                Value: res.$event[i].text,
                                IsSelected: false
                            });
                        }
                    }
                }
            });


            const content: ChoosingRowsModalComponent = cr.instance;
            const result = this.presetsLookup.filter((x) => {
                for (let i = 0; i < this.itemToSave.Presets.length; i++) {
                    if (this.itemToSave.Presets[i].Id === x.id) {
                        return false;
                    }
                }
                return true;
            });
            content.setData(result, "text");
            setTimeout(() => {
                content.toggleOverlay(false);
            });

        });
    }

    processQueuesRowClick(item, $event, i) {
        if ($event.shiftKey) {
            if (this.lastClickedQueueRow > i) {
                this.selectedQueuesRows = this.selectedQueuesRows.concat(this.data.slice(i, this.lastClickedQueueRow));
            } else {
                this.selectedQueuesRows = this.selectedQueuesRows.concat(this.data.slice(this.lastClickedQueueRow, i + 1));
            }

            return;
        }
        this.lastClickedQueueRow = i;
        if (this.selectedQueuesRows.length == 0) {
            this.selectedQueuesRows.push(item);
        } else {
            if ($event.ctrlKey) {
                if (this.selectedQueuesRows.indexOf(item) > -1) {
                    this.selectedQueuesRows.splice(this.selectedQueuesRows.indexOf(item), 1);
                } else {
                    this.selectedQueuesRows.push(item)
                }
            } else {
                if (this.selectedQueuesRows.length == 1 && this.selectedQueuesRows[0] == item) {
                    this.selectedQueuesRows = [];
                } else {
                    this.selectedQueuesRows = [];
                    this.selectedQueuesRows.push(item);
                }
            }
        }
    }

    deleteQueues() {
        this.itemToSave.Queues = this.itemToSave.Queues.filter((val) => {
            for (var i = 0; i < this.selectedQueuesRows.length; i++) {
                var compareId = this.selectedQueuesRows[i].internalId;
                var originalId = val.internalId;
                if (compareId === originalId) {
                    return false;
                }
            }
            return true;
        });
        this.selectedQueuesRows = [];
    }

    editQueue() {
        if (this.selectedQueuesRows.length != 1)
            return;

        const editQueue = this.modalProvider.showByPath(lazyModules.load_master_change_queue_modal, LoadMasterChangeQueueModalComponent, {
            size: "sm",
            title: 'load_master.edit_queue',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, queueData: this.selectedQueuesRows[0], isNew: false});
        editQueue.load().then(() => {
            editQueue.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length !== 0) {
                        for (var i = 0; i < this.itemToSave.Queues.length; i++) {
                            var compareId = res.$event.internalId;
                            var originalId = this.itemToSave.Queues[i].internalId;
                            if (originalId === compareId) {
                                this.itemToSave.Queues[i] = {
                                    ID: res.$event.ID,
                                    Size: res.$event.Size,
                                    Name: res.$event.Name,
                                    IsEnabled: res.$event.IsEnabled
                                };
                                break;
                            }
                        }
                    }
                }
            });
        })
    }

    addQueues() {
        const addQueue = this.modalProvider.showByPath(lazyModules.load_master_change_queue_modal, LoadMasterChangeQueueModalComponent, {
            size: "sm",
            title: 'load_master.add_queue',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, queueData: {}, isNew: true});

        addQueue.load().then(() => {
            addQueue.modalEvents.subscribe((res: IMFXModalEvent) => {
                if (res && res.name == "ok") {
                    if (res.$event && res.$event.length !== 0) {
                        this.itemToSave.Queues.push({
                            ID: res.$event.ID,
                            Size: res.$event.Size,
                            Name: res.$event.Name,
                            IsEnabled: res.$event.IsEnabled,
                            internalId: res.$event.internalId
                        });
                        this.lastInternalId++;
                    }
                }
            });
        })
    }
}
