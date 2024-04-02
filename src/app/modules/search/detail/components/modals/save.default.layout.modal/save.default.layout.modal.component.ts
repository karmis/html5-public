import {
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IMFXModalComponent } from '../../../../../imfx-modal/imfx-modal';
import 'script-loader!../../../../../controls/timecode/libs/jquery.maskedinput.js';

@Component({
    selector: 'save-default-layout-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class SaveDefaultLayoutModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    protected modalRef: IMFXModalComponent;
    protected context;
    private mediaSubtypes: any;
    private mediaType: any;
    private mediaTypeName: any = '';
    private exampleMediaType1: any = '';
    private exampleMediaType2: any = '';

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.mediaSubtypes = d.mediaSubtypes;
        this.mediaType = d.mediaType;
        this.mediaTypeName = '';
        this.exampleMediaType1 = '';
        this.exampleMediaType2 = '';
        for (var e in this.mediaSubtypes) {
            if (Array.isArray(this.mediaSubtypes[e])) {
                for (var j in this.mediaSubtypes[e]) {
                    if (this.mediaSubtypes[e][j] == this.mediaType) {
                        this.mediaTypeName = e;
                    }
                }
            } else if (this.mediaSubtypes[e] == this.mediaType) {
                this.mediaTypeName = e;
            } else {
                if (this.exampleMediaType1 == '') {
                    this.exampleMediaType1 = e;
                } else if (this.exampleMediaType2 == '') {
                    this.exampleMediaType2 = e;
                }
            }
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit(){

    }

    closeModal() {
        this.modalRef.hide();
    }

    saveData() {
        this.closeModal();
    }

}
