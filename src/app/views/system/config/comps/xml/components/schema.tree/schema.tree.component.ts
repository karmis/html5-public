import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXModalProvider} from "../../../../../../../modules/imfx-modal/proivders/provider";
import {EditXmlModalComponent} from "../../modals/edit-modal.modal/edit";
import {IMFXModalAlertComponent} from "../../../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalComponent} from "../../../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalEvent} from "../../../../../../../modules/imfx-modal/types";
import {NotificationService} from "../../../../../../../modules/notification/services/notification.service";
import {XMLService} from "../../../../../../../services/xml/xml.service";
import {TranslateService} from "@ngx-translate/core";
import {lazyModules} from "../../../../../../../app.routes";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'imfx-schema-tree',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class IMFXSchemaTreeComponent implements AfterViewInit {
    @ViewChild('treeFilter', {static: true}) treeFilter: ElementRef;
    @Input() groups;
    @Input() returnSchema = false;
    @Input() collapsedByDefault = true;
    @Input() expandOnFilter = false;
    @Output() selected: EventEmitter<any> = new EventEmitter();
    @Output() reload: EventEmitter<any> = new EventEmitter();
    public selectedItemId = null;
    @ViewChild('control', {static: false}) private control;
    private filteredGroups;
    private expandedAll = false;
    private selectedItemName = null;

    constructor(protected modalProvider: IMFXModalProvider,
                private xmlService: XMLService,
                private translate: TranslateService,
                private notificationService: NotificationService,
    ) {

    }

    ngAfterViewInit() {
        this.treeFilter.nativeElement.focus();
    }

    toggleExpandAll(state) {
        this.expandedAll = state;

        this.filteredGroups = this.filteredGroups.filter((el) => {
            el.hideme = !this.expandedAll;
            return true;
        });
    }

    ngOnInit() {
        this.initManually()
    }

    initManually(groups?) {
        if (groups) {
            this.groups = groups;
        }
        for (var i = 0; i < this.groups.length; i++) {
            this.groups[i].hideme = this.collapsedByDefault;
        }
        this.filteredGroups = $.extend(true, [], this.groups);
        this.clearTreeFilter(false);
    }

    public setFocus() {
        this.treeFilter.nativeElement.focus();
    }

    clearTreeFilter(withExpand = true) {
        $(this.treeFilter.nativeElement).val("");
        this.filterTree("", withExpand);
    }

    filterTree(filter, withExpand = true) {
        var tmp = $.extend(true, [], this.groups);
        var filtered = tmp.filter(x => {
            var match = x.Name.toLowerCase().includes(filter.trim().toLowerCase());
            if (x.Children && x.Children.length > 0) {
                x.Children = x.Children.filter(y => {
                    return y.Name.toLowerCase().includes(filter.trim().toLowerCase());
                });
                match = match || x.Children.length > 0;
            }
            if (this.expandOnFilter && withExpand) {
                x.hideme = false;
            }
            return match;
        });

        if (withExpand) {
            this.expandedAll = true;
        }

        this.filteredGroups = filtered;
    }

    public onSelect(group, id, curItem) {
        if (this.returnSchema) {
            this.selected.emit({item: curItem, group: group});
        } else {
            this.selected.emit('' + id);
        }
        this.selectedItemId = id;
        this.selectedItemName = curItem.Name;
    }

    showModal(isNew) {
        const editModal = this.modalProvider.showByPath(lazyModules.edit_xml_modal, EditXmlModalComponent, {
            size: "xxl",
            title: isNew ? 'system-config.xml.modal.add_title' : 'system-config.xml.modal.view_title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this, isNew: isNew, xmlSchemaId: this.selectedItemId});
        editModal.load().then(() => {
            editModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    this.notificationService.notifyShow(1, this.translate.instant('system-config.xml.modal.saved'), true, 1000);
                    this.reload.emit();
                }
            });
        })
    }

    removeXML() {
        let self = this;
        let id = this.selectedItemId;
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
            size: 'md',
            title: 'modal.titles.confirm',
            position: 'center',
            footer: 'cancel|ok'
        });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                "system-config.xml.modal.confirm",
                {xmlName: this.selectedItemName}
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                modal.showOverlay(true, true);
                if (e.name === 'ok') {
                    self.xmlService.deleteSettingsXmlSchema(id).subscribe((res: any) => {
                            modal.hide();
                            self.notificationService.notifyShow(1, this.translate.instant('system-config.xml.modal.success'), true, 1000);
                            self.reload.emit();
                        },
                        (error: HttpErrorResponse) => {
                            if (error) {
                                try {
                                    if (error.error && error.error.Message) {
                                        self.notificationService.notifyShow(2, error.error.Messag, false, 3000);
                                    } else {
                                        self.notificationService.notifyShow(2, this.translate.instant('error_modal.title'), false, 3000);
                                    }
                                } catch (e) {
                                    self.notificationService.notifyShow(2, this.translate.instant('error_modal.title'), false, 3000);
                                }
                            } else {
                                self.notificationService.notifyShow(2, this.translate.instant('error_modal.title'), false, 3000);
                            }
                            modal.hide();
                        });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
            //this.userManagerService.editSubscription(this.selectedNotification);
        });

    }

    onClickTree(group, index) {
        group.hideme = !group.hideme;
        if (group.hideme === false && this.filteredGroups.length === index + 1) {
            setTimeout(() => {
                $('div#treeWrap.schema-tree-list-wrapper').animate({ scrollTop: 99999 }, 50);
            }, 100)
        }
    }
}
