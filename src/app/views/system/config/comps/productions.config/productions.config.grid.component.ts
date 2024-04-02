import {ChangeDetectionStrategy, Component, Type, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subscriber} from 'rxjs';
import {SlickGridProvider} from "app/modules/search/slick-grid/providers/slick.grid.provider";
import {ProductionsConfigService} from "./services/productions.config.service";
import {ViewsProvider} from "app/modules/search/views/providers/views.provider";
import {lazyModules} from "app/app.routes";
import {EditProductionTemplateModalComponent} from "./modals/edit-modal.modal/edit";
import {CommonTablesGridComponent} from "../common.tables.grid/common.tables.grid.component";
import {CommonTablesGridViewsProvider} from "../common.tables.grid/providers/views.provider";
import {CommonTablesSlickGridProvider} from "../common.tables.grid/providers/slick.grid.provider";

@Component({
    selector: 'productions-config',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ProductionsConfigService,
        {provide: ViewsProvider, useClass: CommonTablesGridViewsProvider},
        {provide: SlickGridProvider, useClass: CommonTablesSlickGridProvider},
    ]
})


export class ProductionsConfigGridComponent {
    @ViewChild('commonTablesGridComponent', {static: true}) private commonTablesGridComponent: CommonTablesGridComponent;
    customEditModal: {type: Type<any>, path: any, size?: string} = {
        type: EditProductionTemplateModalComponent,
        path: lazyModules.edit_production_template_modal,
        size: 'xl',

    };
    constructor(
        private prodConfigService: ProductionsConfigService
    ) {

    };

    ngOnInit() {
        this.getProdConfigTable();
    }

    getProdConfigTable(isReload = false) {
        this.commonTablesGridComponent.getTableAsync(
            this.prodConfigService.getProductionConfigsList().map(res => res),
            isReload
        );
    }

    onModalOk($event) {
        this.getProdConfigTable(true);
    }

    onDeleteItem($event) {
        const itemToDelete = $event.itemToDelete;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.prodConfigService.deleteProductionConfigById(itemToDelete).subscribe((res: any) => {
            if(res && res.Error && res.Error.length > 0) {
                observer.error(res.Error);
            }
            else {
                observer.next(res);
            }
            observer.complete();
            this.getProdConfigTable();
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }

    onChangeItem($event) {
        const itemToSave = $event.itemToSave;
        const observer: Subscriber<any> = $event.observer;

        // observer.next([]);
        // return;
        this.prodConfigService.updateProductionConfig(itemToSave).subscribe((res: any) => {
            observer.next(res);
            observer.complete();
            this.getProdConfigTable();
        }, (err) => {
            observer.error(err);
        }, () => {
            observer.complete();
        });
    }
}








