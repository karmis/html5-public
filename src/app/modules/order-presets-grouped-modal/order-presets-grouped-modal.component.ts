/**
 * Created by Ivan Banan on 05.02.2020.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { OrderPresetsGroupedComponent } from '../order-presets-grouped/order.presets.grouped.component';
import { PresetType } from '../order-presets-grouped/types';

@Component({
    selector: 'order-presets-grouped-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: ['styles/index.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrderPresetsGroupedModalComponent {
    public modalRef: any;
    public onReadyContent: EventEmitter<void> = new EventEmitter<void>();
    @ViewChild('OrderPresetsGroupedComponent', {static: false}) public opgComp: OrderPresetsGroupedComponent;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;

    constructor(private injector: Injector,
                protected cdr: ChangeDetectorRef
    ) {
        this.modalRef = this.injector.get('modalRef');
    }

    saveData() {
        this.opgComp.toggleOverlay(true);
        this.modalRef.emitClickFooterBtn('ok', this.opgComp.getActivePreset());
        this.closeModal();
    }

    closeModal() {
        this.modalRef.hide();
    }

    onDblClickByPresetItemEvent(preset: PresetType) {
        this.saveData();
    }
}
