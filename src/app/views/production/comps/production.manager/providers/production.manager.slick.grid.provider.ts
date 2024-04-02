import { SlickGridProvider } from '../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { ComponentRef, Inject, Injector } from '@angular/core';
import { appRouter } from '../../../../../constants/appRouter';
import { SlickGridEventData, SlickGridResp } from '../../../../../modules/search/slick-grid/types';
import { MakeOfficer, OfficerType, ProductionTypeDetail } from '../../../constants/production.types';
import { IMFXModalProvider } from '../../../../../modules/imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../../modules/imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../app.routes';
import { MakeOfficerModalComponent } from '../../make.officer.modal/make.officer.modal.component';
import { ProductionService } from '../../../../../services/production/production.service';
import { SearchModel } from '../../../../../models/search/common/search';
import { AdvancedSearchModel } from '../../../../../models/search/common/advanced.search';
import { WorkflowComponent } from '../../../../workflow/workflow.component';
import { IMFXModalEvent } from '../../../../../modules/imfx-modal/types';
import { Observable } from 'rxjs';
import { ProductionStatuses } from '../../../../../modules/search/slick-grid/formatters/production-status/constants/productions';
import {SlickProvidersHelper} from "../../../../../modules/abstractions/slick.providers.helper";

export class ProductionManagerSlickGridProvider extends SlickGridProvider {
    selectedSubRow?: { id?: number, index?: number } = {};

    constructor(@Inject(Injector) public injector: Injector,
                private productionService: ProductionService) {
        super(injector);
    }

    onRowDoubleClicked(data: SlickGridEventData) {
        if (this.config.options.type && data && (data.row as any)) {
            let productionTypeDetail: ProductionTypeDetail = null;

            switch (this.config.options.module.searchType) {
                case 'myproductions':
                    productionTypeDetail = 'production-my';
                    break
                case 'productionmanager':
                    productionTypeDetail = 'production-manager';
                    break
            }


            this.router.navigate([
                appRouter.production.prod_detail.split('/')[0],
                productionTypeDetail,
                (data.row as any).ProductionId
            ]);
        }
    }

    clickOnIcon(event): boolean {
        return ($(event.target).hasClass('icons-addbasket') ||
            $(event.target).hasClass('icons-inbasket') ||
            $(event.target).hasClass('media-basket-button') ||
            $(event.target).hasClass('icons-more') ||
            $(event.target).hasClass('settingsButton')) &&
            $(event.target).closest('.slick-cell').hasClass('selected');
    }

    showModalMakeOfficer(title, type: OfficerType) {
        const data = this.getSelectedRowsData();
        // this.refreshGridLazy();
        title = this.translate.instant(title)
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.production_make_officer_modal, MakeOfficerModalComponent, {
            title,
            size: 'sm',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });

        modal.load().then((cr: ComponentRef<MakeOfficerModalComponent>) => {
            let modalContent: MakeOfficerModalComponent = cr.instance;
            modalContent.loadData(data, type, this);
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name == 'ok_and_save') {
                    const py: MakeOfficer = e.state.payload;

                    this.productionService.makeOfficer(py)
                        .subscribe(res => {
                                data.forEach(row => {
                                    if (type === 'Assistant') {
                                        row.ASSISTANT = py.OfficerId;
                                    } else {
                                        row.COMPLIANCE = py.OfficerId;
                                    }
                                    this.getDataView().changeItem(row.id, row);
                                })
                                this.notificationService.notifyShow(1, "Success", true, 1200);
                                modal.hide();
                            },
                            error => showError(error),
                            () => {
                                modalContent.isValid = true;
                            }
                        )

                }
                const showError = (error) => this.notificationService.notifyShow(2, "Error", true, 1200);
            })
        });
    }

    isApprove() {
        const data = this.getSelectedRowsData();
        let status = false;
        if (data.length >= 1) {
            data.some(row => {
                const can = row.STATUS === ProductionStatuses.WISH || row.STATUS === ProductionStatuses.REJECTED;
                if (!can) {
                    status = false;
                    return false
                } else {
                    status = true;
                }
            })
        }
        return status
    }

    approve() {
        const ids = this.getSelectedRowsData().map(el => el.ID);
        this.productionService.makeOfficerApprove(ids).subscribe(res => {
            let errorMessage = '';
            let errorMessageCopy = '';
            let isError = false;

            if (res.MakeItemDetails && res.MakeItemDetails.length > 0) {
                res.MakeItemDetails.forEach(el => {
                    const text = `${el.MakeItemId} ID: ${el.ActionTakenMessage}`;
                    errorMessage +=  text + '<br/>';
                    errorMessageCopy += text;
                });
                isError = true;
            }
            this.refreshGridLazy(ids).subscribe(() => {
                if (isError) {
                    this.notificationService.notifyShow(2, {text: errorMessage, toClipboard: errorMessageCopy});
                } else {
                    this.notificationService.notifyShow(1, "Success", true, 1200);
                }
            });
        }, error => {
            this.notificationService.notifyShow(2, 'Error', true, 1200);
        });
    }

    refreshGridLazy(ids: number[] = [], message = true) {
        return SlickProvidersHelper.refreshGridLazy(this, ids, message);
    }

    private getSelectedSubRow() {
        return this.selectedSubRow;
    }


}
