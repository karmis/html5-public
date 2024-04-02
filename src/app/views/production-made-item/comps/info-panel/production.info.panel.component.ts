/**
 * Created by Ivan Banan on 12.01.2019.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    Input,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import * as $ from 'jquery';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { InfoPanelThumbProvider } from './providers/info.panel.thumb.provider';
import { Observable, Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

import { InfoPanelConfig } from 'app/modules/search/info-panel/info.panel.config';
import {DetailService} from "../../../../modules/search/detail/services/detail.service";
import {HTMLPlayerService} from "../../../../modules/controls/html.player/services/html.player.service";
import {InfoPanelComponent} from "../../../../modules/search/info-panel/info.panel.component";
import { PanelMetadataComponent } from 'app/modules/search/panel-metadata/panel.metadata';
import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SecurityService} from "../../../../services/security/security.service";
import {SettingsGroupsService} from "../../../../services/system.config/settings.groups.service";
import {InfoProductionPanelProvider} from "./providers/info.panel.provider";
import { IMFXAudioTracksTabComponent } from 'app/modules/search/detail/components/audio.tracks.tab.component/imfx.audio.tracks.tab.component';
import { DetailProvider } from 'app/modules/search/detail/providers/detail.provider';

@Component({
    selector: 'search-production-info-panel',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        DetailService,
        InfoPanelThumbProvider,
        HTMLPlayerService,
        DetailProvider
    ]
})

export class ProductionInfoPanelComponent extends InfoPanelComponent {
    public config = <InfoPanelConfig>{
        componentContext: <any>null,
        options: {
            _accordions: [],
            tabsData: [],
            file: {},
            // userFriendlyNames: {},
            mediaParams: {
                addPlayer: false,
                addMedia: false,
                addImage: false,
                showAllProperties: false,
                isSmoothStreaming: false,
                mediaType: ''
            },
            typeDetailsLocal: '',
            timecodeFormatString: 'Pal',
            // providerDetailData: <any>null,
            provider: <InfoProductionPanelProvider>null,
            service: <DetailService>null,
            data: <any>null,
            detailCtx: this,
            showAccordions: false,
            externalSearchTextForMark: '',
            isOpenDetailPanel: false,
            searchType: 'media'
        },
        moduleContext: this
    };

    @ViewChild('detailVideo', {static: false}) public detailVideo;
    @ViewChild('accordion', {static: false}) public accordion;

    @ViewChild('subtitlesGrid', {static: false}) public subtitlesGrid; // tab 1
    @ViewChild('subtitlesPacGrid', {static: false}) public subtitlesPacGrid;
    @ViewChild('subTitlesWrapper', {static: false}) public subTitlesWrapperEl: any;
    @ViewChild('subTitlesWrapperTab', {static: false}) public subTitlesWrapperTabEl: any;
    @ViewChild('subTitlesOverlay', {static: false}) public subTitlesOverlayEl;
    @ViewChild('subTitlesOverlayTab', {static: false}) public subTitlesOverlayTabEl;

    @ViewChild('mediaTagging', {static: false}) public mediaTaggingEl; // tab 2
    @ViewChild('taggingOverlay', {static: false}) public taggingOverlayEl;
    @ViewChild('taggingOverlayTab', {static: false}) public taggingOverlayTabEl;
    @ViewChild('taggingWrapperTab', {static: false}) public taggingWrapperTabEl;

    @ViewChild('metadata', {static: false}) public metadataEl: PanelMetadataComponent; // tab 3
    @ViewChild('metadataOverlay', {static: false}) public metadataOverlayEl;
    @ViewChild('metadataOverlayTab', {static: false}) public metadataOverlayTabEl;
    @ViewChild('metadataWrapperTab', {static: false}) public metadataWrapperTabEl;


    @ViewChild('audioTracksComp', {static: false}) public audioTracksComp: IMFXAudioTracksTabComponent

    @Input('gridProviders') gridProviders: SlickGridProvider[] = null;
    @Input('infoConfigs') infoConfigs = null; //Use if have two (or more) types of content view kind (media item ,version item)
    @Input('config') set setConfig(config) {
        $.extend(true, this.config, config);
        this.initTimecodeChangeUpdate();
    }

    private data: any = {}
    constructor(@Inject(DetailService) protected service: DetailService,
                @Inject(InfoProductionPanelProvider) protected provider: InfoProductionPanelProvider,
                public securityService: SecurityService,
                public cd: ChangeDetectorRef,
                public translate: TranslateService,
                protected settingsGroupsService: SettingsGroupsService,
                protected localStorage: LocalStorageService,
                public injector: Injector
                ) {
        super(service, provider, securityService, cd, translate, settingsGroupsService, localStorage, injector);

    }

    ngAfterViewInit() {
        this.isReady = true;
        this.provider.audioTracksComp = this.audioTracksComp;
        // super.ngAfterViewInit();
        this.provider.onUpdate.subscribe((res) => {
            this.data = res;
            this.cd.markForCheck()
        });

        this.commonDetailInit();
    }
}
