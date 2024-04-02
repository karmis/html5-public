/**
 * Created by Sergey Klimeko on 08.02.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BasketService } from '../../../../services/basket/basket.service';
import { DetailService } from '../../../../modules/search/detail/services/detail.service';
import { IMFXSubtitlesGrid } from '../../../../modules/search/detail/components/subtitles.grid.component/subtitles.grid.component';
import { ItemTypes } from '../../../../modules/controls/html.player/item.types';
import { SessionStorageService } from 'ngx-webstorage';
import { ConsumerSettings } from '../../../../modules/settings/consumer/types';
import { ConsumerDetailSettingsProvider } from '../../../../modules/settings/consumer/detail/providers/consumer.settings.provider';
import { MediaDetailMediaCaptionsResponse } from '../../../../models/media/detail/caption/media.detail.media.captions.response';
import { SecurityService } from '../../../../services/security/security.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../../modules/notification/services/notification.service';
import { ConsumerCriteriaModificationType, ConsumerSettingsType } from '../../consumer.search.component';
import { AdvancedSearchModel } from '../../../../models/search/common/advanced.search';
import { ConsumerUtils } from '../../utils/consumer.utils';

@Component({
    selector: 'consumer-item-detail',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    entryComponents: [
        IMFXSubtitlesGrid
    ],
    providers: [
        DetailService,
        ConsumerDetailSettingsProvider
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})

/**
 * Consumer item
 */
export class ConsumerDetailComponent {
    @Input() public settings;
    @ViewChild('detailVideo', {static: false}) private detailVideo;
    @ViewChild('subtitlesGrid', {static: false}) private subtitlesGrid;
    @ViewChild('Synopsis', {static: false}) private synopsisRef;
    @ViewChild('simpleDetail', {static: false}) private simpleDetail;
    @Input('setupsUpdated') private setupsUpdated;
    @Input() private itemIndex;
    @Input() private defaultSettings: ConsumerSettings;
    @Input('onUpdateSettings') private onUpdateSettings: EventEmitter<any>;
    @Input('storagePrefix') private storagePrefix: string;
    public settingsStoragePrefix: string = this.storagePrefix + '.settings.detail';
    @Output() private selected: EventEmitter<any> = new EventEmitter();
    @Output() private toggleCollapse: EventEmitter<any> = new EventEmitter();
    @Output() private changeFilter: EventEmitter<ConsumerCriteriaModificationType[]> = new EventEmitter();
    private isSmoothStreaming = false;
    private setImage = false;
    private setPlayer = false;
    private typeDetails: String;
    private sidebarCollapsed: boolean = true;
    private subtitles: any[];
    private timecodeFormatString: string;
    private selectedPrefix: string = 'consumer.selected-item';
    private error: boolean = false;
    private errorText: string = '';
    private cinemaMode: any = {
        cinemaModePlayerWrapper: '.cinema-mode-player',
        neighboringContainerWrapper: '.consumer-blocks-wrapper.grid',
        simpleModePlayerWrapper: '#simple-players',
        videoContainerWrapper: '.video-container',
        cinemaModeOn: false
    };

    constructor(protected basketService: BasketService,
                protected storageService: SessionStorageService,
                protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected detailsService: DetailService,
                protected ssip: ConsumerDetailSettingsProvider,
                protected translate: TranslateService,
                protected notificationService: NotificationService) {
    }

    private _item;

    private get item() {
        return this._item;
    }

    @Input()
    private set item(item) {
        this._item = item;
        if (this._item) {
            this.initDetails();
        }
    };

    toggleModifications(fieldId:string, value:any) {
        if(!fieldId || !value) {
            return;
        }
        const asm: AdvancedSearchModel = new AdvancedSearchModel(
            {DBField: fieldId, Operation: '=', Value: value}
        );
        // this.csp.toggleModification([{
        //     mode: "add",
        //     model: asm
        // }])
        this.changeFilter.emit([{mode:'add', model: asm}]);
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name);
    }

    onToggle(settings: ConsumerSettingsType) {
        this.sidebarCollapsed = !settings.detail.opened;
        if (this.cinemaMode.cinemaModeOn) {
            $(this.cinemaMode.cinemaModePlayerWrapper).html('');
            $(this.cinemaMode.neighboringContainerWrapper).removeClass('consumer-blocks-wrapper-with-cinema-player');
        }
        if (this.detailVideo && this.detailVideo.player && this.sidebarCollapsed) {
            this.detailVideo.player.pause();
        }
    }
    //
    // setSeriesFilter(seriesId) {
    //     this.seriesFilter.emit(seriesId);
    // }

    ngOnInit() {
        if (!this.item) {
            return;
        }
        ConsumerUtils.consumerNgOnInit(this);
    }

    ngAfterViewInit() {
        this.ssip.settings = this.settings;
        this.ssip.synopsisRef = this.synopsisRef;
        if (this.setupsUpdated) {
            this.setupsUpdated.subscribe((setups) => {
                this.settings = setups.detailSettings;
                this.ssip.settings = setups.detailSettings;
                this.ssip.synopsisRef = this.synopsisRef;
            });
        }
        // this.initDetails()
    }

    isError($event) {
        if ($event) {
            this.error = true;
        }
    }

    // clickRepeat() {
    //     this.error = false;
    //     if (this.detailVideo) {
    //         this.detailVideo.refresh(this.item.ProxyUrl);
    //     }
    // }

    initDetails() {
        this.error = false;
        this.setVideoBlock();
        this.item.MEDIA_TYPE = ItemTypes.MEDIA;
    }

    onPlayerReady(videoDetails) {
        this.error = false;
        this.errorText = '';
        this.timecodeFormatString = videoDetails.TimecodeFormat;
        this.initSubtitlesGrid();
    }

    onPlayerError(err) {
        this.errorText = err;

        this.error = !!err;
    }

    // getPlayerErrorText() {
    //     let text = '';
    //     if (this.errorText !== '') {
    //         text = this.errorText;
    //     } else {
    //         text = this.translate.instant('consumer.error');
    //     }
    //     return text;
    // }

    initSubtitlesGrid() {
        this.subtitles = null;
        this.detailsService.getSubtitles(this.item.ID)
            .subscribe((res: MediaDetailMediaCaptionsResponse[]) => {
                    this.subtitles = res;
                    try {
                        this.cdr.detectChanges();
                    } catch (e) {
                        console.error(e.message);
                    }
                    this.detailVideo && this.detailVideo.timecodeChange.subscribe((tcStr) => {
                        this.subtitlesGrid && this.subtitlesGrid.selectRow(tcStr);
                    });
                },
                (error) => {
                    const message = this.translate.instant('details_item.subtitles_not_found');
                    this.notificationService.notifyShow(2, message, false);
                });
    }

    toggleBasket(): void {
        this.isOrdered() ? this.basketService.removeFromBasket([this.item])
            : this.basketService.addToBasket(this.item, 'Version');
    }

    isOrdered(): boolean {
        return this.basketService.hasItem(this.item);
    }

    setVideoBlock() {
        this.setPlayer = false;
        this.setImage = false;
        if (this.item && typeof (this.item.ProxyUrl) === 'string'
            && this.item.ProxyUrl.match(/(?:http)|(?:https)/g)) {
            this.setPlayer = true;
            this.setImage = false;
            this.cdr.detectChanges();
            if (this.cinemaMode.cinemaModeOn) { // set cinema mode if it's On
                // remove from old position and add into new
                // $(this.cinemaMode.cinemaModePlayerWrapper).html('');
                $(this.cinemaMode.cinemaModePlayerWrapper).prepend($(this.cinemaMode.videoContainerWrapper));
                $(this.cinemaMode.neighboringContainerWrapper).addClass('consumer-blocks-wrapper-with-cinema-player');
            }
            this.isSmoothStreaming = this.item.ProxyUrl.match(/(?:ism)/g);
        } else {
            this.setPlayer = false;
            if (this.cinemaMode.cinemaModeOn) {
                $(this.cinemaMode.cinemaModePlayerWrapper).html('');
                $(this.cinemaMode.neighboringContainerWrapper).removeClass('consumer-blocks-wrapper-with-cinema-player');
            }
            this.setImage = true;
            this.detailVideo = null;
        }
    };

    getStylesForWidget(customId, widgetType: 'staticWidgets' | 'dynamicWidgets' = 'staticWidgets') {
        return this.ssip.getStylesForWidget(customId, widgetType);
    }
}
