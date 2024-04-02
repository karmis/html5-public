import {ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {XMLService} from "../../../../services/xml/xml.service";
import {IMFXMLTreeComponent} from "../../../../modules/controls/xml.tree/imfx.xml.tree";

@Component({
    selector: 'demo-tree',
    templateUrl: './tpl/index.html'
})

export class DemoXmlComponent {
    @ViewChild('xmlTree', {static: false}) private control: IMFXMLTreeComponent;
    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    private schemas: any = [];

    private serialized: string;
    private fillFrom: string;
    private valid: boolean;


    constructor(private cdr: ChangeDetectorRef,
                private xmlService: XMLService) {
    }


    public onSelect($event) {

    }


    ngOnInit() {
        this.xmlService.getSchemaList()
            .subscribe((result: any) => {
                this.schemas = result;
                this.selectXml(this.schemas[0]);
            });
    }

    selectXml(schema: any) {
        this.xmlService.getXmlData(schema.Id)
            .subscribe((result: any) => {
                this.selectedSchemaModel = result.SchemaModel;
                this.selectedXmlModel = result.XmlModel;
                this.cdr.detectChanges()
            });
    }

    getValue() {
        this.serialized = this.control.getXmlModel().Serialized;
    }

    setValue() {
        this.control.fillFromString(this.fillFrom)
    }

    checkValid() {
        this.valid = this.control.isValid()
    }

}
