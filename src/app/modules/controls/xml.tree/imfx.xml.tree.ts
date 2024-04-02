/**
 * Created by Pavel on 17.01.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Input, Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
// Loading jQuery
// import tree component
// import {TreeComponent} from "./component-overrides/dist/angular2-tree-component";
import {TreeModel, TreeVirtualScroll} from "angular-tree-component";
import {IMFXXMLTree} from "./model/imfx.xml.tree";
import {MultilineTextProvider} from "./components/modals/multiline.text/multiline.text.provider";
// import {ModalConfig} from "../../modal/modal.config";
import {MultilineTextComponent} from "./components/modals/multiline.text/multiline.text.component";
import {XMLService} from "../../../services/xml/xml.service";
import {SchemaItemTypes} from "./schema.item.types/schema.item.types";
import {IMFXXMLNode} from "./model/imfx.xml.node";
import {IMFXXMLNodeComponent} from "./components/node/imfx.xml.node.component";
// overrides

declare var window: any;

@Component({
    selector: 'imfx-xml-tree',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [TreeVirtualScroll, TreeModel, MultilineTextProvider],
    entryComponents: [
        MultilineTextComponent
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IMFXMLTreeComponent {
    get xmlModel(): any {
        return this._xmlModel;
    }


    get schemaModel(): any {
        return this._schemaModel;
    }


    @ViewChild('tree', {static: false}) private tree;
    @ViewChild('nodeRef', {static: false}) private nodeRef;
    @Output('onSelectNodes') onSelectTreeNodes: EventEmitter<any> = new EventEmitter<any>();
    // @ViewChild('multilineTextModal', {static: false}) private multilineTextModal;
    @Input('readonly') set setConfig(readonly) {
        this.selectedNodeForAddingChildrens = null;
        this.readonly = readonly;
    }
    readonly: boolean = false;
    @Input('allowTristate') allowTristate: boolean = false;
    @Input('withNodeSelection') withNodeSelection: boolean = false;
    @Input('preventLastElementRemoving') preventLastElementRemoving: boolean = false;

    @Input() set schemaModel(value: any) {
        this._schemaModel = value;
    }

    private _schemaModel: any;

    @Input() set xmlModel(value: any) {
        this._xmlModel = value;
    }

    private _xmlModel: any;
    @Input() serializedData: string = null;
    public xmlTree;
    private schemaItemTypes = new SchemaItemTypes();
    private selectedNodeForAddingChildrens : IMFXXMLNodeComponent = null;
    private selectedAvailableChildrensToAdd : Array<number> = null;

    // private multilineTextModalConfig = <ModalConfig>{
    //     componentContext: this,
    //     options: {
    //         modal: {
    //             size: 'md',
    //         },
    //         content: {
    //             view: MultilineTextComponent,
    //         }
    //     }
    // };

    constructor(public cdr: ChangeDetectorRef,
                private xmlService: XMLService,
                private multilineTextProvider: MultilineTextProvider) {

    }

    ngOnInit() {
        // this.multilineTextProvider.multilineTextModal = this.multilineTextModal;
    }

    ngOnChanges() {
        //detects when parent component switches to another tree data
        this.xmlTree = null;
        this.applyChanges();
    }

    public applyChanges() {
        let xml = this._xmlModel;
        let sch = this._schemaModel;

        if (!xml || !xml.XmlModel || !sch || !sch.SchemaModel || $.isEmptyObject(xml)) {
            this.cdr.detectChanges();
            return;
        }

        if (this.serializedData != null) {
            this.fillFromString(this.serializedData.split("|")[2]);
        }

        this.xmlTree = new IMFXXMLTree(xml, sch, this.cdr, this.xmlService);
        if (!(this.cdr as any).destroyed) {
            this.cdr.detectChanges();
        }
    }

    public getXmlModel(clear = true) {
        return this.xmlTree && this.xmlTree.getXmlModel ? this.xmlTree.getXmlModel(clear) : null;
    }

    public isValid() {
        return this.xmlTree.isValid();
    }

    public invalidateNode(xPath, error) {
        this.xmlTree.invalidateNode(xPath, error);
    }

    public ExpandAll() {
        if (this.tree) {
            this.tree.treeModel.expandAll();
        }
    }

    public CollapseAll() {
        if (this.tree) {
            this.tree.treeModel.collapseAll();
        }
    }

    private onAddAvailableChildren(node: IMFXXMLNodeComponent) {
        this.selectedNodeForAddingChildrens = node;
    }

    private isSelectedChild(index) {
        return this.selectedAvailableChildrensToAdd != null &&
            this.selectedAvailableChildrensToAdd.indexOf(index) >= 0;
    }

    private toggleAvailableChildrenToAdd(index) {
        if(this.selectedAvailableChildrensToAdd == null)
            this.selectedAvailableChildrensToAdd = [];

        let idx = this.selectedAvailableChildrensToAdd.indexOf(index);
        if(idx < 0) {
            this.selectedAvailableChildrensToAdd.push(index);
        }
        else {
            this.selectedAvailableChildrensToAdd.splice(idx, 1);
        }

        if(this.selectedAvailableChildrensToAdd.length == 0)
            this.selectedAvailableChildrensToAdd = null;
    }

    private addSelectedAvailableChildrens(all : boolean) {
        if(all)
            this.selectedNodeForAddingChildrens.addSelectedAvailableChild(null);
        else
            this.selectedNodeForAddingChildrens.addSelectedAvailableChild(this.selectedAvailableChildrensToAdd);
        this.closeAddChild();
    }

    private closeAddChild() {
        this.selectedAvailableChildrensToAdd = null;
        this.selectedNodeForAddingChildrens = null;
    }

    private onSelectNodes(data) {
        this.xmlTree.onSelectNodes(data);
        var nodes = this.xmlTree.getSerializedSelectedField(true, true);
        this.onSelectTreeNodes.emit(nodes);
    }

    public fillFromString(serialized: string) {
        let strings = serialized.split(";");
        let xpaths = [];
        for (var i = 0; i < strings.length; i += 2) {
            xpaths.push({
                key: strings[i],
                value: strings[i + 1]
            })
        }
        let xmlModelFlat = [];
        let schemaModelFlat = [];
        this.collectXmlModelNodes(this._xmlModel.XmlModel, xmlModelFlat);
        this.collectSchemaModelNodes(this._schemaModel.SchemaModel, schemaModelFlat);
        var handledParts: string[] = [];

        for (var i = 0; i < xpaths.length; i++) {
            let splitArr = xpaths[i].key.split("/")
            let currentPart = "";
            let isChoice = false;
            let idx = -1;
            for (var x = 1; x < splitArr.length; x++) {
                currentPart += ("/" + splitArr[x]);
                for (var k = 0; k < schemaModelFlat.length; k++) {
                    if (schemaModelFlat[k].XPath == currentPart) {
                        if (isChoice) {
                            isChoice = false;
                            for (var j = 0; j < xmlModelFlat.length; j++) {
                                if (schemaModelFlat[idx].Id == xmlModelFlat[j].SchemaId) {
                                    //if (!xmlModelFlat[j].Children || xmlModelFlat[j].Children.length == 0) {
                                    var data = JSON.parse(JSON.stringify(schemaModelFlat[k]));
                                    this.prepareModelId(data);
                                    xmlModelFlat[j].Children = [data];
                                    xmlModelFlat[j].ChoiceItems = null;
                                    //}
                                    break;
                                }
                            }
                            xmlModelFlat = [];
                            this.collectXmlModelNodes(this._xmlModel.XmlModel, xmlModelFlat);
                            break;
                        } else if (schemaModelFlat[k].SchemaItemType == this.schemaItemTypes.Choice && handledParts.indexOf(currentPart) == -1) {
                            handledParts.push(currentPart);
                            idx = k;
                            isChoice = true;
                            break;
                        }
                    }
                }
            }
        }

        xmlModelFlat = [];
        this.collectXmlModelNodes(this._xmlModel.XmlModel, xmlModelFlat);

        for (var i = 0; i < xpaths.length; i++) {
            let currXPath = xpaths[i].key.replace(/\[(.*?)\]/g, "");
            for (var j = 0; j < xmlModelFlat.length; j++) {
                xmlModelFlat[j].Parent = null;
                xmlModelFlat[j].XPath = null;
                xmlModelFlat[j].Id = j;
                var breaker = false;
                for (var k = 0; k < schemaModelFlat.length; k++) {
                    if (schemaModelFlat[k].Id == xmlModelFlat[j].SchemaId) {
                        let xPath = schemaModelFlat[k].XPath;
                        if (xPath == currXPath) {
                            if (schemaModelFlat[k].SchemaItemType == this.schemaItemTypes.Enumeration) {
                                xmlModelFlat[j].Value = xpaths[i].value;
                                xmlModelFlat[j].EnumValue = xpaths[i].value;
                            } else if (schemaModelFlat[k].SchemaItemType == this.schemaItemTypes.Boolean) {
                                xmlModelFlat[j].Value = xpaths[i].value;
                            } else {
                                xmlModelFlat[j].Value = xpaths[i].value;
                            }
                            breaker = true;
                            break;
                        }
                    }
                }
                if (breaker)
                    break;
            }
        }
    }

    private prepareModelId(data) {
        data.SchemaId = data.Id;
        delete data.Id;
        if (data && data.Children && data.Children.length > 0) {
            for (var i = 0; i < data.Children.length; i++) {
                this.prepareModelId(data.Children[i]);
            }
        }
    }

    private collectXmlModelNodes(model, array) {
        array.push(model);
        for (var current of model.Children) {
            this.collectXmlModelNodes(current, array)
        }
    }

    private collectSchemaModelNodes(schema, array) {
        array.push(schema);
        for (var current of schema.Children) {
            this.collectSchemaModelNodes(current, array)
        }
    }

}
