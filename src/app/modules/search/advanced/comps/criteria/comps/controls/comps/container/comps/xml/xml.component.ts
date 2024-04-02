/**
 * Created by Sergey Trizna on 06.02.2016.
 */
import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef, ComponentRef
} from '@angular/core';
// Modal
// import { ModalConfig } from '../../../../../../../../../../modal/modal.config';
import { XMLComponent } from '../../../../../../../../../../search/xml/xml';
import {
    AdvancedSearchDataForControlType,
    AdvancedSearchDataFromControlType
} from '../../../../../../../../types';
// import { ModalComponent } from '../../../../../../../../../../modal/modal';
import { SearchAdvancedCriteriaProvider } from '../../../../../../providers/provider';
import { IMFXModalEvent } from '../../../../../../../../../../imfx-modal/types';
import { IMFXModalProvider } from '../../../../../../../../../../imfx-modal/proivders/provider';
import {BsModalService} from "ngx-bootstrap/modal";
import { XMLService } from '../../../../../../../../../../../services/xml/xml.service';
import {lazyModules} from "../../../../../../../../../../../app.routes";

@Component({
    selector: 'advanced-criteria-control-xml',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})

export class IMFXAdvancedCriteriaControlXMLComponent {
    public data: AdvancedSearchDataForControlType;
    private modal;
    private translateSchemaId: string = 'ng2_components.ag_grid.tbl_header_xml_schemas_SCHEMAID';
    private translateSchemaIdX: string = 'ng2_components.ag_grid.tbl_header_xml_schemas_SCHEMAIDx';
    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    private selectedSchemaFormList: any = null;
    private cuttedSerializedValue?: string;
    private serializedValue?: string = '';
    private content: XMLComponent;
    private modelName: string = '';

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider,
                private modalProvider: IMFXModalProvider,
                private xmlService: XMLService,
                private cdr: ChangeDetectorRef) {
        this.data = this.injector.get('data');
        if(this.data.criteria.data && this.data.criteria.data.value && this.data.criteria.data.value.value){
            this.serializedValue = this.data.criteria.data.value.value.toString();
            this.cuttedSerializedValue = this.cutSerializedData(this.serializedValue);
        }
        if(this.data.criteria.data && this.data.criteria.data.value && this.data.criteria.data.value.humanValue) {
            this.modelName = this.data.criteria.data.value.humanValue.split('|')[1];
        }
    }

    onSelect(schema: any, result: any, i?: number) {
        this.prepareData (schema, result);
        // if (this.data.field.Name === 'SCHEMAID') {
            this.onSave();
        // }
    }

    prepareData (schema: any, result: any) {
        this.selectedSchemaFormList = schema;
        this.selectedSchemaModel = result.SchemaModel;
        this.selectedXmlModel = result.XmlModel;
        if (this.data.field.Name.indexOf('SCHEMAIDx') > -1) {
            this.modelName = this.selectedSchemaModel.SchemaModel.Name;
        } else {
            this.modelName = this.selectedSchemaFormList.Name
        }
    }

    onSave() {
        this.transferData();
    }

    ngAfterViewInit() {
        // set value from recent search
        if (this.data.criteria.data.value && this.data.criteria.data.value.dirtyValue) {
            this.transferData();
        } else if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
            this.getDataAndTransfer(this.data.criteria.data.value.value);
        }
    }

    getDataAndTransfer(val){
        if(!val){
            return;
        }
        if(val.toString().indexOf('|') > -1){
            val = val.split('|')[0];
        }
        this.xmlService.getXmlData(val,true).subscribe((res: any) => {
            this.prepareData({Id: val}, res);
            // if (this.data.field.Name === 'SCHEMAID') {
                this.onSave();
            // }
        });
    }

    afterViewInit() {
        if (this.data.field.Name === 'SCHEMAID') {
            this.onInitSchemaID();
        } else {
            this.onInitSchemaIDx();
        }

        let self = this;
        this.content = this.compRef.instance;
        this.content.onSelectEvent.subscribe((selected) => {
            self.onSelect(selected.schema, selected.result);
        });

        this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name === 'ok') {
                self.onSave();
                self.modal.hide();
            }
        });

        // setTimeout(() => {
            this.modal.contentView.instance.setType(this.data.field.Name);
        // });
    }

    private compRef: ComponentRef<XMLComponent>;
    showModal() {
        // const modalService = this.injector.get(BsModalService);
        // let self = this;

        let title = this.data.field.Name === 'SCHEMAID' ?
        this.translateSchemaId : this.translateSchemaIdX;
        this.modal = this.modalProvider.showByPath(lazyModules.xml_module, XMLComponent, {
            size: 'xl',
            title: title,
            position: 'center',
            footer: 'ok',
        }, {
            compContext: self,
            preventLastElementRemoving: true,
            serializedData: !!this.data && !!this.data.criteria && !!this.data.criteria.data &&
            !!this.data.criteria.data.value && !!this.data.criteria.data.value.value ?
                this.data.criteria.data.value.value.toString() : null
        });

        this.modal.load().then((cr: ComponentRef<XMLComponent>) => {
            this.compRef = cr
            this.afterViewInit();
        });
    }

    /**
     * Send data to parent comp
     */
    transferData() {
        // if (this.selectedSchemaModel) {
        //     let schemaId = this.selectedSchemaModel.SchemaDbId;
        //     let schemaName = this.selectedSchemaFormList.Name;
            let res: AdvancedSearchDataFromControlType = <AdvancedSearchDataFromControlType> {
                dirtyValue: '',
                value: '',
                humanValue: '',
            };
            if (this.data.field.Name.indexOf('SCHEMAIDx') > -1) {
                let schemaId;
                let schemaName;
                if(this.content && this.content.xmlTree){
                    let xmlTree = this.content.xmlTree;
                    if(xmlTree.xmlTree) {
                        this.selectedXmlModel = xmlTree.xmlTree.getXmlModel(false).XmlModel;
                        schemaId = this.selectedSchemaModel.SchemaDbId;
                        schemaName = this.selectedSchemaFormList.Name;
                        let serializedTree = xmlTree.xmlTree.getSerializedTree();
                        this.serializedValue = schemaId + '|' + schemaName + '|' + serializedTree;
                    }
                } else if(
                    this.data.criteria.data.value &&
                    this.data.criteria.data.value.dirtyValue &&
                    this.data.criteria.data.value.dirtyValue.schemaName
                ){
                    const dataVal = this.data.criteria.data.value;
                    schemaId = dataVal.dirtyValue.schemaId;
                    schemaName = dataVal.dirtyValue.schemaName;
                    this.serializedValue = (<string>dataVal.value);
                } else {
                    if (this.data.criteria.data.value) {
                        const dataVal = this.data.criteria.data.value;
                        this.serializedValue = (<string>dataVal.value);
                    }
                }

                // this.cuttedSerializedValue = this.cutSerializedData(this.serializedValue);
                this.cuttedSerializedValue = this.serializedValue;
                res.value = this.serializedValue;
                res.humanValue = this.cuttedSerializedValue;
                res.dirtyValue = {
                    schemaId: schemaId,
                    schemaName: schemaName,
                    serializedValue: this.serializedValue
                };
            } else {
                let schemaId;
                let schemaName;
                if(this.selectedSchemaFormList && this.selectedSchemaModel) {
                    schemaId = this.selectedSchemaModel.SchemaDbId;
                    schemaName = this.selectedSchemaFormList.Name;
                } else {
                    const dataVal = this.data.criteria.data.value;
                    schemaId = dataVal.dirtyValue.schemaId;
                    schemaName = dataVal.dirtyValue.schemaName;
                    this.modelName = schemaName;
                }

                let humanValue = schemaId;
                if(schemaName !== undefined){
                    humanValue = humanValue + '|' + schemaName;
                }

                res = {
                    value: schemaId,
                    humanValue: humanValue,
                    dirtyValue: {
                        schemaId: schemaId,
                        schemaName: schemaName,
                    }
                };
            }

            this.cdr.detectChanges();
            this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>res);
        // }
    }

    private onInitSchemaID() {
        // let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        // if (value) {
        // }
    }

    private onInitSchemaIDx() {
    }

    private cutSerializedData(val: string, len: number = 50) {
        return val.substr(0, len);
    }
}
