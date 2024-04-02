import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {SplashProvider} from '../../../providers/design/splash.provider';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Subscription';
import {IMFXRouteReuseStrategy} from '../../../strategies/route.reuse.strategy';
import {Subject} from "rxjs/Rx";
import {NotificationService} from "../../../modules/notification/services/notification.service";
import {SearchViewsComponent} from "../../../modules/search/views/views";
import {SecurityService} from "../../../services/security/security.service";
import {IMFXModalComponent} from "app/modules/imfx-modal/imfx-modal";
import {ETCheckBoxSelected} from "./types";
import {EventsService} from "../../../services/events/events.service";
import {
    ProductionInfoTabComponent,
    ProductionOnChangeDataType
} from "../../../modules/search/detail/components/production.info.tab.component/production.info.tab.component";
import {ResponseEventDetail} from "../../../services/events/events.types";
import {LocalStorageService} from "ngx-webstorage";
import * as moment from "moment";
import {IMFXModalProvider} from '../../../modules/imfx-modal/proivders/provider';
import {lazyModules} from '../../../app.routes';
import {ChooseItemModalComponent} from '../../../modules/choose.item.modal/choose.item.modal.component';
import {SlickGridRowData} from '../../../modules/search/slick-grid/types';
import {IMFXModalAlertComponent} from '../../../modules/imfx-modal/comps/alert/alert';
import {IMFXModalEvent} from '../../../modules/imfx-modal/types';
import {MultiEventTableComponent, OnSelectEventsType} from "./components/multi.event.table/multi.event.table.component";
import {EventTableComponent} from "./components/event.table/event.table.component";
import * as _ from 'lodash';
import {SlickGridProvider} from "../../../modules/search/slick-grid/providers/slick.grid.provider";
import {DetailEventProvider} from "./providers/detail.event.provider";

@Component({
    moduleId: 'event-request-details',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailEventProvider
    ],
})
export class EventRequestDetailComponent {
    @Input() isMulti: boolean = false;
    @ViewChild('eventRequest', {static: true}) private eventRequest: any;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('overlay', {static: true}) private overlay: any;
    @ViewChild('eventInfoComponent', {static: false}) private eventInfoComponent: ProductionInfoTabComponent;
    @ViewChild('eventVersGrid', {static: false}) private eventVersGrid: EventTableComponent;
    @ViewChild('multiEventGrid', {static: false}) private multiEventGrid: MultiEventTableComponent;

    datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";
    versionModalRef: IMFXModalComponent;

    payload = {
        listVersions: [],
    }
    error: boolean = false;
    text: string = '';
    typeDetails: string = 'event-details';
    destroyed$: Subject<any> = new Subject();
    routeSub: Subscription;
    refreshSubject = new Subject();

    event: ResponseEventDetail = {};
    multiEvents: any = [];


    public routerEventsSubscr: Subscription;
    private isNew: boolean = false;
    private fromProd: boolean = false;
    private eventModes = {
        'Version Mode': 0,
        'Series Mode': 1,
        'Unattached Media Mode': 2,
        'Version Mode:VersionID1': 3,
        'Version Mode:VersionID2': 4,
        'Version Mode:ProgID1': 5,
        'Version Mode:ProgID2': 6,
        'Version Mode:Auto Name': 7,
        'Version Mode:Auto Name NoTitle': 8,
        'Version Mode:Naming Rule': 9
    }
    private eventMode = 0;
    private eventModeReceived = false;
    private utcTimezoneOffset = null;

    private eventInfoView: any = {};
    private lookups: any = {};
    private groupsData: any = {};
    private infoData: any = [];
    private onChangeFieldValue$: Subscription;

    constructor(private cdr: ChangeDetectorRef,
                private splashProvider: SplashProvider,
                private notificationRef: NotificationService,
                private route: ActivatedRoute,
                private router: Router,
                public location: Location,
                private translate: TranslateService,
                private injector: Injector,
                private securityService: SecurityService,
                private eventService: EventsService,
                private localStorage: LocalStorageService,
                private detailEventProvider: DetailEventProvider) {
        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
        let utcOffsetInMilliseconds = this.localStorage.retrieve('utc_timezone_offset');
        this.utcTimezoneOffset = utcOffsetInMilliseconds / 1000 / 60 / 60;
    }

    ngOnInit() {
        this.route.data.subscribe(({isMulti, isNew}) => {
            this.isMulti = isMulti ? true : false;
            this.isNew = isNew ? true : false;
            this.overlay.hideWhole();
            this.overlay.show(this.eventRequest.nativeElement);
            this.overlay.hide(this.eventRequest.nativeElement);
        });
        this.route.parent.params.subscribe((data) => {
            this.fromProd = false;
            if (data.prod_id) {
                this.fromProd = true;
            }
            this.splashProvider.onHideSpinner.emit();
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.routeSub.unsubscribe();
        this.onChangeFieldValue$.unsubscribe();
    }
    private paramsData;
    private eventConfig;
    ngAfterViewInit() {
        this.routeSub = this.route.parent.params.subscribe((data) => {
            this.paramsData = data;
            this.eventModeReceived = false;
            this.eventService.getEventConfig('MFX_LINES_MODE_SCHED_EVENT').subscribe((res: any) => {
                this.eventConfig = res;
                this.eventMode = this.eventModes[this.eventConfig[3]];
                if (!this.isNew) {
                    if (this.fromProd) { // from production
                        this.getEventByProdId(this.paramsData['prod_id'], this.isMulti);
                    } else {
                        this.getEventById(this.paramsData['id'], this.isMulti);
                    }
                } else {
                    if (this.fromProd) {
                        this.event = {
                            PROD_ID: this.paramsData['prod_id'],
                            ID: 0,
                            VERSION_ID: null,
                            MEDIA_ID: null,
                            TITLE_ID: null,
                            EV_MODE: this.eventMode
                        };
                    } else {
                        this.event = {
                            ID: 0,
                            VERSION_ID: null,
                            MEDIA_ID: null,
                            TITLE_ID: null,
                            EV_MODE: this.eventMode
                        };
                    }
                    this.fillConfigData(res);
                }


            }, (error) => {
                this.checkError(error);
            });
        });

        this.onChangeFieldValue$ = this.eventInfoComponent.onChangeFieldValue.subscribe((data: ProductionOnChangeDataType) =>{
            if (this.multiEventGrid) {
                this.multiEventGrid.updateRows([data], this.isNew?'all':'checked');
            }
        });
    }

    getEventByProdId(id: number, isMulti: boolean, updateConfig: boolean = true) {
        this.eventService.getEventByProdId(id).subscribe((event: any) => {
            this.eventModeReceived = true;
            if (isMulti) {
                if (event.length) {
                    this.event = event[0];
                    this.multiEvents = event;
                    if(this.multiEventGrid) {
                        this.multiEventGrid.updateTable(this.multiEvents);
                    }
                } else { // new multi event
                    this.event = {
                        PROD_ID: id,
                        ID: 0,
                        VERSION_ID: null,
                        MEDIA_ID: null,
                        TITLE_ID: null,
                        EV_MODE: this.eventMode
                    };
                    // if(this.eventVersGrid) {
                    //     this.multiEventGrid.updateTable([this.event]);
                    // }
                }
            }
            if (this.event.EV_MODE === null) {
                this.event.EV_MODE = this.eventMode;
            }


            if(updateConfig) {
                this.fillConfigData(this.eventConfig);
            }

        }, (error) => {
            this.checkError(error);
        })
    }

    getEventById(id: number, isMulti: boolean, updateConfig: boolean = true) {
        this.eventService.getEventById(id, isMulti).subscribe((event: any) => {
            this.eventModeReceived = true;
            if (isMulti) {
                if (event.length) {
                    this.event = event[0];
                    this.multiEvents = event.map((row) => {
                        const duration = this.detailEventProvider.calcDuration(row['START_DATETIME'], row['END_DATETIME']);
                        row['DURATION'] = duration
                        row['Duration'] = duration;

                        return row;
                    });
                    if(this.multiEventGrid) {
                       this.multiEventGrid.updateTable(this.multiEvents);
                    }
                }
            } else {
                this.event = event;
                if(this.eventVersGrid) {
                    this.eventVersGrid.updateTable([this.event]);
                }
            }
            if (this.event.EV_MODE === null) {
                this.event.EV_MODE = this.eventMode;
            }
            if(updateConfig) {
                this.fillConfigData(this.eventConfig);
            }
        }, (error) => {
            this.checkError(error);
        });
    }

    fillConfigData(res) {
        this.eventInfoView = res[0].Columns.reduce((obj, item) => Object.assign(obj, {[item.Field]: item}), {});
        this.lookups = res[1];
        this.groupsData = res[2].Groups;
        this.infoData = [];
        let setEmptyArray = false;
        if ((this.eventMode == 0 && this.event.VERSION_ID == null) ||
            (this.eventMode == 1 && this.event.TITLE_ID == null) ||
            (this.eventMode == 2 && this.event.MEDIA_ID == null)) {
            setEmptyArray = true;
        }
        this.payload.listVersions = (this.isNew || setEmptyArray) ? [] : [this.event].map(el => {
            return {
                VERSION_ID: this.eventMode == 0 ? el.VERSION_ID : (this.eventMode == 1 ? el.TITLE_ID : (this.eventMode == 2 ? el.MEDIA_ID : el.VERSION_ID)),
                FULLTITLE: el.FULLTITLE,
                VERSION_NAME: el.VERSION_NAME,
                VERSIONID1: el.VERSIONID1,
                OWNERS_text: el.OWNERS_text,
                NEXT_TX_DATE: el.NEXT_TX_DATE
            }
        });
        Object.keys(this.eventInfoView).forEach((column) => {
            if (column == 'END_DATETIME') {
                this.eventInfoView[column].Label = 'End (ALT)';
                this.eventInfoView["GMT_END_DATETIME"] = {
                    DataType: "DateTime",
                    Field: "GMT_END_DATETIME",
                    GridView: null,
                    ItemsSource: null,
                    Label: "End (GMT)",
                    Rules: null
                }
            }
            if (column == 'START_DATETIME') {
                this.eventInfoView[column].Label = 'Start (ALT)';
                this.eventInfoView["GMT_START_DATETIME"] = {
                    DataType: "DateTime",
                    Field: "GMT_START_DATETIME",
                    GridView: null,
                    ItemsSource: null,
                    Label: "Start (GMT)",
                    Rules: null
                }
            }
        });
        this.groupsData.forEach((group) => {
            let idx = group.Columns.length;
            for (let i = 0; i < idx; i++) {
                if(group.Columns[i]) {
                    if (group.Columns[i].Id == 'END_DATETIME') {
                        if (group.Columns[i+1] && group.Columns[i+1].Id !== 'GMT_END_DATETIME') {
                            group.Columns.splice(i + 1, 0, {
                                Id: "GMT_END_DATETIME",
                                Title: "End (GMT)"
                            });
                            idx++;
                        }

                        if (this.event['END_DATETIME'] !== null) {
                            this.event['GMT_END_DATETIME'] = moment(this.event['END_DATETIME'], "YYYY-MM-DDTHH:mm:ss").subtract(this.utcTimezoneOffset, 'h').format('YYYY-MM-DDTHH:mm:ss');
                        } else {
                            this.event['GMT_END_DATETIME'] = null;
                        }
                    }
                    if (group.Columns[i].Id == 'START_DATETIME') {
                        if (group.Columns[i+1] && group.Columns[i+1].Id !== 'GMT_START_DATETIME') {
                            group.Columns.splice(i + 1, 0, {
                                Id: "GMT_START_DATETIME",
                                Title: "Start (GMT)"
                            });
                            idx++;
                        }

                        if (this.event['START_DATETIME'] !== null) {
                            this.event['GMT_START_DATETIME'] = moment(this.event['START_DATETIME'], "YYYY-MM-DDTHH:mm:ss").subtract(this.utcTimezoneOffset, 'h').format('YYYY-MM-DDTHH:mm:ss');
                        } else {
                            this.event['GMT_START_DATETIME'] = null;
                        }
                    }
                    if (group.Columns[i].Id == 'DURATION') {
                        const duration = this.detailEventProvider.calcDuration(this.event['START_DATETIME'], this.event['END_DATETIME']);
                        if(this.isMulti) {
                            this.multiEvents = this.multiEvents.map((row) => {
                                row['DURATION'] = duration;
                                row['Duration'] = duration;

                                return row;
                            });
                        } else {
                            this.event['DURATION'] = duration;
                            this.event['Duration'] = duration;
                        }
                    }
                    if (group.Columns[i].Id == 'RECURRENCE') {
                        this.event['RECURRENCE'] = this.event['REPEAT_TYPE'];
                    }
                    if (this.eventInfoView[group.Columns[i].Id] && Array.isArray(this.eventInfoView[group.Columns[i].Id].Rules)) {
                        group.Columns[i].Mandatory = !!this.eventInfoView[group.Columns[i].Id].Rules.filter(rule => {
                            return rule.indexOf("Required") !== -1
                        }).length;
                    } else {
                        group.Columns[i].Mandatory = false;
                    }
                }

            }
            this.infoData.push(group.Columns);
        });
        this.eventInfoComponent.Init(this.infoData, this.eventInfoView, this.lookups, this.event);
        this.error = false;
    }

    checkError(error) {
        this.text = error && error.error ? error.error.Error : this.translate.instant('details_item.server_not_work');
        // if (error.status == 500) {
        //     // ошибка сервера
        //     this.text = this.translate.instant('details_item.server_not_work');
        // } else if (error.status == 400) {
        //     // элемент не найден
        //     this.text = this.translate.instant('details_item.media_item_not_found');
        // } else if (error.status == 0) {
        //     // сети нет
        //     this.text = this.translate.instant('details_item.check_network');
        // }
        this._isError();
    }

    changeEvent(data) {
        this.multiEvents = data;
        for (let i = 0; i < this.multiEvents.length; i++) {
            this.multiEvents[i].PROD_ID = this.event.PROD_ID;
            this.multiEvents[i] = Object.assign({}, this.event, this.multiEvents[i]);
            this.multiEvents[i].END_DATETIME = this.event.END_DATETIME;
            this.multiEvents[i].GMT_END_DATETIME = this.event.GMT_END_DATETIME;
            this.multiEvents[i].START_DATETIME = this.event.START_DATETIME;
            this.multiEvents[i].GMT_START_DATETIME = this.event.GMT_START_DATETIME;
            this.multiEvents[i].DURATION = this.event.DURATION;
            this.multiEvents[i].Duration = this.event.Duration;
        }
    }

    selectEventRow(e) {

    }

    changeVersions(data) {
        if (data.length) {
            this.payload.listVersions = data;
            switch (this.eventMode) {
                case 0:
                    this.event.VERSION_ID = data[0].VERSION_ID;
                    break;
                case 1:
                    this.event.TITLE_ID = data[0].VERSION_ID;
                    break;
                case 2:
                    this.event.MEDIA_ID = data[0].VERSION_ID;
                    break;
                default:
                    break;
            }
        } else {
            this.payload.listVersions = data;
            switch (this.eventMode) {
                case 0:
                    this.event.VERSION_ID = null;
                    break;
                case 1:
                    this.event.TITLE_ID = null;
                    break;
                case 2:
                    this.event.MEDIA_ID = null;
                    break;
                default:
                    break;
            }
        }
    }

    selectRow(data) {
        if (!this.isMulti) return;
        if (data.row) {
            let rowId = data.row.ID;
            let newEvent = this.multiEvents.find(event => {
                return event.ID == rowId
            });
            if (newEvent) {
                this.event = newEvent;
                this.eventInfoComponent.Init(this.infoData, this.eventInfoView, this.lookups, newEvent);
            }
        }
    }

    checkBoxVersion(data: ETCheckBoxSelected) {
        console.log(data);
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    clickBack() {
        this.location.back();
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }

    _isError() {
        this.overlay.hide(this.eventRequest.nativeElement);
        this.error = true;
        this.cdr.markForCheck();
    }

    onResize(e) {

    }

    changeDynamicField(data: ProductionOnChangeDataType) {
        if (data.fieldId == 'GMT_END_DATETIME') {
            if (data.fieldValue !== null) {
                let value = moment(data.fieldValue, "YYYY-MM-DDTHH:mm:ss").add(this.utcTimezoneOffset, 'h').format('YYYY-MM-DDTHH:mm:ss');
                this.eventInfoComponent.setValueByFieldId('END_DATETIME', value);
                this.event['END_DATETIME'] = value;
            } else {
                this.event['END_DATETIME'] = null;
            }
        }
        if (data.fieldId == 'END_DATETIME') {
            if (data.fieldValue !== null) {
                let value = moment(data.fieldValue, "YYYY-MM-DDTHH:mm:ss").subtract(this.utcTimezoneOffset, 'h').format('YYYY-MM-DDTHH:mm:ss');
                this.eventInfoComponent.setValueByFieldId('GMT_END_DATETIME', value);
                this.event['GMT_END_DATETIME'] = value;
            } else {
                this.event['GMT_END_DATETIME'] = null;
            }
        }
        if (data.fieldId == 'GMT_START_DATETIME') {
            if (data.fieldValue !== null) {
                let value = moment(data.fieldValue, "YYYY-MM-DDTHH:mm:ss").add(this.utcTimezoneOffset, 'h').format('YYYY-MM-DDTHH:mm:ss');
                this.eventInfoComponent.setValueByFieldId('START_DATETIME', value);
                this.event['START_DATETIME'] = value;
            } else {
                this.event['START_DATETIME'] = null;
            }
        }
        if (data.fieldId == 'START_DATETIME') {
            if (data.fieldValue !== null) {
                let value = moment(data.fieldValue, "YYYY-MM-DDTHH:mm:ss").subtract(this.utcTimezoneOffset, 'h').format('YYYY-MM-DDTHH:mm:ss');
                this.eventInfoComponent.setValueByFieldId('GMT_START_DATETIME', value);
                this.event['GMT_START_DATETIME'] = value;
            } else {
                this.event['GMT_START_DATETIME'] = null;
            }
        }
        // set duration
        const duration = this.detailEventProvider.calcDuration(this.event['START_DATETIME'], this.event['END_DATETIME']);
        this.event['DURATION'] = duration;
        this.event['Duration'] = duration
        this.eventInfoComponent.setValueByFieldId('DURATION', this.event['DURATION']);
        this.event[data.fieldId] = data.fieldValue;
        if (this.isMulti) {
            const sgp: SlickGridProvider = this.multiEventGrid.slickGridComp.provider;
            const rows: SlickGridRowData[] = this.isNew?sgp.getData():this.multiEventGrid.slickGridComp.provider.getCheckedRowsObjects();
            rows.forEach((row: SlickGridRowData) => {
                const index = sgp.dataView.getIdxById(sgp.getId(row));
                this.multiEvents[index].END_DATETIME = this.event.END_DATETIME;
                this.multiEvents[index].GMT_END_DATETIME = this.event.GMT_END_DATETIME;
                this.multiEvents[index].START_DATETIME = this.event.START_DATETIME;
                this.multiEvents[index].GMT_START_DATETIME = this.event.GMT_START_DATETIME;
                this.multiEvents[index].DURATION = this.event.DURATION;
                this.multiEvents[index].Duration = this.event.Duration;
            });

        }
    }

    changeDynamicFields({fieldValue, fieldId}) {
        var result = Object.assign({}, fieldValue);
        Object.keys(result).forEach(k => {
            if (k == "OWNERS") {
                result[k] = result[k] ? result[k].map((k) => {
                    return k.Id
                }).join(";") : "";
            }

            this.event[k] = result[k];
        });
        if (this.isMulti && fieldId) {
            for (let i = 0; i < this.multiEvents.length; i++) {
                this.multiEvents[i][fieldId] = this.event[fieldId];
            }
        }
    }

    private validation() {
        let validationResult = true;
        let validationResultMessage = "";

        if (this.isMulti && this.multiEvents.length == 0) {
            validationResult = false;
            validationResultMessage = "Please add events";
            this.notificationRef.notifyShow(2, "Event not valid! " + validationResultMessage);
            return validationResult;
        }

        let data = this.eventInfoComponent.isValid();
        validationResult = validationResult && data.valid;
        validationResultMessage += data.validationMessage + " ";

        if (!validationResult) {
            this.notificationRef.notifyShow(2, "Event not valid! " + validationResultMessage);
        }

        return validationResult;
    }

    onSave() {
        if (this.validation()) {
            if (this.isNew) {
                let result = Object.assign({}, this.event);
                Object.keys(result).forEach(k => {
                    if (this.event[k] == null) {
                        delete this.event[k];
                    }
                });
            }
            delete this.event['GMT_START_DATETIME'];
            delete this.event['GMT_END_DATETIME'];
            delete this.event['DURATION'];

            if (this.isMulti) {
                const dataToSave: SlickGridRowData[] = this.multiEventGrid.slickGridComp.provider.getClearDataAsArray(_.cloneDeep(this.multiEvents));
                this.eventService.saveMultiEvent(this.event.PROD_ID || 0, dataToSave).subscribe(
                    (res: any) => {
                        if (res && res.ErrorCode && res.Result == false) {
                            this.notificationRef.notifyShow(2, this.translate.instant(res.Error));
                        } else {
                            let message = this.translate.instant('events_detail.saved_successfully');
                            this.notificationRef.notifyShow(1, message);
                            if (this.isNew) {
                                // this.event.ID = IdList[0];
                                this.isNew = false;
                                if (this.isMulti) {
                                    this.router.navigate(['events', 'multi', 'detail', res.IdList[0]]);
                                }
                            } else {
                                // if (this.fromProd) { // from production
                                    this.getEventByProdId(this.event.PROD_ID, this.isMulti, false);
                                // } else {
                                //     this.getEventById(this.paramsData['id'], this.isMulti, false);
                                // }
                                this.cdr.detectChanges();
                            }
                        }
                    },
                    (err) => {
                        let error = err.error ? err.error.Error : this.translate.instant("common.error_message");
                        this.notificationRef.notifyShow(2, error, false);
                    });
            } else {
                this.event.id = this.event.ID; // important for back
                this.eventService.saveEvent(this.event).subscribe(
                    (res: any) => {
                        if (res && res.ErrorCode && res.Result == false) {
                            this.notificationRef.notifyShow(2, this.translate.instant(res.Error));
                        } else {
                            let message = this.translate.instant('events_detail.saved_successfully');
                            this.notificationRef.notifyShow(1, message);
                            if (this.isNew) {
                                this.event.ID = res.ID;
                                this.isNew = false;
                                if (this.isMulti) {
                                    this.router.navigate(['events', 'multi', 'detail', this.event.ID]);
                                } else {
                                    this.router.navigate(['events', 'single', 'detail', this.event.ID]);
                                }
                            } else {
                                this.getEventById(this.paramsData['id'], this.isMulti);
                                // if (this.fromProd) { // from production
                                //     this.getEventByProdId(this.paramsData['prod_id'], this.isMulti);
                                // } else {
                                //     this.getEventById(this.paramsData['id'], this.isMulti);
                                // }
                            }
                        }
                    },
                    (err) => {
                        let error = err.error ? err.error.Error : this.translate.instant("common.error_message");
                        this.notificationRef.notifyShow(2, error, false);
                    });
            }
        } else {
        }
    }

    onAttachProduction() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.choose_item_table, ChooseItemModalComponent, {
            title: 'Select Production',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {
            IsDoubleSelected: true,
            isDisabledMultiSelected: true,
            isDisabledAutoClose: true
        });
        modal.load().then((cr) => {
            let modalContent: ChooseItemModalComponent = cr.instance;
            modalContent.typeGrid = 'production'
            modalContent.addedNewItem.subscribe((rows: SlickGridRowData[]) => {
                const productionId = rows[0].ID;
                // this.eventService.checkAttachProd(productionId).subscribe(res => {
                //     if (res) {
                //         this.showAlreadyTied(productionId);
                //     } else {
                //         this.event.PROD_ID = productionId;
                //         this.multiEvents.forEach(el => {
                //             el.PROD_ID = productionId;
                //         });
                //         this.eventInfoComponent.Init(this.infoData, this.eventInfoView, this.lookups, this.event);
                //         modalContent.closeModal();
                //     }
                //
                // })
                this.event.PROD_ID = productionId;
                this.multiEvents.forEach(el => {
                    el.PROD_ID = productionId;
                });
                this.eventInfoComponent.Init(this.infoData, this.eventInfoView, this.lookups, this.event);
                modalContent.closeModal();
                this.cdr.detectChanges();
            })
        });
    }

    private showAlreadyTied(prodId) {
        let modalProvider = this.injector.get(IMFXModalProvider);
        let modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.alert_modal,
            IMFXModalAlertComponent, {
                size: 'md',
                title: 'Error',
                position: 'center',
                footer: 'ok'
            });
        modal.load().then(cr => {
            let modalContent: IMFXModalAlertComponent = cr.instance;
            modalContent.setText(
                'production.already_tied',
                { prodId }
            );
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                } else if (e.name === 'hide') {
                    modal.hide();
                }
            });
        });
    }

    onSelectEvents($event: OnSelectEventsType) {
        // this.multiEvents =
    }
}
