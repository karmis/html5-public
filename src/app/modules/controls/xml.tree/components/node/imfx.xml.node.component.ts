/**
 * Created by Pavel on 17.01.2017.
 */
import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    Input,
    Output,
    EventEmitter,
    ViewChild, ChangeDetectorRef, Renderer, Inject, ViewContainerRef
} from '@angular/core';

// Loading jQuery
import * as $ from 'jquery';

import {SchemaItemTypes} from '../../schema.item.types/schema.item.types';
import {IMFXControlsDateTimePickerComponent} from '../../../datetimepicker/imfx.datetimepicker';
import {IMFXXMLNode} from '../../model/imfx.xml.node';
import {AbstractOverride} from '../../overrides/abstract.override';
import {ITreeNode} from 'angular-tree-component/dist/defs/api';
import {MultilineTextProvider} from '../modals/multiline.text/multiline.text.provider';
import {IMFXModalComponent} from '../../../../imfx-modal/imfx-modal';
import {IMFXModalProvider} from '../../../../imfx-modal/proivders/provider';
import {MultilineTextComponent} from '../modals/multiline.text/multiline.text.component';
import {IMFXXMLTree} from "../../model/imfx.xml.tree";
import {XMLService} from "../../../../../services/xml/xml.service";
import {Subject} from 'rxjs';
import {TimeProvider} from "../../../../../providers/common/time.provider";


declare var window: any;

@Component({
    selector: 'imfx-xml-tree-node',
    entryComponents: [
        IMFXControlsDateTimePickerComponent,
    ],
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class IMFXXMLNodeComponent {
    @ViewChild('selectEnumItems', {static: false}) private dropdownModuleEnum: any;
    @ViewChild('selectChoice', {static: false}) private dropdownModuleChoice: any;
    @ViewChild('control', {static: false}) private dateTimePicker: any;
    @Input('allowTristate') private allowTristate: boolean = false;
    @Input('preventLastElementRemoving') preventLastElementRemoving: boolean = false;
    @Input('withNodeSelection') withNodeSelection: boolean = false;
    @Input('node') private node: ITreeNode;
    @Input('debug') private debug: any = false;
    @Input('readonly') private readonly: any = false;
    @Input('overrides') private overrides: AbstractOverride[];
    @Output('onUpdate') private updateTreeEmitter = new EventEmitter();
    @Output('onSelectNode') private onSelectNode = new EventEmitter();
    @Output('onAddAvailableChildren') private onAddAvailableChildren = new EventEmitter();
    public xmlNode: IMFXXMLNode;
    private modal: IMFXModalComponent;
    private data: any;
    private schemaItemTypes = new SchemaItemTypes();
    private selectedChoice: any;
    private changeFromXMLEditorEmitter: EventEmitter<any> = new EventEmitter<any>();
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private xmlService: XMLService,
                private multilineTextProvider: MultilineTextProvider,
                private timeProvider: TimeProvider,
                private modalProvider: IMFXModalProvider) {

    }

    private dateForTimePicker;
    private dateForDatePicker;

    ngOnInit() {
        this.xmlNode = this.node.data.xml;
        if (!this.xmlNode.Parent) {
            this.node.expand();
        }
        if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Boolean) {
            this.xmlNode.Value = this.xmlNode.Value == 'true' || this.xmlNode.Value == 'True' ? true :
                this.xmlNode.Value == 'false' || this.xmlNode.Value == 'False' ||
                (!this.allowTristate && this.xmlNode.Value == null) ? false : this.xmlNode.Value; // || this.xmlNode.Value == null
        }
        if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Choice && this.xmlNode.Children.length > 0) {
            this.xmlNode.SelectedChoice = this.xmlService.findSchemaNodeById(this.xmlNode.Children[0].SchemaId);
        }
        if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Time) {
            if (this.xmlNode.Value) {
                this.dateForTimePicker = new Date('1970-01-01 ' + this.xmlNode.Value);
            } else if (this.xmlNode.Schema.Value) {
                this.dateForTimePicker = new Date('1970-01-01 ' + this.xmlNode.Schema.Value);
            }
        }
        if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Date) {
            if (this.xmlNode.Value && this.xmlNode.Value.indexOf("T") < 0) {
                this.dateForDatePicker = this.xmlNode.Value + "T00:00:00";
            } else if (this.xmlNode.Schema.Value && this.xmlNode.Schema.Value.indexOf("T") < 0) {
                this.dateForDatePicker = new Date(this.xmlNode.Schema.Value + "T00:00:00");
            }
        }
        if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.String) {
            if (!this.xmlNode.Value && this.xmlNode.Schema.Value) {
                this.xmlNode.Value = this.xmlNode.Schema.Value;
            }
        }

        this.changeFromXMLEditorEmitter.subscribe((res: any) => {
            this.xmlNode.Value = res;
        });
        this.interval = setInterval(() => {
            this.adjustTextarea();
        }, 10);
    }

    sendSelectedField(xmlNode, node) {
        if (this.withNodeSelection) {
            if (xmlNode.AvailableChildren && xmlNode.AvailableChildren.length > 0 ||
                xmlNode.Children && xmlNode.Children.length > 0)
                return;
            xmlNode.selected = !xmlNode.selected;
            this.onSelectNode.emit({
                xmlNode: xmlNode,
                node: node
            });
        }
    }

    private interval;
    @ViewChild('textAreaEl', {static: false}) private textAreaEl: any;
    private minRows = 1;
    private maxRows = 5;
    private currentText = null;
    private oldWidth = 0;
    private lineHeight = null;

    adjustTextarea() {
        if (this.textAreaEl && this.textAreaEl.nativeElement) {
            if (this.currentText == this.textAreaEl.nativeElement.value &&
                this.oldWidth == this.textAreaEl.nativeElement.offsetWidth) {
                return;
            }
            this.currentText = this.textAreaEl.nativeElement.value;
            this.oldWidth = this.textAreaEl.nativeElement.offsetWidth;
            const clone = this.textAreaEl.nativeElement.cloneNode(true);
            const parent = this.textAreaEl.nativeElement.parentNode;
            //clone.style.visibility = 'hidden';
            parent.appendChild(clone);
            clone.style.overflow = 'auto';
            clone.style.height = '26px';
            clone.style.position = 'absolute';
            clone.style.width = '100%';
            clone.style.top = '0';
            if (this.lineHeight == null)
                this.lineHeight = parseInt($(this.textAreaEl.nativeElement).css('line-height'), 10);
            let height = clone.scrollHeight;// > clone.offsetHeight ? clone.scrollHeight : lineHeight;

            const rowsCount = Math.floor(height / this.lineHeight);

            if (this.minRows && this.minRows >= rowsCount) {
                height = this.minRows * this.lineHeight;
            } else if (this.maxRows && this.maxRows <= rowsCount) {
                height = this.maxRows * this.lineHeight;
                this.textAreaEl.nativeElement.style.overflow = 'auto';
            } else {
                this.textAreaEl.nativeElement.style.overflow = 'hidden';
            }

            this.textAreaEl.nativeElement.style.height = (height + 23) + 'px';
            parent.removeChild(clone);
            this.cdr.detectChanges();
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.changeFromXMLEditorEmitter.unsubscribe();
        clearInterval(this.interval);
    }

    ngAfterViewInit() {
        if (this.xmlNode.Schema) {
            if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Enumeration) {
                this.xmlNode.EnumValue = {
                    Id: this.xmlNode.Value
                };
                this.selectEnumValue();
                this.selectEnumeration();
            }
        } else if (!this.xmlNode.Schema) {
            this.selectChoiceItem();
        }
    }

    isMinusAvailable() {
        return this.xmlNode && !this.readonly && this.xmlNode.isRemovable(this.preventLastElementRemoving);
    }

    isPlusAvailable() {
        return this.xmlNode && !this.readonly && this.xmlNode.newChildNodesAvailable();
    }

    public addSelectedAvailableChild(indexes) {
        this.xmlNode.addChild(true, indexes);
        this.updateTree(this.node);
        this.node.expand();
    }

    addChild(manual: boolean) {
        if (manual) {
            this.onAddAvailableChildren.emit(this);
        } else {
            this.xmlNode.addChild(manual);
            this.updateTree(this.node);
            this.node.expand();
        }
    }

    removeNode() {
        // if choice is xml root and if is not
        if (this.xmlNode.SelectedChoice || this.xmlNode.ChoiceParent) {
            this.xmlNode.removeChoice();
        } else {
            this.xmlNode.remove();
        }
        this.updateTree(this.node.parent.data.virtual ? this.node : this.node.parent);
    }

    updateTree(node: ITreeNode) {
        this.updateTreeEmitter.emit({
            node: node,
            xml: node.data.xml
        });
    }

    selectNodeType() {
        this.xmlNode.selectNodeType({
            fromNodeTypeSelector: true
        });
        this.updateTree(this.node.parent);
    }

    onChoiceChange(xmlNode) {
        // this.updateTree(this.node.parent);
        var newChild = new IMFXXMLNode({
            Parent: this.xmlNode,
            Schema: this.xmlNode.SelectedChoice,
            SchemaId: this.xmlNode.SelectedChoice.Id,
            Name: this.xmlNode.SelectedChoice.Name,
            Value: null
        });

        this.xmlNode.Children.push(newChild);
        newChild.addChild(true);
        this.updateTree(this.node/*this.node.parent.data.virtual ? this.node : this.node.parent*/);
        this.xmlNode.SelectedChoice = newChild.Schema;
        this.node.expand();
        // debugger;
    }

    onChangeValue(event) {
        let data = event.target.value;
        let empty = '';
        let str = data.trim();
        let value = str.replace(/\n/g, '<#!#>');
        value = value.replace(/\s+/g, ' ');
        value = value.replace(/\<\#\!\#\>/g, '\n');
        if (value !== empty) {
            this.xmlNode.Value = value;
        } else {
            this.xmlNode.Value = null;
        }
    }

    onSelectValue(date) {
        if (date === undefined) {
            return
        }
        if (this.dateTimePicker.compRef.val() != null && this.dateTimePicker.compRef.val().trim() != "") {
            if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Time) {
                let resultstring = "" +
                    //date.getFullYear() + "-" +
                    //(date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + "-" +
                    //(date.getDate() > 9 ? date.getDate(): "0" + date.getDate()) + "T" +
                    (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" +
                    (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) + ":00";
                this.xmlNode.Value = resultstring;
            } else if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.Date) {
                let resultstring = "" +
                    date.getFullYear() + "-" +
                    (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + "-" +
                    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
                this.xmlNode.Value = resultstring;
            } else if (this.xmlNode.Schema.SchemaItemType === this.schemaItemTypes.DateTime) {
                let resultstring = "" +
                    date.getFullYear() + "-" +
                    (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) + "-" +
                    (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) + "T" +
                    (date.getHours() > 9 ? date.getHours() : "0" + date.getHours()) + ":" +
                    (date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes()) + ":00";
                this.xmlNode.Value = resultstring;
            } else {
                this.xmlNode.Value = null;
            }
        } else {
            this.xmlNode.Value = null;
        }
    }

    selectEnumValue() {
        this.xmlNode.Value = this.xmlNode.IsOverridedNode ? this.xmlNode.EnumValue.Id : this.xmlNode.EnumValue.text ? this.xmlNode.EnumValue.text : this.xmlNode.EnumValue.Id;
    }

    selectEnumeration() {
        if (this.xmlNode.EnumItems.length > 0) {
            let enumItems = this.xmlNode.EnumItems;

            let data = this.dropdownModuleEnum.turnArrayOfObjectToStandart(enumItems, {
                key: 'Id',
                text: 'Value'
            });

            //Tricky escape for " in select
            data.forEach(function (el, idx) {
                el.text = el.text.replace(/\"/g, "''");
            });

            let tmpData = [];

            if (!this.xmlNode.IsOverridedNode) {
                for (var i = 0; i < enumItems.length; i++) {
                    if (data[i].id == undefined && data[i].text == undefined)
                        tmpData.push({
                            id: enumItems[i],
                            text: enumItems[i],
                        });
                }
                if (tmpData.length > 0) {
                    data = tmpData;
                }
            }
            if (data.filter(el => el.id === 0).length > 1 || !this.xmlNode.IsOverridedNode) { // if all Ids == 0
                data.forEach(function (el, idx) {
                    el.id = el.text;
                });
            }
            if (this.xmlNode.Value) {
                data.forEach((el, idx) => {
                    if (el.text === this.xmlNode.Value) {
                        this.xmlNode.EnumValue = {text: this.xmlNode.Value};
                        this.xmlNode.EnumValue.Id = typeof this.xmlNode.Value == 'string' ? this.xmlNode.Value : idx;
                        this.selectEnumValue();
                        this.cdr.detectChanges();
                    }
                });
            }
            this.cdr.detectChanges();
            setTimeout(() => {
                if (this.destroyed$.isStopped) {
                    return;
                }
                this.dropdownModuleEnum.setData(data, true);
                this.cdr.detectChanges();
            }, 1);
        }
    }

    onSelectEnum(event) {
        this.xmlNode.EnumValue = event.params.data.length && event.params.data.length > 0 ? event.params.data[0] : event.params.data;
        this.xmlNode.EnumValue.Id = this.xmlNode.EnumValue.id;
        this.selectEnumValue();
    }

    selectChoiceItem() {
        if (this.xmlNode.Parent.AvailableChildren) {
            let enumItems = this.xmlNode.Parent.AvailableChildren;
            let data = this.dropdownModuleChoice.turnArrayOfObjectToStandart(enumItems, {
                key: 'Id',
                text: 'Name'
            });
            this.dropdownModuleChoice.setData(data, true);
        }
    }

    onSelectChoice(event) {
        let obj = this.xmlNode.Parent.AvailableChildren.filter(el => el.Id === event.params.data.id);
        this.xmlNode.Schema = obj[0];
        this.selectNodeType();
    }

    openMultilineModal() {
        this.modal = this.modalProvider.show(MultilineTextComponent, {
            size: 'md',
            title: this.xmlNode.DisplayName
        });

        let content = this.modal.contentView.instance;
        content.setXmlString(
            this.multilineTextProvider.formatXML(this.xmlNode.Value),
            this.xmlNode.DisplayName
        );
        content.toggleOverlay(true);

        this.modal.modalEvents.subscribe(() => {
            this.changeFromXMLEditorEmitter.emit(content.getXmlString());
            this.cdr.detectChanges();
            this.multilineTextProvider.modalIsOpen = false;
        });
    }
}
