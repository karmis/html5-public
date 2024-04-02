import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, EventEmitter,
    Injector, Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { ViewsProvider } from "../../../../../../modules/search/views/providers/views.provider";
import { CoreSearchComponent } from "../../../../../../core/core.search.comp";
import { SlickGridService } from "../../../../../../modules/search/slick-grid/services/slick.grid.service";
import { SlickGridProvider } from "../../../../../../modules/search/slick-grid/providers/slick.grid.provider";
import { MediaAppSettings } from "../../../../../media/constants/constants";
import { ActivatedRoute, Router } from "@angular/router";
import { SecurityService } from "../../../../../../services/security/security.service";
import { SearchSettingsProvider } from "../../../../../../modules/search/settings/providers/search.settings.provider";
import { LoanService } from "../../../../../../services/loan/loan.service";
import { SlickGridComponent } from "../../../../../../modules/search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../../../../modules/search/slick-grid/slick-grid.config";
import { SlickGridColumn } from "../../../../../../modules/search/slick-grid/types";
import { TreeFormatter } from "../../../../../../modules/search/slick-grid/formatters/tree/tree.formatter";
import { AboutSystemRow, PackageInfo } from "../../../../../../modules/system-about/models";
import { SearchFormProvider } from "../../../../../../modules/search/form/providers/search.form.provider";
import { IMFXControlsTreeComponent } from "../../../../../../modules/controls/tree/imfx.tree";
import { NamesService } from "../../../../../names/services/names.service";
import { IMFXModalComponent } from "../../../../../../modules/imfx-modal/imfx-modal";
import { TreeStandardItemType } from '../../../../../../modules/controls/tree/types';

@Component({
    selector: 'wizard-name-table',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        ViewsProvider,
        SlickGridProvider,
        SlickGridService,
        SearchFormProvider,
        NamesService
    ]
})

export class WizardNameTableComponent extends CoreSearchComponent {
    @ViewChild('tree', {static: false}) public tree: IMFXControlsTreeComponent;
    @ViewChild('elSearchString', {static: false}) public elSearchString;
    @Output() onSave = new EventEmitter();

    public doSearch: EventEmitter<any> = new EventEmitter<any>();
    private modalRef: IMFXModalComponent;

    constructor(protected injector: Injector,
                protected cdr: ChangeDetectorRef,
                private loanService: LoanService,
                private nameService: NamesService) {
        super(injector);
        this.modalRef = this.injector.get('modalRef');
    }

    data = [];
    treeData = [];
    treeSelected = null;

    ngOnInit() {
        this.doSearch.subscribe((data) => {
            this.nameService.getData(data).subscribe((res) => {
                this.data = res.Data;

                this.treeData = this.tree.turnArrayOfObjectToStandart(this.data, {
                    key: 'ID',
                    title: 'NAME',
                    children: 'Children',
                    lazy: 'C_FLAG'
                });

                this.tree.setSource(this.treeData);
                this.cdr.detectChanges();
            });
        });
    }

    ngAfterViewInit() {
        this.tree.onRenderNode.subscribe((res) => {
            var comp = $(res.data.node.li).find('span.fancytree-title').find('div.highlighted-company');
            if (res.data.node.data.dirtyObj.Type == "Company" && comp.length == 0) {
                $(res.data.node.li).find('span.fancytree-title').prepend('<div class="highlighted-company"></div>');
            }


            var pers = $(res.data.node.li).find('span.fancytree-title').find('div.highlighted-person');
            if (res.data.node.data.dirtyObj.Type == "Person" && pers.length == 0) {
                $(res.data.node.li).find('span.fancytree-title').prepend('<div class="highlighted-person"></div>');
            }

        });
        // this.tree.onLazyLoad.subscribe((res) => {
        //     var node = res.data.node;
        //
        //     this.nameService.getChildData(node.data.dirtyObj["ENTITY_ID"]).subscribe((resInner) => {
        //         var result = this.tree.turnArrayOfObjectToStandart(resInner.Data, {
        //             key: 'ID',
        //             title: 'NAME',
        //             children: 'Children',
        //             lazy: 'C_FLAG'
        //         });
        //
        //         result = result.filter(function (v) {
        //             var tmpNode = node;
        //             var existed = tmpNode.key ? parseInt(tmpNode.key) == parseInt(v['key']) : false;
        //             if (!existed) {
        //                 while (tmpNode.parent.key && tmpNode.parent.key.indexOf("root") == -1) {
        //                     tmpNode = tmpNode.parent;
        //                     if (parseInt(tmpNode.key) == parseInt(v['key'])) {
        //                         existed = true;
        //                         break;
        //                     }
        //                 }
        //             }
        //             return !existed;
        //         });
        //
        //         res.dfd.resolve(result);
        //     });
        // });
        setTimeout(_ => this.elSearchString.nativeElement.focus(), 0);
    }

    public compContext = this;
    public lazyLoadFn(event, data, compContext: WizardNameTableComponent): JQueryDeferred<any> {
        const def = jQuery.Deferred();
        compContext.nameService.getChildData(data.node.data.dirtyObj["ENTITY_ID"], data.node.data.dirtyObj["PARENT_E_ID"]).subscribe((resInner) => {
            var result = compContext.tree.turnArrayOfObjectToStandart(resInner.Data, {
                key: 'ID',
                title: 'NAME',
                children: 'Children',
                lazy: 'C_FLAG'
            });

            result = result.filter(function (v) {
                var tmpNode = data.node;
                var existed = tmpNode.key ? parseInt(tmpNode.key) == parseInt(v['key']) : false;
                if (!existed) {
                    while (tmpNode.parent.key && tmpNode.parent.key.indexOf("root") == -1) {
                        tmpNode = tmpNode.parent;
                        if (parseInt(tmpNode.key) == parseInt(v['key'])) {
                            existed = true;
                            break;
                        }
                    }
                }
                return !existed;
            });

            def.resolve(result);
        });
        data.result = def;
        // const id = data.node.data.dirtyObj.Id;
        // compContext.getChildren(id, false).subscribe((res: TreeStandardItemType[]) => {
        //     def.resolve(res);
        // });
        // data.result = def;

        return def;
    }

    onSearch(event: HTMLFormElement) {
        if (event.value.searchString.length > 0) {
            // this.loanService.searchName(event.value.searchString).subscribe(Data => {
            //     this.slickGridComp.provider.buildPageByData({Data});
            // });
            this.doSearch.emit(event.value.searchString);
        }

    }

    onSelectTree(e, submit = false) {
        if (e.data.targetType == "title") {
            this.treeSelected = e.data.node.data.dirtyObj;
            if (submit) {
                this.onSave.emit();
            }
        }
    }

    getSelectedRows() {
        return this.treeSelected;
    }
}
