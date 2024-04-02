import {
    ChangeDetectorRef,
    Component,
    EventEmitter, Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    NotificationService
} from '../../../../../../../modules/notification/services/notification.service';
import {IMFXMLTreeComponent} from "../../../../../../../modules/controls/xml.tree/imfx.xml.tree";
import { TranslateService } from '@ngx-translate/core';
import {XMLService} from "../../../../../../../services/xml/xml.service";
import {ServiceConfigService} from "../../../../../../../services/system.config/settings.service-config.service";
import {ServiceConfigGridComponent} from "../grid/settings.service.config.grid.component";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'service-config-detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ServiceConfigService
    ]
})

export class ServiceConfigDetailsComponent implements OnInit {

    @Input("gridRef") gridRef: ServiceConfigGridComponent;
    @Output() private back: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('xmlTreeRef', {static: false}) private xmlTreeRef: IMFXMLTreeComponent;
    @ViewChild('overlayGroup', {static: true}) private overlayGroup: any;
    @ViewChild('detailConfig', {static: true}) private detailConfig: any;
    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    private dataStored = null;
    constructor(private cdr: ChangeDetectorRef,
                private settingsServiceConfigService: ServiceConfigService,
                private xmlService: XMLService,
                private translate: TranslateService,
                private notificationService: NotificationService,
                private notificationRef: NotificationService) {
    };

    goBack() {
        this.back.emit();
    }

    ngOnInit() {
        this.overlayGroup.show(this.detailConfig.nativeElement);
    }

    clearValidation() {
        $("#cfg-name").removeClass('invalid');
    }

    isValidFields() {
        if(!($("#cfg-name").val().trim().length > 0)) {
            $("#cfg-name").removeClass('invalid');
            $("#cfg-name").addClass('invalid');
            return false;
        }
        return true;
    }

    saveServiceConfig() {
        this.overlayGroup.show(this.detailConfig.nativeElement);
        let valid = true;
        if (this.xmlTreeRef && !this.xmlTreeRef.isValid()) {
            this.overlayGroup.hide(this.detailConfig.nativeElement);
            valid = false;
        }
        if(!this.isValidFields()) {
            this.overlayGroup.hide(this.detailConfig.nativeElement);
        }
        if(!valid) {
            this.notificationService.notifyShow(2, this.translate.instant('global_settings.config_invalid'), true, 1000);
            return;
        }
        let model = this.xmlTreeRef.getXmlModel();
        // let data = {
        //     "ID": this.dataStored.ID,
        //     "CONFIG_NAME": $("#cfg-name").val().trim(),
        //     "DESCRIPTION": $("#cfg-description").val().trim(),
        //     "ACTIVE": this.dataStored.ACTIVE == null ? 0 : this.dataStored.ACTIVE,
        //     "CONFIG_TYPE_ID": this.dataStored.CONFIG_TYPE_ID,
        //     "XmlDocAndSchema": {
        //         "SchemaModel": {},
        //         "XmlModel": Object.assign({}, model.XmlModel)
        //     }
        // };
        this.dataStored.CONFIG_NAME = $("#cfg-name").val().trim();
        this.dataStored.DESCRIPTION = $("#cfg-description").val().trim();
        this.dataStored.ACTIVE = this.dataStored.ACTIVE == null ? 0 : this.dataStored.ACTIVE;
        this.dataStored.XmlDocAndSchema.SchemaModel = {};
        this.dataStored.XmlDocAndSchema.XmlModel = model.XmlModel;

        if (model && model.XmlModel && model.XmlModel.XmlModel) {
            this.settingsServiceConfigService.saveServiceConfig(this.dataStored, this.dataStored.ID).subscribe((res: any) => {
                if(!!res["ValidationErrors"] && res["ValidationErrors"].length > 0) {
                    let errorString = "";
                    for(var i = 0; i < res["ValidationErrors"].length; i++) {
                        errorString += res["ValidationErrors"][i]["Error"] + ";";
                    }
                    this.notificationService.notifyShow(2, this.translate.instant('global_settings.xml_not_valid') + ". " + errorString, true, 3000);
                    this.overlayGroup.hide(this.detailConfig.nativeElement);
                    this.cdr.detectChanges();
                }
                else if (res["Error"] == null) {
                    this.notificationService.notifyShow(1, this.translate.instant('global_settings.success'));
                    this.overlayGroup.hide(this.detailConfig.nativeElement);
                    this.gridRef.refresh();
                    this.goBack();
                }
                else {
                    this.notificationService.notifyShow(2, this.translate.instant('global_settings.error') + ". " + res["Error"], true, 3000);
                    this.overlayGroup.hide(this.detailConfig.nativeElement);
                    this.cdr.detectChanges();
                }
            }, (err: HttpErrorResponse) => {
                let message = "";
                if(err.status == 500) {
                    message = err.error.Message;
                }
                this.notificationService.notifyShow(2, this.translate.instant('global_settings.error') + ". " + message, true, 3000);
                this.overlayGroup.hide(this.detailConfig.nativeElement);
                this.cdr.detectChanges();
            });
        }
    }

    public setServiceConfig(data) {
        if(data.XmlDocAndSchema != null) {
            this.dataStored = data;
            this.selectedSchemaModel = Object.assign({}, data.XmlDocAndSchema.SchemaModel);
            this.selectedXmlModel = data.XmlDocAndSchema.XmlModel;
            this.overlayGroup.hide(this.detailConfig.nativeElement);
            this.cdr.detectChanges();
        }
        else {
            this.settingsServiceConfigService.getSettingsServiceConfigDetailById(data.ID).subscribe((res: any) =>{
                this.dataStored = res;
                this.selectedSchemaModel = Object.assign({}, res.XmlDocAndSchema.SchemaModel);
                this.selectedXmlModel = res.XmlDocAndSchema.XmlModel;
                this.overlayGroup.hide(this.detailConfig.nativeElement);
                this.cdr.detectChanges();
            });
        }
    }
}
