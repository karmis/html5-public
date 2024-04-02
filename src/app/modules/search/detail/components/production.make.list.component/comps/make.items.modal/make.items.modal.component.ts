import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector, TemplateRef,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { IMFXModalComponent } from '../../../../../../imfx-modal/imfx-modal';
import { ProductionService } from '../../../../../../../services/production/production.service';


@Component({
    selector: 'make-items-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MakeItemsModalComponent implements AfterViewInit {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    private modalRef: IMFXModalComponent;
    name = '';
    type = 'btn-confirm';

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private productionService: ProductionService) {

        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit(): void {

    }

    loadData(type, data) {
        this.type = type;
    }

    save() {
        this.modalRef.modalEvents.emit({
            name: 'ok_and_save', state: {
                name: this.name
            }
        });
    }


    closeModal() {
        this.modalRef.hide();
    }

}
