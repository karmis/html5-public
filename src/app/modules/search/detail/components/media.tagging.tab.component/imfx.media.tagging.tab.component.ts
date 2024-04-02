import {
    Component, ViewEncapsulation, Input, Injectable, Inject, ChangeDetectorRef,
    EventEmitter, ViewChild, Injector, Output
} from '@angular/core';
import { DetailService } from "../../../../../modules/search/detail/services/detail.service";

import { Select2ItemType, Select2ListTypes } from "../../../../controls/select2/types";

import { MediaDetailMediaTaggingResponse } from '../../../../../models/media/detail/mediatagging/media.detail.media.tagging.response';
import { IMFXControlsLookupsSelect2Component } from "../../../../controls/select2/imfx.select2.lookups";
import {
    SlickGridConfig, SlickGridConfigModuleSetups, SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../../slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../../slick-grid/services/slick.grid.service";
import { TaggingSlickGridProvider } from "./providers/tagging.slick.grid.provider";
import { SearchFormProvider } from "../../../form/providers/search.form.provider";
import { SlickGridComponent } from "../../../slick-grid/slick-grid";
import { TaggingViewsProvider } from "./providers/views.provider";
import { setTimeout } from "timers";
import { ViewsProvider } from "../../../views/providers/views.provider";
import { TimeCodeFormat, TMDTimecode } from "../../../../../utils/tmd.timecode";
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SessionStorageService } from "ngx-webstorage";
import { CustomLabels } from "../../../../../services/system.config/search.types";
import { UtilitiesService } from "../../../../../services/common/utilities.service";

@Component({
    selector: 'imfx-media-tagging-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailService,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: TaggingSlickGridProvider},
        SearchFormProvider,
        SlickGridService,
        {provide: ViewsProvider, useClass: TaggingViewsProvider},
        TaggingViewsProvider
    ],
})
@Injectable()
export class IMFXMediaTaggingTabComponent {
    private config = <any>{
        hasOuterFilter: true,
        hasTagColumn: true
    };
    public compIsLoaded = false;
    @ViewChild('slickGridComp', {static: false}) slickGrid: SlickGridComponent;
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewMode: 'table',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                hasOuterFilter: this.config.hasOuterFilter,
                //  colNameForSetRowHeight: 'Tags',
                isThumbnails: false,
                info: {
                    enabled: false
                },
                pager: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                forceFitColumns: true,
                multiAutoHeight: true,
                rowHeight: 30  // wil not work until call this.slickGrid.provider.setRowHeight('Tags');
            }
        })
    });

    @Input('config') set setParams(config) {
        this.config = $.extend(true, this.config, config);
        this.searchGridConfig.options.module.hasOuterFilter = this.config.hasOuterFilter;
    }

    @Output() onAfterReceiveMediaTagging: EventEmitter<MediaDetailMediaTaggingResponse> = new EventEmitter();
    @Output() onSetTaggingNode: EventEmitter<any> = new EventEmitter();
    @Output() goToTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter<any>();
    private tableRows = [];
    // private selectedTagTypes = ['Comments', 'Legal', 'Cuts'];
    private selectedTagTypesIds = [];
    private destroyed$: Subject<any> = new Subject();

    @ViewChild('select', {static: false}) private select: IMFXControlsLookupsSelect2Component;

    constructor(private cdr: ChangeDetectorRef,
                private detailService: DetailService,
                private sessionStorage: SessionStorageService,
                private utilities: UtilitiesService,
                @Inject(Injector) public injector: Injector) {
    }

    ngAfterViewInit() {
        this.config.moduleContext = this;
        if ((this.config.elem && !this.config.elem._config._isHidden) || this.config.tagType == 'blackdetect') {
            this.selectMediaTagging();
        }
        if (this.config.locatorsComponent && this.config.locatorsComponent.onSelectLocatorTab) {
            this.config.locatorsComponent.onSelectLocatorTab.subscribe((data) => {
                data.series = this.utilities.customLabels(data.series, 'TagType');
                this.refreshGrid(data);
            });
        }
        this.goToTimecodeString.subscribe(tc => {
            this.onSetTimecodeString.emit(tc);
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    selectMediaTagging() {
        let self = this;
        if (!!this.config.series) {
            this.fillTableRows(this.utilities.customLabels(this.config.series, 'TagType'));
        } else {
            if (this.config.file["DFILE_LINK_GUID"] !== '' && this.config.file["DFILE_LINK_GUID"] !== null) {
                this.detailService.getDetailMediaTagging(this.config.file["DFILE_LINK_GUID"]).pipe(
                    takeUntil(this.destroyed$)
                ).subscribe((res: MediaDetailMediaTaggingResponse) => {
                    res = this.utilities.customLabels(res, 'TagType');
                    self.onAfterReceiveMediaTagging.emit(res);
                    self.fillTableRows(res);
                });
            } else {
                this.onAfterReceiveMediaTagging.emit();
            }
        }
    };

    fillTableRows(series) {
        this.tableRows = [];
        let self = this;
        let index = 1;
        let maxTagsLength = 0, tagsCount = 0;
        series.forEach(el => {
            this.tableRows.push({
                $id: index++,
                TagType: el.TagType,
                InTc: el.InTc,
                OutTc: el.OutTc,
                Notes: el.Notes,
                Tags: el.TaxonomyLinks,
                thumbIn: self.config.file["THUMBURL"],
                thumbOut: self.config.file["THUMBURL"],
                indicator: this.getCssClass(el),
                DurationTc: this.calcDurationTimecode(el) || '00:00:00:00'
            });
            for (let i = 0; i < el.TaxonomyLinks.length; i++) {
                if (el.TaxonomyLinks[i].TaxonomyText.length > maxTagsLength) {
                    maxTagsLength = el.TaxonomyLinks[i].TaxonomyText.length;
                    tagsCount = el.TaxonomyLinks.length;
                }
            }

        });
        let globalColsView = this.injector.get(TaggingViewsProvider).getCustomColumns(null, this.config.hasTagColumn);
        this.slickGrid.provider.setGlobalColumns(globalColsView);
        this.slickGrid.provider.setDefaultColumns(globalColsView, [], true);
        if (this.config.isSimpleDetail) {
            this.slickGrid.provider.changeColParams('InTc', {width: 100, resizable: false});
            this.slickGrid.provider.changeColParams('OutTc', {
                width: 0,
                resizable: false,
                headerCssClass: "simple-detail-locator-hider",
                cssClass: "simple-detail-locator-hider",
                minWidth: 0
            });
        }
        //    this.slickGrid.provider.setRowHeight('Tags');

        // -----------------------------
        this.compIsLoaded = true;
        if (this.config.hasOuterFilter) {
            let tagTypes = this.getValuesOfTagTypes(series);

            let lowerLevelValuesS2: Select2ListTypes = this.select.turnArrayOfObjectToStandart(tagTypes, {
                key: 'ID',
                text: 'Name',
                selected: 'selected'
            });

            // lowerLevelValuesS2 = this.customLabels(lowerLevelValuesS2, 'text');
            this.select.setData(lowerLevelValuesS2, true);
            this.select.setSelectedByIds(this.selectedTagTypesIds);
        }


        this.slickGrid.provider.buildPageByData({Data: this.tableRows});
        this.refreshGrid();
    }

    setNode(o) {
        this.onSetTaggingNode.emit({markers: o.markers, m_type: 'locator', id: o.id});
    };

    public loadComponentData() {
        if (!this.compIsLoaded) {
            this.selectMediaTagging();
        }
    };

    unselectRow() {
        // this.gridOptions.api.deselectAll();
    }

    getValuesOfTagTypes(series) {
        let tagTypes = [];
        let index = 0;
        series.forEach(el => {

            var newItem = true;
            tagTypes.forEach(elem => {
                if (elem.Name == el.TagType) {
                    newItem = false;
                }
            })
            if (newItem) {
                tagTypes.push({
                    ID: index,
                    Name: el.TagType,
                    selected: !(el.TagType === 'Blackdetect')
                });
                // default selected
                if (!(el.TagType === 'Blackdetect')) {
                    this.selectedTagTypesIds.push(index);
                }
                index++;
            }
        });
        return tagTypes;
    }

    onSelect() {
        const objs: Select2ItemType[] = this.select.getSelectedObjects();
        (<TaggingSlickGridProvider>this.slickGrid.provider).setSelectedTagTypes(objs);
        this.slickGrid.provider.dataView.setFilter(this.slickGrid.provider.getFilter());
        this.slickGrid.provider.dataView.refresh();
        this.slickGrid.provider.slick.invalidateAllRows();
        this.slickGrid.provider.slick.render();
        (<TaggingSlickGridProvider>this.slickGrid.provider).resize();
    }

    refreshGrid(data?: any) {
        const customLabels = this.utilities.getCustomLabels();
        if (data) {
            this.config.series = JSON.parse(JSON.stringify(data.series.filter(el => {
                return el.TagType.toLowerCase() == this.config.tagType.toLowerCase();
            })));
            this.fillTableRows(this.config.series);
        }
        ;
        // setTimeout(() => {
        //   this.slickGrid.provider.resize();
        // }, 0);
    }

    getCssClass(locator) {
        let cssClass = '';
        switch (locator.Origin) {
            case 'iMfxOriginal':
                cssClass = 'green';
                break;
            case 'AvidLocator':
                cssClass = 'red';
                break;
            case 'FCP':
                cssClass = 'yellow';
                break;
            case 'Premier':
                cssClass = 'blue';
                break;
            // AvidRestriction,  AiService
            default:
                break;
        }
        return {cssClass: cssClass, title: locator.Origin};
    }

    private calcDurationTimecode(row) {
        let soms = row.InTc;
        let eoms = row.OutTc;
        let timecodeFormat = TimeCodeFormat[this.config.file.TimecodeFormat];
        return TMDTimecode.fromString(eoms, timecodeFormat).substract(TMDTimecode.fromString(soms, timecodeFormat)).toString();
    }
}
