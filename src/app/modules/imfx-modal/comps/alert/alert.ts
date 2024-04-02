/**
 * Created by Sergey Trizna on 30.03.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { IMFXModalComponent } from "../../imfx-modal";
import { TranslateService } from '@ngx-translate/core';
import { ClipboardProvider } from '../../../../providers/common/clipboard.provider';

@Component({
    selector: 'modal-alert-content',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../styles/index.scss']
})
export class IMFXModalAlertComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    protected text: string;
    protected textParams: any;
    protected modalRef: IMFXModalComponent;
    protected copyButton: boolean = false;
    private title: string;

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private clipboardProvider: ClipboardProvider,
                private translate: TranslateService) {
        this.modalRef = this.injector.get('modalRef');
    }

    setTitle(title: string) {
        this.title = this.translate.instant(title);
        this.cdr.detectChanges();
    }

    setText(text: string, textParams?: object) {
        this.text = text;
        this.textParams = textParams;
        this.cdr.detectChanges();
    }

    setCopyButton(state: boolean) {
        this.copyButton = state;
        this.cdr.detectChanges();
    }


    protected copyError() {
        const text = this.translate.instant(this.text, this.textParams);
        this.clipboardProvider.copy(text);
    }
}
