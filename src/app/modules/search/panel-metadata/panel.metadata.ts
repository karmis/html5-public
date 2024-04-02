import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injector, Input, Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { XMLService } from '../../../services/xml/xml.service';
import { IMFXMLTreeComponent } from '../../controls/xml.tree/imfx.xml.tree';
import { TranslateService } from '@ngx-translate/core';
import { SessionStorageService } from "ngx-webstorage";

@Component({
    selector: 'panel-metadata',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
    ]
})

export class PanelMetadataComponent {
    @ViewChild('xmlTree', {static: false}) public xmlTree: IMFXMLTreeComponent;

    private schemaModel;
    private xmlModel;
    private schemaFriendlyName;
    private data;

    constructor(private xmlService: XMLService,
                private injector: Injector,
                private cdr: ChangeDetectorRef,
                private translate: TranslateService,
                public sessionStorage: SessionStorageService) {
    }

    ngAfterViewInit() {

    }

    setTabData(data) {
        debugger
        this.data = data;
        this.schemaModel = data.schemaModel;
        this.xmlModel = data.xmlModel;
        this.schemaFriendlyName = data.friendlyName;
        this.cdr.detectChanges();
    }
}
