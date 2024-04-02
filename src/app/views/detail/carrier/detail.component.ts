import {Component, ChangeDetectionStrategy, ViewEncapsulation, EventEmitter} from '@angular/core';
import {DetailData} from '../../../services/viewsearch/detail.service';
import {CarrierDetailAppSettings} from './constants/constants';
import {LookupService} from '../../../services/lookup/lookup.service';

import {DetailConfig} from '../../../modules/search/detail/detail.config';
import {DetailProvider} from '../../../modules/search/detail/providers/detail.provider';
import {DetailThumbProvider} from "../../../modules/search/detail/providers/detail.thumb.provider";
import {GoldenProvider} from "../../../modules/search/detail/providers/gl.provider";

@Component({
    moduleId: 'detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        DetailData,
        CarrierDetailAppSettings,
        LookupService,
        DetailProvider,
        DetailThumbProvider,
        GoldenProvider
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
            typeDetails: "carrier-details",
            showInDetailPage: true,
            detailsviewType: "TapeDetails",
            friendlyNamesForDetail: "FriendlyNames.TM_CTNRS",
            data: {
                detailInfo: <any>null
            },
            onDataUpdated: new EventEmitter<any>(),
            detailsViews: []
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

    constructor(protected appSettings: CarrierDetailAppSettings,
                protected detailProvider: DetailProvider,
                public detailThumbProvider: DetailThumbProvider,
    ) {
        // detail provider
        detailProvider.inducingComponent = 'carrier';
        this.detailConfig.options.provider = detailProvider;
        this.detailConfig.options.appSettings = this.appSettings;
    }
}
