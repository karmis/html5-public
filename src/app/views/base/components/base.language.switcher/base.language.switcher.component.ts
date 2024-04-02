/**
 * Created by initr on 28.11.2016.
 */
import {Component, ViewEncapsulation, Input, ChangeDetectionStrategy} from '@angular/core';
import {LanguageSwitcherComponent} from '../../../../modules/language.switcher/language.switcher';
@Component({
    selector: 'base-language-switcher',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseLanguageSwitcherComponent extends LanguageSwitcherComponent{
    @Input('isVisible') isVisible?: any;
}
