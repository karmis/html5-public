import {
    ChangeDetectionStrategy,
    Component, ElementRef,
    Injector,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {SlickGridColumn, SlickGridFormatterData, SlickGridRowData, SlickGridTreeRowData} from "../../types";
import {commonFormatter} from "../common.formatter";
import {SlickGridProvider} from '../../providers/slick.grid.provider';
import {Select2ListTypes} from '../../../../controls/select2/types';
import {TaxonomyService} from '../../../taxonomy/services/service';
import * as $ from "jquery";
import {BaseProvider} from "../../../../../views/base/providers/base.provider";
import { IMFXControlTreeProvider } from '../../../../controls/tree/providers/control.tree.provider';

@Component({
    selector: 'tag-formatter-comp',
    templateUrl: './tpl/index.html',
    styleUrls: ['./styles/index.scss'],
    host: {'style': 'width:100%;'},
    providers: [TaxonomyService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TagFormatterComp {
    public injectedData: SlickGridFormatterData;
    private params;
    private provider: SlickGridProvider;
    private column: SlickGridColumn;

    @ViewChild('select', {static: false}) private select;
    private tags: any;
    private text: any;
    private editable: boolean;
    private defSelect2Tags: Select2ListTypes = [];
    private select2Tags: Select2ListTypes = [];
    private dropdownParentType; // "default", "canvas", "formatter"
    private dropdownParent;


    constructor(private injector: Injector,
                private taxonomyService: TaxonomyService,
                private compRef: ElementRef,
                private treeProvider: IMFXControlTreeProvider) {
        this.injectedData = this.injector.get('data');
        this.params = this.injectedData.data;
        this.column = this.params.columnDef;
        this.provider = this.column.__contexts.provider;
        this.editable = this.column.__deps.data.tagsEditable;
        this.dropdownParentType = this.column.__deps.data.dropdownParentType;
        this.dropdownParent = this.getDropdownParentByType(this.dropdownParentType);
        // this.params.data.tagsEditable = this.editable;

    }

    ngOnInit() {
        this.select2Tags = [];
        // this.params = params;
        this.tags = this.params.data.Tags;
        // this.editable = params.data.tagsEditable;
        this.text = '';
        // this.gridOptions = params.api;
        // TODO ANGRY HACK with debounce


        if (this.editable) {
            new Promise((resolve, reject) => {
                resolve();
            }).then(
                () => {
                    const taxSettings = (this.provider.componentContext as any).taxonomySettings;
                    if (taxSettings && taxSettings.TaxonomyValues) {
                        this.buildTaxonomyForSelect([taxSettings.TaxonomyValues], true)
                    } else {
                        this.taxonomyService.getTaxonomy().subscribe((res: any) => {
                            this.buildTaxonomyForSelect(res)
                        })
                    }

                }
            );
        }

    }

    buildTaxonomyForSelect(res, isConfig: boolean = false) {
        // let tags = this.taxonomyService.getLowerLevelValuesOfTaxonomy(res);
        let tags = this.taxonomyService.getAllTagsOfTaxonomy(res, isConfig);
        this.defSelect2Tags = this.select.turnArrayOfObjectToStandart(tags, {
            key: 'ID',
            text: isConfig?'SUBJECT_NAME':'Name',
        });
        $.each(this.defSelect2Tags, (k, tag) => {
            let _tag = this.tags.filter(e=>{return e.TaxonomyId == tag.id})[0];
            if (!_tag) {
                this.select2Tags.push(tag);
            }
        });

        this.select.setData(this.select2Tags, true);
    };

    ngAfterViewInit() {
    }

    getDropdownParentByType(type: string = "default") {
        let types = {
            "default": $(".common-app-wrapper"),
            "canvas": $(this.provider.slick.getCanvasNode()),
            "formatter": $(this.compRef.nativeElement)
        }
        return types[type];
    }


    refresh(params: any): void {
        this.tags = this.params.data.Tags;
        this.text = '';
        if (this.editable) {
            this.select2Tags = [];
            $.each(this.defSelect2Tags, (k, tag) => {
                let _tag = this.tags.filter(e=>{return e.TaxonomyId == tag.id})[0];
                if (!_tag) {
                    this.select2Tags.push(tag);
                }
            });
            this.select.setData(this.select2Tags, true);
        }
    }

    deleteTag(ind) {
        this.tags.splice(ind, 1);
        (<any>this.provider.componentContext).removeTag(this.text);
        this.select2Tags = [];
        $.each(this.defSelect2Tags, (k, tag) => {
            let _tag = this.tags.filter(e=>{return e.TaxonomyId == tag.id})[0]
            if (!_tag) {
                this.select2Tags.push(tag);
            }
        });
        this.select.setData(this.select2Tags, true);
        setTimeout(() => {
            this.select.clearSelected();
            // this.removeTagFromSelect(id);
        })
        // this.gridOptions.resetRowHeights();
    }

    onSelect() {
        let id = this.select.getSelectedId();
        let text = this.select.getSelectedTextByIdForSingle(id);

        let _tag = this.tags.filter(tag => {
            return tag.TaxonomyId == id
        })[0];
        if (!_tag) {
            (<any>this.provider.componentContext).addTag({ID:id, Name: text}, this.params.data);
        }

        setTimeout(() => {
            this.select.clearSelected();
            this.select.setData(this.select.storageData);
            this.removeTagFromSelect(id);
        })
    }

    // onClose() {
    //     // new Promise((resolve, reject) => {
    //     //     resolve();
    //     // }).then(
    //     //     () => {
    //     //         debugger
    //     //         this.select.clearSelected();
    //     //     }
    //     // );
    // }

    onKeyPress($event): void {
        // console.log('onKeyPress');
        switch ($event.which) {
            case 13: {// enter
                if (this.text != '') {
                    (<any>this.provider.componentContext).addTag(this.text);
                    // this.gridOptions.resetRowHeights();
                    this.text = '';
                }
                break;
            }
            default: {
                break;
            }
        }
        $event.currentTarget.focus();
    }

    private removeTagFromSelect(id) {
        this.select.removeDataById(id);
        this.select2Tags = this.select.getData();
    }
}

export function TagFormatter(rowNumber: number, cellNumber: number, value: any, columnDef: SlickGridColumn, dataContext: SlickGridTreeRowData | SlickGridRowData) {
    let ctxs = columnDef.__contexts;

    return commonFormatter(TagFormatterComp, {
        rowNumber: rowNumber,
        cellNumber: cellNumber,
        value: value,
        columnDef: columnDef,
        data: dataContext
    });
}



