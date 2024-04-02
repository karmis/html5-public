import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ComponentRef,
    Inject, Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Location} from "@angular/common";
import {BasketService} from "../../services/basket/basket.service";
import {XMLService} from "../../services/xml/xml.service";
import {NotificationService} from "../../modules/notification/services/notification.service";
import {TranslateService} from '@ngx-translate/core';
import {SecurityService} from "../../services/security/security.service";
import {IMFXRouteReuseStrategy} from '../../strategies/route.reuse.strategy';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {IMFXControlsDateTimePickerComponent} from "../../modules/controls/datetimepicker/imfx.datetimepicker";
import { IMFXModalProvider } from '../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../modules/imfx-modal/imfx-modal';
import { appRouter } from '../../constants/appRouter';
import { RaiseWorkflowWizzardComponent } from '../../modules/rw.wizard/rw.wizard';
import { WorkflowListComponent } from '../workflow/comps/wf.list.comp/wf.list.comp';
import { IMFXModalEvent } from '../../modules/imfx-modal/types';
import { OrderPresetGroupedInputComponent } from './components/order.preset.grouped.input/order.preset.grouped.input.component';
import {lazyModules} from "../../app.routes";
import { HttpErrorResponse } from '@angular/common/http';
import { ServerGroupStorageService } from 'app/services/storage/server.group.storage.service';
import {RaiseWorkflowSettingsType} from "../system/config/comps/settings.groups/comps/details/comps/raise.workflow/types";


@Component({
    moduleId: 'media-basket',
    selector: 'media-basket',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaBasketComponent {
    @ViewChild('xmlTree', {static: false}) private xmlTree;
    @ViewChild('datetimepicker', {static: false}) private dtp: IMFXControlsDateTimePickerComponent;
    @ViewChild('orderPresetGroupedInputComponent', {static: false}) private orderPresetGroupedInputComponent: OrderPresetGroupedInputComponent;
    private items: any = [];
    private selectedPreset: any;
    private message: String;
    private orderStatus: OrderStatus;
    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    private showNotification = false;
    private loading = false;
    private keepBasketAfterwards: boolean = false;
    private basketSubscr: Subscription;
    private routerSubscr: Subscription;
    private itemsSubscriber: Subscription;
    private dateAsJson: string;
    private minDate = new Date();
    private yearStart = new Date().getFullYear();
    private showZeroStep: any = true; //show active wf step
    protected applyAllToOneWF = true;
    protected wfSettingsKey = 'raiseWorkflowSettings';
    // private hasVersionItemType: boolean = false;

    constructor(private basketService: BasketService,
                private cdr: ChangeDetectorRef,
                private xmlService: XMLService,
                protected securityService: SecurityService,
                protected serverGroupStorageService: ServerGroupStorageService,
                private translate: TranslateService,
                private router: Router,
                private route: ActivatedRoute,
                private injector: Injector,
                private modalProvider: IMFXModalProvider,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                private location: Location) {
    }
    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }
    ngOnInit() {

        this.basketSubscr = this.basketService.onPlaceOrder.subscribe((res)=>{
            this.selectedPreset = null;
            this.message = null;
            this.selectedSchemaModel = {};
            this.selectedXmlModel = {};
            this.orderPresetGroupedInputComponent.clear();
            this.dtp.onClearDatePicker();
        });

        this.routerSubscr = this.route.parent && this.route.parent.url.subscribe((data)=>{
            this.loadAndApplyRaiseWfOptionsFromSettingsGroup();
            this.cdr.markForCheck();
        }, error => console.error(error));

        this.itemsSubscriber = this.basketService.items
            .subscribe((updatedItems) => {
                this.items = updatedItems;
                this.onUpdateItems();
                this.cdr.detectChanges();
            });
        this.orderStatus = OrderStatus.Ready;
    }

    ngAfterViewInit() {
        this.dateAsJson = null;
    }

    ngOnDestroy() {
        this.itemsSubscriber.unsubscribe();
        this.routerSubscr.unsubscribe();
        this.basketSubscr.unsubscribe();
    }

    loadAndApplyRaiseWfOptionsFromSettingsGroup() {
        this.serverGroupStorageService.retrieve({global: [this.wfSettingsKey], local: [this.wfSettingsKey]}).subscribe((res:any) => {
            if (!res.global[this.wfSettingsKey]) {
                return;
            }

            let wfSetups: RaiseWorkflowSettingsType = JSON.parse(res.global[this.wfSettingsKey] || null);
            if (wfSetups) {
                this.applyAllToOneWF = wfSetups.fromBasket;
            }
        });
    }

    onUpdateItems() {

    }

    onPresetChange() {
        if (this.selectedPreset.SchemaId != 0) {
            this.xmlService.getXmlData(this.selectedPreset.SchemaId).subscribe(
                (result: any) => {
                    if (result) {
                        this.selectedSchemaModel = result.SchemaModel;
                        this.selectedXmlModel = result.XmlModel;
                        this.cdr.detectChanges();
                    }
                },
                (err) => {
                    console.log(err);
                }
            );
        }
    }

    onSelectDate(data){
        if (data === null) {
            this.dateAsJson = null;
        } else {
            this.dateAsJson = this.dtp.getValueAsJSON();
        }
    }

    isPlaceOrderEnabled() {
        return this.items && this.items.length > 0 && this.selectedPreset;
        // return this.items.filter(item => item.selected).length;
    }

    placeOrder() {
        if (!this.isPlaceOrderEnabled()) {
            return;
        }

        if(this.dtp.getValue() !== null && this.dtp.getValue() < this.minDate){
            this.notificationRef.notifyShow(2, 'basket.date_not_more_than_now');
            return;
        }
        // this.loading = true;
        if (this.selectedPreset.SchemaId != 0 && this.xmlTree && !this.xmlTree.isValid()) {
            // this.loading = false;
            return;
        }

        const that = this;
        const extraData = {
            preset: this.selectedPreset,
            xmlDocAndSchema: this.selectedPreset && this.selectedPreset.SchemaId ? this.xmlTree.getXmlModel() : undefined,
            note: this.message,
            removeItemsFromBasket: !this.keepBasketAfterwards,
            CompleteByDate: this.dateAsJson,
            workflowPerItem: (this.items.length > 1)
                ? !this.applyAllToOneWF
                : false
        };

        let modal: IMFXModalComponent = this.modalProvider.showByPath(
            lazyModules.wf_raise,
            RaiseWorkflowWizzardComponent, {
                title: 'rwwizard.title',
                size: 'md',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            });

        modal.load().then((compRef: ComponentRef<RaiseWorkflowWizzardComponent>) => {
            const comp: RaiseWorkflowWizzardComponent = compRef.instance;
            comp.rwwizardprovider.openFromStep(this.items, extraData);
        });
        // this.basketService.placeOrder({
        //     preset: this.selectedPreset,
        //     note: this.message,
        //     schemaId: this.selectedPreset && this.selectedPreset.SchemaId,
        //     xmlDocAndSchema: this.selectedPreset && this.selectedPreset.SchemaId ? this.xmlTree.getXmlModel() : undefined,
        //     removeItemsFromBasket: !this.keepBasketAfterwards,
        //     CompleteByDate: this.dateAsJson
        // }).subscribe((result) => {
        //     let extraData;
        //
        //     if (result.ErrorDesc && result.JobId == 0) {
        //         extraData = {
        //             successPlacement: false,
        //             resultsMessage: result.ErrorDesc
        //         };
        //     }
        //     else {
        //         // message = this.translate.instant("basket.success_message") + '\n\rWorkflow: ';
        //         extraData = {
        //             successPlacement: true,
        //             resultsMessage: this.translate.instant("basket.success_message") + '\n\rWorkflow: ',
        //             resultJob: result.JobId,
        //             resultJobRef: result.JobRef && result.JobRef.length > 0
        //                 ? result.JobRef
        //                 : result.JobId,
        //             firstTask: result.FirstTask
        //         };
        //     }
        //     this.showRaiseWorkflowModal(extraData);
        //
        //     that.loading = false;
        //     this.cdr.detectChanges();
        // }, (error) => {
        //     let message = this.translate.instant("basket.error_message");
        //     if (typeof error._body == 'string') {
        //         message = error._body.replace(/.*\(.*\): /, "");
        //     } else {
        //         let errorLines = error.Message.match(/[^\r\n]+/g);
        //         message = errorLines[0].replace(/.*\(.*\): /, "");
        //     }
        //
        //     let extraData = {
        //         successPlacement: false,
        //         resultsMessage: message
        //     };
        //
        //     this.showRaiseWorkflowModal(extraData);
        //     // this.notificationRef.notifyShow(2, message);
        //     this.cdr.detectChanges();
        //     that.loading = false;
        // })
    }

    onSelect($event) {
        this.selectedPreset = $event;
        this.selectedPreset.SchemaId = $event.SchemaId;
        this.selectedPreset.Id = $event.Id;
        this.onPresetChange();
    }

    isFirstLocation () {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    clickBack() {
        this.location.back();
    }

    clearAll() {
        if (this.items && this.items.length > 0) {
            this.basketService.removeFromBasket(this.items);
        }
    }

    checkSelected() {
        return this.items.filter((el) => el.selected == true).length > 0;
    }

    clearSelected() {
        if (this.items && this.items.length > 0) {
            let items = this.items;
            items = items.filter((el) => el.selected == true);
            this.basketService.removeFromBasket(items);
        }
    }


    private getErrorTextForPresets(error: HttpErrorResponse) {
        let msg: string;
        try {
            msg = error.error.Message.match(/[^\r\n\[*.\]]+/g)[2].replace(/.*\(.*\): /, "").trim();
        } catch (e) {
            msg = this.translate.instant("basket.error_message");
        }

        return msg;
    }
    private setKeepBasketAfterwards() {
        this.keepBasketAfterwards = !this.keepBasketAfterwards;
    }
}

enum OrderStatus {
    Ready = 1,
    Loading = 2,
    Success = 3,
    Error = 4
}
