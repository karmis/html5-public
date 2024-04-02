import {ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {XMLService} from '../../../../../services/xml/xml.service';
import {OverlayComponent} from '../../../../../modules/overlay/overlay';
import {Subject, Subscription} from 'rxjs';
import {IMFXMLTreeComponent} from "../../../../../modules/controls/xml.tree/imfx.xml.tree";
import {map, takeUntil} from 'rxjs/operators';
import {XmlSchemaListTypes} from "../../../../../modules/controls/xml.tree/types";
import {XmlSchemaListPipe, XMLSchemasPipeType} from "../../../../../modules/pipes/xml.schema.list/xml.schema.list.pipe";

@Component({
    selector: 'system-config-xml-tree',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    entryComponents: [
        OverlayComponent
    ],
    encapsulation: ViewEncapsulation.None
})

export class SystemConfigXmlComponent {
    @ViewChild('xmlTree', {static: false}) private xmlTree: IMFXMLTreeComponent;
    @ViewChild('systemConfig', {static: false}) private systemConfig;
    @ViewChild('overlay', {static: false}) private overlay: OverlayComponent;
    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    private schemas: any = [];
    private schemaTypes: any[] = [];
    private xmlLoading: boolean = false;
    private xmlEmpty: boolean = false;
    private xmlSubscription: Subscription;
    private destroyed$: Subject<any> = new Subject();
    private selectedId = null;

    constructor(private cdr: ChangeDetectorRef,
                private xmlService: XMLService,
                public xmlSchemaListPipe: XmlSchemaListPipe) {
    }

    public onSelect($event) {

    }

    ngOnInit() {
        this.initXML();
    }

    reloadXMLS() {
        this.selectedSchemaModel = {};
        this.selectedXmlModel = {};
        this.schemas = [];
        this.schemaTypes = null;
        this.xmlLoading = false;
        this.xmlEmpty = false;
        this.initXML(true);
    }

    initXML(forceReload: boolean = false) {
        let self = this;
        this.xmlService.getSchemaList(forceReload)
            .pipe(
                takeUntil(this.destroyed$),
                map((res: XmlSchemaListTypes) => {
                    return self.xmlSchemaListPipe.transform(res);
                })
            ).subscribe((pd: XMLSchemasPipeType) => {
            // if (this.xmlTree) && false === $.isEmptyObject(pd.originSchemaTypes)) {
                self.schemaTypes = pd.schemaTypes;
                self.schemaTypes.forEach((el, idx) => {
                    el.Children.forEach((el2, idx2) => {
                        el2.Additional = '(' + el2.Id + ')'
                    });
                });
                // this.toggleOverlay(false);
                self.cdr.detectChanges();
            // }
        });
    }

    selectXml(id) {
        this.xmlLoading = true;
        this.overlay.show(this.systemConfig.nativeElement);
        this.xmlEmpty = false;
        if (this.xmlSubscription) {
            this.xmlSubscription.unsubscribe();
        }
        this.xmlSubscription = this.xmlService.getXmlData(id)
            .pipe(takeUntil(this.destroyed$))
            .subscribe((result: any) => {
                this.selectedId = id;
                this.xmlLoading = false;
                this.overlay.hide(this.systemConfig.nativeElement);
                if (result) {
                    this.selectedSchemaModel = result.SchemaModel;
                    this.selectedXmlModel = result.XmlModel;
                } else {
                    this.xmlEmpty = true;
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.selectedId = id;
                this.xmlLoading = false;
                this.selectedSchemaModel = {};
                this.selectedXmlModel = {};
                this.xmlEmpty = true;
                this.overlay.hide(this.systemConfig.nativeElement);
                this.cdr.detectChanges();
            });
    }

    public getValue() {
        let a = this.xmlTree.getXmlModel();
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.overlay.hide(this.systemConfig.nativeElement);
    }

    public validate() {
        alert(this.xmlTree.isValid());
    }

}
