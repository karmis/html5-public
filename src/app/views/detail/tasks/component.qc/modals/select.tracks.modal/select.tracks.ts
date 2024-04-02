import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'select-tracks-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})

export class SelectTracksModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static:true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('modalSelectTracksOverlayWrapper', {static:true}) private modalSelectTracksOverlayWrapper: ElementRef;

    private modalRef: any;
    private internalExpanded = true;
    private externalExpanded = true;
    private context;
    private audioTracksRowsInternal;
    private audioTracksRowsExternal;
    private externalSelectedState = 0;
    private internalSelectedState = 0;
    private selectedInternal = [];
    private selectedExternal = [];

    constructor(private injector: Injector,
                private cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
        this.audioTracksRowsInternal = d.audioTracksRowsInternal;
        this.audioTracksRowsExternal = d.audioTracksRowsExternal;

        this.selectedInternal = [];
        this.selectedExternal = [];

        for (var i = 0; i < this.audioTracksRowsInternal.length; i++) {
            if(this.audioTracksRowsInternal[i].Data.Selected)
                this.selectedInternal[i] = true;
            else
                this.selectedInternal[i] = false;
        }
        for (var i = 0; i < this.audioTracksRowsExternal.length; i++) {
            if(this.audioTracksRowsExternal[i].Data.Selected)
                this.selectedExternal[i] = true;
            else
                this.selectedExternal[i] = false;
        }

        this.internalSelectedState = this.selectedState(this.selectedInternal);
        this.externalSelectedState = this.selectedState(this.selectedExternal);
    }

    toggleOverlay(show) {
        if (show) {
            $(this.modalSelectTracksOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.modalSelectTracksOverlayWrapper.nativeElement).hide();
        }
        this.cd.detectChanges();
    }

    selectTrack(track, internal) {
        if(internal) {
            this.selectedInternal[track] = !this.selectedInternal[track];
            this.internalSelectedState = this.selectedState(this.selectedInternal);
        }
        else {
            this.selectedExternal[track] = !this.selectedExternal[track];
            this.externalSelectedState = this.selectedState(this.selectedExternal);
        }
    }

    selectTracks(internal: boolean) {
        if(internal) {
            this.internalSelectedState = this.selectTracksProcessor(this.selectedInternal ,this.internalSelectedState);
        }
        else {
            this.externalSelectedState = this.selectTracksProcessor(this.selectedExternal ,this.externalSelectedState);
        }
    }

    selectTracksProcessor(tracks, state) {
        if(state == 2) {
            for (var i = 0; i < tracks.length; i++) {
                tracks[i] = false;
            }
            return 0;
        }
        else {
            for (var i = 0; i < tracks.length; i++) {
                tracks[i] = true;
            }
            return 2;
        }
    }
    ///2 - All | 1 - Partial | 0 - Nothing
    selectedState(tracks) {
        var selectedCount = tracks.filter((x)=> {
            return x;
        }).length;
        if(selectedCount == tracks.length)
            return 2;
        if(selectedCount == 0)
            return 0;
        return 1;
    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }

    ngAfterViewInit() {
        this.toggleOverlay(false);
    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        this.modalRef.emitClickFooterBtn('ok', {
            internal: this.selectedInternal,
            external: this.selectedExternal
        });
        this.modalRef.hide();
    }
}
