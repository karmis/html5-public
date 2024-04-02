import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    Input, OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SearchFormProvider } from '../../../form/providers/search.form.provider';
import { ViewsConfig } from '../../../views/views.config';
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
import { ProductionBottomTabViewsProvider } from './providers/production.bottom.tab.views.provider';
import { IMFXModalProvider } from '../../../../imfx-modal/proivders/provider';
import { IMFXModalComponent } from '../../../../imfx-modal/imfx-modal';
import { lazyModules } from '../../../../../app.routes';
import {
    SourceMediaData,
    SourceProgsData
} from '../../../../../services/production/production.types';
import { GlobalSlickGridProvider } from './providers/global.slick.grid.provider';
import { ItemSlickGridProvider } from './providers/item.slick.grid.provider';
import { ProductionDetailProvider } from '../../../../../views/detail/production/providers/production.detail.provider';
import { Subject, Subscription } from 'rxjs';
import { ChooseItemModalComponent } from '../../../../choose.item.modal/choose.item.modal.component';
import { SlickGridRowData } from '../../../slick-grid/types';
import { LeftViewsProvider } from './providers/left.views.provider';
import { RightViewsProvider } from './providers/right.views.provider';
import { SearchSettingsConfig } from '../../../settings/search.settings.config';
import { RightSettingsProvider } from './providers/right.settings.provider';
import { LeftSettingsProvider } from './providers/left.settings.provider';
import * as _ from 'lodash';


@Component({
    selector: 'production-bottom-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridService,
        ProductionBottomTabViewsProvider,
        LeftViewsProvider,
        RightViewsProvider,
        RightSettingsProvider,
        LeftSettingsProvider,
        {provide: ViewsProvider, useClass: LeftViewsProvider},
        {provide: ViewsProvider, useClass: RightViewsProvider},
        SlickGridPagerProvider,
        IMFXTextMarkerComponent,
        SearchFormProvider,
        GlobalSlickGridProvider,
        ItemSlickGridProvider,
        {provide: SlickGridProvider, useClass: GlobalSlickGridProvider},
        {provide: SlickGridProvider, useClass: ItemSlickGridProvider}
    ]
})

export class ProductionSourceTabComponent implements OnInit, OnDestroy {
    typeGrids: 'media' | 'versions' = 'media';
    addedNewItem: Subject<{ typeItem: 'production' | 'item', rows: any[] }> = new Subject();
    addedNewItemSub: Subscription;
    makeItemSelected: Subscription;
    isDisabledItemBtn = true;
    //slick
    @ViewChild('gridGlobal', {static: false}) gridGlobal: SlickGridComponent;
    protected gridGlobalConfig: SlickGridConfig = null;

    @ViewChild('gridItem', {static: false}) gridItem: SlickGridComponent;
    protected gridItemConfig: SlickGridConfig = null;

    protected searchViewsConfig = null;
    protected gridItemViewsConfig = null;

    isMenuShow = {
        viewsModify: false,
        viewsSave: false,
        viewsSaveAs: false,
        viewsSaveAsGlobal: false,
        viewsSaveAsDefault: true,
        viewsDelete: false,
        viewsReset: false,
        viewsColumnsSetup: true,
        viewsColumnsAutosize: true,
        exportOptions: false
    }
    sourceMediaData
    private gridGlobalSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            provider: this.leftSettingsProvider,
            viewsProvider: this.leftViewsProvider,
            available: {
                isMenuShow: this.isMenuShow
            }
        }
    };

    private gridItemSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            provider: this.rightSettingsProvider,
            viewsProvider: this.rightViewsProvider,
            available: {
                isMenuShow: this.isMenuShow
            }
        }
    };

    //**

    constructor(private injector: Injector,
                private pbtViewsProvider: ProductionBottomTabViewsProvider,
                private globalSlickGridProvider: GlobalSlickGridProvider,
                private itemSlickGridProvider: ItemSlickGridProvider,
                private leftViewsProvider: LeftViewsProvider,
                private rightViewsProvider: RightViewsProvider,
                private rightSettingsProvider: RightSettingsProvider,
                private leftSettingsProvider: LeftSettingsProvider,
                private cdr: ChangeDetectorRef,
                private productionDetailProvider: ProductionDetailProvider) {
        this.rightViewsProvider.config = this.searchViewsConfig;
        this.leftViewsProvider.config = this.gridItemViewsConfig;
    }

    ngOnInit(): void {
    }

    getProviders() {
        return [this.globalSlickGridProvider, this.itemSlickGridProvider]
    }

    ngAfterViewInit() {

        this.makeItemSelected = this.productionDetailProvider.makeItemSelected.subscribe(item => {
            this.isDisabledItemBtn = !item;
            if (!item)
                return
            item = _.cloneDeep(item);
            if (this.typeGrids === 'media') {
                this.gridItem.provider.buildPageByData({Data: item.SourceMedias});
            } else {
                this.gridItem.provider.buildPageByData({Data: item.SourceProgs});
            }
            this.gridItem.provider.resize();
            this.cdr.detectChanges();
        });

        const interval = setInterval(() => {
            if (this.gridGlobal) {
                this.gridGlobal.provider.buildPageByData({Data: this.sourceMediaData});
                this.gridGlobal.provider.resize();
                this.cdr.detectChanges();
                clearInterval(interval);
            }
        }, 500)
    }

    ngOnDestroy() {
        this.makeItemSelected.unsubscribe();
        if (this.addedNewItemSub) {
            this.addedNewItemSub.unsubscribe();
        }
    }

    showMediaTable(type: 'media' | 'versions', typeItem: 'production' | 'item') {
        let modalProvider = this.injector.get(IMFXModalProvider);
        const modal: IMFXModalComponent = modalProvider.showByPath(lazyModules.choose_item_table, ChooseItemModalComponent, {
            title: 'Select ' + type.charAt(0).toUpperCase() + type.substr(1),
            size: 'xl',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        });
        modal.load().then((cr) => {
            let modalContent: ChooseItemModalComponent = cr.instance;
            modalContent.typeGrid = this.typeGrids === 'media' ? 'media' : 'versions'
            this.addedNewItemSub = modalContent.addedNewItem.subscribe((rows: SlickGridRowData[]) => {
                this.addedNewItem.next({typeItem, rows});
            })
        });
    }

    setData(sourceMediaData: SourceMediaData[] | SourceProgsData[], type: 'media' | 'versions') {
        this.typeGrids = type;
        this.sourceMediaData = sourceMediaData;

        const typeConf = type === 'media' ? 'MediaGrid' : 'VersionGrid';
        const searchType = type === 'media' ? 'Media' : 'versions';

        if (!this.gridGlobalConfig) {
            this.gridGlobalConfig = new SlickGridConfig(<SlickGridConfig>{
                componentContext: this,
                providerType: GlobalSlickGridProvider,
                serviceType: SlickGridService,
                isExpandable: true,
                options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
                    module: <SlickGridConfigModuleSetups>{
                        viewModeSwitcher: false,
                        viewMode: 'table',
                        searchType: searchType,
                        isThumbnails: false,
                        enableSorting: false,
                        popupsSelectors: {
                            'settings': {
                                'popupEl': '.GlobalSlickGridProvider'
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

            this.gridItemConfig = new SlickGridConfig(<SlickGridConfig>{
                componentContext: this,
                providerType: ItemSlickGridProvider,
                serviceType: SlickGridService,
                isExpandable: true,
                options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
                    module: <SlickGridConfigModuleSetups>{
                        searchType: searchType,
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
                        fullWidthRows: true,
                        forceFitColumns: false
                    }
                })
            });
            this.searchViewsConfig = <ViewsConfig><unknown>{
                componentContext: {
                    slickGridComp: this.gridGlobal
                },
                options: {
                    type: typeConf,
                    provider: this.leftViewsProvider,
                },
                moduleContext: {
                    gridProviders: [this.getProviders()[0]]
                }
            }

            this.gridItemViewsConfig = <ViewsConfig><unknown>{
                componentContext: {
                    slickGridComp: this.gridItem
                },
                options: {
                    type: typeConf,
                    provider: this.rightViewsProvider,
                },
                moduleContext: {
                    gridProviders: [this.getProviders()[1]]
                }
            };
        } else {
            this.gridGlobal.provider.buildPageByData({Data: this.sourceMediaData});
            this.gridGlobal.provider.resize();
            this.cdr.detectChanges();
        }

    }

}
