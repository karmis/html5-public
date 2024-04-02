/**
 * Created by Sergey Klimenko on 10.03.2017.
 */
import {EventEmitter} from '@angular/core'
import {DetailProvider} from './providers/detail.provider';
import {DetailComponent} from "./detail";
import { DetailService } from './services/detail.service';

export class DetailSettings {
    /**
    * Service for working moduke
    */
    service?: DetailService;

    /**
    * Provider for working with module
    */
    provider?: DetailProvider;

    appSettings?: any;

    needApi?: boolean;

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

    showInDetailPage?: boolean;

    showAccordions?: boolean;

    onDataUpdated?: EventEmitter<any>;

    detailCtx?: any;

    _accordions?: Array<any>;
    tabsData?: Array<any>;
    file?: any;
    columnData?: any;
    userFriendlyNames?: any;
    mediaParams?: {
        addPlayer: boolean,
        addMedia: boolean,
        addImage: boolean,
        showAllProperties: boolean,
        isSmoothStreaming: boolean,
        mediaType: string
    };
    typeDetailsLocal?:string;
    providerDetailData?: any;
    subtitles?: Array<any>;
    pacsubtitles?: Array<any>;
    timecodeFormatString?: string;
    showGolden?: boolean;
    clipBtns?: boolean;
    disabledClipBtns?: boolean;
    defaultThumb?: string;
    externalSearchTextForMark?: string;
    isOpenDetailPanel?: boolean;
}

export class DetailConfig {
    /**
    * Context of top component
    */
    public componentContext: any;

    public moduleContext?: any;

    public layoutConfig?: any;

    public providerType?: any;

    /**
    * Model of settings
    * @type {{}}
    */
    public options: DetailSettings = {};
}

export class GoldenSettings {
    file?: Object;
    jobFile?: Object;
    groups?: any[];
    jobGroups?: any[];
    friendlyNames?: Object;
    jobFriendlyNames?: Object;
    typeDetailsLocal?: string;
    typeDetails?: string;
    tabs?: any[];
    params?: any;
    layoutConfig?: any;
    series?: any;
    columnData?: any;
    titleForStorage?: string;
    lookup?: string;
    firstLoadReadOnly?: boolean;
}
export class GoldenConfig {
    /**
    * Context of top component
    */
    public componentContext: any;
    /**
    * settings obj
    */
    public appSettings: any;

    public moduleContext: any;
    public providerType: any;
    /**
    * Model of settings
    * @type {{}}
    */
    public options: GoldenSettings = {};
    constructor(c: GoldenConfig) {
    }
}
export interface TabData {
    type: string;
    componentName:  string;
    title:  string;
    tTitle: string;
}
