import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component, Injector, TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { SlickGridComponent } from '../../../search/slick-grid/slick-grid';
import { SlickGridColumn } from '../../../search/slick-grid/types';
import { IMFXModalComponent } from '../../../imfx-modal/imfx-modal';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../search/slick-grid/services/slick.grid.service';
import { ViewsProvider } from '../../../search/views/providers/views.provider';
import { SearchFormProvider } from '../../../search/form/providers/search.form.provider';
import { VersionAlreadySlickGridProvider } from './providers/version.already.slick.grid.provider';
import { VersionAlreadyViewsProvider } from './providers/version.already.views.provider';
import { DatetimeFormatter } from '../../../search/slick-grid/formatters/datetime/datetime.formatter';


@Component({
    selector: 'version-already',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        SlickGridService,
        VersionAlreadySlickGridProvider,
        VersionAlreadyViewsProvider,
        {provide: SlickGridProvider, useClass: VersionAlreadySlickGridProvider},
        {provide: ViewsProvider, useClass: VersionAlreadyViewsProvider},
        SearchFormProvider
    ]
})

export class VersionAlreadyComponent implements AfterViewInit {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    columns =<SlickGridColumn[]>[
            {
                id: 1,
                name: 'Prod Id',
                field: 'ProductionId',
                // width: 50,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'Campaign',
                field: 'ProductionName',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Channel',
                field: 'ProductionChannel',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 4,
                name: 'Status',
                field: 'StatusText',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 5,
                name: 'Template',
                field: 'ProductionTemplateText',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
            },
            {
                id: 6,
                name: 'Due Date',
                field: 'DueDate',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
                formatter: DatetimeFormatter,
                __deps: {
                    injector: this.injector,
                    datetimeFullFormatLocaldatePipe: "DD/MM/YYYY HH:mm"
                }
            }
        ]
    data = [];
    version = {
        ID: null,
        VERSIONID1: null,
        TITLE: null,
    }
    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: VersionAlreadySlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    private modalRef: IMFXModalComponent;

    constructor(private injector: Injector) {
        this.modalRef = this.injector.get('modalRef');
    }

    ngAfterViewInit() {
        this.slickGridComp.provider.setGlobalColumns(this.columns);
        this.slickGridComp.provider.setDefaultColumns(this.columns, [], true);
        this.slickGridComp.provider.buildPageByData({Data: this.data});
        setTimeout(() => {
            this.slickGridComp.provider.resize();
        }, 500)
    }

    closeModal() {
        this.modalRef.hide();
    }
}
