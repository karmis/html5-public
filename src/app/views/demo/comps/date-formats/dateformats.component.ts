import {Component, ViewChild} from '@angular/core';
import {TranslateService, LangChangeEvent} from '@ngx-translate/core';

@Component({
    selector: 'demo-date-formats',
    templateUrl: './tpl/index.html',
})

export class DateFormatsComponent {
    private currentDate = new Date();
    @ViewChild('controlaSasasdasd', {static: false}) private control: any;

    constructor(private translate: TranslateService) {
    }

    ngAfterViewInit() {
        let _this = this;
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            _this.control.reinitPlugin();
        });
    }
}
