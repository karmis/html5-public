import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {IMFXModalComponent} from "../../../../modules/imfx-modal/imfx-modal";
import {SlickGridRowData} from "../../../../modules/search/slick-grid/types";
import {IMFXControlsLookupsSelect2Component} from "../../../../modules/controls/select2/imfx.select2.lookups";
import {IMFXModalEvent} from "../../../../modules/imfx-modal/types";
import {MediaStatusService} from "./service/service";
import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {NotificationService} from "../../../../modules/notification/services/notification.service";

@Component({
    selector: 'media-status-component',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    providers: [
        MediaStatusService,
        NotificationService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaChangeStatusComponent {
    @ViewChild('mediaStatusControl', {static: false}) mediaStatusControlRef: IMFXControlsLookupsSelect2Component;
    private modalRef: IMFXModalComponent;
    private row: SlickGridRowData;
    private slickGridProvider: SlickGridProvider;
    public onSave: EventEmitter<boolean|string> = new EventEmitter();
    private error: boolean = false;
    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private mediaStatusService: MediaStatusService,
    ) {
        this.modalRef = this.injector.get('modalRef');
        this.row = this.modalRef.getData().data;
        this.slickGridProvider = this.modalRef.getData().context;
        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name === 'save') {
                if(this.mediaStatusControlRef.getSelectedId() == null) {
                    this.error = true;
                    this.cdr.detectChanges();
                } else {
                    this.mediaStatusService.saveMediaStatus(this.row.ID, this.mediaStatusControlRef.getSelectedId() as number).subscribe((text) => {
                        (<any>this.row).MEDIA_STATUS = this.mediaStatusControlRef.getSelectedId();
                        (<any>this.row).MEDIA_STATUS_text = text;
                        this.onSave.emit(true);
                        // this.slickGridProvider.refreshGrid();
                        this.modalRef.hide();
                    }, (err) => {
                        this.onSave.emit(err.Message);
                    });
                }
            }
        })
    };

    ngAfterViewInit() {
        if ((<any>this.row).MEDIA_STATUS !== null) {
            this.mediaStatusControlRef.setSelectedByIds([(<any>this.row).MEDIA_STATUS]);
        }
        this.mediaStatusControlRef.onSelect.subscribe( el => {
            this.error = false;
            this.cdr.detectChanges();
        });
    }
}
