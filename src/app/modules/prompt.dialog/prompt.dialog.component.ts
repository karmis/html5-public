import {
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { Subject } from "rxjs";

@Component({
    selector: 'prompt-dialog',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class PromptDialogComponent {
    public onSubmit: Subject<any> = new Subject<any>();

    protected i18nMessageText: string = 'common.confirmation';

    public setMessage(i18nMessage: string) {
        this.i18nMessageText = i18nMessage;
    }

    private choosePromptOption(status) {
        this.onSubmit.next(status);
    }
}
