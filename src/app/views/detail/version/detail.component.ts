import {Component, ChangeDetectionStrategy, ViewEncapsulation, EventEmitter} from '@angular/core';
import {DetailData} from '../../../services/viewsearch/detail.service';
import {VersionDetailAppSettings} from './constants/constants';
import {LookupService} from '../../../services/lookup/lookup.service';

import {DetailConfig} from '../../../modules/search/detail/detail.config';
import {DetailProvider} from '../../../modules/search/detail/providers/detail.provider';
import {DetailThumbProvider} from "../../../modules/search/detail/providers/detail.thumb.provider";
import {VersionGoldenProvider} from "./providers/version.gl.provider";
import {GoldenProvider} from "../../../modules/search/detail/providers/gl.provider";

@Component({
    moduleId: 'detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        DetailData,
        VersionDetailAppSettings,
        LookupService,
        DetailProvider,
        DetailThumbProvider,
        GoldenProvider,
        {provide: GoldenProvider, useClass: VersionGoldenProvider},
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DetailComponent {
    /**
     * Detail
     * @type {DetailConfig}
     */
    private detailConfig = <DetailConfig>{
        componentContext: this,
        options: {
            provider: <DetailProvider>null,
            needApi: true,
            typeDetails: "version-details",
            showInDetailPage: true,
            detailsviewType: "VersionDetails",
            friendlyNamesForDetail: "FriendlyNames.TM_PG_RL",
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: [],
            tabsData: ['vTitles']
        },
        layoutConfig: {
            content: [{
                type: 'row',
                content: [
                    {
                        type: 'component',
                        componentName: 'Data',
                        tTitle: 'Data',
                        width: 35
                    },
                    {
                        type: 'column',
                        content: [
                            {
                                type: 'stack',
                                content: [],
                                id: 'stackOfTabs'
                            }
                        ]
                    }
                ]
            }]
        },
        providerType: GoldenProvider
    };

    constructor(protected appSettings: VersionDetailAppSettings,
                protected detailProvider: DetailProvider,
                public detailThumbProvider: DetailThumbProvider,
    ) {
        // detail provider
        detailProvider.inducingComponent = 'version';
        this.detailConfig.options.provider = detailProvider;
        this.detailConfig.options.appSettings = this.appSettings;
    }
}
