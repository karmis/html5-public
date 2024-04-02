import {ChangeDetectorRef, Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {DropEffect, DndDropEvent} from 'ngx-drag-drop'
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";
import {IMFXModalAlertComponent} from "../../../../../modules/imfx-modal/comps/alert/alert";
import {IMFXModalComponent} from "../../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalEvent} from "../../../../../modules/imfx-modal/types";
import {SessionStorageService} from "ngx-webstorage";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {DetailViewCustommetadataConfigService} from "./services/settings.default.view.custommetadata.config.service";
import {AddCustomColumnModalComponent} from "../../../../../modules/controls/add.customcolumn.modal/add.customcolumn.modal.component";
import * as ld from "lodash";
import { lazyModules } from "../../../../../app.routes";
import {SystemConfigCommonProvider} from "../../providers/system.config.common.provider";

@Component({
    selector: 'details-view-custommetadata-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [

    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailViewCustommetadataConfigService,
        SystemConfigCommonProvider
    ]
})


export class DetailsViewCustomMetadataConfig {

    @ViewChild('detailConfigOverlay', {static: true}) private detailConfigOverlay: ElementRef;
    @Input("selectedCustomMetadata") public selectedCustomMetadata;
    private initialData;
    private layoutList = [];
    private fieldsList = [];
    private groupId = 1;
    private activeView = 1;
    private destroyed$: Subject<any> = new Subject();

    constructor(protected service: DetailViewCustommetadataConfigService,
                protected modalProvider: IMFXModalProvider,
                protected notificationRef: NotificationService,
                public sessionStorage: SessionStorageService,
                protected cd: ChangeDetectorRef,
                public sccp: SystemConfigCommonProvider) {

    }

    ngOnInit() {
        this.updateData();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    switchView(type) {
        this.activeView = type;
    }

    toggleOverlay(show) {
        if(show) {
            $(this.detailConfigOverlay.nativeElement).show();
        }
        else {
            $(this.detailConfigOverlay.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    updateData() {
        this.toggleOverlay(true);
        this.layoutList = [];
        this.fieldsList = [];
        this.groupId = 1;
        this.activeView = 1;
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
        this.toggleOverlay(false);
        /*this.service.getConfigData(this.detailType, this.detailSubType)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) =>{
            this.layoutList = [];
            this.fieldsList = [];
            this.groupId = 1;
            this.activeView = 1;
            this.initialData = res;

            var fieldsKeys = Object.keys(res.AllColumns);
            for(var i = 0; i < fieldsKeys.length; i++) {
                this.fieldsList.push({
                    data: {
                        Id: fieldsKeys[i],
                        Title: res.AllColumns[fieldsKeys[i]],
                        Foreground: "",
                        Background: "",
                        IsBold: false
                    },
                    effectAllowed: "move",
                    disable: false,
                    handle: false,
                });
            }
            for(var i = 0; i < res.Groups.length; i++) {
                if(res.Groups[i].GroupName.length > 0) {
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
                }
                else {
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
                for(var j = 0; j < res.Groups[i].Columns.length; j++) {
                    this.layoutList[this.layoutList.length - 1].children.push({
                        data: {
                            Id: res.Groups[i].Columns[j].Id,
                            Title: res.Groups[i].Columns[j].Title,
                            Foreground: res.Groups[i].Columns[j].Foreground,
                            Background: res.Groups[i].Columns[j].Background,
                            IsBold: res.Groups[i].Columns[j].IsBold
                        },
                        effectAllowed: "move",
                        disable: false,
                        handle: false,

                    });
                }
            }
            this.fieldsList.sort(this.compare);
            this.toggleOverlay(false);
        });*/
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
        if(item.data[field] == "" || !(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(item.data[field].trim()))) {
            item.data[field] = "";
        }
        else {
            item.data[field] = item.data[field].trim();
        }
    }

    addFieldGroup() {
        this.layoutList.push({
            data: {
                GroupID: this.groupId,
                GroupName:"New Fields Group"
            },
            effectAllowed: "move",
            disable: false,
            handle: false,
            children: []
        });
        this.groupId++;
    }

    onDragStart( event:DragEvent ) {
        //console.log("On Drag Start!")
    }

    onDragged( item:any, list:any[], effect:DropEffect ) {
        if( effect === "move" ) {
            const index = list.indexOf( item );
            list.splice( index, 1 );
        }
    }

    onDragEnd( event:DragEvent ) {
        //console.log("On Drag End!")
    }

    onDrop( event:DndDropEvent, list?:any[] ) {

        if(list && (event.dropEffect === "move") ) {
            let index = event.index;

            if( typeof index === "undefined" ) {

                index = list.length;
            }

            list.splice( index, 0, event.data );
        }
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
                text: 'details_view_custommetadata.confirm_reset',
                textParams: {
                    type: "DEBUG",
                }
            };

            modalContent.setText(confirmParams.text, confirmParams.textParams);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                    this.toggleOverlay(true);
                    this.service.resetConfigData(this.initialData.Id).subscribe((res: any) =>{
                        this.updateData();
                    });
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    addNewFields() {
        console.log('add');

        var setupCustomColumnsModal = this.modalProvider.showByPath(lazyModules.add_custom_column_modal,
            AddCustomColumnModalComponent, {
            size: 'md',
            title: 'custom_columns.modal.title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {context: this});
        setupCustomColumnsModal.load().then(cr => {
            setupCustomColumnsModal.modalEvents.subscribe((res: any) => {
                if(res && res.name == "ok") {
                    for(var i = 0; i < res.state.length; i++) {
                        var id = "xml|" + res.state[i].SchemaId + "|" + res.state[i].Path;
                        var name = res.state[i].Name;
                        this.fieldsList.push({
                            data: {
                                Id: id,
                                Title: name,
                                Foreground: "",
                                Background: "",
                                IsBold: false
                            },
                            effectAllowed: "move",
                            disable: false,
                            handle: false,
                        });
                    }
                    console.log(this.fieldsList);
                }
            })
            /*var modal = this.modalProvider.show(CopyFromModalComponent, {
                size: "sm",
                title: 'details_view_custommetadata.modal.title',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {context: this});

            modal.modalEvents.subscribe((res: any) => {
                if(res && res.name == "ok" ) {
                    var typeFrom = res.$event.type;
                    this.toggleOverlay(true);
                    this.service.getConfigData(this.detailType, typeFrom)
                        .pipe(takeUntil(this.destroyed$))
                        .subscribe((res: any) =>{
                        this.layoutList = [];
                        this.fieldsList = [];
                        this.tabsList = [];
                        this.activeTabsList = [];
                        this.groupId = 1;
                        this.activeView = 1;

                        this.initialData = res;
                        console.log(res);
                        var fieldsKeys = Object.keys(res.AllColumns);
                        for(var i = 0; i < fieldsKeys.length; i++) {
                            this.fieldsList.push({
                                data: {
                                    Id: fieldsKeys[i],
                                    Title: res.AllColumns[fieldsKeys[i]],
                                    Foreground: "",
                                    Background: "",
                                    IsBold: false
                                },
                                effectAllowed: "move",
                                disable: false,
                                handle: false,
                            });
                        }
                        for(var i = 0; i < res.Groups.length; i++) {
                            if(res.Groups[i].GroupName.length > 0) {
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
                            }
                            else {
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
                            for(var j = 0; j < res.Groups[i].Columns.length; j++) {
                                this.layoutList[this.layoutList.length - 1].children.push({
                                    data: {
                                        Id: res.Groups[i].Columns[j].Id,
                                        Title: res.Groups[i].Columns[j].Title,
                                        Foreground: res.Groups[i].Columns[j].Foreground,
                                        Background: res.Groups[i].Columns[j].Background,
                                        IsBold: res.Groups[i].Columns[j].IsBold
                                    },
                                    effectAllowed: "move",
                                    disable: false,
                                    handle: false,

                                });
                            }
                        }

                        var tabsKeys = Object.keys(res.AllTabs);
                        for(var i = 0; i < tabsKeys.length; i++) {
                            this.tabsList.push({
                                Id: tabsKeys[i],
                                Name: res.AllTabs[tabsKeys[i]],
                                Active: res.TabsData.indexOf(tabsKeys[i]) > -1
                            });
                        }
                        this.fieldsList.sort(this.compare);
                        this.activeTabsList = res.TabsData;
                        this.toggleOverlay(false);
                    });
                }
            });*/
        })
    }

    saveLayout() {
        this.toggleOverlay(true);
        setTimeout(()=>{
            this.notificationRef.notifyShow(1, 'details_view_custommetadata.saved');
            this.toggleOverlay(false);
        }, 2000);
        /*var data = {
            Id: false ? this.initialData.Id : 0,
            Type: this.initialData.Type,
            Groups: this.layoutList.map((val, index) => {
                return {
                    Columns: val.children ? val.children.map((val2, index2) => {
                            return {
                                Id: val2.data.Id,
                                Title:  val2.data.Title,
                                Foreground:  val2.data.Foreground,
                                Background:  val2.data.Background,
                                IsBold:  val2.data.IsBold,
                            }
                        }) : [],
                    GroupName: val.data.GroupName
                }
            })
        };
        this.service.saveFieldsForDetail(data).subscribe((res: any) =>{
            if(res && res.ID) {
                this.initialData.Id = res.ID;
            }
            var i = sessionStorage.length;
            while(i--) {
                var key = sessionStorage.key(i);
                if(/detailsview\./.test(key)) {
                    this.sessionStorage.clear(key.substring(key.indexOf('.') + 1));
                }
            }
            this.notificationRef.notifyShow(1, 'details_view_custommetadata.saved');
            this.toggleOverlay(false);
        });*/
    }
}

