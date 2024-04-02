import {
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../slick-grid/slick-grid.config';
import { ViewsProvider } from '../../../views/providers/views.provider';
import { SlickGridService } from '../../../slick-grid/services/slick.grid.service';
import { IMFXTextMarkerComponent } from '../../../../controls/text.marker/imfx.text.marker';
import { SlickGridProvider } from '../../../slick-grid/providers/slick.grid.provider';
import { SlickGridComponent } from '../../../slick-grid/slick-grid';
import { SlickGridPagerProvider } from '../../../slick-grid/comps/pager/providers/pager.slick.grid.provider';
import { ItemSlickGridProvider } from './providers/item.slick.grid.provider';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { Subscription } from 'rxjs';
import { SubtitlesViewsProvider } from './providers/subtitles.views.provider';
import { ArrayProvider } from "../../../../../providers/common/array.provider";
import * as _ from 'lodash';

@Component({
    selector: 'production-subs-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        SubtitlesViewsProvider,
        {provide: ViewsProvider, useClass: SubtitlesViewsProvider},
        SlickGridPagerProvider,
        IMFXTextMarkerComponent,
        SearchFormProvider,
        ItemSlickGridProvider,
        {provide: SlickGridProvider, useClass: ItemSlickGridProvider}
    ]
})

export class ProductionSubtitlesTabComponent implements OnInit, OnDestroy {
    makeItemSelectedSub: Subscription;
    makeItemBeforeSelectedSub: Subscription;
    makeItemOnGridMouseUpSub: Subscription;
    isMakeItemSelected = false;

    @ViewChild('gridItem', {static: true}) gridItem: SlickGridComponent;
    protected gridItemConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: ItemSlickGridProvider,
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
                        'popupEl': '.gridItemConfig'
                    }
                },
                selectFirstRow: false
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                rowHeight: 40,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    //**

    constructor(private injector: Injector,
                private subtitlesViewsProvider: SubtitlesViewsProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private arrayProvider: ArrayProvider,
                private itemSlickGridProvider: ItemSlickGridProvider,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {

       this.subtitlesViewsProvider.getCustomColumnsSubtitles().subscribe(colSubs => {
            this.gridItem.provider.setGlobalColumns(colSubs);
            this.gridItem.provider.setDefaultColumns(colSubs, [], true);
        })

        this.makeItemOnGridMouseUpSub = this.productionDetailProvider.makeItemOnGridMouseUp.subscribe(item => {
            this.isMakeItemSelected = true;
            this.gridItem.hideOverlay()
        });

        this.makeItemBeforeSelectedSub = this.productionDetailProvider.makeItemBeforeSelected.subscribe(item => {
            if (!item) {
                return;
            }
            this.isMakeItemSelected = false;
            this.gridItem.showOverlay();
        })

        this.makeItemSelectedSub = this.productionDetailProvider.makeItemSelected.subscribe(item => {
            if (!item) {
                this.isMakeItemSelected = false;
                this.gridItem.provider.buildPageByData({Data: []});
                this.gridItem.provider.resize();
                return
            }
            const subtitles = _.cloneDeep(item.Subtitles)
            this.gridItem.provider.buildPageByData({Data: subtitles});
            this.gridItem.provider.resize();
            setTimeout(() => {
                this.isMakeItemSelected = true;
                this.gridItem.hideOverlay();
                this.cdr.markForCheck()
            })
        });
        // delete subs
        this.itemSlickGridProvider.onRowDelete.subscribe(data => {
            this.productionDetailProvider.removeAudioSubs(data.SEQUENCE, 'Subtitles');
        });
        // select language
        this.itemSlickGridProvider.formatterSelect2OnSelect.subscribe(data => {
            this.productionDetailProvider.changeAudioSubsSelect(data);
        })
    }

    ngOnDestroy() {
        this.makeItemSelectedSub.unsubscribe();
        this.makeItemBeforeSelectedSub.unsubscribe();
        this.makeItemOnGridMouseUpSub.unsubscribe();
    }

    onAddSubs() {
        let tracks = _.cloneDeep(this.productionDetailProvider.makeItemSelected.value.Subtitles)
        const SEQUENCE = this.arrayProvider.uniqueIndexByKey(tracks, "SEQUENCE");

        let newItem = {
            "PROD_ITEM_ID": this.productionDetailProvider.makeItemSelected.value.ID,
            "TEMPLATE_ID": null,
            SEQUENCE,
            "AUDIO_CONTENT_TYPE_ID": null,
            "LANGUAGE_ID": null,
        };
        tracks.push(newItem);
        this.productionDetailProvider.addAudioSubs(newItem, 'Subtitles');

        this.gridItem.provider.buildPageByData({Data: tracks});
        this.gridItem.provider.slick.scrollRowToTop(tracks[tracks.length - 1]);
        this.gridItem.provider.resize();
        this.productionDetailProvider.updateSubsRowMakeItemsGrid.next(); // for Subs checkbox in makeItem
    }

}
