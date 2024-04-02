/**
 * Created by Sergey Trizna on 10.01.2016.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Injector,
    ViewEncapsulation
} from '@angular/core';
import { AdvancedSearchDataForControlType, AdvancedSearchDataFromControlType } from '../../../../../../../../../types';
import { AdvancedCriteriaControlLookupUsersModalDataType } from './types';
import { SearchAdvancedCriteriaProvider } from '../../../../../../../providers/provider';
import { UserLookupType } from '../../../../../../../../../../../../services/lookupsearch/types';
import { IMFXModalComponent } from '../../../../../../../../../../../imfx-modal/imfx-modal';
import { IMFXModalProvider } from '../../../../../../../../../../../imfx-modal/proivders/provider';
import { BsModalService } from 'ngx-bootstrap/modal';
import { LookupSearchService } from '../../../../../../../../../../../../services/lookupsearch/common.service';
import { lazyModules } from "../../../../../../../../../../../../app.routes";
import { LoanWizardComponent } from '../../../../../../../../../../../../views/loan/comps/wizard/wizard';
import { LoanService } from '../../../../../../../../../../../../services/loan/loan.service';
import { UsersComponent } from '../../../../../../../../../../users/users';
import { IMFXModalEvent } from '../../../../../../../../../../../imfx-modal/types';

@Component({
    selector: 'advanced-criteria-control-lookupsearch-users-modal',
    templateUrl: 'tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    // providers: [LoanService]
})
export class IMFXAdvancedCriteriaControlLookupSearchUsersModalComponent {
    public data: AdvancedSearchDataForControlType;
    private modal: IMFXModalComponent;
    private modalData: AdvancedCriteriaControlLookupUsersModalDataType;
    private modalValue: string;
    private modalService;
    private lookupSearchTypeVal: string;

    constructor(private injector: Injector,
                private transfer: SearchAdvancedCriteriaProvider,
                private modalProvider: IMFXModalProvider,
                private lookupSearchService: LookupSearchService,
                private cdr: ChangeDetectorRef,
                private loanService: LoanService,) {
        this.data = this.injector.get('data');
        this.modalService = this.injector.get(BsModalService);
        this.modalData = <AdvancedCriteriaControlLookupUsersModalDataType>{
            users: [],
            filteredUser: [],
            paramsOfSearch: ''
        };
    }

    onSelect(data) {
        this.modalData = <AdvancedCriteriaControlLookupUsersModalDataType>{
            users: data.users,
            paramsOfSearch: data.paramsOfSearch,
            user: data.user
        };


        this.transferData(this.modalData);
    }

    ngAfterViewInit() {
        this.lookupSearchTypeVal = this.injector.get('lookupSearchTypeVal');
        // set value from recent search
        if (this.data.criteria.data.value && this.data.criteria.data.value.dirtyValue) {
            this.transferData(this.data.criteria.data.value.dirtyValue);
        } else if (this.data.criteria.data.value && this.data.criteria.data.value.value) {
            this.lookupSearchService.getLookup(this.lookupSearchTypeVal).subscribe((res: any) => {
                const dirtyValue = res.find((el) => {
                    return el.Id == this.data.criteria.data.value.value;
                });
                if (!dirtyValue) {
                    return;
                }

                this.transferData({
                    Forename: dirtyValue.Forename,
                    Id: dirtyValue.Id,
                    Surname: dirtyValue.Surname,
                    UserId: dirtyValue.UserId
                });
            });
        }

        this.cdr.detectChanges();
    }

    afterViewInit() {
        let self = this;
        let value: AdvancedSearchDataFromControlType = this.data.criteria.data.value;
        let content = this.modal.contentView.instance;
        // let valueCriteria = this.transfer.data;
        if (value) {
            let dv = value.dirtyValue;
            if (!dv) {
                content.onReady.subscribe(() => {
                    let user: UserLookupType = content.findUserByUserId(value.value);
                    self.transferData(user);
                });
            } else {
                self.transferData((<UserLookupType>dv));
            }
        }

        content.onSelectEvent.subscribe((selected) => {
            self.onSelect(selected);
        });
    }

    /**
     * Send data to parent comp
     */
    transferData(user: any) {
        if (user.users) {
            user = user.user
        }
        // if (this.modal) {
        //     this.modal.hide();
        // }


        if (this.lookupSearchTypeVal === 'users') {// for user
            if ($.trim(user.Forename) || $.trim(user.Surname)) {
                this.modalValue = user.Forename + ' ' + user.Surname;
            } else {
                this.modalValue = user.UserId;
            }

            this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
                value: user.Id,
                dirtyValue: user,
                humanValue: this.modalValue
            });
        } else if (this.lookupSearchTypeVal === 'na') {// for na
            if (user) {
                this.modalValue = user.Name;
                this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
                    value: user.ENTITY_ID,
                    dirtyValue: user,
                    humanValue: user.NAME + '(id=' + user.ID + ')'
                });
            }
        } else if (this.lookupSearchTypeVal === 'company') {// for company
            this.modalValue = user.TITLE;
            this.transfer.onSelectValue(<AdvancedSearchDataFromControlType>{
                value: user.ID,
                dirtyValue: user,
                humanValue: user.TITLE
            });
        }

        this.cdr.detectChanges();
    }

    showModal() {

        if (this.lookupSearchTypeVal === 'users') {
            this.modal = this.modalProvider.showByPath(lazyModules.users_modal, UsersComponent, {
                size: 'md',
                title: 'ng2_components.ag_grid.select_user',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            }, {
                lookupSearchTypeVal: this.lookupSearchTypeVal
            });

            this.modal.load().then((cr: ComponentRef<UsersComponent>) => {
                this.modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                    if (e.name === 'ok') {
                        this.modal.hide();
                    }
                });

                this.afterViewInit();
            });
        } else if (this.lookupSearchTypeVal === 'na') {
            this.loanService.typeGrid = 'name';
            let modalProvider = this.injector.get(IMFXModalProvider);
            const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.loan_modal, LoanWizardComponent, {
                title: 'Name Authority Lookup',
                size: 'xl',
                position: 'center',
                footerRef: 'modalFooterTemplate'
            });

            modal.load().then((compRef: ComponentRef<LoanWizardComponent>) => {
                const comp: LoanWizardComponent = compRef.instance;
                comp.loanService.itemsAdded.subscribe((items) => {
                    if (items.type === 'name') {
                        // this.afterViewInit();
                        this.transferData(items.items);
                        this.modalValue = (items.items as any).NAME;
                        this.cdr.markForCheck();
                    }

                })
            });
        }
    }
}
