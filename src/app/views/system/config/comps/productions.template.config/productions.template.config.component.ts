import {ChangeDetectorRef, Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {DndDropEvent, DropEffect} from 'ngx-drag-drop'
import {SessionStorageService} from "ngx-webstorage";
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ProductionsTemplateConfigService} from "./services/productions.template.config.service";
import {NotificationService} from "../../../../../modules/notification/services/notification.service";
import {IMFXModalProvider} from "../../../../../modules/imfx-modal/proivders/provider";
import {TranslateService} from "@ngx-translate/core";
import * as _ from 'lodash';
import {SystemConfigCommonProvider} from "../../providers/system.config.common.provider";
import {SystemConfigCommonComp} from "../system.config.common.comp";

@Component({
    selector: 'productions-template-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ProductionsTemplateConfigService,
        SystemConfigCommonProvider
    ]
})


export class ProductionsInfoTabConfig extends SystemConfigCommonComp {
    @ViewChild('productionsTemplateConfig', {static: true}) private productionsTemplateConfig: ElementRef;
    @ViewChild('productionsTemplatesList', {static: true}) private productionsTemplatesList: ElementRef;
    @ViewChild('mainTemplateConfigWrapper', {static: true}) private mainTemplateConfigWrapper: ElementRef;
    @ViewChild('productionsTabInfoConfigOverlay', {static: true}) private productionsTabInfoConfigOverlay;


    private destroyed$: Subject<any> = new Subject();

    constructor(protected service: ProductionsTemplateConfigService,
                protected notificationRef: NotificationService,
                public sessionStorage: SessionStorageService,
                public translate: TranslateService,
                protected modalProvider: IMFXModalProvider,
                protected cd: ChangeDetectorRef,
                public sccp: SystemConfigCommonProvider) {
        super()

    }

    ngOnInit() {
        this.toggleOverlay(true);
        this.loadList();
    }


    convertArrayToObject(array, key) {
        return array.reduce((acc, curr) => (acc[curr[key]] = curr, acc), {});
    }

    loadList() {
        this.service.getTemplateConfigList().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((list) => {
            this.service.getTemplateConfigTypes().pipe(
                takeUntil(this.destroyed$)
            ).subscribe((types) => {
                if (list) {
                    this.templatesList = Object.entries(list).map(([id, val]) => ({
                        id: id,
                        name: (<any>val).ConfigName
                    }));
                    this.templatesList = _.sortBy(this.templatesList, [user => user.name.toLowerCase()], ['desc'])
                    this.templatesListFiltered = Object.entries(list).map(([id, val]) => ({
                        id: id,
                        name: (<any>val).ConfigName
                    }));
                    this.templatesListFiltered = _.sortBy(this.templatesListFiltered, [user => user.name.toLowerCase()], ['desc'])
                }
                if (types) {
                    this.templateConfigTypes = Object.entries(types.ConfigTypeLookup).map(([id, name]) => ({id, name}));
                    this.allFieldsLookup = this.convertArrayToObject(types.AllColumns, "BindingName");
                    this.allFields = [];
                    for (var i = 0; i < types.AllColumns.length; i++) {
                        this.allFields.push({
                            data: {
                                Id: types.AllColumns[i].BindingName,
                                Title: types.AllColumns[i].FriendlyName,
                                IsMandatory: types.AllColumns[i].IsMandatory
                            },
                            effectAllowed: "move",
                            disable: false,
                            handle: false,
                        });
                    }
                    this.tabsList = [];
                    var tabsKeys = Object.keys(types.AllTabs);
                    for (var i = 0; i < tabsKeys.length; i++) {
                        this.tabsList.push({
                            Id: tabsKeys[i],
                            Name: types.AllTabs[tabsKeys[i]],
                            Active: false
                        });
                    }
                }
                if (this.selectedTemplate != null) {
                    this.selectTemplate(this.selectedTemplate);
                }

                this.toggleOverlay(false);
            });
        });
    }

    switchView(type) {
        this.activeView = type;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    filterList($event) {
        var filterStr = $event ? $event.target.value : "";
        this.templatesListFiltered = this.templatesList.filter((res) => {
            return res.name.toLowerCase().indexOf(filterStr.toLowerCase()) > -1;
        });
    }

    addTemplate() {
        this.isNew = true;
        this.selectedTemplate = {
            id: 0,
            name: ""
        };

        this.layoutList = [];
        this.fieldsList = [];
        this.activeTabsList = [];
        this.allActive = false;
        this.groupId = 1;
        this.activeView = 1;
        this.selectedTemplateType = 0;

        this.fieldsList = this.allFields.slice();
        this.fieldsList.sort(this.compare);

        for (var i = 0; i < this.tabsList.length; i++) {
            this.tabsList[i].Active = false;
        }

        this.initialData = {
            Id: 0,
            Name: this.selectedTemplate.name,
            Groups: []
        };

        this.itemForEdit = {
            Id: 0,
            Name: this.selectedTemplate.name,
            Groups: []
        };
    }

    removeTemplate() {
        this.toggleOverlay(true);
        if (this.selectedTemplate) {
            this.service.deleteTemplateConfigById(this.selectedTemplate.id).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res) => {
                    if (res && res.Error) {
                        this.notificationRef.notifyShow(2, res.Error);
                        this.toggleOverlay(false);
                    } else if (res) {
                        this.selectedTemplate = null;
                        this.selectedTemplateType = null;
                        this.notificationRef.notifyShow(1, 'production.template_config.removed');
                        this.loadList();
                    }
                },
                (err) => {
                    this.notificationRef.notifyShow(2, err);
                });
        }
    }

    selectTemplate(template) {
        this.isNew = false;
        this.selectedTemplate = template;
        this.toggleOverlay(true);
        this.service.getTemplateConfigById(this.selectedTemplate.id).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res) => {
            if (res && res.Error) {
                this.toggleOverlay(false);
                this.notificationRef.notifyShow(2, res.Error);
            } else if (res) {
                this.layoutList = [];
                this.fieldsList = [];
                this.activeTabsList = [];
                this.groupId = 1;
                this.activeView = 1;
                this.initialData = res;
                this.selectedTemplateType = res.ConfigTypeId;

                var fieldsKeys = Object.keys(res.AllColumns);
                for (var i = 0; i < fieldsKeys.length; i++) {
                    this.fieldsList.push({
                        data: {
                            Id: fieldsKeys[i],
                            Title: res.AllColumns[fieldsKeys[i]],
                            IsMandatory: this.allFieldsLookup[fieldsKeys[i]].IsMandatory
                        },
                        effectAllowed: "move",
                        disable: false,
                        handle: false,
                    });
                }
                for (var i = 0; i < res.Groups.length; i++) {
                    this.layoutList.push({
                        data: {
                            GroupID: this.groupId
                        },
                        effectAllowed: "move",
                        disable: false,
                        handle: false,
                        children: []
                    });
                    this.groupId++;
                    for (var j = 0; j < res.Groups[i].Columns.length; j++) {
                        this.layoutList[this.layoutList.length - 1].children.push({
                            data: {
                                Id: res.Groups[i].Columns[j].Id,
                                Title: res.Groups[i].Columns[j].Title,
                                IsMandatory: this.allFieldsLookup[res.Groups[i].Columns[j].Id].IsMandatory
                            },
                            effectAllowed: "move",
                            disable: false,
                            handle: false,
                        });
                    }
                }

                for (var i = 0; i < this.tabsList.length; i++) {
                    this.tabsList[i].Active = res.TabsData.indexOf(this.tabsList[i].Id) > -1;
                }

                this.activeTabsList = res.TabsData;

                if (this.activeTabsList.length != this.tabsList.length) {
                    this.allActive = false;
                } else {
                    this.allActive = true;
                }

                this.fieldsList.sort(this.compare);

                this.itemForEdit = Object.assign({}, res);
                this.itemForEdit.Name = res.Name;
            }
            this.toggleOverlay(false);
        });
    }

    toggleOverlay(show, target = null) {
        target = target ? target : this.mainTemplateConfigWrapper.nativeElement;
        if (show) {
            this.productionsTabInfoConfigOverlay.show(target);
        } else {
            this.productionsTabInfoConfigOverlay.hide(target);
        }
        this.cd.detectChanges();
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

    addFieldGroup() {
        this.layoutList.push({
            data: {
                GroupID: this.groupId
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
                for (var i = 0; i < this.fieldsList.length; i++) {
                    if (this.fieldsList[i].selected) {
                        list.splice(index, 0, this.fieldsList[i]);
                    }
                }
                this.fieldsList = this.fieldsList.filter((x) => {
                    var valid = !x.selected;
                    if (!valid)
                        x.selected = false;
                    return valid;
                });
            } else {
                for (var i = 0; i < this.fieldsList.length; i++) {
                    this.fieldsList[i].selected = false;
                }
                list.splice(index, 0, event.data);
            }

            this.cd.detectChanges();
        }
    }

    extractXPath(id) {
        return id.split('|')[2];
    }

    validate() {
        const mandatoryFields = this.fieldsList.filter((val) => {
            return this.allFieldsLookup[val.data.Id].IsMandatory;
        });
        var result = true;
        if (!this.itemForEdit.Name || this.itemForEdit.Name.trim().length <= 0) {
            this.notificationRef.notifyShow(2, "production.template_config.template_name_invalid");
            result = false;
        }
        if (mandatoryFields.length > 0) {
            this.notificationRef.notifyShow(2,
                this.translate.instant("production.template_config.mandatory_validation").replace("{0}", mandatoryFields.map((val) => {
                    return val.data.Title;
                }).join(",")));
            result = false;
        }
        return result;
    }

    saveLayout() {
        this.toggleOverlay(true);
        if (!this.validate()) {
            this.toggleOverlay(false);
            return;
        }
        var data = {
            Id: this.itemForEdit.Id,
            Name: this.itemForEdit.Name,
            ConfigTypeId: this.templateConfigTypes[this.selectedTemplateType].id,
            ConfigTypeText: this.templateConfigTypes[this.selectedTemplateType].name,
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
                    }) : []
                }
            })
        };

        this.service.updateTemplateConfig(data).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((res: any) => {
            if (res && res.Error) {
                this.toggleOverlay(false);
                this.notificationRef.notifyShow(2, res.Error);
            } else {
                this.notificationRef.notifyShow(1, 'production.template_config.saved');
                this.selectedTemplate.id = res.ID;
                this.selectedTemplate.name = this.itemForEdit.Name;
                this.loadList();
            }
        });
    }
}

