/**
 * Created by Sergey Trizna on 26.06.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { SessionStorageService } from "ngx-webstorage";
import { GridStackOptions, ConsumerSettings, ViewColumnFakeType, ViewColumnType } from "../types";
import { BasketService } from "../../../../services/basket/basket.service";
import { ConsumerDetailSettingsProvider } from "./providers/consumer.settings.provider";
import { ConsumerDetailComponent } from "../../../../views/consumer/components/consumer.detail/consumer.detail.component";
import { DetailService } from "../../../search/detail/services/detail.service";
import { SettingsGroupsService } from "../../../../services/system.config/settings.groups.service";
import { ConsumerSettingsTransferProvider } from "../consumer.settings.transfer.provider";
import { IMFXModalProvider } from '../../../imfx-modal/proivders/provider';
import { NotificationService } from "../../../notification/services/notification.service";
import { SecurityService } from "../../../../services/security/security.service";
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'consumer-detail-settings',
    templateUrl: './tpl/index.html',
    styleUrls: [
        '../../../../views/consumer/components/consumer.item/styles/index.scss',
        './styles/index.scss',
    ],
    providers: [
        ConsumerDetailSettingsProvider,
        DetailService,
        SettingsGroupsService
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConsumerDetailSettingsComponent extends ConsumerDetailComponent {
    public settingsGroupId;
    @ViewChild('wrapperDetailConfig', {static: false}) private wrapper;
    @ViewChild('gridStackDetail', {static: false}) private gridStack;
    @ViewChild('overlayForDetail', {static: false}) private overlay;
    @Output('onSave') public onSave: EventEmitter<any> = new EventEmitter();
    public type = 'detail';
    protected builderMode: boolean = false;
    protected gridStackOptions: GridStackOptions;
    private tmpSettings: ConsumerSettings;
    private fields: Array<ViewColumnType | ViewColumnFakeType> = [];
    private destroyed$: Subject<any> = new Subject();
    constructor(protected storageService: SessionStorageService,
                protected cdr: ChangeDetectorRef,
                protected basketService: BasketService,
                protected modalProvider: IMFXModalProvider,
                protected ssip: ConsumerDetailSettingsProvider,
                protected detailService: DetailService,
                protected securityService: SecurityService,
                protected sgs: SettingsGroupsService,
                protected simpleTransferProvider: ConsumerSettingsTransferProvider,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                @Inject(TranslateService) protected translate: TranslateService) {
        super(basketService, storageService, cdr, securityService, detailService, ssip, translate, notificationRef);
        this.gridStackOptions = this.ssip.getGridStackOptions();
        this.settings = $.extend(true, this.ssip.getDefaultSettings('detail'), this.settings);
        this.tmpSettings = $.extend(true, {}, this.settings);
        ssip.tmpSettings = this.tmpSettings;
        ssip.settings = this.tmpSettings;
        ssip.isSetupPage = true;
        ssip.moduleContext = this;
        ssip.modalProvider = this.modalProvider;
        ssip.storageService = this.storageService;
        ssip.settingsStoragePrefix = this.settingsStoragePrefix;
        ssip.cdr = this.cdr;
        ssip.service = this.sgs;
        ssip.transfer = this.simpleTransferProvider;
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    preheatSettings(settingsGroupId, setups){
        this.settingsGroupId = settingsGroupId;
        this.settings = $.extend(true, this.ssip.getDefaultSettings('detail'), setups);
        this.ssip.settings = this.settings;
        this.ssip.getFields().pipe(
            takeUntil(this.destroyed$)
        ).subscribe((fields: any) => {
            this.fields = fields;
            this.cdr.detectChanges();
        });
    }

    getTitleByFieldName(fieldName: string){
        return this.fields && this.fields[fieldName]?this.fields[fieldName].TemplateName:'loading...';
    }

    // override
    initDetails() {}

    openListOfFiledsModal() {
        this.ssip.openListOfFiledsModal();
    }

    open() {
        this.ssip.open();
    }

    save() {
        if(!this.settingsGroupId){
            this.notificationRef.notifyShow(2, 'consumer_settings.need_to_save_this_settings_group');
            console.error('settingsGroupId not found');
            return;
        }

        this.ssip.save(this.settingsGroupId);
    }

    reset() {
        this.ssip.reset('detail')
    }

    addLabel() {
        this.ssip.addLabel();
    }

    getSettings(): ConsumerSettings {
        return this.ssip.getSettings();
    }
}
