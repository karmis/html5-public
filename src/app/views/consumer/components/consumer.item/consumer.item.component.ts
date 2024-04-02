/**
 * Created by Sergey Klimeko on 08.02.2017.
 */
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { BasketService } from '../../../../services/basket/basket.service';
import { DetailService } from '../../../../modules/search/detail/services/detail.service';
import { IMFXSubtitlesGrid } from '../../../../modules/search/detail/components/subtitles.grid.component/subtitles.grid.component';
import { SessionStorageService } from 'ngx-webstorage';
import { ConsumerSettings } from '../../../../modules/settings/consumer/types';
import { ConsumerItemSettingsProvider } from '../../../../modules/settings/consumer/item/providers/consumer.settings.provider';
import { SecurityService } from '../../../../services/security/security.service';
import { ConsumerCriteriaModificationType } from '../../consumer.search.component';
import { AdvancedSearchModel } from '../../../../models/search/common/advanced.search';
import { ConsumerUtils } from '../../utils/consumer.utils';

@Component({
    selector: 'consumer-item-component',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../modules/settings/consumer/item/styles/index.scss'
    ],
    entryComponents: [
        IMFXSubtitlesGrid
    ],
    providers: [
        DetailService,
        ConsumerItemSettingsProvider
    ],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * Consumer item
 */
export class ConsumerItemComponent {
    @Input() item;
    @Input() settings;
    @Input() index;
    @Input() page;
    @Input() settingsMode;
    @Input() defaultSettings: ConsumerSettings;
    @Input('onUpdateSettings') onUpdateSettings: EventEmitter<any>;
    @Input('storagePrefix') storagePrefix: string;
    @Output() selected: EventEmitter<any> = new EventEmitter();
    @Output() changeFilter: EventEmitter<ConsumerCriteriaModificationType[]> = new EventEmitter();
    protected typeDetails: String;
    protected settingsStoragePrefix: string = this.storagePrefix + '.settings.item';
    @Input('setupsUpdated') private setupsUpdated;
    @ViewChild('simplItem', {static: false}) private simplItem;

    constructor(protected basketService: BasketService,
                protected storageService: SessionStorageService,
                protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected ssip: ConsumerItemSettingsProvider) {
    }

    onSelect(item, pageIndex, itemIndex) {
        this.selected.emit({
            'item': item,
            'page': pageIndex,
            'index': itemIndex
        });
    }

    toggleModifications(fieldId: string, value: any) {
        if (!fieldId || !value) {
            return;
        }
        const asm: AdvancedSearchModel = new AdvancedSearchModel(
            {DBField: fieldId, Operation: '=', Value: value}
        );
        // this.csp.toggleModification([{
        //     mode: "add",
        //     model: asm
        // }])
        this.changeFilter.emit([{mode: 'add', model: asm}]);
    }

    ngOnInit() {
        ConsumerUtils.consumerNgOnInit(this);
    }

    ngAfterViewInit() {
        this.ssip.settings = this.settings;
        if (this.setupsUpdated) {
            this.setupsUpdated.subscribe((setups) => {
                this.settings = setups.itemSettings;
                this.ssip.settings = setups.itemSettings;
            });
        }
    }

    getStylesForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return this.ssip.getStylesForWidget(customId, widgetType);
    }

    getHeightForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return this.ssip.getHeightForWidget(customId, widgetType);
    }

    getWidthForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return this.ssip.getWidthForWidget(customId, widgetType);
    }

    toggleBasket($event): void {
        // cancel bubbling (for cancel row selection)
        $event.stopPropagation();
        if (this.securityService.hasPermissionByName('media-basket'))
            this.isOrdered()
                ? this.basketService.removeFromBasket([this.item])
                : this.basketService.addToBasket(this.item, 'Version');

    }

    isOrdered(): boolean {
        return this.basketService.hasItem(this.item);
    }
}
