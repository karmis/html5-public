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
import { IMFXModalComponent } from '../../../../../imfx-modal/imfx-modal';
import 'script-loader!../../../../../controls/timecode/libs/jquery.maskedinput.js';
import { TimecodeInputComponent } from '../../../../../controls/timecode/timecode.input';

@Component({
    selector: 'edit-som-eom-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class EditSomEomModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('somInput', {static: false}) somInput: TimecodeInputComponent;
    @ViewChild('eomInput', {static: false}) eomInput: TimecodeInputComponent;
    protected modalRef: IMFXModalComponent;
    protected context;
    public SOMtext;
    public startSOMtext;
    public EOMtext;
    public startEOMtext;
    public TimecodeFormat;
    public errMessage = '';
    private arrMessages = [
        'media.table.modal_edit_som_eom.error_messages.eom_less_som',
        'media.table.modal_edit_som_eom.error_messages.invalid_format',
    ];

    constructor(protected injector: Injector,
                protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService) {
        this.modalRef = this.injector.get('modalRef');
        let d = this.modalRef.getData();
        this.context = d.context;
    }

    ngOnInit() {
    }

    ngAfterViewInit(){

    }

    closeModal() {
        this.modalRef.hide();
    }

    setData(data) {
        if(!data || !data.SOMtext || !data.EOMtext){
            return;
        }

        this.SOMtext = this.startSOMtext = data.SOMtext;
        this.EOMtext = this.startEOMtext = data.EOMtext;
        this.TimecodeFormat = data.TimecodeFormat;
    }

    checkValid(){
        if (this.SOMtext > this.EOMtext) {
            this.errMessage = this.arrMessages[0];
            return this.errMessage;
        }

        if(!this.somInput.getIsValid() || !this.eomInput.getIsValid()){
            this.errMessage = this.arrMessages[1];
            return this.errMessage;
        }

        this.errMessage = null;
        return this.errMessage;
    }

    checkUpdate(){
        if (this.SOMtext != this.startSOMtext || this.EOMtext != this.startEOMtext) {
            return true;
        } else{
            return false;
        }
    }

    saveData() {
        if (!this.checkUpdate() || (this.checkValid() !== null)) {
            return;
        }

        this.cd.detectChanges();
        this.modalRef.emitClickFooterBtn(
            'ok'
            ,{
                SOM: this.SOMtext,
                EOM: this.EOMtext
            }
        );
        this.closeModal();
    }

}
