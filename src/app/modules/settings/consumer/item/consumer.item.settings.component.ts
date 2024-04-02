/**
 * Created by Sergey Trizna on 26.06.2017.
 */
import {
    Component, Output, EventEmitter, ViewChild, ViewEncapsulation, ChangeDetectorRef, Input, Inject,
} from '@angular/core';
import {SessionStorageService} from "ngx-webstorage";
import {ConsumerItemComponent} from "../../../../views/consumer/components/consumer.item/consumer.item.component";
import {
    GridStackOptions, ConsumerSettings, TransferdSimplifedType, ViewColumnFakeType,
    ViewColumnType
} from "../types";
import {BasketService} from "../../../../services/basket/basket.service";
import {ConsumerItemSettingsProvider} from "./providers/consumer.settings.provider";
import {SettingsGroupsService} from "../../../../services/system.config/settings.groups.service";
import {ConsumerSettingsTransferProvider} from "../consumer.settings.transfer.provider";
import { IMFXModalProvider } from '../../../imfx-modal/proivders/provider';
import {NotificationService} from "../../../notification/services/notification.service";
import {SecurityService} from "../../../../services/security/security.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'consumer-item-settings',
    templateUrl: './tpl/index.html',
    styleUrls: [
        '../../../../views/consumer/components/consumer.item/styles/index.scss',
        './styles/index.scss',
    ],
    providers: [
        ConsumerItemSettingsProvider
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})

export class ConsumerItemSettingsComponent extends ConsumerItemComponent {
    public settingsGroupId;
    @ViewChild('wrapperItemConfig', {static: false}) private wrapper;
    @ViewChild('overlayForItem', {static: false}) private overlay;
    @ViewChild('gridStackListItem', {static: false}) private gridStack;
    @Output('onSave') public onSave: EventEmitter<any> = new EventEmitter();
    public type = 'item';
    protected builderMode: boolean = false;
    protected gridStackOptions: GridStackOptions;
    private tmpSettings: ConsumerSettings;
    private fields: Array<ViewColumnType | ViewColumnFakeType> = [];
    private subAddedNewGroup: Subscription;

    constructor(protected storageService: SessionStorageService,
                protected cdr: ChangeDetectorRef,
                protected basketService: BasketService,
                protected modalProvider: IMFXModalProvider,
                protected securityService: SecurityService,
                protected ssip: ConsumerItemSettingsProvider,
                protected sgs: SettingsGroupsService,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                @Inject(NotificationService) protected notificationRef: NotificationService) {

        super(basketService, storageService, cdr, securityService, ssip);
        this.gridStackOptions = this.ssip.getGridStackOptions();
        this.settings = $.extend(true, this.ssip.getDefaultSettings('item'), this.settings);
        this.tmpSettings = $.extend(true, {}, this.settings);
        ssip.tmpSettings = this.tmpSettings;
        ssip.settings = this.tmpSettings;
        ssip.moduleContext = this;
        ssip.modalProvider = this.modalProvider;
        ssip.storageService = this.storageService;
        ssip.settingsStoragePrefix = this.settingsStoragePrefix;
        ssip.cdr = this.cdr;
        ssip.service = this.sgs;
        ssip.transfer = this.simpleTransferProvider;
    }

    ngOnInit() {
        this.subAddedNewGroup = this.sgs.addedNewGroup.subscribe( group => {
            if (group){
                this.settingsGroupId = group.ID;
            }
        });
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.subAddedNewGroup.unsubscribe();
    }

    preheatSettings(settingsGroupId, setups) {
        this.settingsGroupId = settingsGroupId;
        this.settings = $.extend(true, this.ssip.getDefaultSettings('item'), setups);
        this.ssip.settings = this.settings;
        this.ssip.getFields().subscribe((fields: any) => {
            this.fields = fields;
            try {
                this.cdr.detectChanges();
            } catch (e) {}
        });
    }

    getTitleByFieldName(fieldName: string){
        return this.fields && this.fields[fieldName]?this.fields[fieldName].TemplateName:'loading...';
    }

    openListOfFiledsModal() {
        this.ssip.openListOfFiledsModal();
    }

    open() {
        this.ssip.open();
    }

    save() {
        if (!this.settingsGroupId) {
            this.notificationRef.notifyShow(2, 'consumer_settings.need_to_save_this_settings_group');
            console.error('settingsGroupId not found')
            return;
        }

        this.ssip.save(this.settingsGroupId);
    }

    reset() {
        this.ssip.reset('item')
    }

    addLabel() {
        this.ssip.addLabel();
    }

    getSettings(): ConsumerSettings {
        return this.ssip.getSettings();
    }
}
