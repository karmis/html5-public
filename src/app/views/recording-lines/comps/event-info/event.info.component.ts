import {
    ChangeDetectorRef,
    Component,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../modules/imfx-modal/imfx-modal';
import { ChooseItemModalComponent } from '../../../../modules/choose.item.modal/choose.item.modal.component';
import { SlickGridRowData } from '../../../../modules/search/slick-grid/types';
import { lazyModules } from '../../../../app.routes';

@Component({
    selector: 'event-info',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class EventInfoComponent {
    form = {
        eventId:'',
        status:'',
        source:'',
        titles:'',
        versions: '',
        series: '',
        eventTitle: '',
        from: '',
        to: '',
        port: '',
        mediaStatus: '',
        owner: '',
        filename: '',
    }
    constructor(protected cdr: ChangeDetectorRef,
                private translate: TranslateService,
                private injector: Injector,) {
    }

    onUpdateControl(event, type) {
        switch (type) {
            case 'from':
                this.form.from = event;
                break;
            case 'to':
                this.form.to = event;
                break;
            case 'owner':
                this.form.owner = event.params.data[0].id;
                break;
        }
        console.log(event, type, this.form);
    }

    showMediaTable(type: 'media' | 'versions' | 'carriers' | 'titles' | 'series' | 'source' ) {  // 'series' | 'versions' | 'titles' | 'source'
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.choose_item_table, ChooseItemModalComponent, {
            title: 'Select ' + type.charAt(0).toUpperCase() + type.substr(1),
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr) => {
            let modalContent: ChooseItemModalComponent = cr.instance;
            modalContent.typeGrid = type;
            modalContent.addedNewItem.subscribe((rows: SlickGridRowData[]) => {
                console.log({type, rows});
            })
        });
    }

}
