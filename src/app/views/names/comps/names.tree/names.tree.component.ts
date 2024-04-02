import {
    ChangeDetectorRef,
    Component, ElementRef, EventEmitter, Injector, Input, ViewChild, ViewEncapsulation
} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {IMFXControlsTreeComponent} from "../../../../modules/controls/tree/imfx.tree";
import {NamesService} from "../../services/names.service";
import {TreeStandardListTypes} from "../../../../modules/controls/tree/types";
import {IMFXModalComponent} from "../../../../modules/imfx-modal/imfx-modal";
import {IMFXModalProvider} from "../../../../modules/imfx-modal/proivders/provider";
import {NamesModalComponent} from "../../modals/names.modal/names.modal.component";
import {LookupService} from "../../../../services/lookup/lookup.service";
import {lazyModules} from "../../../../app.routes";


@Component({
    selector: 'names-tree',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        NamesService,
        IMFXModalProvider
    ]
})

export class NamesTreeComponent {

    @Input("searchView") searchView: boolean = false;
    @ViewChild('tree', {static: false}) public tree: IMFXControlsTreeComponent;
    @ViewChild('overlayWrapper', {static: false}) public overlayWrapper: ElementRef;
    @ViewChild('detailOverlayWrapper', {static: false}) public detailOverlayWrapper: ElementRef;
    public onSelectAuthoring:EventEmitter<any>  = new EventEmitter<any>();
    public doSearch:EventEmitter<any>  = new EventEmitter<any>();

    private mainData: TreeStandardListTypes = [];
    private data = [];
    private activeData = null;
    private addModal: IMFXModalComponent;
    private editModal: IMFXModalComponent;
    private countries = [];

    constructor(protected injector: Injector,
                protected router: Router,
                protected service: NamesService,
                protected cdr: ChangeDetectorRef,
                protected lokupService: LookupService,
                protected modalProvider: IMFXModalProvider,
                protected route: ActivatedRoute) {
    }

    public compContext = this;
    public lazyLoadFn(event, data, compContext: NamesTreeComponent): JQueryDeferred<any> {
        const def = jQuery.Deferred();
        compContext.service.getChildData(data.node.data.dirtyObj["ENTITY_ID"], data.node.data.dirtyObj["PARENT_E_ID"]).subscribe((resInner) => {
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

    ngOnInit() {
        this.doSearch.subscribe((data) => {
            this.toggelOverlay(true);
            this.service.getData(data).subscribe((res: any) => {
                this.data = res.Data;

                this.mainData = this.tree.turnArrayOfObjectToStandart(this.data, {
                    key: 'ID',
                    title: 'NAME',
                    children: 'Children',
                    lazy: 'C_FLAG'
                });

                this.tree.setSource(this.mainData);
                this.toggelOverlay(false);
                this.cdr.detectChanges();
            });
        });
        this.lokupService.getLookups('Countries').subscribe((res: any) => {
            if(res && res.length > 0) {
                this.countries = res;
                this.cdr.detectChanges();
            }
        });
    }

    ngAfterViewInit() {
        this.tree.onRenderNode.subscribe((res: any) =>{
            var comp = $(res.data.node.li).find('span.fancytree-title').find('div.highlighted-company');
            if(res.data.node.data.dirtyObj.Type == "Company" && comp.length == 0) {
                $(res.data.node.li).find('span.fancytree-title').prepend('<div class="highlighted-company"></div>');
            }


            var pers = $(res.data.node.li).find('span.fancytree-title').find('div.highlighted-person');
            if(res.data.node.data.dirtyObj.Type == "Person" && pers.length == 0) {
                $(res.data.node.li).find('span.fancytree-title').prepend('<div class="highlighted-person"></div>');
            }

        });
        this.tree.onLazyLoad.subscribe((res: any) =>{
            var node = res.data.node;

            this.service.getChildData(node.data.dirtyObj["ENTITY_ID"], node.data.dirtyObj["PARENT_E_ID"]).subscribe((resInner)=>{
                var result = this.tree.turnArrayOfObjectToStandart(resInner.Data, {
                    key: 'ID',
                    title: 'NAME',
                    children: 'Children',
                    lazy: 'C_FLAG'
                });

                result = result.filter(function(v) {
                    var tmpNode = node;
                    var existed = tmpNode.key ? parseInt(tmpNode.key) == parseInt(v['key']) : false;
                    if(!existed) {
                        while(tmpNode.parent.key && tmpNode.parent.key.indexOf("root") == -1) {
                            tmpNode = tmpNode.parent;
                            if(parseInt(tmpNode.key) == parseInt(v['key'])) {
                                existed = true;
                                break;
                            }
                        }
                    }
                    return !existed;
                });

                res.dfd.resolve(result);
            });
        });
    }

    getCountry(id) {
        if (id == null || this.countries.length == 0) {
            return "";
        }
        const country = this.countries.find(item => item.Id === id);
        return country ? country.Value : '';
    }

    ngOnDestroy() {
        this.doSearch.unsubscribe();
    }

    toggelOverlay(show) {
        if(show) {
            $(this.overlayWrapper.nativeElement).show();
        }
        else {
            $(this.overlayWrapper.nativeElement).hide();
        }
    }
    toggelDetailOverlay(show) {
        if(this.searchView)
            return;
        if(show) {
            $(this.detailOverlayWrapper.nativeElement).show();
        }
        else {
            $(this.detailOverlayWrapper.nativeElement).hide();
        }
    }

    onSelect(e) {
        if (e.data.targetType == "title") {
            this.toggelDetailOverlay(true);
            this.service.getDetail(e.data.node.data.dirtyObj.ID).subscribe((res: any) => {
                this.activeData = res;
                console.log(this.activeData);
                this.cdr.detectChanges();
                this.toggelDetailOverlay(false);
                this.onSelectAuthoring.emit(e.data.node.data.dirtyObj);
            });
        }
    }
    toggleTree(expand) {
        if (expand) {
            this.tree.expandAll();
        }
        else {
            this.tree.collapseAll();
        }
    }

    filterData(arr, term, self) {
        var matches = [];

        for (var i = 0; i < arr.length; i++) {
            if (arr[i].OBJECT_TYPE == term) {
                matches.push(arr[i]);
            }
            if (arr[i].Children && arr[i].Children.length > 0) {
                let tmp = self.filterData(arr[i].Children, term, self);
                for (var j = 0; j < tmp.length; j++) {
                    matches.push(tmp[j]);
                }
            }
        }
        return matches;
    }

    showAddModal() {
        this.addModal = this.modalProvider.showByPath(lazyModules.names_modal, NamesModalComponent, {
            size: 'lg',
            title: 'names.addmodal.title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {namesContext: this});
        this.addModal.load().then(() => {
            // this.addModal.modalEvents.subscribe((res: any) => {
            //     debugger;
            // });
        })

    }

    showEditModal() {
        this.editModal = this.modalProvider.showByPath(lazyModules.names_modal, NamesModalComponent, {
            size: 'lg',
            title: 'names.editmodal.title',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, {namesContext: this, nameData: this.activeData});
        this.editModal.load().then(() => {
            // this.addModal.modalEvents.subscribe((res: any) => {
            //     debugger;
            // });
        })
    }
}
