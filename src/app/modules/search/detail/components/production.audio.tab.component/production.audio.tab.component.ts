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
import { GlobalSlickGridProvider } from './providers/global.slick.grid.provider';
import { ItemSlickGridProvider } from './providers/item.slick.grid.provider';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { Subscription } from 'rxjs';
import { AudioViewsProvider } from './providers/audio.views.provider';
import { ArrayProvider } from "../../../../../providers/common/array.provider";
import * as _ from 'lodash';

@Component({
    selector: 'production-audio-subs-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        AudioViewsProvider,
        {provide: ViewsProvider, useClass: AudioViewsProvider},
        SlickGridPagerProvider,
        IMFXTextMarkerComponent,
        SearchFormProvider,
        GlobalSlickGridProvider,
        ItemSlickGridProvider,
        {provide: SlickGridProvider, useClass: GlobalSlickGridProvider},
    ]
})

export class ProductionAudioTabComponent implements OnInit, OnDestroy {
    makeItemSelectedSub: Subscription;
    makeItemBeforeSelectedSub: Subscription;
    makeItemOnGridMouseUpSub: Subscription;
    isMakeItemSelected = false;
    //slick
    @ViewChild('gridGlobal', {static: true}) gridGlobal: SlickGridComponent;
    protected gridGlobalConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: GlobalSlickGridProvider,
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
                private audioViewsProvider: AudioViewsProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private globalSlickGridProvider: GlobalSlickGridProvider,
                private arrayProvider: ArrayProvider,
                private itemSlickGridProvider: ItemSlickGridProvider,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {

        this.audioViewsProvider.getCustomColumnsAudio().subscribe(col => {
            this.gridGlobal.provider.setGlobalColumns(col);
            this.gridGlobal.provider.setDefaultColumns(col, [], true);
        })

        this.makeItemOnGridMouseUpSub = this.productionDetailProvider.makeItemOnGridMouseUp.subscribe(item => {
            this.isMakeItemSelected = true;
            this.gridGlobal.hideOverlay()
        });
        this.makeItemBeforeSelectedSub = this.productionDetailProvider.makeItemBeforeSelected.subscribe(item => {
            if (!item) {
                return;
            }
            this.isMakeItemSelected = false;
            this.gridGlobal.showOverlay()
            this.cdr.markForCheck()
        })
        this.makeItemSelectedSub = this.productionDetailProvider.makeItemSelected.subscribe(item => {
            item = _.cloneDeep(item);
            if (!item) {
                this.isMakeItemSelected = false;
                this.gridGlobal.provider.buildPageByData({Data: []});
                this.gridGlobal.provider.resize();
                return
            }
            this.applySorting(item.AudioTracks);
            this.gridGlobal.provider.buildPageByData({Data: item.AudioTracks});
            this.gridGlobal.provider.resize();
            setTimeout(() => {
                this.isMakeItemSelected = true;
                this.gridGlobal.hideOverlay()
                this.cdr.markForCheck()
            })
        });

        // delete audio
        this.globalSlickGridProvider.onRowDelete.subscribe(data => {
            this.productionDetailProvider.removeAudioSubs(data.SEQUENCE, 'AudioTracks');
            this.applySeqAssignment();
        })

        // select language and audio
        this.globalSlickGridProvider.formatterSelect2OnSelect.subscribe(data => {
            this.productionDetailProvider.changeAudioSubsSelect(data);
        })
    }

    ngOnDestroy() {
        this.makeItemSelectedSub.unsubscribe();
        this.makeItemBeforeSelectedSub.unsubscribe();
        this.makeItemOnGridMouseUpSub.unsubscribe();
    }

    onAddAudio() {
        let tracks = [...this.productionDetailProvider.makeItemSelected.value.AudioTracks];
        const SEQUENCE = this.arrayProvider.uniqueIdByField(tracks, 'SEQUENCE');

        let newItem = {
            "PROD_ITEM_ID": this.productionDetailProvider.makeItemSelected.value.ID,
            "TEMPLATE_ID": null,
            SEQUENCE,
            "AUDIO_CONTENT_TYPE_ID": null,
            "LANGUAGE_ID": null,
        };
        tracks.push(newItem);
        this.applySorting(tracks);
        this.productionDetailProvider.addAudioSubs(newItem, 'AudioTracks');

        this.gridGlobal.provider.buildPageByData({Data: tracks});
        this.gridGlobal.provider.slick.scrollRowToTop(tracks[tracks.length - 1]);
        this.gridGlobal.provider.resize();
    }

    applySorting(rows) {
        rows.sort((el1, el2) => {
            return ((el1['SEQUENCE'] - 0) - (el2['SEQUENCE'] - 0)) * 1;
        });
    }

    applySeqAssignment() {
        const tracks = this.productionDetailProvider.getItem().AudioTracks;
        this.applySorting(tracks);

        for (let i = 0; i < tracks.length; i++) {
            tracks[i]['SEQUENCE'] = i + 1;
        }

        this.gridGlobal.provider.buildPageByData({Data: tracks});
        this.gridGlobal.provider.resize();
    }
}
