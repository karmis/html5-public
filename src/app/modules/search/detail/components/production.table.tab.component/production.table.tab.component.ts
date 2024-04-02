import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Input, OnChanges,
    OnInit, SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../slick-grid/slick-grid.config';
import { TableViewsProvider } from './providers/table.views.provider';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import { Subscription } from 'rxjs';
import { TypeGridProd } from '../../../../../services/production/production.types';
import { SegmentsViewsProvider } from '../segments.tab.component/providers/views.provider';



@Component({
    selector: 'production-table-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridService,
        SlickGridProvider,
        TableViewsProvider,
        SearchFormProvider,
        SegmentsViewsProvider,
    ]
})

export class ProductionTableTabComponent implements AfterViewInit, AfterViewInit, OnChanges {
    @Input('data') data = [];
    @Input('typeGrids') typeGrids: TypeGridProd = 'history';
    columns;

    //slick
    @ViewChild('grid', {static: false}) grid: SlickGridComponent;
    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
                isTree: {
                    enabled: true,
                    startState: 'collapsed',
                    expandMode: 'allLevels'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.tableSlickGridProvider'
                    }
                },
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });
    //**
    // inProdMedia
    mediaData = [];

    constructor(private tableViewsProvider: TableViewsProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private segmentsViewsProvider: SegmentsViewsProvider,
                private cdr: ChangeDetectorRef) {
    }

    ngAfterViewInit() {
        if (this.typeGrids !== 'mediaInProd') {
            if (!this.columns) {
                this.setData(this.typeGrids, this.data);
            }
            this.grid.provider.setGlobalColumns(this.columns);
            this.grid.provider.setDefaultColumns(this.columns, [], true);
        }

        this.setGrid();
        this.cdr.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.setGrid();
    }

    ngOnDestroy() {
    }

    setData(typeGrids: TypeGridProd, data = []) {
        this.typeGrids = typeGrids;
        this.data = data;
        switch (typeGrids) {
            case 'history':
                this.columns = this.tableViewsProvider.getCustomColumnsHistory();
                break;

            case 'mediaInProd':
                this.columns = this.tableViewsProvider.getCustomColumnsMediaInProd();
                break;

            case 'workflows':
                this.columns = this.tableViewsProvider.getCustomColumnsWorkflows();
                break;

            case 'attachments':
                this.columns = this.tableViewsProvider.getCustomColumnsAttachments();
                break;

            case 'segments':
                this.columns = this.segmentsViewsProvider.getCustomColumns(null,true);
                break;

        }
        this.setGrid();
    }

    setGrid() {
        if (!this.data || !this.grid)
            return
        switch (this.typeGrids) {
            case 'history':
                this.grid.provider.buildPageByData({Data: this.data});
                this.grid.provider.resize();
                break;

            case 'mediaInProd':
                this.mediaData = this.data;
                break

            case 'workflows':
                this.grid.provider.buildPageByData({Data: this.data});
                this.grid.provider.resize();
                break

            case 'attachments':
                this.grid.provider.buildPageByData({Data: this.data});
                this.grid.provider.resize();
                break

            case 'segments':
                this.grid.provider.buildPageByData({Data: this.data});
                this.grid.provider.resize();
                break
        }
    }
}
