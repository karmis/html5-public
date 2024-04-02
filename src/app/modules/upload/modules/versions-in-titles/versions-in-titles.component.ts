import { Component, EventEmitter, Injector, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
// Views
import { ViewsConfig } from '../../../search/views/views.config';
// Grid
import { GridConfig } from '../../../../modules/search/grid/grid.config';
// Search Modal
import { VersionsUploadViewsProvider } from './providers/views.provider';
import { SearchThumbsProvider } from '../../../search/thumbs/providers/search.thumbs.provider';
import { VersionAppSettings } from '../../../../views/version/constants/constants';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchFormConfig } from '../../../search/form/search.form.config';
import { AppSettingsInterface } from '../../../common/app.settings/app.settings.interface';
import {
    SearchThumbsConfig,
    SearchThumbsConfigModuleSetups,
    SearchThumbsConfigOptions
} from '../../../search/thumbs/search.thumbs.config';

import { VersionInsideUploadSearchFormProvider } from './providers/search.form.provider';
import { SearchThumbsComponent } from '../../../search/thumbs/search.thumbs';
// search component
import { SlickGridComponent } from '../../../search/slick-grid/slick-grid';
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions
} from '../../../search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../search/slick-grid/services/slick.grid.service';
import { VersionInsideUploadSlickGridProvider } from './providers/version.slick.grid.provider';
import { SearchFormProvider } from '../../../search/form/providers/search.form.provider';
import { UploadProvider } from '../../providers/upload.provider';
import { CoreSearchComponent } from '../../../../core/core.search.comp';
import { IMFXModalComponent } from '../../../imfx-modal/imfx-modal';
import { IMFXModalEvent } from '../../../imfx-modal/types';
import { SearchSettingsProvider } from '../../../search/settings/providers/search.settings.provider';
import { SearchViewsComponent } from '../../../search/views/views';
import { ViewsProvider } from '../../../search/views/providers/views.provider';
import { Select2ItemType } from "../../../controls/select2/types";
import { SecurityService } from '../../../../services/security/security.service';
import { SearchSettingsConfig } from '../../../search/settings/search.settings.config';
import { VersionsInsideTitlesComponent } from '../../../../views/titles/modules/versions/versions.component';
import { SlickGridTreeRowData } from '../../../search/slick-grid/types';
import { Subject } from 'rxjs';

@Component({
    selector: 'versions-in-titles',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        ViewsProvider,
        {provide: ViewsProvider, useClass: VersionsUploadViewsProvider},
        VersionAppSettings,
        SearchThumbsProvider,
        SearchFormProvider,
        VersionInsideUploadSearchFormProvider,
        SearchSettingsProvider,
        SlickGridProvider,
        {provide: SlickGridProvider, useClass: VersionInsideUploadSlickGridProvider},
        SlickGridService
    ]
})

export class VersionsInTitlesComponent extends CoreSearchComponent {
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    @ViewChild('viewsComp', {static: false}) public viewsComp: SearchViewsComponent;
    @ViewChild('searchThumbsComp', {static: false}) searchThumbsComp: SearchThumbsComponent;
    @Output() onDoubleClick: EventEmitter<string> = new EventEmitter<string>();
    // versions
    protected searchViewsConfig = <ViewsConfig>{
        componentContext: this,
        options: {
            type: 'VersionGrid',
        }
    };
    protected searchSettingsConfig = <SearchSettingsConfig>{
        componentContext: this,
        options: {
            available: {
                export: {
                    enabled: true,
                    useCustomApi: true
                }
            }
        }
    };
    protected searchGridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                enableSorting: false,
                viewModeSwitcher: false,
                viewMode: 'table',
                exportPath: 'Version',
                searchType: 'versions',
                onIsThumbnails: new EventEmitter<boolean>(),
                onSelectedView: new EventEmitter<any>(),
                isThumbnails: false,
                overlay: {
                    zIndex: 250
                },
                dragDropCellEvents: {
                    dropCell: true,
                    dragEnterCell: true,
                    dragLeaveCell: true,
                },
                pager: {
                    enabled: false,
                },
                isTree: {
                    enabled: true,
                    startState: 'expanded',
                    expandMode: 'allLevels'
                },
                popupsSelectors: {
                    'settings': {
                        'popupEl': '.versionSettingsPopup'
                    }
                },
                bottomPanel: {
                    enabled: false
                },
                availableContextMenu: true,
                refreshOnNavigateEnd: true
            },
        })
    });
    expandedAll: boolean = true;

    constructor(
        public searchFormProvider: VersionInsideUploadSearchFormProvider,
        public slickGridProvider: SlickGridProvider,
        protected appSettings: VersionAppSettings,
        protected router: Router,
        protected route: ActivatedRoute,
        protected securityService: SecurityService,
        protected injector: Injector) {
        super(injector);
        this.slickGridProvider.onRowMouseDblClick.subscribe(() => {
            this.onDoubleClick.next();
        })
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    expandCollapseAll(expandedAll: boolean, withSwitch: boolean = true) {
        if (!this.slickGridComp || this.slickGridComp.provider.getData().length === 0)
            return;
        if (withSwitch) {
            this.expandedAll = !expandedAll;
        }

        const provider: SlickGridProvider = this.slickGridComp.provider;
        let dataView = provider.getDataView();
        dataView.beginUpdate();
        if (expandedAll) {
            $.each(provider.getData(), (i, row: SlickGridTreeRowData) => {
                provider.collapseTreeRow(row);
            });
        } else {
            $.each(provider.getData(), (i, row: SlickGridTreeRowData) => {
                provider.expandTreeRow(row);
            });
        }
        dataView.endUpdate();
        provider.resize();
    }
}
