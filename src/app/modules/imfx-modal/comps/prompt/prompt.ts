/**
 * Created by Sergey Trizna on 30.03.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXModalComponent} from "../../imfx-modal";
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'modal-prompt-content',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../styles/index.scss']
})
export class IMFXModalPromptComponent implements OnInit {
    @ViewChild('promptInput', {static: true}) promptInputRef: ElementRef;
    protected title: string;
    protected label: string;
    protected error: string;
    protected placeholder: string = 'common.input_name';
    protected modalRef: IMFXModalComponent;

    constructor(protected injector: Injector,
                protected cdr: ChangeDetectorRef,
                protected translate: TranslateService) {
        this.modalRef = this.injector.get('modalRef');
    }

    ngOnInit(): void {
        this.promptInputRef.nativeElement.focus();
    }

    setTitle(title: string) {
        this.title = title;
        this.cdr.detectChanges();
    }

    setLabel(label: string) {
        this.label = label;
        this.cdr.detectChanges();
    }

    setError(error: string) {
        this.error = this.translate.instant(error);
        this.cdr.detectChanges();
    }

    setPlaceholder(placeholder: string) {
        this.placeholder = placeholder;
        this.cdr.detectChanges();
    }

    getValue() {
        return this.promptInputRef.nativeElement.value;
    }

    setValue(v: string) {
        this.promptInputRef.nativeElement.value = v;
        this.cdr.detectChanges();
    }

    ok() {
        this.modalRef.modalEvents.emit({
            name: 'ok'
        });
    }

    hide() {
        this.modalRef.hide();
        this.modalRef.modalEvents.emit({
            name: 'hide'
        });
    }
}
