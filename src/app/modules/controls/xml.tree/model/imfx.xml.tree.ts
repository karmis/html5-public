/**
 * Created by Pavel on 23.02.2017.
 */

import {IMFXSerializable} from "../../../../utils/imfx.serializable";
import {OverrideTypes} from "../overrides/override.types";
import {EnumOverride} from "../overrides/enum.override";
import {TextOverride} from "../overrides/text.override";
import {NoeditOverride} from "../overrides/noedit.override";
import {DefaultOverride} from "../overrides/default.override";
import {IMFXXMLSchema} from "./imfx.xml.schema";
import {AbstractHandler} from "../schema.item.types/abstract.handler";
import {IMFXXMLNode} from "./imfx.xml.node";
import {SchemaItemTypes} from "../schema.item.types/schema.item.types";
import {BooleanHandler} from "../schema.item.types/boolean.handler";
import {DefaultHandler} from "../schema.item.types/default.handler";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {TreeNode} from "angular-tree-component";
import {MultilineOverride} from "../overrides/multiline.override";
import {XMLService} from "../../../../services/xml/xml.service";
import {LengthOverride} from "../overrides/length.override";
import {ValLimitsOverride} from "../overrides/vallimits.override";
import {PatternOverride} from "../overrides/pattern.override";
import { ChangeDetectorRef, ViewRef } from "@angular/core";
import {SuggestionOverride} from "../overrides/suggestion.override";
import {PlaceholderOverride} from "../overrides/placeholder.override";

export class FlatMap {
    public Id:string;
    public Node: IMFXXMLNode | IMFXXMLSchema;
}
export class IMFXXMLTree extends IMFXSerializable {

    public nodes;
    private overrides;
    private schemaItemTypes = new SchemaItemTypes();

    constructor(private xmlModel: any,
                private schemaModel: any,
                private cdr: ChangeDetectorRef,
                private xmlService: XMLService) {
        super();
        if (xmlModel && xmlModel.XmlModel) {
            this.xmlService.createFlatSchema([this.schemaModel.SchemaModel]);
            this.appendSchema(xmlModel.XmlModel);
            schemaModel.SchemaOverrides = schemaModel.SchemaOverrides || [];
            // pass these overrides to each node. it will be handled later in the IMFXXMLNode
            this.overrides = schemaModel.SchemaOverrides.map((currentOverride) => {
                if (currentOverride.OverrideType == OverrideTypes.TEXT) {
                    return new TextOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.ENUM) {
                    return new EnumOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.NOEDIT) {
                    return new NoeditOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.MULTILINE) {
                    return new MultilineOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.MAXLENGTH || currentOverride.OverrideType == OverrideTypes.MINLENGTH) {
                    return new LengthOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.MINVALUE || currentOverride.OverrideType == OverrideTypes.MAXVALUE) {
                    return new ValLimitsOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.PATTERN) {
                    return new PatternOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.SUGGESTION) {
                    return new SuggestionOverride(currentOverride);
                } else if (currentOverride.OverrideType == OverrideTypes.PLACEHOLDER) {
                    return new PlaceholderOverride(currentOverride);
                } else {
                    return new DefaultOverride(currentOverride);
                }
            });
            this.nodes = this.handleTree([xmlModel.XmlModel]);
        }
    }



    // append Schema to each node in the source tree
    // handle schema item type
    private appendSchema(node: IMFXXMLNode) {
        node.Schema = node.SchemaId ? this.xmlService.findSchemaNodeById(node.SchemaId) : new IMFXXMLSchema();
        let nodeHandler: AbstractHandler;
        if (node.Schema.SchemaItemType == this.schemaItemTypes.Boolean) {
            nodeHandler = new BooleanHandler();
        } else {
            nodeHandler = new DefaultHandler();
        }

        nodeHandler.handle(node);

        // TODO: refactor this stuff
        //if (node.Children) {
        if (!node || !node.Children) {
            return;
        }
        var i = node.Children.length;
        while (i--) {
            if (node.Children[i].Id) {
                this.appendSchema(node.Children[i]);
            } else {
                node.Children.splice(i);
            }
        }
        //}
    }

    // handle overrided immutable tree data and return new one in angular2-tree-component format
    public handleTree(sourceTrees: Array<IMFXXMLNode>, parent?: IMFXXMLNode) {
        var targetTrees = [];
        for (var sourceTree of sourceTrees) {
            if (parent) {
                sourceTree.Parent = parent;
            }
            if (!sourceTree.Schema) {
              this.appendSchema(sourceTree);
            }
            var targetTree;
            // TODO: refactoring
            var sourceTreeActual = sourceTree;
            if (sourceTreeActual instanceof IMFXXMLNode && sourceTreeActual.overrided) {
                targetTree = {
                    id: sourceTreeActual.Id,
                    name: sourceTreeActual.Name,
                    xml: sourceTreeActual,
                    children: [],
                    // isExpanded: true
                };
                targetTree.children = this.handleTree(sourceTreeActual.Children, targetTree.xml);
            } else {
                targetTree = {
                    id: sourceTreeActual.Id,
                    name: sourceTreeActual.Name,
                    xml: new IMFXXMLNode(sourceTreeActual, this.overrides),
                    children: [],
                    // isExpanded: true
                };
                targetTree.children = this.handleTree(sourceTreeActual.Children, targetTree.xml);
                targetTree.xml.Children = targetTree.children.map((el) => el.xml);
            }
            targetTrees.push(targetTree);
        }
        return targetTrees;
    }

    public updateTree(data) {
        let node = data.node;
        let xml = data.xml;
        this.storeExpanded(node);
        node.data.children = this.handleTree(xml.Children, xml);
        node._initChildren();
        node.treeModel.update();
        // setTimeout(()=>{
          this.restoreExpanded(node);
        // })

    }

    private storeExpanded(node: TreeNode) {
      if (node.data.xml) {
        node.data.xml.isExpanded = node.isExpanded;
      }
      let children = node.getVisibleChildren();
      for (let child of children) {
        this.storeExpanded(child)
      }
    }

    restoreExpanded(node: TreeNode) {
      if (node.data.xml.isExpanded === true || node.data.xml.isExpanded === undefined) {
        // setTimeout(()=>{
          node.expand()
        // });
      }
      let children = node.getVisibleChildren();
      for (let child of children) {
        this.restoreExpanded(child)
      }
    }

    private getOriginalXmlModel(node, clear = true) {
        node.xml.Children = [];
        for (var child of node.children) {
            node.xml.Children.push(this.getOriginalXmlModel(child, clear))
        }
        return node.xml.getOriginalNode(clear)
    }

    public getXmlModel(clear = true) {
        this.xmlModel.XmlModel = this.getOriginalXmlModel(this.nodes[0], clear);
        return {
            FriendlyName: null, // TODO: pick up from the parent
            SchemaModel: this.schemaModel,
            XmlModel: this.xmlModel,
            Serialized: this.getSerializedTree()
        }
    }

    private getNodesArray(): Array<IMFXXMLNode> {
        var nodesList = [];
        if(this.nodes) {
            this.collectNodes(this.nodes[0], nodesList)
        }
        return nodesList;
    }

    private collectNodes(node, array) {
        array.push(node.xml);
        for (var current of node.children) {
            this.collectNodes(current, array)
        }
    }

    public getSerializedTree(excludeFields: string[] = []) {
        let arr = this.getNodesArray().filter(el => el.Value != null && el.Value !== '' && excludeFields.indexOf(el.Name) === -1);
        let serializedArr = [];
        for (let idx in arr) {
            let el = arr[idx];
            let elementIndex = 1;

            let decrement = Number(idx);
            while (arr[decrement - 1] && arr[decrement].Schema.XPath == arr[decrement - 1].Schema.XPath) {
                elementIndex++;
                decrement--;
            }
            serializedArr.push(el.Schema.XPath + "[" + elementIndex + "]" + ";" + el.Value)
        }
        return serializedArr.join(";")
    }

    public onSelectNodes(data) {
        var index = this.selectedNodes.map(function(e) { return e.node.id; }).indexOf(data.node.id);
        if(index > -1) {
            this.selectedNodes.splice(index, 1);
        }
        else {
            this.selectedNodes.push(data);
        }
    }

    private selectedNodes = [];
    public getSerializedSelectedField(asArray:boolean = false, withNodeData:boolean = false) {
        var arr = this.selectedNodes;
        let serializedArr = [];
        for (let idx in arr) {
            let el = arr[idx].xmlNode;
            let node = arr[idx].node;

            let endXPath = node.data.xml.Schema.XPath;
            let processNode = node.parent;
            let childNode = node;
            let iterator = 1;
            while(processNode) {
                var nodeIndex = 0;
                for (var i = 0; i < processNode.data.children.length; i++) {
                    if(processNode.data.children[i].xml.Schema.XPath == childNode.data.xml.Schema.XPath) {
                        nodeIndex++;
                    }
                    if(processNode.data.children[i].id == childNode.data.id) {
                        var xPath = endXPath.split('/');
                        xPath[xPath.length - iterator] += "[" + nodeIndex + "]";
                        endXPath = xPath.join('/');
                    }
                }
                iterator++;
                childNode = processNode;
                processNode = processNode.parent;
            }

            if(withNodeData) {
                serializedArr.push({
                    Path: endXPath,
                    Data: Object.assign({}, el)
                });
            }
            else {
                serializedArr.push(endXPath);
            }
        }
        return asArray || withNodeData ? serializedArr : serializedArr.join(";");
    }


    public setXmlModel(serializedNodes: Array<{
        key: string,
        value: string
    }>) {
        let arr: Array<IMFXXMLNode> = this.getNodesArray();
        let plainNodes = [];
        for (let idx in arr) {
            let el = arr[idx];
            let elementIndex = 1;

            let decrement = Number(idx);
            while (arr[decrement - 1] && arr[decrement].Schema.XPath == arr[decrement - 1].Schema.XPath) {
                elementIndex++;
                decrement--;
            }
            plainNodes.push({
                xpath: el.Schema.XPath + "[" + elementIndex + "]",
                node: el
            });
        }
        plainNodes.map(el => {
            return el;
        });
        for(var i = 0; i < plainNodes.length; i++)
        {
            for(var j = 0; j < serializedNodes.length; j++) {
                if (serializedNodes[j].key == plainNodes[i].xpath) {
                    if(plainNodes[i].node.Schema.SchemaItemType == this.schemaItemTypes.Enumeration) {
                        plainNodes[i].node.Value = serializedNodes[j].value;
                        plainNodes[i].node.EnumValue = serializedNodes[j].value;
                    }
                    else {
                        plainNodes[i].node.Value = serializedNodes[j].value;
                        plainNodes[i].node.EnumValue = serializedNodes[j].value;
                    }
                }
            }
        }
    }

    public invalidateNode(xPath, error) {
        this.getNodesArray().forEach(el => {
            el.invalidNode(xPath, error);
        });
        setTimeout(()=>{
            this.cdr.detectChanges();
        });
    }

    public isValid() {
        let invalidNodes: Array<IMFXXMLNode> = this.getNodesArray().filter(el => {
            return !el.isValid()
        });

        setTimeout(() => {
            if (!(<ViewRef>this.cdr).destroyed) {
                this.cdr.detectChanges();
            }
        });
        
        return invalidNodes.length == 0;
    }


}
