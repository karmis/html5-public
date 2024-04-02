import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ComponentFactoryResolver, Inject,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { OverlayComponent } from '../../../modules/overlay/overlay';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoanService, NewLoanPayload } from '../../../services/loan/loan.service';
import * as moment from 'moment';
import { LoanItems } from '../../loan/constants/constants';
import { lazyModules } from '../../../app.routes';
import { LoanWizardComponent } from '../../loan/comps/wizard/wizard';
import { ActivatedRoute, Router } from '@angular/router';
import { SlickGridService } from '../../../modules/search/slick-grid/services/slick.grid.service';
import { forkJoin, Subscription } from 'rxjs';
import { IMFXControlsSelect2Component, Select2EventType } from '../../../modules/controls/select2/imfx.select2';
import { BasketService } from '../../../services/basket/basket.service';
import { IMFXModalComponent } from '../../../modules/imfx-modal/imfx-modal';
import { NotificationService } from '../../../modules/notification/services/notification.service';
import { IMFXModalProvider } from '../../../modules/imfx-modal/proivders/provider';
import { LoanDetailResponse, LoanSettings } from '../../../services/loan/types';
import { LookupSearchUsersService } from '../../../services/lookupsearch/users.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { LookupService } from '../../../services/lookup/lookup.service';
import { SlickGridProvider } from '../../../modules/search/slick-grid/providers/slick.grid.provider';
import { IMFXVersionsTabComponent } from '../../../modules/search/detail/components/versions.tab.component/imfx.versions.tab.component';
import { IMFXControlsDateTimePickerComponent } from '../../../modules/controls/datetimepicker/imfx.datetimepicker';
import { TranslateService } from '@ngx-translate/core';
import { IMFXRouteReuseStrategy } from '../../../strategies/route.reuse.strategy';
import { Location } from '@angular/common';


@Component({
    moduleId: 'detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        OverlayComponent,
        SlickGridProvider,
        SlickGridService
    ],
    entryComponents: [
        IMFXVersionsTabComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class LoanDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('bookingTypeSelectEl', {static: false}) private bookingTypeSelectEl: IMFXControlsSelect2Component;
    @ViewChild('deliveryMethodSelectEl', {static: false}) private deliveryMethodSelectEl: IMFXControlsSelect2Component;
    @ViewChild('userLookupSelectEl', {static: false}) private userLookupSelectEl: IMFXControlsSelect2Component;
    @ViewChild('returnDatePickerEl', {static: false}) private returnDatePickerEl: IMFXControlsDateTimePickerComponent;
    @ViewChild('requiredDatePickerEl', {static: false}) private requiredDatePickerEl: IMFXControlsDateTimePickerComponent;

    private error: boolean = false;
    tabActive: 'media' | 'versions' | 'carriers' = 'versions';
    loanId;
    isEditMode = false;
    public datetimeFullFormatLocaldatePipe: string = "DD/MM/YYYY HH:mm";
    private dateFormatForServer = 'YYYY-MM-DDTHH:mm:ss';

    form: FormGroup;
    isEditNotes = false;
    dateNow = new Date();

    payloadForm: any = {
        Id: null,
        BookingType: null,
        RequestedBy: null,
        NaDeliverTo: null,
        RequiredFromDate: moment(this.dateNow).format(this.dateFormatForServer),
        ReturnDate: moment(this.dateNow).format(this.dateFormatForServer),
        DeliveryMethod: null,
        CreatedDate: moment(this.dateNow).format(this.dateFormatForServer),
        Notes: '',
        VersionItems: [],
        TapeItems: [],
        MediaItems: [],
        PlacedBy: null,
    };

    private details: LoanDetailResponse;

    bookingTypeSelect = {
        selectedId: null,
        data: [],
        readonly: false
    };

    deliveryMethodSelect = {
        selectedId: null,
        data: [],
        readonly: false
    };

    userLookupSelect = {
        selectedId: null,
        data: [],
        readonly: false
    };

    isUserLookupSelect = false;

    itemsFromBasket = {
        version: [],
        media: [],
        added: false,
        isEmpty: true
    };

    private routeSub: Subscription;
    private formSub: Subscription;
    private itemsSub: Subscription;
    private itemsSubDel: Subscription;
    private basketSub: Subscription;

    constructor(private overlay: OverlayComponent,
                private route: ActivatedRoute,
                private router: Router,
                public location: Location,
                private loanService: LoanService,
                protected cdr: ChangeDetectorRef,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                private profileService: ProfileService,
                private notificationService: NotificationService,
                private translate: TranslateService,
                private injector: Injector,
                private lookupService: LookupService,
                private lookupSearchUsersService: LookupSearchUsersService,
                private basketService: BasketService) {
    }

    ngOnInit(): void {

        this.form = new FormGroup({
            'notes': new FormControl(''),
            'naDeliverTo': new FormControl('', [Validators.required]),
        });

        this.formSub = this.form.valueChanges.subscribe(values => {
            this.payloadForm.Notes = values.notes;
            // this.payloadForm.BookingType = values.type;
            // this.payloadForm.DeliveryMethod = values.deliveryMethod;
        });

        this.routeSub = this.route.parent.params.subscribe((data) => {
            this.loanId = data['id'];
            if (this.loanId === undefined) {
                this.isEditMode = true;
                this.loanService.isEditMode = true;
                forkJoin([
                    this.lookupService.getLookups('BookingTypes'),
                    this.lookupService.getLookups('DeliveryMethods'),
                    this.lookupSearchUsersService.getUsers(),
                    this.loanService.getSettingsLoan()
                ]).subscribe(res => {
                    this.setDataSelects(res[0], res[1], undefined, undefined, res[2]);
                    this.setIdSelects();
                    this.setSettingsPickers(res[3]);

                });
            } else {
                forkJoin([
                    this.loanService.getLoanDetails(data['id']),
                    this.lookupService.getLookups('BookingTypes'),
                    this.lookupService.getLookups('DeliveryMethods'),
                    this.lookupSearchUsersService.getUsers()
                ]).subscribe(res => {
                    // detail
                    this.loanService.isEditMode = false;
                    this.details = res[0];
                    const data = res[0];
                    const bookingTypes = res[1];
                    const deliveryMethods = res[2];
                    const lookupSearch = res[3];

                    const naDeliverToName = data.NaDeliverTo ? data.NaDeliverTo.Name : '';
                    this.form.setValue({
                        // 'type': data.BookingType.ID,
                        // 'deliveryMethod': data.DeliveryMethod.ID,
                        'notes': data.Notes === null ? '' : data.Notes,
                        'naDeliverTo': naDeliverToName
                    });

                    const MediaItems = [];
                    const TapeItems = [];
                    const VersionItems = [];


                    data.DetailItems.forEach(el => {
                        if (el.TYPE === LoanItems.MediaItems) {
                            MediaItems.push(el.Item);
                        }
                        if (el.TYPE === LoanItems.TapeItems) {
                            TapeItems.push(el.Item);
                        }
                        if (el.TYPE === LoanItems.VersionItems) {
                            VersionItems.push(el.Item);
                        }
                    });

                    this.payloadForm = {
                        Id: data.Id,
                        BookingType: data.BookingTypeID,
                        DeliveryMethod: data.DeliveryMethodID,
                        Notes: data.Notes,
                        RequestedBy: data.RequestedBy,
                        CreatedDate: data.CreatedDate,
                        MediaItems,
                        TapeItems,
                        VersionItems,
                        RequiredFromDate: data.RequiredFromDate,
                        ReturnDate: data.ReturnDate,
                        PlacedBy: data.PlacedBy,
                    };
                    // detail end
                    this.setDataSelects(bookingTypes,
                        deliveryMethods,
                        data.BookingTypeID ? data.BookingTypeID : null,
                        data.DeliveryMethodID ? data.DeliveryMethodID : null,
                        lookupSearch,
                        data.RequestedBy ? data.RequestedBy : undefined
                    );
                    this.setIdSelects();
                });
            }

        });

        this.itemsSub = this.loanService.itemsAdded.subscribe(items => {
            if(!items || !items.items || items.items.length === 0) {
                return
            }
            switch (items.type) {
                case "media":
                    return this.payloadForm.MediaItems = items.items;
                case "carriers":
                    return this.payloadForm.TapeItems = items.items;
                case "versions":
                    return this.payloadForm.VersionItems = items.items;
                case "name":
                    const name = (items.items as any).NAME;
                    this.form.get('naDeliverTo').setValue(name);
                    this.loanService.searchName(name).subscribe(res => {
                        this.payloadForm.NaDeliverTo = res.find(el => el.ID == (items.items as any).ENTITY_ID);
                    });
            }
        });

        this.itemsSubDel = this.loanService.itemsDeleted.subscribe(payload => {
            switch (payload.type) {
                case "versions":
                    this.payloadForm.VersionItems = this.payloadForm.VersionItems
                        .filter(el => {
                            return payload.items.find(fEl => fEl.ID === el.ID) === undefined;
                        });
                    break;
                case "media":
                    this.payloadForm.MediaItems = this.payloadForm.MediaItems
                        .filter(el => {
                            return payload.items.find(fEl => fEl.ID === el.ID) === undefined;
                        });
                    break;
                case "carriers":
                    this.payloadForm.TapeItems = this.payloadForm.TapeItems
                        .filter(el => {
                            return payload.items.find(fEl => fEl.ID === el.ID) === undefined;
                        });
                    break;
            }
            this.cdr.detectChanges();
        });

        if (this.isEditMode === false) {
            this.bookingTypeSelect.readonly = true;
            this.deliveryMethodSelect.readonly = true;
            this.userLookupSelect.readonly = true;
        }

        this.basketSub = this.basketService.items.subscribe(updatedItems => {
            if (updatedItems.length > 0) {
                this.itemsFromBasket.version = [];
                this.itemsFromBasket.media = [];

                updatedItems.forEach(el => {
                    switch (el.searchType) {
                        case "versions":
                            this.itemsFromBasket.version.push(el);
                            break;
                        case "Media":
                            this.itemsFromBasket.media.push(el);
                            break;
                    }
                });
                this.itemsFromBasket.isEmpty = this.itemsFromBasket.version.length === 0 && this.itemsFromBasket.media.length === 0;
                console.log(this.itemsFromBasket);

            }
        });
    }

    ngAfterViewInit(): void {


    }

    ngOnDestroy(): void {
        this.routeSub.unsubscribe();
        this.formSub.unsubscribe();
        this.itemsSub.unsubscribe();
        this.itemsSubDel.unsubscribe();
        this.basketSub.unsubscribe();
        this.resetForm(true);
    }

    setIdSelects() {
        if (this.bookingTypeSelectEl === undefined ||
            this.deliveryMethodSelectEl === undefined ||
            this.userLookupSelectEl === undefined
        ) {
            setTimeout(() => {
                this.setIdSelects();
            }, 300);
            return;
        }
        this.bookingTypeSelectEl.setData(this.bookingTypeSelect.data);
        this.bookingTypeSelectEl.setSelected(this.bookingTypeSelect.selectedId);

        this.deliveryMethodSelectEl.setData(this.deliveryMethodSelect.data);
        this.deliveryMethodSelectEl.setSelected(this.deliveryMethodSelect.selectedId);

        this.userLookupSelectEl.setData(this.userLookupSelect.data);
        this.userLookupSelectEl.setSelected(this.userLookupSelect.selectedId);

        this.cdr.detectChanges();
        this.overlay.hideWhole();
    }

    setDataSelects(bookingTypes, deliveryMethods, bookingTypesId?, deliveryMethodsId?, userLookup?, userLookupId?) {

        this.userLookupSelect.data = userLookup
            .filter(el => !(el.Surname.length === 0 && el.Forename.length === 0))
            .map((el: any) => {
                el.id = String(el.UserId);
                el.text = el.Forename + ' ' + el.Surname;
                return el;
            });


        if (userLookupId !== undefined && userLookupId !== null) {
            this.userLookupSelect.selectedId = String(userLookupId);
            this.isUserLookupSelect = true;
        }
        // Type Select
        this.bookingTypeSelect.data = bookingTypes.map((el) => {
            el.text = el.Name;
            el.id = String(el.ID);
            return el;
        });
        if (bookingTypesId)
            this.bookingTypeSelect.selectedId = String(bookingTypesId);
        // Type Select end

        // Delivery Select
        this.deliveryMethodSelect.data = deliveryMethods.map((el) => {
            el.text = el.Name;
            el.id = el.ID;
            return el;
        });
        if (deliveryMethodsId)
            this.deliveryMethodSelect.selectedId = deliveryMethodsId;
        // Delivery Select end
    }

    setSettingsPickers(set: LoanSettings){
        const maxDate = moment(this.dateNow).add(set.RequiredDays + set.MaxLoanPeriod, 'd').toDate();
        const minDate = moment(this.dateNow).add(set.RequiredDays, 'd').toDate();
        // "Return Date" is set to 7 days from the "Required Date"
        const returnDateDefault = moment(this.dateNow).add(set.RequiredDays + set.ReturnDays, 'd').toDate();

        // console.log(maxDate, minDate);
        this.returnDatePickerEl.setOptions({value: returnDateDefault, maxDate, minDate});
        this.requiredDatePickerEl.setOptions({value: minDate, minDate});
        this.onSelectDate(minDate,'requiredFromDate');
        // this.maxDateReturn =
    }

    onChangeSelect(value: Select2EventType, type: 'bookingTypeSelect' | 'deliveryMethodSelect' | 'userLookupSelect') {
        if (value.params.data.length === 0) {
            return;
        }

        switch (type) {
            case "bookingTypeSelect":
                this.bookingTypeSelect.selectedId = value.params.data[0].id;
                this.payloadForm.BookingType = this.bookingTypeSelect.data.find(el => el.ID == value.params.data[0].id);
                break;
            case "deliveryMethodSelect":
                this.deliveryMethodSelect.selectedId = value.params.data[0].id;
                this.payloadForm.DeliveryMethod = this.deliveryMethodSelect.data.find(el => el.ID == value.params.data[0].id);
                break;
            case "userLookupSelect":
                this.userLookupSelect.selectedId = value.params.data[0].id;
                this.payloadForm.RequestedBy = this.userLookupSelect.data.find(el => el.UserId == value.params.data[0].id);
                break;
        }
        if (this.payloadForm.BookingType && this.payloadForm.BookingType.SubType === 1) {
            this.payloadForm.NaDeliverTo = null;
            this.form.get('naDeliverTo').setValue('');
            this.isUserLookupSelect = true;
        } else if (this.payloadForm.BookingType !== null) {
            this.payloadForm.RequestedBy = null;
            this.userLookupSelect.selectedId = null;
            this.isUserLookupSelect = false;
            this.userLookupSelectEl.clearSelect();
        }

    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    clickBack() {
        this.location.back();
    }

    onOpenPopupName() {
        if (this.isEditMode === false)
            return;
        this.loanService.typeGrid = 'name';
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.loan_modal, LoanWizardComponent, {
            title: 'Name Authority Lookup',
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });

        modal.load().then(() => {
        });
    }

    submit() {
        this.loanService.createLoan(this.getPayload())
            .subscribe((newId) => {
                this.notificationService.notifyShow(1, `Loan ${newId} has been created.`, false);
                this.resetForm();
            });
    }

    isFormValid() {
        let isValid = this.deliveryMethodSelect.selectedId !== null &&
            this.bookingTypeSelect.selectedId !== null;

        if (this.isUserLookupSelect) {
            isValid = isValid && (this.userLookupSelect.selectedId !== null);
        } else {
            isValid = isValid && (this.payloadForm.NaDeliverTo !== null);
        }
        return isValid;
    }

    saveNotes() {
        this.loanService.saveNotes(this.loanId, this.form.get('notes').value)
            .subscribe(() => {
                this.notificationService.notifyShow(1, this.translate.instant("loans.saved_notes"));
            });
    }

    changeNotes(event) {
        if (this.isEditNotes === false) {

            const date = moment().format(this.datetimeFullFormatLocaldatePipe);

            let newText = '';
            if (this.form.get('notes').value.length === 0) {
                newText = this.form.get('notes').value + date + '\n' + this.profileService.userData.UserID + '\n';
            } else {
                newText = this.form.get('notes').value + '\n\n' + date + '\n' + this.profileService.userData.UserID + '\n';
            }

            this.form.get('notes').setValue(
                newText
            );

            setTimeout(() => {
                event.target.selectionEnd = event.target.selectionStart = 10000;
            }, 500);

            this.isEditNotes = true;
        }
    }

    showMediaTable(type: 'media' | 'versions' | 'carriers') {
        this.loanService.typeGrid = type;
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.loan_modal, LoanWizardComponent, {
            title: 'Select ' + type.charAt(0).toUpperCase() + type.substr(1),
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then(() => {
        });
    }

    onSelectDate(value, nameDate: 'returnDate' | 'requiredFromDate') {
        switch (nameDate) {
            case "requiredFromDate":
                this.payloadForm.RequiredFromDate = moment(value).format(this.dateFormatForServer);
                break;
            case "returnDate":
                this.payloadForm.ReturnDate = moment(value).format(this.dateFormatForServer);
                break;
            default:
                return console.error('Date not correct');
        }
    }

    getPayload(): NewLoanPayload {
        const newLoan: NewLoanPayload = {
            ...this.payloadForm,
        };
        return newLoan;
    }

    resetForm(onDestroy = false) {
        this.payloadForm = {
            Id: null,
            BookingType: null,
            RequestedBy: null,
            RequiredFromDate: moment(this.dateNow).format(this.dateFormatForServer),
            ReturnDate: moment(this.dateNow).format(this.dateFormatForServer),
            DeliveryMethod: null,
            CreatedDate: moment(this.dateNow).format(this.dateFormatForServer),
            Notes: '',
            VersionItems: [],
            TapeItems: [],
            MediaItems: [],
        };
        this.form.reset();

        this.bookingTypeSelect.selectedId = null;
        this.deliveryMethodSelect.selectedId = null;
        this.userLookupSelect.selectedId = null;

        if (!onDestroy) {
            this.bookingTypeSelectEl.clearSelect();
            this.deliveryMethodSelectEl.clearSelect();
            this.userLookupSelectEl.clearSelect();
            this.cdr.detectChanges();
        }
    }

    addFromBasket() {
        this.payloadForm.MediaItems = this.payloadForm.MediaItems.concat(this.itemsFromBasket.media);
        this.payloadForm.VersionItems = this.payloadForm.VersionItems.concat(this.itemsFromBasket.version);
        this.itemsFromBasket.added = true;
        this.cdr.detectChanges();
    }
}
