import {ChangeDetectorRef, Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {DndDropEvent, DropEffect} from 'ngx-drag-drop'
import {DetailViewConfigService} from "./services/settings.default.view.config.service";
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import {CopyFromModalComponent} from "./modals/copy-from.modal/copy-from";
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";
import {IMFXModalAlertComponent} from "../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalComponent} from "../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalEvent} from "../../../../../modules/imfx-modal/types";
import {SessionStorageService} from "ngx-webstorage";
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {lazyModules} from "../../../../../app.routes";
import {AddCustomColumnModalComponent} from "../../../../../modules/controls/add.customcolumn.modal/add.customcolumn.modal.component";
import {IMFXControlsTreeComponent} from "../../../../../modules/controls/tree/imfx.tree";
import {AddCustomStatusModalComponent} from '../../../../../modules/controls/add.custom.status.modal/add.custom.status.modal.component';
import {SystemConfigCommonProvider} from "../../providers/system.config.common.provider";
import {SystemConfigCommonComp} from "../system.config.common.comp";

@Component({
    selector: 'details-view-metadata-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailViewConfigService,
        SystemConfigCommonProvider
    ]
})


export class DetailsViewMetadataConfig extends SystemConfigCommonComp {
    @Input('settingsGroup') public settingsGroup;
    @ViewChild('detailConfigWrapper', {static: true}) public detailConfigWrapper: ElementRef;
    @ViewChild('detailConfigOverlay', {static: true}) public detailConfigOverlay;
    @ViewChild('detailsMetadataSubtree', {static: false}) public detailsMetadataSubtree: IMFXControlsTreeComponent;

    private detailsMetadata = [];
    private selectedDetailMetadata = {
        detailType: null,
        detailSubType: null,
        selectedId: null,
        detailSubTypeFriendlyName: null,
        isDefault: false,
        DefaultOnly: false,
        parentKey: null // 17 "Media Details (Workstation)" Title Details (Workstation) 28 Version Details (Workstation) 36
    };
    private destroyed$: Subject<any> = new Subject();

    constructor(protected service: DetailViewConfigService,
                protected modalProvider: IMFXModalProvider,
                protected notificationRef: NotificationService,
                public sessionStorage: SessionStorageService,
                protected cd: ChangeDetectorRef,
                public sccp: SystemConfigCommonProvider) {
        super()

    }

    ngOnInit() {
        this.service.getViewsTree().subscribe((res) => {
            if (res) {
                var key = -1;
                this.detailsMetadata = res.map((x) => {
                    key++;
                    var result = {
                        key: key,
                        title: x.Title,
                        type: 0,
                        children: x.Children.map((child) => {
                            key++;
                            return {
                                key: key,
                                title: child.Title,
                                type: child.Type,
                                subType: child.SubType,
                                isDefault: child.IsDefault,
                                DefaultOnly: false
                            }
                        })
                    };
                    if (result.children.length > 1)
                        result.type = result.children[0].type;
                    if (result.children.length == 1 && result.children[0].isDefault) {
                        result.children[0].DefaultOnly = true;
                    }
                    return result;
                });
                this.detailsMetadataSubtree.setSource(this.detailsMetadata);
            }
            this.toggleOverlay(false);
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    switchView(type) {
        this.activeView = type;
    }



    toggleOverlay(show) {
        if (show) {
            this.detailConfigOverlay.show(this.detailConfigWrapper.nativeElement);
        } else {
            this.detailConfigOverlay.hide(this.detailConfigWrapper.nativeElement);
        }
        this.cd.detectChanges();
    }

    onSelectSubType($event) {
        if ($event.data.targetType != "expander" && !$event.data.node.folder) {
            if ($event.data.node && !$event.data.node.children) {
                this.toggleOverlay(true);
                this.selectedDetailMetadata.parentKey = $event.data.node.parent.key;
                this.selectedDetailMetadata.detailType = $event.data.node.data.type;
                this.selectedDetailMetadata.detailSubType = $event.data.node.data.subType;
                this.selectedDetailMetadata.detailSubTypeFriendlyName = $event.data.node.title;
                this.selectedDetailMetadata.isDefault = $event.data.node.data.isDefault;
                this.selectedDetailMetadata.DefaultOnly = $event.data.node.data.DefaultOnly;
                this.selectedDetailMetadata.selectedId = $event.data.node.key;

                this.detailsMetadataSubtree.setSelectedById($event.data.node.key, true);

                setTimeout(() => {
                    this.updateData();
                });

            }
        }
    }


    updateData() {
        this.toggleOverlay(true);
        this.service.getConfigData(this.selectedDetailMetadata.detailType, this.selectedDetailMetadata.detailSubType, this.settingsGroup.ID)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                this.updateDefaults(res);
                if (res.Groups.length == 0) {
                    this.layoutList.push({
                        data: {
                            GroupID: 0,
                            GroupName: ""
                        },
                        effectAllowed: "move",
                        disable: false,
                        handle: false,
                        children: []
                    });
                }
                this.fillUpDefaults(res);

                if (this.activeTabsList.length != this.tabsList.length) {
                    this.allActive = false;
                } else {
                    this.allActive = true;
                }
                this.toggleOverlay(false);
            });
    }

    compare(a, b) {
        const t1 = a.data.Title.toUpperCase();
        const t2 = b.data.Title.toUpperCase();

        let comparison = 0;
        if (t1 > t2) {
            comparison = 1;
        } else if (t1 < t2) {
            comparison = -1;
        }
        return comparison;
    }

    pickerClick(item, prefix) {
        $("#color-" + prefix + "-" + item.data.ID).click();
    }

    onChangeColorField(data, item, field, prefix) {
        item.data[field] = data;
    }

    onColorFocusOut(item, field, prefix) {
        if (item.data[field] == "" || !(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(item.data[field].trim()))) {
            item.data[field] = "";
        } else {
            item.data[field] = item.data[field].trim();
        }
    }

    addCustomStatusFields() {
        const setupCustomStatusModal = this.modalProvider.showByPath(lazyModules.add_custom_status_modal,
            AddCustomStatusModalComponent, {
                size: 'md',
                title: 'details_view_metadata.add_custom_status',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {context: this.selectedDetailMetadata.parentKey});
        setupCustomStatusModal.load().then(cr => {
            setupCustomStatusModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    for (let i = 0; i < res.state.length; i++) {
                        let id = 'CustomStatus|' + res.state[i].id;
                        var name = res.state[i].name;
                        if (this.layoutList.filter(obj => {
                            return obj.children.filter(child => {
                                return child.data.Id === id
                            }).length > 0
                        }).length > 0) {
                            continue;
                        }
                        var defaultGroup = this.getDefaultGroup()
                        (<any>defaultGroup).children.push({
                            data: {
                                Id: id,
                                Title: name,
                                Foreground: "",
                                Background: "",
                                IsBold: false,
                                AlwaysVisible: false,
                                IsCustom: 2
                            },
                            effectAllowed: "move",
                            disable: false,
                            handle: false
                        });

                        for (let j = 0; j < this.fieldsList.length; j++) {
                            if (this.fieldsList[j].data.Id == id) {
                                this.fieldsList.splice(j, 1);
                                break;
                            }
                        }
                    }
                    this.cd.detectChanges();
                }
            })
        });
    }

    addCustomMetadataFields() {
        var setupCustomColumnsModal = this.modalProvider.showByPath(lazyModules.add_custom_column_modal,
            AddCustomColumnModalComponent, {
                size: 'md',
                title: 'details_view_metadata.modal.title_custom',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {context: this});
        setupCustomColumnsModal.load().then(cr => {
            setupCustomColumnsModal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    for (let i = 0; i < res.state.length; i++) {
                        let id = "xml|" + res.state[i].SchemaId + "|" + res.state[i].Path;
                        var name = res.state[i].Name;
                        if (this.layoutList.filter(obj => {
                            return obj.children.filter(child => {
                                return child.data.Id === id
                            }).length > 0
                        }).length > 0) {
                            continue;
                        }
                        var defaultGroup = this.getDefaultGroup()
                        (<any>defaultGroup).children.push({
                            data: {
                                Id: id,
                                Title: name,
                                Foreground: "",
                                Background: "",
                                IsBold: false,
                                AlwaysVisible: false,
                                IsCustom: 1
                            },
                            effectAllowed: "move",
                            disable: false,
                            handle: false
                        });

                        for (let j = 0; j < this.fieldsList.length; j++) {
                            if (this.fieldsList[j].data.Id == id) {
                                this.fieldsList.splice(j, 1);
                                break;
                            }
                        }
                    }
                    this.cd.detectChanges();
                }
            })
        });
    }

    addFieldGroup() {
        this.layoutList.push({
            data: {
                GroupID: this.groupId,
                GroupName: "New Fields Group"
            },
            effectAllowed: "move",
            disable: false,
            handle: false,
            children: []
        });
        this.groupId++;
    }

    onDragStart(event: DragEvent) {
        //console.log("On Drag Start!")

    }

    onDragged(item: any, list: any[], effect: DropEffect) {
        if (effect === "move") {
            const index = list.indexOf(item);
            list.splice(index, 1);
        }
    }

    onDragEnd(event: DragEvent) {
        //console.log("On Drag End!")
    }

    onDrop(event: DndDropEvent, list?: any[]) {
        if (list && (event.dropEffect === "move")) {
            let index = event.index;

            if (typeof index === "undefined") {

                index = list.length;
            }

            if (event.data.selected) {
                for (let i = 0; i < this.fieldsList.length; i++) {
                    if (this.fieldsList[i].selected) {
                        list.splice(index, 0, this.fieldsList[i]);
                    }
                }
                var tmp = this.fieldsList.filter((x) => {
                    return x.selected;
                });
                this.fieldsList = this.fieldsList.filter((x) => {
                    var valid = !x.selected;
                    if (!valid)
                        x.selected = false;
                    return valid;
                });
            } else {
                for (let i = 0; i < this.fieldsList.length; i++) {
                    this.fieldsList[i].selected = false;
                }
                list.splice(index, 0, event.data);
            }

            this.cd.detectChanges();
        }
    }

    isDefault() {
        return this.selectedDetailMetadata.isDefault;
    }

    isDefaultOnly() {
        return this.selectedDetailMetadata.DefaultOnly;
    }

    isWorkstation() {
        const k = this.selectedDetailMetadata.parentKey;
        return k == 17 || k == 28 || k == 36;
    }

    isUsedDefault() {
        return this.initialData && this.initialData.Subtype != this.selectedDetailMetadata.detailSubType && this.initialData.Subtype == 0;
    }

    resetLayout() {
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'modal.titles.confirm',
                position: 'center',
                footer: 'cancel|ok'
            });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            let confirmParams = {
                text: 'details_view_metadata.confirm_reset',
                textParams: {
                    type: this.selectedDetailMetadata.detailSubTypeFriendlyName,
                }
            };

            modalContent.setText(confirmParams.text, confirmParams.textParams);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                    this.toggleOverlay(true);
                    this.service.resetConfigData(this.initialData.Type, this.initialData.Subtype, this.settingsGroup.ID).subscribe((res: any) => {
                        this.updateData();
                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    extractXPath(id) {
        return id.split('|')[2];
    }

    // System ->Metadata Display Configuration -> Media Details  -> Carrier Based -> Copy From
    showCopyFromModal() {
        const modal = this.modalProvider.showByPath(lazyModules.show_copy_from_modal,
            CopyFromModalComponent, {
                size: "sm",
                title: 'details_view_metadata.modal.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                context: this, types: this.detailsMetadata.filter((x) => {
                    return x.type == this.selectedDetailMetadata.detailType;
                })[0].children.map((x) => {
                    return {
                        type: x.subType,
                        title: x.title
                    }
                })
            });

        modal.load().then(cr => {
            modal.modalEvents.subscribe((res: any) => {
                if (res && res.name == "ok") {
                    var typeFrom = res.$event.type;
                    this.toggleOverlay(true);
                    this.service.getConfigData(this.selectedDetailMetadata.detailType, typeFrom, this.settingsGroup.ID)
                        .pipe(takeUntil(this.destroyed$))
                        .subscribe((res: any) => {
                            this.updateDefaults(res);
                            this.fillUpDefaults(res);
                            this.toggleOverlay(false);
                        });
                }
            });
        });
    }

    saveLayout() {
        this.toggleOverlay(true);
        var data = {
            Id: this.initialData.Subtype == this.selectedDetailMetadata.detailSubType ? this.initialData.Id : 0,
            Subtype: this.initialData.Subtype == this.selectedDetailMetadata.detailSubType ? this.initialData.Subtype : this.selectedDetailMetadata.detailSubType,
            Type: this.initialData.Type,
            TabsData: this.activeTabsList,
            Groups: this.layoutList.map((val, index) => {
                return {
                    Columns: val.children ? val.children.map((val2, index2) => {
                        return {
                            Id: val2.data.Id,
                            Title: val2.data.Title,
                            Foreground: val2.data.Foreground,
                            Background: val2.data.Background,
                            IsBold: val2.data.IsBold,
                            AlwaysVisible: val2.data.AlwaysVisible,
                        }
                    }) : [],
                    GroupName: val.data.GroupName
                }
            })
        };
        this.service.saveFieldsForDetail(data, this.settingsGroup.ID).subscribe((res: any) => {
            if (res && res.ID) {
                this.initialData.Id = res.ID;
                this.initialData.Subtype = this.selectedDetailMetadata.detailSubType;
            }
            let i = sessionStorage.length;
            while (i--) {
                var key = sessionStorage.key(i);
                if (/detailsview\./.test(key)) {
                    this.sessionStorage.clear(key.substring(key.indexOf('.') + 1));
                }
            }
            this.notificationRef.notifyShow(1, 'details_view_metadata.saved');
            setTimeout(() => {
                this.updateData();
            });
        });
    }

    private getTypeCustom(id) {
        if (id.startsWith("xml|")) {
            return 1
        }
        if (id.startsWith("CustomStatus|")) {
            return 2
        }
        return false
    }

    private getDefaultGroup() {
        var defaultGroup = this.layoutList.filter(obj => {
            return obj.data.GroupID === 0
        });
        if (defaultGroup.length == 0) {
            this.layoutList.push({
                data: {
                    GroupID: 0,
                    GroupName: ""
                },
                effectAllowed: "move",
                disable: false,
                handle: false,
                children: []
            });
            return this.layoutList[this.layoutList.length - 1];
        } else {
            return defaultGroup[0];
        }
    }

    private updateDefaults(res) {
        this.layoutList = [];
        this.fieldsList = [];
        this.tabsList = [];
        this.activeTabsList = [];
        this.groupId = 1;
        this.activeView = 1;

        this.initialData = res;

        const fieldsKeys = Object.keys(res.AllColumns);
        for (let i = 0; i < fieldsKeys.length; i++) {
            this.fieldsList.push({
                data: {
                    Id: fieldsKeys[i],
                    Title: res.AllColumns[fieldsKeys[i]],
                    Foreground: "",
                    Background: "",
                    IsBold: false,
                    AlwaysVisible: false,
                    IsCustom: this.getTypeCustom(fieldsKeys[i])
                },
                effectAllowed: "move",
                disable: false,
                handle: false,
            });
        }
    }

    private fillUpDefaults(res) {
        for (let i = 0; i < res.Groups.length; i++) {
            if (res.Groups[i].GroupName.length > 0) {
                this.layoutList.push({
                    data: {
                        GroupID: this.groupId,
                        GroupName: res.Groups[i].GroupName
                    },
                    effectAllowed: "move",
                    disable: false,
                    handle: false,
                    children: []
                });
                this.groupId++;
            } else {
                this.layoutList.push({
                    data: {
                        GroupID: 0,
                        GroupName: ""
                    },
                    effectAllowed: "move",
                    disable: false,
                    handle: false,
                    children: []
                });
            }
            for (let j = 0; j < res.Groups[i].Columns.length; j++) {
                this.layoutList[this.layoutList.length - 1].children.push({
                    data: {
                        Id: res.Groups[i].Columns[j].Id,
                        Title: res.Groups[i].Columns[j].Title,
                        Foreground: res.Groups[i].Columns[j].Foreground,
                        Background: res.Groups[i].Columns[j].Background,
                        IsBold: res.Groups[i].Columns[j].IsBold,
                        AlwaysVisible: res.Groups[i].Columns[j].AlwaysVisible,
                        IsCustom: this.getTypeCustom(res.Groups[i].Columns[j].Id)
                    },
                    effectAllowed: "move",
                    disable: false,
                    handle: false,

                });
            }
        }

        var tabsKeys = Object.keys(res.AllTabs);
        for (let i = 0; i < tabsKeys.length; i++) {
            this.tabsList.push({
                Id: tabsKeys[i],
                Name: res.AllTabs[tabsKeys[i]],
                Active: res.TabsData.indexOf(tabsKeys[i]) > -1
            });
        }
        this.fieldsList.sort(this.compare);
        this.activeTabsList = res.TabsData;
    }
}

