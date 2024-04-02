/**
 * Created by Sergey Trizna on 24.08.2017.
 */

import {
    Component,
    ViewEncapsulation,
    Injector,
    ChangeDetectionStrategy,
    ViewChild,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import {ConsumerSettings, ConsumerSettingsStaticWidgetItem, ViewColumnType} from "../types";

@Component({
    selector: 'search-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    providers: []
})
export class ConsumerFieldsComponent implements AfterViewInit{
    @ViewChild('inputSearchRef',{static: true}) inputSearchRef: ElementRef;
    fields: Array<ViewColumnType> = [];
    data: any;
    modalRef: any;
    tmpSettings: ConsumerSettings;
    private activeType;
    private componentContext;
    private moduleContext;
    public searchText: string = '';
    constructor(private injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
        this.data = this.modalRef.getData().compContext;
        this.fields = this.data.moduleContext.fields;
        this.tmpSettings = $.extend(true, {}, this.data.moduleContext.tmpSettings);
        this.activeType = this.data.moduleContext.type;
        this.componentContext = this.data;
        this.moduleContext = this.data.moduleContext;
    }


    ngAfterViewInit() {
        this.inputSearchRef.nativeElement.focus();
    }

    private onChangeCheckbox(event, field): void {
        this.tmpSettings.staticWidgets[field.BindingName].enabled = !this.tmpSettings.staticWidgets[field.BindingName].enabled;
    }

    private selectAll(): void {
        $.each(this.tmpSettings.staticWidgets,(k, o:ConsumerSettingsStaticWidgetItem) => {
            o.enabled = true
        });
    }

    private apply() {
        this.componentContext.setSetups(this.activeType, this.tmpSettings);
        this.modalRef.hide();
    }
}
