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
import { HttpErrorResponse } from '@angular/common/http';
import { MediaDetailResponse } from "../../../../models/media/detail/media.detail.response";

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
    private rows: MediaDetailResponse[];
    private slickGridProvider: SlickGridProvider;
    public onSave: EventEmitter<boolean | string> = new EventEmitter();
    private error: boolean = false;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private mediaStatusService: MediaStatusService,
    ) {
        this.modalRef = this.injector.get('modalRef');
        this.rows = this.modalRef.getData().data;
        this.slickGridProvider = this.modalRef.getData().context;
        this.modalRef.modalEvents.subscribe((e: IMFXModalEvent) => {
            if (e.name === 'save') {
                if (this.mediaStatusControlRef.getSelectedId() == null) {
                    this.error = true;
                    this.cdr.detectChanges();
                } else {

                    const mediaIds = this.rows.map(el => el.ID);
                    const statusId = this.mediaStatusControlRef.getSelectedId() as number;

                    this.mediaStatusService.saveMediaStatus(mediaIds, statusId).subscribe(() => {
                        const selectedId = this.mediaStatusControlRef.getSelectedId();
                        const text = this.mediaStatusControlRef.getSourceData().find(el => el.ID === selectedId).Name;

                        this.rows = this.rows.map(el => {
                           el.MEDIA_STATUS = selectedId;
                           el.MEDIA_STATUS_text = text;
                           return el
                        });

                        this.onSave.emit(true);
                        // this.slickGridProvider.refreshGrid();
                        this.modalRef.hide();
                    }, (err: HttpErrorResponse) => {
                        this.onSave.emit(err.error.Message);
                    });
                }
            }
        });
    };

    ngAfterViewInit() {
        if (this.rows.length === 1){
            if ((<any>this.rows[0]).MEDIA_STATUS !== null) {
                this.mediaStatusControlRef.setSelectedByIds([(<any>this.rows[0]).MEDIA_STATUS]);
            }
        }

        this.mediaStatusControlRef.onSelect.subscribe(el => {
            this.error = false;
            this.cdr.detectChanges();
        });
    }
}
