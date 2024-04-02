/**
 * Created by Sergey Trizna on 06.02.2016.
 */
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {XMLService} from '../../../services/xml/xml.service';
import {Observable} from "rxjs";
import {XmlSchemaListTypes} from '../../controls/xml.tree/types';
import {OverlayComponent} from '../../overlay/overlay';
import {IMFXMLTreeComponent} from '../../controls/xml.tree/imfx.xml.tree';
import {TranslateService} from '@ngx-translate/core';
import {SlickGridProvider} from '../slick-grid/providers/slick.grid.provider';
import {SlickGridService} from '../slick-grid/services/slick.grid.service';
import {BsModalService} from 'ngx-bootstrap';
import {SessionStorageService} from "ngx-webstorage";
import {IMFXModalComponent} from "../../imfx-modal/imfx-modal";
import {NotificationService} from "../../notification/services/notification.service";
import {IMFXSchemaTreeComponent} from "../../../views/system/config/comps/xml/components/schema.tree/schema.tree.component";
import {HttpErrorResponse} from '@angular/common/http';
import {map} from "rxjs/operators";
import {XmlSchemaListPipe, XMLSchemasPipeType} from "../../pipes/xml.schema.list/xml.schema.list.pipe";

@Component({
    selector: 'xml',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridProvider,
        SlickGridService,
    ]
})

export class XMLComponent implements AfterViewInit {
    public data: IMFXModalComponent;
    public modalService;
    public preventLastElementRemoving = false;
    public onReady: EventEmitter<void> = new EventEmitter<void>();
    public onSelectEvent: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('xmlTree', {static: false}) public xmlTree: IMFXMLTreeComponent;
    @ViewChild('schemaTree', {static: false}) public schemaTree: IMFXSchemaTreeComponent;
    @ViewChild('overlayXML', {static: false}) public overlayXML: OverlayComponent;
    @ViewChild('tableSplit', {static: false}) public tableSplit: any;
    @ViewChild('filterInput', {static: false}) public filterInput: ElementRef;
    public selectedSchemaFormList: any = null;
    public modalData;
    private schemas: any = [];
    private schemaTypes: any = [];
    private selectedSchemaModel = {};
    private selectedXmlModel = {};
    private type;
    private selectedIndex;
    private showOverlay = false;
    private gridInited: boolean = false;
    private originSchemas: any[] = [];
    private originSchemaTypes: any[] = [];
    private externalList: any[] = [];
    private canCloseModal = true;

    constructor(private xmlService: XMLService,
                private injector: Injector,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private notificationService: NotificationService,
                public sessionStorage: SessionStorageService,
                public xmlSchemaListPipe: XmlSchemaListPipe) {
        this.data = this.injector.get('modalRef');
        this.modalData = this.data.getData();
        this.preventLastElementRemoving = !!this.modalData.preventLastElementRemoving;
        this.modalService = this.injector.get(BsModalService);
        if (this.modalData.externalList && this.modalData.externalList.length > 0) {
            this.externalList = this.modalData.externalList;
        } else {
            this.externalList = [];
        }
        if (!this.modalData.compContext.withoutXmlTree) {
            this.selectedIndex = this.sessionStorage.retrieve('adv.xml.modal.selectedIndex.id');
        }
    }

    ngAfterViewInit() {
        // Load schemas
        this.xmlService.getSchemaList()
            .pipe(
                map((res: XmlSchemaListTypes) => {
                    return this.xmlSchemaListPipe.transform(res);
                })
            ).subscribe((pd: XMLSchemasPipeType) => {
                this.schemas = pd.schemas;
                this.originSchemas = pd.originSchemas;
                if (this.schemaTree) { // && false === $.isEmptyObject(pd.originSchemaTypes)) {
                    if (this.externalList.length > 0) {
                        //self.schemaTypes = Array.from(schemaTypesMap).map(el => el[1]);
                        this.schemaTypes = this.externalList;
                    } else {
                        this.schemaTypes = pd.schemaTypesMap
                    }

                    this.originSchemaTypes = pd.schemaTypes
                    if (this.schemaTree) {
                        this.schemaTree.initManually(this.originSchemaTypes);
                    }
                    this.cdr.detectChanges();
                }
                this.toggleOverlay(false);


                setTimeout(() => {
                    this.onReady.emit();
                    if (this.modalData && this.modalData.serializedData != null) {
                        this.selectedIndex = this.modalData.serializedData.split("|")[0];
                        let Name = this.modalData.serializedData.split("|")[1];
                        this.onSelect(null, {Id: this.selectedIndex, Name: Name}, true);
                    } else if (this.selectedIndex != undefined) {
                        let resSchema = null;
                        $.each(this.schemas, (l, _schema) => {
                            if (_schema.Id == this.selectedIndex) {
                                resSchema = _schema;
                                return false;
                            }
                        });
                        if (resSchema != null) {
                            this.onSelect(resSchema, resSchema.Id);
                        }
                    }
                    if(this.schemaTree) {
                        this.schemaTree.setFocus();
                    }
                    this.cdr.detectChanges();
                    this.gridInited = true;
                }, 0);
            }
        );

        if (this.filterInput) {
            this.filterInput.nativeElement.focus();
        }
    }

    onSaveClick() {
        if (this.canCloseModal) {
            this.data.emitClickFooterBtn('ok', {
                state: {
                    schema: this.selectedSchemaFormList
                }
            });
            this.data.hide();
        }
    }

    onSelectTree(data = null) {
        if (this.modalData.compContext.withoutXmlTree) {
            this.canCloseModal = false;
            this.data.showOverlay(true, true);
        } else {
            this.data.showOverlay(false, false);
        }

        this.selectedIndex = data.item.Id;
        this.sessionStorage.store('adv.xml.modal.selectedIndex.id', this.selectedIndex);
        this.selectedSchemaFormList = data.item;

        if (this.tableSplit) {
            this.overlayXML.hide($(this.tableSplit.nativeElement));
        } else {
            // if(this.data)
            //   schema = schema.data;
        }
        let self = this;

        this.selectedSchemaModel = {};
        this.selectedXmlModel = {};
        if (this.xmlTree) {
            this.xmlTree.applyChanges();
        }

        self.cdr.markForCheck();

        this.xmlService.getXmlData(this.selectedIndex, !!this.tableSplit)
            .subscribe((result: any) => {
                self.selectedSchemaModel = result.SchemaModel;
                self.selectedXmlModel = result.XmlModel;
                let selected = {
                    schema: this.selectedSchemaFormList,
                    result: result,
                    groupData: data
                };
                self.onSelectEvent.emit(selected);
                // self.data.contentView.instance.onSelect(schema, result);
                // self.data.config.componentContext.onSelect(schema, result);
                if (self.tableSplit) {
                    self.overlayXML.hide($(this.tableSplit.nativeElement));
                }
                if (this.modalData.compContext.withoutXmlTree) {
                    this.canCloseModal = true;
                    this.data.hideOverlay(true, true);
                } else {
                    this.data.hideOverlay(true, false);
                }
                self.cdr.markForCheck();
            }, (err: HttpErrorResponse) => {
                if (this.modalData.compContext.withoutXmlTree) {
                    this.data.hideOverlay(true, true);
                    if (err && err.error) {
                        var message = err.error.Message;
                        this.notificationService.notifyShow(2, message, false);
                    }
                }
                if (self.tableSplit)
                    self.overlayXML.hide($(self.tableSplit.nativeElement));

                this.data.hideOverlay(true, false);
                self.cdr.markForCheck();
            }, () => {
                if (self.tableSplit)
                    self.overlayXML.hide($(self.tableSplit.nativeElement));

                this.data.hideOverlay(true, false);
                self.cdr.markForCheck();
            });
    }

    onSelect(schema = null, schemaData, isNew: boolean = false, isDblClick: boolean = false) {
        if (this.modalData.compContext.withoutXmlTree) {
            this.canCloseModal = false;
            this.data.showOverlay(true, true);
        }
        this.selectedIndex = schema ? schema.Id : schemaData.Id;
        this.sessionStorage.store('adv.xml.modal.selectedIndex.id', this.selectedIndex);
        this.selectedSchemaFormList = schema ? schema : schemaData;
        if (!isNew &&
            !$.isEmptyObject(this.modalData.compContext.selectedXmlModel) &&
            !$.isEmptyObject(this.modalData.compContext.selectedSchemaModel)) {
            this.selectedSchemaModel = this.modalData.compContext.selectedSchemaModel;
            this.selectedXmlModel = this.modalData.compContext.selectedXmlModel;
            // this.xmlTree.xmlModel = this.modalData.compContext.selectedXmlModel;
            // this.xmlTree.schemaModel = this.modalData.compContext.selectedSchemaModel;
            let selected = {
                schema: schema,
                result: {
                    SchemaModel: this.selectedSchemaModel,
                    XmlModel: this.modalData.compContext.selectedXmlModel
                }
            };
            this.onSelectEvent.emit(selected);
            if (this.modalData.compContext.withoutXmlTree) {
                this.canCloseModal = true;
                this.data.hideOverlay(true, true);
            }
        } else {
            if (this.tableSplit) {
                this.overlayXML.hide($(this.tableSplit.nativeElement));
            } else {
                // if(this.data)
                //   schema = schema.data;
            }
            let self = this;

            this.xmlService.getXmlData(this.selectedIndex, !!this.tableSplit)
                .subscribe((result: any) => {
                    self.selectedSchemaModel = result.SchemaModel;
                    self.selectedXmlModel = result.XmlModel;
                    let selected = {
                        schema: this.selectedSchemaFormList,
                        result: result
                    };
                    self.onSelectEvent.emit(selected);
                    // self.data.contentView.instance.onSelect(schema, result);
                    // self.data.config.componentContext.onSelect(schema, result);

                    self.tableSplit && self.overlayXML.hide($(this.tableSplit.nativeElement));

                    if (isDblClick === true) {
                        this.data.hide();
                    }
                    if (this.modalData.compContext.withoutXmlTree) {
                        this.canCloseModal = true;
                        this.data.hideOverlay(true, true);
                    }
                    self.cdr.markForCheck();
                }, (err: HttpErrorResponse) => {
                    if (this.modalData.compContext.withoutXmlTree) {
                        this.data.hideOverlay(true, true);
                        if (err && err.error) {
                            var message = err.error.Message;
                            this.notificationService.notifyShow(2, message, false);
                        }
                    }
                    self.tableSplit && self.overlayXML.hide($(this.tableSplit.nativeElement));
                    self.cdr.markForCheck();
                }, () => {
                    self.tableSplit && self.overlayXML.hide($(this.tableSplit.nativeElement));
                    self.cdr.markForCheck();
                });
        }
    }

    fillByString(str: string) {
        this.xmlTree.fillFromString(str);
    }

    getShemaById(id): Observable<any> {
        return new Observable((observer: any) => {
            this.xmlService.getXmlData(id)
                .subscribe((result: any) => {
                    observer.next(result);
                }, (err) => {
                    observer.error(err);
                }, () => {
                    observer.complete();
                });
        });
    }

    resetSelection() {
        this.selectedSchemaModel = {};
        this.selectedXmlModel = {};
        this.selectedSchemaFormList = null;
        this.selectedIndex = undefined;
        this.cdr.markForCheck();
    }

    setSelectedSchemaAndModel(schema, model) {
        this.selectedSchemaModel = schema;
        this.selectedXmlModel = model;
    }

    toggleOverlay(show) {
        this.showOverlay = show;
        this.cdr.markForCheck();
    }

    // onSave() {
    //     this.data.config.componentContext.onSave();
    // }

    setType(type) {
        this.type = type;

        this.cdr.detectChanges();
    }

    cdrFired() {
        let self = this;
        let valueOfSearch = this.filterInput.nativeElement.value;
        if (this.modalData.compContext.withoutXmlTree) {
            var origin = $.extend(true, {}, self.originSchemaTypes);
            origin = Object.keys(origin).map(function (key) {
                return origin[key];
            });
            let filter = origin.filter((el) => {
                if (el.Children) {
                    el.Children = el.Children.filter((cEl) => {
                        let element = cEl.Name.toLowerCase();
                        let value = valueOfSearch.toLowerCase();
                        if (element.indexOf(value) !== -1) {
                            return true;
                        }
                        return false;
                    });
                    return el.Children.length > 0;
                } else {
                    return true;
                }
            });
            self.schemaTypes = filter;
        } else {
            var origin = $.extend(true, {}, self.originSchemas);
            origin = Object.keys(origin).map(function (key) {
                return origin[key];
            });
            let filter = origin.filter((el) => {
                let element = el.Name.toLowerCase();
                let value = valueOfSearch.toLowerCase();
                if (element.indexOf(value) !== -1) {
                    return true;
                }
                return false;
            });
            self.schemas = filter;
        }

        this.cdr.markForCheck();
    }
}
