/**
 * Created by Ivan Banan 12.01.2019.
 */
import { EventEmitter } from '@angular/core';
import { InfoPanelProvider } from './providers/info.panel.provider';
import { DetailService } from '../detail/services/detail.service';

export class InfoPanelSettings {
    /**
    * Service for working moduke
    */
    service?: DetailService;

    /**
    * Provider for working with module
    */
    provider?: InfoPanelProvider;

    appSettings?: any;

    // needApi?: boolean;

    detailsviewType?: string;

    detailsViews?: any[];

    typeDetails?: string;

    friendlyNamesForDetail?: any;

    detailData?: any;

    lookupService?: any;

    data?: {
        detailInfo?: any;
        accordions?: any;
    }

    // showInDetailPage?: boolean;

    showAccordions?: boolean;

    onDataUpdated?: EventEmitter<any>;

    detailCtx?: any;

    _accordions?: Array<any>;
    tabsData?: Array<any>;
    file?: any;
    columnData?: any;
    // userFriendlyNames?: any;
    mediaParams?: {
        addPlayer: boolean,
        addMedia: boolean,
        addImage: boolean,
        showAllProperties: boolean,
        isSmoothStreaming: boolean,
        mediaType: string
    };
    typeDetailsLocal?:string;
    // providerDetailData?: any;
    subtitles?: Array<any>;
    pacsubtitles?: Array<any>;
    timecodeFormatString?: string;
    // showGolden?: boolean;
    // clipBtns?: boolean;
    // disabledClipBtns?: boolean;
    defaultThumb?: string;
    externalSearchTextForMark?: string;
    isOpenDetailPanel?: boolean;
    tabsLayoutSettings?: string;
    specifiedEndpointUrl?: string; // can contain a field name within bkackets (e.g. {ID})
}

export class InfoPanelConfig {
    /**
    * Context of top component
    */
    public componentContext: any;

    public moduleContext?: any;

    /**
    * Model of settings
    * @type {{}}
    */
    public options: InfoPanelSettings = {};
}

