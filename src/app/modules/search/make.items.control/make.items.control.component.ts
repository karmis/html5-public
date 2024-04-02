import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef, HostListener,
    Injector,
    Input, OnDestroy,
    OnInit,
    QueryList, Renderer2,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { SlickGridComponent } from '../slick-grid/slick-grid';
import { IMFXModalProvider } from '../../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../imfx-modal/imfx-modal';
import { lazyModules } from '../../../app.routes';
import { MakeItemsModalComponent } from '../detail/components/production.make.list.component/comps/make.items.modal/make.items.modal.component';
import { IMFXModalEvent } from '../../imfx-modal/types';
import { NotificationService } from '../../notification/services/notification.service';
import { ProductionService } from '../../../services/production/production.service';
import {
    PROD_ITEM_MADE_STATUS,
    PROD_ITEM_MAKE_STATUS,
    PRODUCTION_TEMPLATE,
    PRODUCTION_TEMPLATE_CONFIG
} from '../../../views/detail/production/constants';
import { SecurityService } from '../../../services/security/security.service';
import { ProductionDetailProvider } from "../../../views/detail/production/providers/production.detail.provider";
import { Observable, Subscription } from "rxjs";
import { ChooseItemModalComponent } from "../../choose.item.modal/choose.item.modal.component";
import { SlickGridRowData } from "../slick-grid/types";
import { MakeListModalComponent } from "../../make.list.modal/make.list.modal.component";
import { Router } from "@angular/router";
import * as _ from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';
import { ProductionSelectVersionModalComponent } from '../../production.select.version.modal/production.select.version.modal.component';

@Component({
    selector: 'make-items-control',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    providers: [],
    encapsulation: ViewEncapsulation.None
})
export class MakeItemsControlComponent implements OnInit, OnDestroy {
    @Input('slickGridComp') slickGridComp: SlickGridComponent;

    productionLoadedSub: Subscription;
    showBtns = {
        isMultiLineEvents: true,
        isCleanMaster: true,
        isDelete: true,
        isApprove: true,
        isReject: true,
        isStart: true,
        isRestart: true,
        isComplete: true,
        isAbort: true,
        isAddVersion: true,
        isAddTitle: true,
        isChangeTitle: true,
        isChangeMasterOrVersion: true,
    };
    disabledBtns = {
        isAddVersion: false,
        isChangeVersion: false, // isChangeTitle
        isDelete: false,
        isAddMaster: false, //not use
        isAddMasterVersion: true, // statusButtons().isAddVersion
        isChangeMasterOrVersion: false, // isEditItem
        isMultiLineEvents: false,

        isRemake: false,

        isApprove: false,
        isReject: false,
        isStart: false,
        isRestart: false,
        isComplete: false,
        isAbort: false,
    };
    displayWidth: number = 0;
    hiddenIds: number[] = [];
    winResizeObs: ResizeObserver = null;
    clickListener: any = null;
    itemSelected = false;
    arraySubs: Subscription[] = [];

    @ViewChildren('ddItem') private ddItem: QueryList<ElementRef>;
    @ViewChildren('inlineItem') private inlineItem: QueryList<ElementRef>

    @ViewChild('inlineBlock', {static: false}) private inlineBlockEl: ElementRef;
    @ViewChild('checkTrigger', {static: false}) private checkTrigger: ElementRef;
    @ViewChild('ddWrapper', {static: false}) private ddWrapper: ElementRef;
    @ViewChild('ellipsedEl', {static: false}) private ellipsedEl: ElementRef;

    constructor(private injector: Injector,
                private notificationService: NotificationService,
                private productionService: ProductionService,
                private productionDetailProvider: ProductionDetailProvider,
                private router: Router,
                private securityService: SecurityService,
                private cdr: ChangeDetectorRef,
                private renderer: Renderer2) {
    }

    ngOnInit() {
        this.productionLoadedSub = this.productionDetailProvider.productionLoadedSub.subscribe(() => {
            this.setBtns();
        });
        this.arraySubs.push(this.productionDetailProvider.makeItemSelected.subscribe(data => {
            this.itemSelected = !!data;
            this.updateStatusBtns();
            this.cdr.detectChanges();
        }));

        this.arraySubs.push(this.productionDetailProvider.makeMultiSelected.subscribe(data => {
            this.updateStatusBtns();
            this.cdr.detectChanges();
        }))

        this.arraySubs.push(this.productionDetailProvider.madeItemSelected.subscribe(item => {
            if (item) {
                switch (item.STATUS) {
                    default:
                    case PROD_ITEM_MADE_STATUS.COMPLETE:
                    case PROD_ITEM_MADE_STATUS.TRANSFERRING:
                    case PROD_ITEM_MADE_STATUS.TRANSFER_FAILED:
                        this.disabledBtns.isRemake = true;
                        break;
                    case PROD_ITEM_MADE_STATUS.MADE:
                    case PROD_ITEM_MADE_STATUS.AWAITING_APPROVAL:
                    case PROD_ITEM_MADE_STATUS.UNAPPROVED:
                    case PROD_ITEM_MADE_STATUS.AWAITINGQC:
                    case PROD_ITEM_MADE_STATUS.QC_FAILED:
                    case PROD_ITEM_MADE_STATUS.AWAITING_FULFILMENT:
                    case PROD_ITEM_MADE_STATUS.AWAITING_CONSISTENCY:
                    case PROD_ITEM_MADE_STATUS.CONSISTENCY_FAILED:
                    case PROD_ITEM_MADE_STATUS.MADE_FAILED:
                    case PROD_ITEM_MADE_STATUS.FULFILMENT_FAILED:
                    case PROD_ITEM_MADE_STATUS.REMAKE:
                        this.disabledBtns.isRemake = false;
                        break;
                }
            } else {
                this.disabledBtns.isRemake = true;
            }
            this.cdr.detectChanges();
        }))
    }

    private wrapperResizeEl: Element;

    ngAfterViewInit() {
        setTimeout(() => {
            this.updateList();
            this.wrapperResizeEl = $(this.inlineBlockEl.nativeElement).parents('.lm_content')[0];
            this.blockResizeObs.observe(this.wrapperResizeEl);
        }, 300)
        this.resizeBtns();
    }

    ngOnDestroy() {
        this.arraySubs.forEach(el => {
            el.unsubscribe();
        })

        if (this.productionLoadedSub) {
            this.productionLoadedSub.unsubscribe();
        }
        if (this.winResizeObs) {
            this.winResizeObs.unobserve(document.body);
        }
        if (this.blockResizeObs) {
            this.blockResizeObs.unobserve(this.wrapperResizeEl);
        }
        this.clickListener(); // unsubscribe
    }

    setBtns() {
        if (this.productionDetailProvider.templateConfig) {
            switch (this.productionDetailProvider.templateConfig.ConfigTypeText.toLocaleLowerCase()) {
                case PRODUCTION_TEMPLATE_CONFIG.VERSIONS:
                    this.showBtns.isCleanMaster = false;
                    this.showBtns.isAddVersion = false;
                    this.showBtns.isMultiLineEvents = false;
                    this.showBtns.isChangeMasterOrVersion = false;
                    break;
                case PRODUCTION_TEMPLATE_CONFIG.CLEAN_MASTERS:
                    this.showBtns.isAddTitle = false;
                    this.showBtns.isChangeTitle = false;
                    this.showBtns.isMultiLineEvents = false;
                    break;
                case PRODUCTION_TEMPLATE_CONFIG.EVENTS:
                    this.showBtns.isMultiLineEvents = true;
                    this.showBtns.isAddTitle = false;
                    this.showBtns.isChangeTitle = false;
                    this.showBtns.isCleanMaster = false;
                    this.showBtns.isChangeMasterOrVersion = false;
                    this.showBtns.isAddVersion = false;
                    this.showBtns.isDelete = false;

                    break;
                default:
                    break;
            }
            this.cdr.detectChanges();
        }
    }

    updateStatusBtns() {

        let isAddVersion = false;
        let isChangeVersion = true; // isChangeTitle
        let isDelete = true;
        let isAddMaster = false; //not use
        let isAddMasterVersion = true; // statusButtons().isAddVersion
        let isChangeMasterOrVersion = true; // isEditItem
        let isMultiLineEvents = true;

        let isRemake = true;

        let isApprove = true;
        let isReject = true;
        let isStart = true;
        let isRestart = true;
        let isComplete = true;
        let isAbort = true;

        if (this.slickGridComp && this.slickGridComp.provider && this.slickGridComp.provider.slick) {
            const data = this.slickGridComp.provider.getSelectedRowData();
            if (data) {
                switch (data.ITEM.STATUS) {
                    default:
                    case PROD_ITEM_MAKE_STATUS.NONE: // 0 "None"
                    case PROD_ITEM_MAKE_STATUS.COMPLETED: //Completer
                        break;

                    case PROD_ITEM_MAKE_STATUS.WISH: // 1 "Wish"
                        isApprove = false;
                        isReject = false;
                        break;

                    case PROD_ITEM_MAKE_STATUS.AWAITING_APPROVAL: // 2 "Awaiting Approval"
                        isReject = false;
                        isAbort = false;
                        break;

                    case PROD_ITEM_MAKE_STATUS.REJECTED:
                        isApprove = false;
                        break;


                    case PROD_ITEM_MAKE_STATUS.NOT_STARTED: // "Not Started"
                        isReject = false;
                        isStart = false;
                        isAbort = false;
                        break;

                    case PROD_ITEM_MAKE_STATUS.RESTARTED:
                    case PROD_ITEM_MAKE_STATUS.STARTED: // 4 "Started"
                        isRestart = false;
                        isAbort = false;
                        break;

                    case PROD_ITEM_MAKE_STATUS.PUBLISHING_EDL:
                        isRestart = false;
                        isAbort = false;
                        break;
                    case PROD_ITEM_MAKE_STATUS.IN_PRODUCTION: // In Production
                        isRestart = false;
                        isComplete = false;
                        isAbort = false;
                        break;
                    case PROD_ITEM_MAKE_STATUS.FAILED: //Failed
                        isRestart = false;
                        break;
                    case null: // new item
                        isDelete = false;
                }


                const isMulti = this.productionDetailProvider.makeMultiSelected.value ? this.productionDetailProvider.makeMultiSelected.value.length > 1 : false;

                isChangeVersion = data.ITEM.STATUS !== PROD_ITEM_MAKE_STATUS.WISH || isMulti;

                isDelete = !(data.ITEM.StatusText === '' || data.ITEM.__ISNEW || data.ITEM.StatusText === 'Wish' || data.ITEM.StatusText === 'None');

                isAddMasterVersion = data.parent !== null || !this.itemSelected;
                isChangeMasterOrVersion = !(data.ITEM.StatusText === '' || data.ITEM.__ISNEW || data.ITEM.StatusText === 'Wish' || data.ITEM.StatusText === 'None') || isMulti;

                isApprove = isApprove ? true : !this.securityService.hasPermissionByName('make-item-approve');

                if (data.ITEM.__ISNEW) { //new item
                    isStart = true;
                    isApprove = true;
                    isReject = true;
                    isRestart = true;
                    isComplete = true;
                    isAbort = true;
                }
            } else {
                isChangeVersion = true;
                isDelete = true;
                isChangeMasterOrVersion = true;
            }
        }

        isMultiLineEvents = this.productionDetailProvider.typePage === 'create';

        this.disabledBtns = {

            isAddVersion,
            isChangeVersion,
            isDelete,
            isAddMaster,
            isAddMasterVersion ,
            isChangeMasterOrVersion,
            isMultiLineEvents,

            isRemake,

            isApprove,
            isReject,
            isStart,
            isRestart,
            isComplete,
            isAbort,
        }
    }

    modalNewItem(type: 'version' | 'master') {
        let modalProvider = this.injector.get(IMFXModalProvider);
        const title = type === 'version' ? 'Add Version' : 'Add Clean Master';

        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.make_list_modal, MakeListModalComponent, {
            title,
            size: 'sm',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr) => {
            let modalContent: MakeListModalComponent = cr.instance;
            modalContent.submit.subscribe((form) => {
                // @ts-ignore
                this.slickGridComp.provider.addNewMakeItem(type, form);
            })
        });
    }

    modalChangeItemVersionorMaster() {
        let modalProvider = this.injector.get(IMFXModalProvider);
        const newItem = this.productionDetailProvider.getItem();
        const title = 'Edit Item';

        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.make_list_modal, MakeListModalComponent, {
            title,
            size: 'sm',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr) => {
            let modalContent: MakeListModalComponent = cr.instance;

            modalContent.setData({
                duration: newItem.Duration_text,
                title: newItem.TITLE,
                mediaTypeId: newItem.MEDIA_FILE_TYPE,
                notes: newItem.NOTES
            })
            modalContent.submit.subscribe((form) => {
                this.productionDetailProvider.changeMakeItem(form);
            })
        });
    }

    showModalMakeItems(title, type) {
        let dataOld = this.productionDetailProvider.makeMultiSelected.value;

        switch (title) {
            case 'Delete':
                this.slickGridComp.provider.removeSelectedRows(dataOld.map(el => el.id));
                // this.onUnSelectRowSubs = this.slickGridComp.provider.onUnSelectRow.subscribe(() => {
                    this.productionDetailProvider.deleteVersionMakeItems();
                    // this.onUnSelectRowSubs.unsubscribe()
                // });
                break;

            case 'Approve':
            case 'Start':
            case 'Restart':
            case 'Complete':
                this.productionService.makeItems(dataOld.map(el => el.ID), title, name)
                    .subscribe((dataServ) => {
                        dataOld.forEach((row, i) => {
                            delete dataServ[i]['EntityKey'];
                            delete dataServ[i]['$id'];
                            const item = this.productionDetailProvider.getItemById(row.ID, 'ID');
                            if(item) {
                                item.StatusText = dataServ[i].StatusText;
                                item.STATUS = dataServ[i].STATUS;

                                row.ITEM.STATUS = dataServ[i].STATUS;
                                row.ITEM.StatusText = dataServ[i].StatusText;
                                row.STATUS_TEXT = dataServ[i].StatusText;
                                this.slickGridComp.provider.getDataView().changeItem(row.id, row);
                            }
                        });

                        const dataNew = this.slickGridComp.provider.getMergeDataviewData([]);
                        this.slickGridComp.provider.setOriginalData(dataNew);
                        this.slickGridComp.provider.updateData(dataOld, dataNew);
                        // this.slickGridComp.provider.resize();
                        this.updateStatusBtns();
                        this.cdr.detectChanges();
                        this.notificationService.notifyShow(1, "Success", true, 1200);
                    }, error => {
                        this.notificationService.notifyShow(2, 'Error');
                    })
                return

            case 'Abort':
            default:
                let modalProvider = this.injector.get(IMFXModalProvider);
                const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.production_make_items_modal, MakeItemsModalComponent, {
                    title,
                    size: 'sm',
                    position: 'center',
                    footerRef: 'modalFooterTemplate'
                });
                modal.load().then((cr: ComponentRef<MakeItemsModalComponent>) => {
                    let modalContent: MakeItemsModalComponent = cr.instance;
                    modalContent.loadData(type, dataOld);
                    modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                        if (e.name == 'ok_and_save') {
                            const name = e.state.name;
                            this.productionService.makeItems(dataOld.map(el => el.ID), title, name)
                                .subscribe((dataServ) => {
                                    dataOld.forEach((row, i) => {
                                        const item = this.productionDetailProvider.getItemById(row.ID, 'ID');
                                        if (item) {
                                            item.StatusText = dataServ[i].StatusText;
                                            item.STATUS = dataServ[i].STATUS;

                                            row.ITEM.STATUS = dataServ[i].STATUS;
                                            row.ITEM.StatusText = dataServ[i].StatusText;
                                            row.STATUS_TEXT = dataServ[i].StatusText;
                                            this.slickGridComp.provider.getDataView().changeItem(row.id, row);
                                        }
                                    });

                                    const dataNew = this.slickGridComp.provider.getMergeDataviewData([]);
                                    this.slickGridComp.provider.setOriginalData(dataNew);
                                    this.slickGridComp.provider.updateData(dataOld, dataNew);
                                    this.updateStatusBtns();
                                    this.cdr.detectChanges();
                                    this.notificationService.notifyShow(1, "Success", true, 1200);
                                }, error => {
                                    this.notificationService.notifyShow(2, 'Error');
                                })


                            modalContent.closeModal();

                        }
                    })
                });
                break
        }

    }

    showMediaTable(): Observable<Observable<any>> {
        const type = 'versions';
        return new Observable((obs) => {
            let modalProvider = this.injector.get(IMFXModalProvider);
            const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.production_select_version, ProductionSelectVersionModalComponent, {
                title: 'Select ' + type.charAt(0).toUpperCase() + type.substr(1),
                size: 'xl',
                position: 'center',
                footerRef: 'modalFooterTemplate',

            }, {
                IsDoubleSelected: true,
                isDisabledMultiSelected: true
            });
            modal.load().then((cr) => {
                let modalContent: ProductionSelectVersionModalComponent = cr.instance;
                modalContent.typeGrid = 'versions'
                obs.next(modalContent.addedNewItem);
                obs.complete();
            })
        });
    }

    private blockResizeObs: ResizeObserver = null;

    resizeBtns() {
        this.winResizeObs = new ResizeObserver(entries => {
            this.updateList()
        });
        this.winResizeObs.observe(document.body);
        this.blockResizeObs = new ResizeObserver(entries => {
            this.updateList()
        });
        // ;
        // https://stackoverflow.com/questions/43642915/angular-2-remove-hostlistener
        this.clickListener = this.renderer.listen(document, 'click', event => {
            const ddEl = $(this.ddWrapper.nativeElement);
            if (event.target.id != 'check-trigger') { // close
                this.checkTrigger.nativeElement.checked = false
                $(event.target).parents('.lm_content').removeAttr('style');
                ddEl.removeAttr('style');
            } else { // open
                new Promise((r) => {
                    r()
                }).then(() => {
                    $(event.target).parents('.lm_content').css({'z-index': 2, 'overflow': 'visible'});
                    const offsetTop = ddEl.offset().top;
                    const ddHeight = ddEl.height();
                    const windowHeight = $(window).height();
                    const diff = windowHeight - offsetTop - ddHeight;
                    if (diff < 0) {
                        ddEl.css({'top': (windowHeight - ddHeight) + 'px'});
                    }
                });
            }
        });
    }

    updateList() {
        this.cdr.detach();
        const inlineEls: ElementRef[] = this.inlineItem.toArray();
        this.hiddenIds = Object.keys(inlineEls).map((k) => parseInt(k));

        const ddEls: ElementRef[] = this.ddItem.toArray();
        this.displayWidth = this.visibleWidth($(this.inlineBlockEl.nativeElement)) - 60;
        // hide all
        inlineEls.forEach((el: ElementRef, k: number) => {
            el.nativeElement.style.display = 'none';
            ddEls[k].nativeElement.style.display = 'block';
        });
        $.each(inlineEls, (k: number, el: ElementRef) => {
            const w: number = $(el.nativeElement).width();
            if (this.displayWidth >= w) {
                this.displayWidth = this.displayWidth - w;
                inlineEls[k].nativeElement.style.display = 'inline-block';
                ddEls[k].nativeElement.style.display = 'none';
                this.hiddenIds.splice(0, 1);
            }
        });

        this.cdr.detectChanges();
    }

    visibleWidth($el) {
        let elH = $el.outerWidth(),
            H = $(window).width(),
            r = $el[0].getBoundingClientRect(), t = r.top, b = r.bottom;
        return Math.max(0, t > 0 ? Math.min(elH, H - t) : Math.min(b, H));
    }

    onOpenMultiLineEventsPage() {
        this.productionDetailProvider.isChange = true;
        this.router.navigate(['events', 'multi', 'detail', 'production', this.productionDetailProvider.payload.ID]);
        setTimeout(() => {
            this.productionDetailProvider.isChange = false;
        }, 1000)
    }

    onDelete() {
        this.showModalMakeItems('Delete', 'btn-confirm');
    }

    onAddCleanMaster() {
        this.modalNewItem('master');
    }

    onAddVersion() {
        if (!this.itemSelected) {
            this.cdr.detectChanges();
            return
        }
        this.modalNewItem('version');
    }

    onEditItem() {
        this.modalChangeItemVersionorMaster();
    }

    onChangeTitle() {
        this.showMediaTable().subscribe(obs => {
            obs.subscribe((rows: SlickGridRowData[]) => {
                console.log(rows);
                this.productionDetailProvider.changeVersionMakeItems(rows);
            })
        });
    }

    onAddTitle() {
        this.showMediaTable().subscribe(obs => {
            obs.subscribe((rows: SlickGridRowData[]) => {
                console.log(rows);
                this.productionDetailProvider.addVersionMakeItems(rows);
                // this.productionDetailProvider.makeItemSelected.next(this.productionDetailProvider.getItem());
            })
        });
    }

    onApprove() {
        this.showModalMakeItems('Approve', 'btn-confirm');
    }

    onReject() {
        this.showModalMakeItems('Reject', 'btn-confirm');
    }

    onStart() {
        this.showModalMakeItems('Start', 'btn-confirm');
    }

    onRestart() {
        this.showModalMakeItems('Restart', 'btn-confirm');
    }

    onComplete() {
        this.showModalMakeItems('Complete', 'btn-confirm');
    }

    onAbort() {
        this.showModalMakeItems('Abort', 'btn-confirm');
    }

    onRemake() {
        this.productionDetailProvider.onSubmitRemake.next();
    }

}
