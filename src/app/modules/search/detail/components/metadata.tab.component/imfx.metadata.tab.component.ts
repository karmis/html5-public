/**
 * Created by initr on 20.10.2016.
 */
import {
    Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Injectable, Inject, ChangeDetectorRef,
    ViewChild, Injector, EventEmitter, Output, ComponentRef
} from '@angular/core'
import { FormControl } from '@angular/forms';
import { XMLService } from '../../../../../services/xml/xml.service';

// Loading jQuery
import * as $ from 'jquery';
import { GLComponent } from '../../gl.component';
// import {ModalComponent} from '../../../../modal/modal';
// import {ModalConfig} from '../../../../modal/modal.config';
import { XMLComponent } from '../../../xml/xml';
import { AdvancedSearchDataForControlType } from '../../../advanced/types';
import { IMFXSimpleTreeComponent } from '../../../../controls/simple.tree/simple.tree.component';
import { IMFXModalProvider } from '../../../../imfx-modal/proivders/provider';
import { IMFXModalEvent } from '../../../../imfx-modal/types';
import { IMFXMLTreeComponent } from "../../../../controls/xml.tree/imfx.xml.tree";
import { NotificationService } from "../../../../notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import { SecurityService } from "../../../../../services/security/security.service";
import { config } from "shelljs";
import { Subject } from "rxjs/Subject";
import { takeUntil } from 'rxjs/operators';
import { lazyModules } from "../../../../../app.routes";
import { LocationComponent } from "../../../location/location";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'imfx-metadata-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
@Injectable()
export class IMFXMetadataTabComponent {
    config: any;
    compIsLoaded = false;

    public modal;
    public withoutXmlTree = true;
    public data: AdvancedSearchDataForControlType;
    @Input() onRefresh: Subject<any> = new Subject();
    @Output() onValidationChange: EventEmitter<any> = new EventEmitter();
    @Output() onEditStateChange: EventEmitter<any> = new EventEmitter();

    @ViewChild('simpleTreeRef', {static: false}) private simpleTreeRef: IMFXSimpleTreeComponent;
    @ViewChild('xmlTreeRef', {static: false}) private xmlTreeRef: IMFXMLTreeComponent;

    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    private selectedItemInfo: any = null;
    private xmls: any = [];
    private mandatoryXmls: any = [];
    private mandatoryXmlsMap: any = {};
    private showMandatory = true;
    private translateSchemaIdX: string = 'ng2_components.ag_grid.tbl_header_xml_schemas_SCHEMAIDx';
    private schemaFromCMModal;
    private resultFromCMModal;
    private groupDataCMModal;
    private content;
    private destroyed$: Subject<any> = new Subject();
    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";
    private expanded = false;
    private externalXmlList = [];

    constructor(private cdr: ChangeDetectorRef,
                private securityService: SecurityService,
                private xmlService: XMLService,
                private translate: TranslateService,
                private notificationService: NotificationService,
                private modalProvider: IMFXModalProvider) {
        this.onRefresh.pipe(takeUntil(this.destroyed$)).subscribe(data => {
            this.refresh(data.file, data.readOnly);
        });
    }

    // ngOnInit() {
    //   this.config.readOnly = false;// FOR TEST
    // }

    afterViewInit() {
        if (this.config.readOnly === false) {
            this.content.setType('SCHEMAIDx');
        }
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    ngAfterViewInit() {
        this.toggleEditState(false);
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    editDocument() {
        this.newDoc = false;
        var tmp = this.selectedSchemaModel;
        this.selectedSchemaModel = null;
        this.cdr.detectChanges();
        this.toggleEditState(true);
        this.selectedSchemaModel = tmp;
        this.cdr.detectChanges();
    }

    expandTree() {
        this.expanded = true;
        this.xmlTreeRef.ExpandAll();
    }

    collapseTree() {
        this.expanded = false;
        this.xmlTreeRef.CollapseAll();
    }

    toggleEditState(state) {
        this.editMode = state;
        this.onEditStateChange.emit(state);
    }

    cancelEditDocument() {
        if (!this.newDoc) {
            this.selectXml(this.selectedXmlModel.XmlDocumentDbId);
        } else {
            let groupExist = false;
            for (var i = 0; i < this.xmls.length; i++) {
                if (this.xmls[i].Children.length > 0)
                    for (var j = 0; j < this.xmls[i].Children.length; j++) {
                        this.xmls[i].Children[j].selected = false;
                    }
                if (this.groupDataCMModal.group.schemaType.Id == this.xmls[i].Id) {
                    if (this.xmls[i].Children.length > 1) {
                        this.xmls[i].Children.shift();
                        groupExist = true;
                    }
                }
            }
            if (!groupExist) {
                this.xmls.shift();
            }
            this.selectedSchemaModel = {};
            this.selectedXmlModel = {};
            this.selectedItemInfo = null;
            this.newDoc = false;
        }
        this.toggleEditState(false);
        this.cdr.detectChanges();
    }

    private inSave = false;
    private newDoc = false;
    private editMode = false;
    private documentInLoad = false;

    saveSelectedMetadata() {
        this.cdr.detectChanges();
        this.inSave = true;
        if (this.xmlTreeRef && !this.xmlTreeRef.isValid()) {
            this.notificationService.notifyShow(2, this.translate.instant('custom_metadata.xml_not_valid'), true, 1000);
            this.inSave = false;
            return;
        }
        let model = this.xmlTreeRef.getXmlModel();
        var sType = '';
        switch (this.config.typeDetailsLocal) {
            case 'version_details':
                sType = this.config.file['ITEM_TYPE'];
                break;
            case 'title_details':
                sType = this.config.file['ITEM_TYPE'];
                break;
            case 'media_details':
                sType = '4000';
                break;
            case 'segment_details':
                sType = '4006';
                break;
            case 'carrier_details':
                sType = '4001';
                break;
            case 'events':
                sType = '4005';
                break;
            default:
                console.log('ERROR: unknown detail type.');
        }
        //if(this.config.file["ITEM_TYPE"] && this.config.file["ITEM_TYPE"] != 4000)
        model.XmlModel.OwnerType = sType;//this.config.file["ITEM_TYPE"];
        let data = {
            "SchemaModel": {},
            "XmlModel": model.XmlModel
        };
        if (model && model.XmlModel && model.XmlModel.XmlModel) {
            this.xmlService.saveXmlDocument(data, this.newDoc ? 0 : model.XmlModel.XmlDocumentDbId).pipe(
                takeUntil(this.destroyed$)
            ).subscribe((res: any) => {
                if (!!res["ValidationErrors"] && res["ValidationErrors"].length > 0) {
                    for (var i = 0; i < res["ValidationErrors"].length; i++) {
                        let errorString = res["ValidationErrors"][i]["Error"];

                        if (this.xmlTreeRef) {
                            this.xmlTreeRef.invalidateNode(res["ValidationErrors"][i]["XPath"], res["ValidationErrors"][i]["Error"]);
                        }
                    }
                    this.notificationService.notifyShow(2, this.translate.instant('custom_metadata.xml_not_valid'), true, 3000);
                    this.inSave = false;
                    this.cdr.detectChanges();
                } else if (res["Error"] == null) {
                    this.notificationService.notifyShow(1, this.translate.instant('custom_metadata.success'));
                    this.selectXml(res['ID']);
                } else {
                    this.notificationService.notifyShow(2, this.translate.instant('custom_metadata.error') + ". " + res["Error"], true, 3000);
                    this.inSave = false;
                    this.cdr.detectChanges();
                }
            }, (err: HttpErrorResponse) => {
                let message = "";
                if (err.status == 500) {
                    message = err.error.Message;
                }
                this.notificationService.notifyShow(2, this.translate.instant('custom_metadata.error') + ". " + message, true, 3000);
                this.inSave = false;
                this.cdr.detectChanges();
            });
        }
    }

    addCustomMetadata() {
        let self = this;

        let title = this.translateSchemaIdX;

        this.modal = this.modalProvider.showByPath(lazyModules.xml_module, XMLComponent, {
            size: 'md',
            title: title,
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {compContext: self, externalList: this.externalXmlList});

        this.modal.load().then((cr: ComponentRef<XMLComponent>) => {
            this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    self.onAddNew();
                    self.modal.hide();
                }
            });

            this.content = cr.instance;
            this.content.resetSelection();
            this.content.toggleOverlay(false);
            this.afterViewInit();

            this.content.onSelectEvent.subscribe((selected) => {
                self.onSelect(selected.schema, selected.result, selected.groupData);
            });

            this.cdr.detectChanges();
        });


    }

    onSelect(schema, result, groupData) {
        this.schemaFromCMModal = schema;
        this.resultFromCMModal = result;
        this.groupDataCMModal = groupData;
        this.cdr.detectChanges();
    }

    onAddNew(externalData?: any) {
        let data = this.resultFromCMModal;
        if (externalData) {
            data = externalData;
        }
        this.selectedSchemaModel = {};
        this.selectedXmlModel = {};
        this.selectedItemInfo = null;
        this.cdr.detectChanges();

        if (data) {
            data.XmlModel.OwnerId = this.config.file['ID'];
            data.XmlModel.OwnerType = 4000;
            this.selectedSchemaModel = data.SchemaModel;

            this.selectedXmlModel = data.XmlModel;
            let groupExist = false;
            for (var i = 0; i < this.xmls.length; i++) {
                if (this.xmls[i].Children.length > 0)
                    for (var j = 0; j < this.xmls[i].Children.length; j++) {
                        this.xmls[i].Children[j].selected = false;
                    }
                if (this.groupDataCMModal.group.schemaType.Id == this.xmls[i].Id) {
                    groupExist = true;
                    this.xmls[i].Children.unshift({
                        Id: 0,
                        selected: true,
                        Name: this.groupDataCMModal.item.Name
                    });
                }
            }
            if (!groupExist) {
                this.xmls.unshift({
                    Id: this.groupDataCMModal.group.schemaType.Id,
                    Name: this.groupDataCMModal.group.schemaType.Value,
                    Children: [{
                        Id: 0,
                        selected: true,
                        Name: this.groupDataCMModal.item.Name
                    }],
                });
            }
            this.newDoc = true;
            this.toggleEditState(true);
            this.cdr.detectChanges();
        }
    }

    selectXml(selectId = null) {
        debugger
        this.documentInLoad = true;
        this.cdr.detectChanges();
        var sType = '';
        switch (this.config.typeDetailsLocal) {
            case 'version_details':
                sType = this.config.file['ITEM_TYPE'];
                break;
            case 'title_details':
                sType = this.config.file['ITEM_TYPE'];
                break;
            case 'media_details':
                sType = '4000';
                break;
            case 'carrier_details':
                sType = '4001';
                break;
            case 'events':
                sType = '4005';
                break;
            case 'segment_details':
                sType = '4006';
                break;
            default:
                console.log('ERROR: unknown detail type.');
        }
        if(this.config.file['ID'] <= 0) {
            this.config.defaultSchemas = [];
            this.mandatoryXmlsMap = {};
            this.showMandatory = false;
            this.xmls = [];
            this.selectedSchemaModel = {};
            this.selectedXmlModel = {};
            this.selectedItemInfo = null;
            this.compIsLoaded = true;
            this.expanded = false;
            this.toggleEditState(false);
            this.documentInLoad = false;
            this.onValidationChange.emit(true);
            this.newDoc = false;
            this.inSave = false;
            this.config.readOnly = true;
            this.cdr.detectChanges();
        }
        else
            this.xmlService.getXmlForMetadata(this.config.file['ID'], sType).pipe(
                takeUntil(this.destroyed$)
            ).subscribe(result => {
                    if (!this.config.defaultSchemas) {
                        this.config.defaultSchemas = [];
                    }
                    this.mandatoryXmls = this.config.defaultSchemas ? this.config.defaultSchemas.map((x) => {

                        return {
                            item: {
                                Id: x.SchemaId,
                                Name: x.SchemaName
                            },
                            group: {
                                schemaType: {
                                    Id: x.SchemaTypeId,
                                    Value: x.SchemaTypeName
                                }
                            },
                            exist: false
                        }
                    }) : [];

                    this.mandatoryXmlsMap = {};
                    for (var j = 0; j < this.mandatoryXmls.length; j++) {
                        this.mandatoryXmlsMap[this.mandatoryXmls[j].item.Id] = this.mandatoryXmls[j];
                    }

                    if (result != undefined && result.length > 0) {
                        this.xmls = result;
                        if (selectId) {
                            if (this.modal && this.content) {
                                this.content.toggleOverlay(false);
                                this.modal.hide();
                            }

                            var existsDocumentsCount = 0;
                            for (var i = 0; i < this.xmls.length; i++) {
                                if (this.xmls[i].Children.length > 0)
                                    for (var j = 0; j < this.xmls[i].Children.length; j++) {
                                        this.xmls[i].Children[j].selected = false;
                                        if (this.xmls[i].Children[j].Id == Math.round(selectId)) {
                                            this.xmls[i].Children[j].selected = true;
                                            if (!this.selectedItemInfo)
                                                this.selectedItemInfo = this.xmls[i].Children[j];
                                        }
                                        if (this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId]) {
                                            if (!this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId].exist) {
                                                this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId].exist = true;
                                                this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId].existDocument = this.xmls[i].Children[j];
                                            }
                                            existsDocumentsCount++;
                                        }
                                    }
                            }

                            this.showMandatory = existsDocumentsCount != this.mandatoryXmls.length;
                            this.onValidationChange.emit(!this.showMandatory && !this.config.readOnly || this.config.readOnly);
                            this.selectXmlDocument(this.selectedItemInfo);
                        } else {
                            var existsDocumentsCount = 0;
                            for (var i = 0; i < this.xmls.length; i++) {
                                if (this.xmls[i].Children.length > 0)
                                    for (var j = 0; j < this.xmls[i].Children.length; j++) {
                                        if (this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId]) {
                                            if (!this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId].exist) {
                                                this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId].exist = true;
                                                this.mandatoryXmlsMap[this.xmls[i].Children[j].SchemaId].existDocument = this.xmls[i].Children[j];
                                            }
                                            existsDocumentsCount++;
                                        }
                                    }
                            }

                            this.showMandatory = existsDocumentsCount != this.mandatoryXmls.length;
                            this.onValidationChange.emit(!this.showMandatory && !this.config.readOnly || this.config.readOnly);
                            this.documentInLoad = false;
                            this.selectedSchemaModel = {};
                            this.selectedXmlModel = {};
                        }
                    }
                    else {
                        this.showMandatory = this.mandatoryXmls.length > 0;
                        this.onValidationChange.emit(!this.showMandatory && !this.config.readOnly || this.config.readOnly);
                        this.documentInLoad = false;
                        this.xmls = [];
                        this.selectedSchemaModel = {};
                        this.selectedXmlModel = {};
                        this.selectedItemInfo = null;
                    }
                    this.compIsLoaded = true;
                    this.newDoc = false;
                    this.inSave = false;
                    this.cdr.detectChanges();
                },
                (err: HttpErrorResponse) => {
                    let message = err.error && err.error.Message ? err.error.Message : "Error"
                    this.notificationService.notifyShow(2, message, true, 3000);
                    this.selectedItemInfo = null;
                    this.documentInLoad = false;
                    this.compIsLoaded = true;
                    this.newDoc = false;
                    this.inSave = false;
                    this.cdr.detectChanges();
                });
    }

    selectMandatoryItem(schema) {
        if (this.editMode || this.config.readOnly)
            return;
        if (schema.exist) {
            for (var i = 0; i < this.xmls.length; i++) {
                if (this.xmls[i].Children.length > 0)
                    for (var j = 0; j < this.xmls[i].Children.length; j++) {
                        this.xmls[i].Children[j].selected = false;
                        if (this.xmls[i].Children[j].Id == Math.round(schema.existDocument.Id)) {
                            this.xmls[i].Children[j].selected = true;
                            if (!this.selectedItemInfo)
                                this.selectedItemInfo = this.xmls[i].Children[j];
                        }
                    }
            }
            this.selectXmlDocument(schema.existDocument);
        } else {
            this.documentInLoad = true;
            this.cdr.detectChanges();

            this.xmlService.getXmlData(schema.item.Id, false)
                .subscribe((result: any) => {
                    this.documentInLoad = false;
                    this.groupDataCMModal = schema;
                    this.onAddNew(result);
                }, (err: HttpErrorResponse) => {
                    this.notificationService.notifyShow(2, err.error.Message, false);
                });
        }
    }

    selectXmlDocument(obj) {
        this.selectedSchemaModel = {};
        this.selectedXmlModel = {};
        this.selectedItemInfo = obj;
        this.documentInLoad = true;
        this.cdr.detectChanges();

        this.xmlService.getXmlDocument(obj.Id).pipe(
            takeUntil(this.destroyed$)
        ).subscribe(res => {
                if (res.SchemaModel != undefined) {
                    this.selectedSchemaModel = Object.assign({}, res.SchemaModel);
                    this.selectedXmlModel = res.XmlModel;
                } else {
                    this.selectedSchemaModel = {};
                    this.selectedXmlModel = {};
                }
                this.expanded = false;
                this.newDoc = false;
                this.inSave = false;
                this.toggleEditState(false);
                this.documentInLoad = false;
                this.cdr.detectChanges();
            },
            (err: HttpErrorResponse) => {
                this.notificationService.notifyShow(2, (err.error && err.error.Message ? err.error.Message : "Error"), true, 3000);
                this.selectedSchemaModel = {};
                this.selectedXmlModel = {};
                this.selectedItemInfo = null;
                this.compIsLoaded = true;
                this.expanded = false;
                this.newDoc = false;
                this.inSave = false;
                this.toggleEditState(false);
                this.documentInLoad = false;
                this.cdr.detectChanges();
            });
    };

    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.selectXml();
        }
    }

    refresh(data?: any, readOnly?: boolean, externalXmlList: Array<any> = []) {
        if(!this.cdr || this.cdr['destroyed']) {
            return;
        }
        if(externalXmlList.length > 0)
            this.externalXmlList = externalXmlList;
        if (readOnly != null) {
            this.config.readOnly = readOnly;
        }
        if (data) {
            this.config.file = data;
            this.selectXml();
        }
    };
}
