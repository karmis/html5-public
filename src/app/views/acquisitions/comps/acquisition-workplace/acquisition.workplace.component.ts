import {
    ChangeDetectorRef,
    Component,
    ComponentRef,
    ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { AcquisitionService } from '../../services/acquisition.service';
import { TreeStandardListTypes } from '../../../../modules/controls/tree/types';
import { IMFXControlsTreeComponent } from '../../../../modules/controls/tree/imfx.tree';
import { EditAcquisitionModalComponent } from './modals/edit.acquisition.modal/edit.acquisition.modal.component';
import { EditArticleModalComponent } from './modals/edit.article.modal/edit.article.modal.component';
import { NewContactModalComponent } from './modals/new.contact.modal/new.contact.modal.component';
import { OverlayComponent } from '../../../../modules/overlay/overlay';
import { IMFXModalProvider } from '../../../../modules/imfx-modal/proivders/provider';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { IMFXRouteReuseStrategy } from '../../../../strategies/route.reuse.strategy';
import { lazyModules } from '../../../../app.routes';

@Component({
    selector: 'acquisition-workspace',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        AcquisitionService,
    ]
})

export class AcquisitionsWorkspaceComponent {
    @ViewChild('overlayWrapper', {static: false}) overlayWrapper: any;
    @ViewChild('overlay', {static: false}) overlay: OverlayComponent;
    @ViewChild('articlesHeader', {read: ElementRef, static: false}) articlesHeader: ElementRef;
    @ViewChild('articlesBody', {read: ElementRef, static: false}) articlesBody: ElementRef;
    datetimeFullFormatLocaldatePipe: string = 'DD/MM/YYYY HH:mm';
    @ViewChild('tree', {static: false}) private tree: IMFXControlsTreeComponent;
    private id;
    private data = null;
    private mainData = null;
    private activeData = null;
    private activeTab = 0;
    private containerData = null;
    private articlesData = null;

    private acquisitionLabels = {
        DESCRIPTION: 'Description',
        ALT_ID1: 'Transfer Job Number',
        EXT_REF: 'External Ref',
        FILE_NO: 'File Number',
        CHANNEL_TEXT: 'Client',// CHANNEL: 'Client',
        ORIGIN: 'Origin',
        ID: 'Acquisition ID',
        SYSTEM_STATUS: 'System Status',
        CREATED: 'Created',
        CREATED_BY: 'Created By',
        UPDATED: 'Updated',
        UPDATED_BY: 'Updated By',
        DRAFT_CONTRACT_PROV: 'Contract Prov',
        CATEGORY_TEXT: 'Category',// CATEGORY: 'Category',
        TYPE_TEXT: 'Type',// TYPE: 'Type',
        STATUS_TEXT: 'Status',// STATUS: 'Status',
        SOURCE_TEXT: 'Source',// SOURCE: 'Source',
        COPYRIGHT_TEXT: 'Copyright',// COPYRIGHT: 'Copyright',
        COLLECTION_TEXT: 'Collection',// COLLECTION: 'Collection',
        DISPOSAL_RIGHTS_TEXT: 'Disposal Authority',// DISPOSAL_RIGHTS: 'Disposal Authority',
        CASE_OFFICER_TEXT: 'Case Officer',// CASE_OFFICER: 'Case Officer',
        DEPARTMENT: 'Section',
        DRAFT_CONTRACT: 'Draft Contract'
    };

    private articleLabels = {
        DESCRIPTION: 'Description',
        ARTICLE_MEDIUM_TEXT: 'Medium',// ARTICLE_MEDIUM: 'Medium',
        ARTICLE_SUBMEDIUM_TEXT: 'Submedium',// ARTICLE_SUBMEDIUM: 'Submedium',
        ARCTICLE_FORM_TEXT: 'Category/Form',// ARTICLE_FORM: 'Category/Form',
        ARTICLE_FORMAT_TEXT: 'Article Format',// ARTICLE_FORMAT : 'Article Format',
        ARTICLE_ITEMTYPE_TEXT: 'Item Type', // ARTICLE_ITEMTYPE: 'Item Type',
        ARTICLE_QTY_EXPECTED: 'Quantity Expected',
        ARTICLE_QTY_RECEIVED: 'Quantity Received',
        ARTICLE_QTY_REMAINING: 'Quantity Remaining',
        ARTICLE_CONDITION: 'Condition',
        ARTICLE_MATERIAL: 'Material',
        OBJECT_ID: 'Article ID',
        STATUS_TEXT: 'Status',// STATUS: 'Status',
        CREATED: 'Created',
        CREATED_BY: 'Created By',
        ARTICLE_BARCODE: 'Article Barcode'
    };

    private proposalLabels = [
        'Supplier',
        'Title',
        'Category',
        'Category Code',
        'Status',
        'Pitching Date',
        'Evaluation Mark'
    ];

    constructor(protected injector: Injector,
                protected router: Router,
                protected service: AcquisitionService,
                protected cdr: ChangeDetectorRef,
                protected route: ActivatedRoute,
                protected location: Location,
                protected modalProvider: IMFXModalProvider,
                private translate: TranslateService) {
        this.route.params.subscribe(params => {
            this.id = params.id;
        });

        this.translate.get('common.date_time_full_format_localdate_pipe').subscribe(
            (res: string) => {
                this.datetimeFullFormatLocaldatePipe = res;
            });
    }

    isFirstLocation() {
        return (this.router.routeReuseStrategy as IMFXRouteReuseStrategy).isFirstLocation();
    }

    clickBack() {
        this.location.back();
    }

    newContactShow() {
        const modal = this.modalProvider.showByPath(lazyModules.new_contact_modal_comp, NewContactModalComponent, {
            size: 'lg',
            title: 'contacts.new_contact',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr: ComponentRef<NewContactModalComponent>) => {
            const content = cr.instance;
            content.toggleOverlay(true);
            content.setData();
        })
    }

    editAcquisitionShow() {
        const modal = this.modalProvider.showByPath(lazyModules.edit_acq_modal_comp, EditAcquisitionModalComponent, {
            size: 'lg',
            title: 'acquisitions.edit_acq'
        });

        modal.load().then((cr: ComponentRef<NewContactModalComponent>) => {
            const content = cr.instance;
            content.toggleOverlay(true);
            content.setData();

            modal.modalEvents.subscribe((res: any) => {
                if (res && res.name == 'ok') {
                    this.acquisitionSave(res);
                }
            });
        });
    }

    editArticleShow() {
        const modal = this.modalProvider.showByPath(lazyModules.edit_article_modal_comp, EditArticleModalComponent, {
            size: 'lg',
            title: 'acquisitions.edit_article'
        });

        modal.load().then((cr: ComponentRef<EditArticleModalComponent>) => {
            const content = cr.instance;
            content.toggleOverlay(true);

            modal.modalEvents.subscribe((res: any) => {
                if (res && res.name == 'ok') {
                    this.articleSave(res);
                }
            });
        })

    }

    acquisitionSave(data) {

    }

    articleSave(data) {

    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.overlay.show(this.overlayWrapper.nativeElement);
        this.initData();
    }

    onSelect(e) {
        if (e.data.targetType == 'title') {
            const tmp = e.data.node.data.dirtyObj;
            const self = this;
            this.containerData = [];
            this.activeData = tmp;
            if (tmp.OBJECT_TYPE == 3) {
                $.each(tmp, function (i, v) {
                    if (i.toUpperCase() in self.articleLabels)
                        self.containerData.push({Key: self.articleLabels[i.toUpperCase()], Value: v});
                });
                self.containerData.push({Key: self.articleLabels['STATUS_TEXT'], Value: self.mainData['STATUS_TEXT']});
            } else if (tmp.OBJECT_TYPE == 0) {
                $.each(self.mainData, function (i, v) {
                    if (i.toUpperCase() in self.acquisitionLabels)
                        self.containerData.push({Key: self.acquisitionLabels[i.toUpperCase()], Value: v});
                });
            } else {
                $.each(tmp, function (i, v) {
                    if (i.toUpperCase() in self.acquisitionLabels)
                        self.containerData.push({Key: self.acquisitionLabels[i.toUpperCase()], Value: v});
                });
            }
        }
    }

    ngAfterViewChecked() {
        if (this.articlesHeader != undefined && this.articlesBody != undefined) {
            // setTimeout(()=>{
            const headers = $(this.articlesHeader.nativeElement).find('th');
            const rows = $(this.articlesBody.nativeElement).find('.fake-rows');
            for (let i = 0; i < rows.length; i++) {
                rows[i].style.width = this.articlesHeader.nativeElement.Width + 'px';
                const columns = $(rows[i]).find('.fake-cell');
                for (let j = 0; j < headers.length; j++) {
                    if (headers.length - 1 == j) {
                        columns[j].style.width = headers[j].offsetWidth - 20 + 'px';
                    } else {
                        columns[j].style.width = headers[j].offsetWidth + 'px';
                    }

                }
            }
            // },0);
        }
    }

    changeTab(tab) {
        this.activeTab = tab;
    }

    toggleTree(expand) {
        if (expand) {
            this.tree.expandAll();
        } else {
            this.tree.collapseAll();
        }
    }

    /*
      0 – Acquisition (root node in treeview)
      1 – Container
      3 – Article
      4 – XML Document
     */
    filterData(arr, term, self) {
        const matches = [];

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].OBJECT_TYPE == term) {
                matches.push(arr[i]);
            }
            if (arr[i].Children && arr[i].Children.length > 0) {
                const tmp = self.filterData(arr[i].Children, term, self);
                for (let j = 0; j < tmp.length; j++) {
                    matches.push(tmp[j]);
                }
            }
        }
        return matches;
    }

    initData() {
        const self = this;
        this.service.getDetail(self.id).subscribe((res: any) => {
            if (res && res.Objects && res.Objects.length > 0) {
                self.data = res.Objects;
                self.mainData = res.Acq;
            } else {
                self.data = null;
            }

            if (self.data != null) {
                debugger;
                setTimeout(() => {
                    self.articlesData = self.filterData(self.data, 3, self);
                    const normData: TreeStandardListTypes = self.tree.turnArrayOfObjectToStandart(self.data, {
                        key: 'ACQ_ID',
                        title: 'DESCRIPTION',
                        children: 'Children',
                    });
                    self.data = normData;
                    self.tree.setSource(this.data);

                    self.overlay.hide(self.overlayWrapper.nativeElement);
                    // $(self.overlayWrapper.nativeElement).hide();
                    self.cdr.detectChanges();
                }, 0)
            }
        });
    }
}
