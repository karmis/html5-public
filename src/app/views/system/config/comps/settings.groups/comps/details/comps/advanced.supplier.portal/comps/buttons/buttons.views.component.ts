import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Input, OnChanges,
    ViewEncapsulation,
} from '@angular/core';
import { SettingsGroupsAdvancedSupplierPortalComponent } from "../../advanced.supplier.portal.component";
@Component({
    selector: 'buttons-views',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class ButtonsViewsComponent implements OnChanges{
    @Input('SettingsGroupsAdvancedSupplierPortalComponent') comp: SettingsGroupsAdvancedSupplierPortalComponent;
    @Input('type') type;
    @Input('isDisabledBtn') isDisabledBtn;

    constructor(private cdr: ChangeDetectorRef) {
    }
    ngOnInit() {
        console.log(this.isDisabledBtn);
    }

    ngOnChanges(){
        console.log(this.isDisabledBtn);
        this.cdr.detectChanges();
    }
}
