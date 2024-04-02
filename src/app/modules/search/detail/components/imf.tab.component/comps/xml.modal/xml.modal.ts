import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {IMFXMLTreeComponent} from "../../../../../../controls/xml.tree/imfx.xml.tree";
import {OverlayComponent} from "../../../../../../overlay/overlay";
import {XMLModalComponentProvider} from "./providers/xml.modal.provider";
import {DetailService} from "../../../../services/detail.service";
import {Router} from "@angular/router";
import { Subscription } from 'rxjs';

@Component({
    selector: 'xml-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [XMLModalComponentProvider, DetailService]
})

export class XMLModalComponent {
    @ViewChild('xmlTree', {static: false}) public xmlTree: IMFXMLTreeComponent;
    private data: any;
    private selectedSchemaModel: any;
    private selectedXmlModel: any;
    private routerEventsSubscr: Subscription;
    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                public provider: XMLModalComponentProvider,
                private router: Router) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.data = this.injector.get('modalRef');
    }
    ngOnInit() {
        this.data.showOverlay();
        let detailService = this.injector.get(DetailService);
        detailService.getIMFCPL(this.data._data.data.mediaId).subscribe( res => {
            this.selectedSchemaModel = res.SchemaModel;
            this.selectedXmlModel = res.XmlModel;
            this.data.hideOverlay();
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }
    onShow() {}
    /**
     * Hide modal
     */
    closeModal() {
        this.data.hide();
        this.provider.modalIsOpen = false;
    }
}
