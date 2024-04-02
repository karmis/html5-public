import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { BasketService } from "../../services/basket/basket.service";
import { RaiseWorkflowWizzardProvider } from "./providers/rw.wizard.provider";
import { NotificationService } from "../notification/services/notification.service";
import { TranslateService } from '@ngx-translate/core';
import { XMLService } from "../../services/xml/xml.service";
import { Router } from "@angular/router";
import { MediaClip } from "../../views/clip-editor/rce.component";
import { appRouter } from "../../constants/appRouter";
import { IMFXModalComponent } from "../imfx-modal/imfx-modal";
import { WorkflowProvider } from '../../providers/workflow/workflow.provider';
import { MisrService } from '../../views/misr/services/service';
import { IMFXControlsDateTimePickerComponent } from '../controls/datetimepicker/imfx.datetimepicker';
import { WorkflowListComponent } from '../../views/workflow/comps/wf.list.comp/wf.list.comp';
import { OrderPresetsGroupedComponent } from '../order-presets-grouped/order.presets.grouped.component';
import { PresetType } from '../order-presets-grouped/types';
import { ErrorManagerProvider } from '../error/providers/error.manager.provider';
import { ErrorManager } from '../error/error.manager';
import { HttpErrorResponse } from '@angular/common/http';
import {MappingComponent} from "../../views/mapping/mapping.component";
import { ServerGroupStorageService } from 'app/services/storage/server.group.storage.service';
import { RaiseWorkflowSettingsType } from 'app/views/system/config/comps/settings.groups/comps/details/comps/raise.workflow/types';
import {Observable} from "rxjs";
import { IMFXMLTreeComponent } from '../controls/xml.tree/imfx.xml.tree';

@Component({
    selector: 'imfx-rf-wizard-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        RaiseWorkflowWizzardProvider,
        WorkflowProvider,
        MisrService
        // ControlToAdvTransfer,
    ]
})

export class RaiseWorkflowWizzardComponent {
    public onShow: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('OrderPresetsGroupedComponent', {static: false}) public opgComp: OrderPresetsGroupedComponent;
    @ViewChild('workflowListComponent', {static: false}) private workflowListComponent: WorkflowListComponent;
    @ViewChild('datetimepicker', {static: false}) private dtp: IMFXControlsDateTimePickerComponent;
    @ViewChild('xmlTreePresets', {static: false}) private xmlTree: IMFXMLTreeComponent;
    private modalRef: IMFXModalComponent;
    private title: any;
    private currentStep = 1;
    private prevStep = 1;
    private startStep = 1;
    private overlayShowed = true;
    private overlayActive = true;
    private selectedPreset: PresetType = null;
    private selectedSchemaModel: any = {};
    private selectedXmlModel: any = {};
    // private visiblePresets = [];
    // private presets = [];
    private resultsMessage = '';
    private selectedItem;
    private selectedItemType;
    private clips: Array<MediaClip> = [];
    private successPlacement;
    private resultJob = null;
    private resultJobRef = null;
    private firstTask = null;
    private firstTaskValid = false;
    private temporaryBasket: Array<any> = [];//it needs to attach some items
    private modalData: any;
    private showZeroStep: any = true; //show active wf step
    private activeWorkflows: any[];
    private initModalParams: any = null;
    private dateAsJson: string;
    private minDate = new Date();

    private xmlDocAndSchema = null;
    private note = null;
    private removeItemsFromBasket = null;

    private wzSourceType: 'media' | 'version' | 'tape' = 'media';
    // private basketContentType: 'onlyMedia' | 'onlyVersion' | 'combined' = null;

    protected wfSettingsKey = 'raiseWorkflowSettings';
    protected wfSettings: RaiseWorkflowSettingsType = null;
    protected applyAllToOneWF = true; //depends of WorkflowPerItem
    protected wfResult: any[] = [];

    constructor(private cdr: ChangeDetectorRef,
                private elRef: ElementRef,
                private router: Router,
                private injector: Injector,
                private translate: TranslateService,
                public rwwizardprovider: RaiseWorkflowWizzardProvider,
                public workflowProvider: WorkflowProvider,
                private xmlService: XMLService,
                private notificationRef: NotificationService,
                private serverGroupStorageService: ServerGroupStorageService,
                private emp: ErrorManagerProvider,
                private basketService: BasketService) {
        // ref to component
        this.rwwizardprovider.moduleContext = this;

        // modal data
        this.modalRef = this.injector.get('modalRef');
        this.modalData = this.modalRef.getData();

        this.loadRaiseWfOptionsFromSettingsGroup();
    }

    ngAfterViewInit() {
        this.focusFilter();
        this.dateAsJson = null;
    }

    focusFilter() {
        let inputEl = this.elRef.nativeElement.querySelector('.filter-field');
        if (this.startStep == 1 && inputEl) {
            inputEl.focus();
        }
    }

    showActiveWorkflow() {
        let service: MisrService = this.injector.get(MisrService);
        if (this.wzSourceType == 'media') {
            service.getWorkflowsByMedias([this.selectedItem]).subscribe((resp: any[]) => {
                if (!resp || resp.length == 0) {
                    this.showZeroStep = false;
                    this.currentStep = this.prevStep = this.startStep;
                    this.loadStep();
                } else {
                    this.activeWorkflows = resp;
                    this.storeInitModalParams();
                    this.loadZeroStep();
                    this.workflowListComponent.setData(this.activeWorkflows);
                    this.workflowListComponent.loadData([this.selectedItem], 'media', false);
                    this.toggleOverlay(false);
                    this.cdr.detectChanges();
                }
            });
        } else if (this.wzSourceType == 'version') {
            service.getWorkflowsByVersions([this.selectedItem]).subscribe((resp: any[]) => {
                if (!resp || resp.length == 0) {
                    this.showZeroStep = false;
                    this.currentStep = this.prevStep = this.startStep;
                    this.loadStep();
                } else {
                    this.activeWorkflows = resp;
                    this.storeInitModalParams();
                    this.loadZeroStep();
                    this.workflowListComponent.setData(this.activeWorkflows);
                    this.workflowListComponent.loadData([this.selectedItem], 'version', false);
                    this.toggleOverlay(false);
                    this.cdr.detectChanges();
                }
            });
        } else if (this.wzSourceType == 'tape') {
            service.getWorkflowsByTape([this.selectedItem]).subscribe((resp: any[]) => {
                if (!resp || resp.length == 0) {
                    this.showZeroStep = false;
                    this.currentStep = this.prevStep = this.startStep;
                    this.loadStep();
                } else {
                    this.activeWorkflows = resp;
                    this.storeInitModalParams();
                    this.loadZeroStep();
                    this.workflowListComponent.setData(this.activeWorkflows);
                    this.workflowListComponent.loadData([this.selectedItem], 'tape', false);
                    this.toggleOverlay(false);
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.showZeroStep = false;
            this.currentStep = this.prevStep = this.startStep;
            this.loadStep();
        }
    }

    loadZeroStep() {
        this.currentStep = 0;
        this.changeModalSize('xl');
        this.changeModalTitle('rwwizard.act_wf_title');
    }

    storeInitModalParams() {
        this.initModalParams = $.extend(false, {}, this.modalRef.getModalOptions());
    }

    changeModalSize(size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full-size') {
        this.modalRef.getModalOptions().size = size;
        this.modalRef.applyCustomCss();
    }

    changeModalTitle(title: string) {
        this.modalRef.getModalOptions().title = title;
        this.modalRef.cdr.detectChanges();
    }

    loadRaiseWfOptionsFromSettingsGroup(): Observable<any> {
        return new Observable((observer: any) => {
            this.serverGroupStorageService.retrieve({global: [this.wfSettingsKey], local: [this.wfSettingsKey]}).subscribe((res:any) => {
                if (!res.global[this.wfSettingsKey]) {
                    observer.next();
                    observer.complete();
                    return;
                }

                let wfSetups = JSON.parse(res.global[this.wfSettingsKey] || null);
                if (wfSetups) {
                    this.wfSettings = wfSetups;
                }
                observer.next();
                observer.complete();
            });
        });
    }

    init(
        items,
        extraData?: {
            preset?: PresetType,
            showZeroStep?: boolean,
            CompleteByDate?: any,
            VersionSourceType?: 'media' | 'version'
            note?: any,
            removeItemsFromBasket?:boolean
            xmlDocAndSchema?: any
            workflowPerItem?: boolean
        }
    ) {
        this.loadRaiseWfOptionsFromSettingsGroup().subscribe(() => {
            this._init(items, extraData);
        });
    }

    private _init(
        items,
        extraData?: {
            preset?: PresetType,
            showZeroStep?: boolean,
            CompleteByDate?: any,
            VersionSourceType?: 'media' | 'version'
            note?: any,
            removeItemsFromBasket?:boolean
            xmlDocAndSchema?: any
            workflowPerItem?: boolean
        }
    ) {
        if (Array.isArray(items)) {
            this.temporaryBasket = items;
        } else if (items && typeof items == 'object') {
            //legacy support
            this.temporaryBasket = [items];
            // this.title = items.itemTitle;
            this.clips = items.clips || [];
        }

        if (this.temporaryBasket.length == 1) {
            this.showZeroStep = extraData && extraData.hasOwnProperty('showZeroStep')
                ? extraData.showZeroStep
                : this.showZeroStep;
            this.selectedItem = this.temporaryBasket[0].ID;
            this.selectedItemType = this.temporaryBasket[0].basket_item_type;
            this.applyAllToOneWF = true;
        } else {
            this.showZeroStep = false; //'cause it's enabled only for single item
        }

        //commented by https://yt.tmd.tv/issue/px-4429#focus=streamItem-88-94728.0-0
        // this.hasVersionItemType = (this.temporaryBasket.length)
        //     ? this.temporaryBasket.some(el => el.basket_item_type.toLowerCase() == 'version')
        //     : this.hasVersionItemType;
        // this.workflowPerItem = this.hasVersionItemType;

        // this.basketContentType = (this.temporaryBasket.every(el => el.basket_item_type.toLowerCase() == 'version'))
        //     ? 'onlyVersion'
        //     : (this.temporaryBasket.every(el => el.basket_item_type.toLowerCase() == 'media'))
        //         ? 'onlyMedia'
        //         : (this.temporaryBasket.length > 0)
        //             ? 'combined'
        //             : null;

        this.wzSourceType = extraData && extraData.VersionSourceType || this.wzSourceType;

        //will be overritten if extraData has a 'workflowPerItem' property
        if (this.wfSettings) {
            this.applyAllToOneWF = (this.wzSourceType === 'version') //Default for version - true, for media - false;
                ? this.wfSettings.onVersions
                : (this.wzSourceType === 'tape')
                    ? this.wfSettings.onCarriers
                    : this.wfSettings.onMedia;
        }


        if (!extraData) {
            this.startStep = 1;
        } else if (extraData.preset) {
            this.startStep = 2;
            this.selectedPreset = extraData.preset;
            this.dateAsJson = extraData.CompleteByDate || null;
            this.note = extraData.note || null;
            this.removeItemsFromBasket = extraData.removeItemsFromBasket || false;
            this.xmlDocAndSchema = extraData.xmlDocAndSchema || null;
            this.applyAllToOneWF = (extraData.hasOwnProperty('workflowPerItem')) //convert input-data
                ? !extraData.workflowPerItem
                : this.applyAllToOneWF;

            if (this.selectedPreset.SchemaId == 0 || (this.selectedPreset.SchemaId !== 0 && this.xmlDocAndSchema)) {
                this.startStep = 3;
            }
        }

        if (this.showZeroStep) {
            this.cdr.detectChanges();
            this.showActiveWorkflow();
            return;
        } else {
            this.currentStep = this.startStep;
        }

        this.loadStep();
    }

    // initFinal(extraData) {
    //     if (extraData
    //         && extraData.hasOwnProperty('successPlacement')
    //         && extraData.resultsMessage) {
    //         this.successPlacement = !!extraData.successPlacement;
    //         this.resultsMessage = extraData.resultsMessage;
    //         this.resultJob = extraData.resultJob;
    //         this.resultJobRef = extraData.resultJobRef;
    //         this.firstTask = extraData.firstTask;
    //
    //         this.startStep = 3;
    //         this.prevStep = 3;
    //         this.currentStep = 3;
    //         this.toggleOverlay(false);
    //         return;
    //         // self.loadStep();
    //     }
    // }

    /**
     * Hide modal
     * @param $event
     */
    hide($event?) {
        this.modalRef.hide();
        this.toggleOverlay(true);
        this.currentStep = 1;
        this.selectedPreset = null;
        this.resultJob = null;
        this.resultJobRef = null;
        // this.visiblePresets = this.presets;
        if(this.firstTaskRefreshTimer) {
            clearInterval(this.firstTaskRefreshTimer);
        }
    }

    ngOnDestroy() {
        if(this.firstTaskRefreshTimer) {
            clearInterval(this.firstTaskRefreshTimer);
        }
    }

    loadStep() {
        let self = this;
        if (this.currentStep === 1) {
            // Load presets
            // if (this.presets.length === 0) {
            //     self.toggleOverlay(true);
            //     self.basketService.getOrderPresets().subscribe(
            //         result => {
            //             // self.visiblePresets = result;
            //             self.presets = result;
            //             self.toggleOverlay(false);
            //             self.cdr.detectChanges();
            //         });
            // } else {
                this.toggleOverlay(false);
            // }
        } else if (this.currentStep === 2) {
            this.xmlService.getXmlData(this.selectedPreset.SchemaId)
                .subscribe((result: any) => {
                    if (result) {
                        self.selectedSchemaModel = result.SchemaModel;
                        self.selectedXmlModel = result.XmlModel;
                        self.toggleOverlay(false);
                        self.cdr.detectChanges();
                    }
                });
        } else if (this.currentStep === 3) {
            if (!this.placeOrder()) {
                this.goToPreviousStep();
                this.toggleOverlay(false);
            };
        }
        this.cdr.detectChanges();
    }

    goToPreviousStep() {
        if (this.currentStep == this.startStep && this.showZeroStep) {
            this.currentStep = 0;
            this.loadZeroStep();
        } else if (this.selectedPreset && this.selectedPreset.SchemaId !== 0) {
            this.currentStep--;
            // this.visiblePresets = this.presets;
        } else {
            this.currentStep = 1;
            // this.visiblePresets = this.presets;
        }
    }

    goToNextStep() {
        let dtp_wrp = this.dtp;
        this.toggleOverlay(true);
        if (this.currentStep == 0) {
            this.currentStep = this.startStep;
            if (this.initModalParams) {
                this.changeModalSize(this.initModalParams.size);
                this.changeModalTitle(this.initModalParams.title);
            }
        } else if (dtp_wrp && dtp_wrp.getValue() !== null && dtp_wrp.getValue() < this.minDate){
            this.toggleOverlay(false);
            this.notificationRef.notifyShow(2, 'basket.date_not_more_than_now');
            return;
        } else
        // check if schema not exist set step 3
        if (this.selectedPreset && this.selectedPreset.SchemaId !== 0) {
            this.currentStep++;
            if (this.currentStep === 2) {
                if (this.xmlTree && !this.xmlTree.isValid()) {
                    this.notificationRef.notifyShow(2, this.translate.instant('basket.xml_not_valid'));
                    return;
                }
            }
        } else {
            this.currentStep = 3;
        }
        this.loadStep();
    }

    toggleOverlay(bShow) {
        let self = this;
        this.overlayShowed = bShow;
        if (!bShow) {
            setTimeout(function () {
                self.overlayActive = false;
            }, 300);
        } else {
            self.overlayActive = bShow;
        }
    }

    onClickByPresetItem(preset: PresetType) {
        this.selectPreset(preset);
    }

    selectPreset(item: PresetType) {
        this.selectedPreset = item;
    }

    // filterPresets($event) {
    //     let filterValue = $event.target.value.toLowerCase();
    //     if (filterValue !== '') {
    //         this.visiblePresets = this.presets.filter(
    //             (el) => el.Name.toLowerCase().indexOf(filterValue) > -1
    //         );
    //     } else {
    //         this.visiblePresets = this.presets;
    //     }
    // }

    private firstTaskRefreshTimer;
    private taskRefreshInProgress = false;
    placeOrder(): boolean {
        let _this = this;
        //toDo previous data serialize
        // let model = _this.selectedPreset && _this.selectedPreset.SchemaId
        //     ? (_this.xmlDocAndSchema)
        //         ? _this.xmlDocAndSchema
        //         : _this.xmlTree.getXmlModel()
        //     : undefined;
        let model;
        if (this.xmlTree && !this.xmlTree.isValid()) {
            this.xmlTree.ExpandAll();
            return;
        }

        if (this.selectedPreset && this.selectedPreset.SchemaId) {
            model = this.xmlDocAndSchema
        } else if (this.xmlTree && this.xmlTree.isValid()) {
            model = this.xmlTree.getXmlModel();
        }

        let  params, serviceOrderFunc;

        params = {
            preset: _this.selectedPreset,
            note: _this.note || '',
            schemaId: _this.selectedPreset && _this.selectedPreset.SchemaId,
            xmlDocAndSchema: model,
            CompleteByDate: _this.dateAsJson,
            WorkflowPerItem: !_this.applyAllToOneWF, //convert input-data 'WorkflowPerItem'
            VersionSourceType: (_this.wzSourceType == 'version') ? 'version' : null
        };

        if (this.removeItemsFromBasket){
            params.removeItemsFromBasket = _this.removeItemsFromBasket;
            serviceOrderFunc = this.basketService.placeOrder.bind(this.basketService);
        } else {
            if (_this.temporaryBasket.length != 0 && this.clips.length == 0) {
                params.items = this.temporaryBasket;
                serviceOrderFunc = this.basketService.placeOrderFast.bind(this.basketService);
            } else if (this.clips.length !== 0 && _this.selectedItem) {
                params.itemType = _this.selectedItemType;
                params.itemId = _this.selectedItem;
                params.clips = _this.clips;
                serviceOrderFunc = this.basketService.placeOrderClipsFast.bind(this.basketService);
            } else {
                return;
            }
        }

        serviceOrderFunc(params).subscribe((result) => {
            if(!Array.isArray(result) || !result.length) {
                console.error('wfResult is inappropriate for the Array type.');
                return;
            }

            if (result.length == 1) {
                _this.wfResult = result;
                const _result = result[0];
                if (_result.ErrorDesc && _result.JobId == 0) {
                    _this.successPlacement = false;
                    _this.resultsMessage = _result.ErrorDesc;
                    _this.toggleOverlay(false);
                }
                else {
                    let message = _this.translate.instant('basket.success_message');
                    message += '\n\rWorkflow: ';
                    _this.resultJob = _result.JobId;
                    _this.resultJobRef = _result.JobRef && _result.JobRef.length > 0 ?
                        _result.JobRef : _result.JobId;
                    _this.resultsMessage = message;
                    _this.successPlacement = true;
                    _this.firstTask = _result.FirstTask;
                    _this.firstTaskValid = _this.isEnabledTaskDetailPage(_result.FirstTask);
                    _this.firstTaskRefreshTimer = setTimeout(()=>{
                        _this.updateFirstTask(_this, _result.JobId);
                    }, 5000);
                }
            } else if (result.length > 1) {
                _this.successPlacement = true;
                _this.wfResult = result;
                // that.wfResult = that.wfResult.map((el) => {
                //     const item = that.temporaryBasket.find(el1 => el1.ID == el.Source.Id);
                //     Object.assign(el.Source, item);
                //     return el;
                // });
                _this.changeModalSize('lg');
            }



            _this.toggleOverlay(false);
            this.cdr.detectChanges();
        }, (error: HttpErrorResponse) => {
            let message = _this.translate.instant('basket.error_message');
            if (error.error && error.error.Message) {
                let errorLines = error.error.Message.match(/[^\r\n]+/g);
                message = errorLines[0].replace(/.*\(.*\): /, '');
            }
            _this.successPlacement = false;
            _this.resultsMessage = message;
            _this.toggleOverlay(false);
            this.cdr.detectChanges();
        });

        return true;
    }

    updateFirstTask(that, jobId) {
        that.taskRefreshInProgress = true;
        that.cdr.detectChanges();
        that.basketService.checkActiveTask(jobId).subscribe((res)=>{
            clearTimeout(that.firstTaskRefreshTimer);
            that.taskRefreshInProgress = false;
            that.cdr.detectChanges();
            if(res) {
                that.firstTask = res;
                that.firstTaskValid = that.isEnabledTaskDetailPage(res);
            }
            else {
                that.firstTask = null;
            }
            that.firstTaskRefreshTimer = setTimeout(()=>that.updateFirstTask(that, jobId), 5000);
        });
    }

    goToJobDetailFromWizard(jobId = null) {
        // let id = this.resultJob;
        // this.hide();
        this.toggleOverlay(true);
        clearTimeout(this.firstTaskRefreshTimer);
        this.router.navigate(
            [
                appRouter.workflow.detail.substr(
                    0,
                    appRouter.workflow.detail.lastIndexOf('/')),
                (jobId) ? jobId : this.resultJob
            ]
        );
    }

    goToTaskFromWizard() {
        if(!this.isEnabledTaskDetailPage(this.firstTask))
            return;

        clearTimeout(this.firstTaskRefreshTimer);
        if(this.workflowProvider.getTaskRule(this.firstTask)) {
            this.toggleOverlay(true);
        }
        let promise = this.workflowProvider.navigateToPageByTask(this.firstTask);
        if (promise) {
            promise.then(() => {
                this.modalRef.hide();
            });
        }
    }

    callErrorModal(item) {
        const message = item.ErrorDesc;
        if (!message) {
            return;
        }
        const m: ErrorManager = this.emp.getManager();
        m.handleRuntimeError(new Error(item.ErrorDesc), true);
    }

    isEnabledTaskDetailPage(task) {
        let rule = (task) ? this.workflowProvider.getTaskRule(task) : null;
        return !!rule;
    }

    isVisibleWfPerItem() {
        // const flag = ((this.wzSourceType === 'media')
        //     && ((this.basketContentType === 'onlyMedia' && this.temporaryBasket.length >= 2)
        //         || (this.basketContentType === 'onlyVersion' && this.temporaryBasket.length >= 1))
        // ) || ((this.wzSourceType === 'version')
        //     && (this.basketContentType === 'onlyVersion' && this.temporaryBasket.length >= 2));

        const flag = (this.temporaryBasket.length >= 2);

        return flag;
    }

    getFirstTaskMessage() {
        let message = this.isEnabledTaskDetailPage(this.firstTask) ? this.translate.instant('basket.open_first_task') : "";
        return (this.firstTask.TSK_TYPE_text)
            ? message +  (this.isEnabledTaskDetailPage(this.firstTask) ? ' - ' : "") + this.firstTask.TSK_TYPE_text
            : message;
    }

    onSelectDate(data){
        if (data === null) {
            this.dateAsJson = null;
        } else {
            this.dateAsJson = this.dtp.getValueAsJSON();
        }
    }
}
