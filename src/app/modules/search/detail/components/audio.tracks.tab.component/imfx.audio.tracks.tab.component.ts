import {
    ApplicationRef,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver, ElementRef,
    EventEmitter, Inject,
    Injectable,
    Injector, Input, OnDestroy, Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { SlickGridComponent } from "../../../slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions,
    SlickGridConfigPluginSetups
} from "../../../slick-grid/slick-grid.config";
import { SlickGridProvider } from "../../../slick-grid/providers/slick.grid.provider";
import { SlickGridService } from "../../../slick-grid/services/slick.grid.service";
import {
    SlickGridButtonFormatterEventData, SlickGridCheckBoxFormatterEventData, SlickGridColumn,
    SlickGridSelect2FormatterEventData
} from "../../../slick-grid/types";
import { Select2Formatter } from "../../../slick-grid/formatters/select2/select2.formatter";
import { LookupService } from "../../../../../services/lookup/lookup.service";
import { TextFormatter } from "../../../slick-grid/formatters/text/text.formatter";
import { VideoJSCurrentTimeProvider } from "../../../../controls/html.player/providers/videojs.current.time.provider";
import { AudioTracksService } from "./services/audio.tracks.service";
import { AudioSynchProvider } from "../../../../controls/html.player/providers/audio.synch.provider";
import { ATFirstSlickGridProvider } from "./providers/audiotracks.first.slickgrid.provider";
import { ATSecondSlickGridProvider } from "./providers/audiotracks.second.slickgrid.provider";
import { PlayButtonFormatter } from "../../../slick-grid/formatters/play-button/play-button.formatter";
import { DeleteFormatter } from "../../../slick-grid/formatters/delete/delete.formatter";
import { ActivatedRoute } from "@angular/router";
import { ATFirstSlickGridViewsProvider } from "./providers/first.slickgrid.views.provider";
import { ATSecondSlickGridViewsProvider } from "./providers/second.slickgrid.views.provider";
import { DetailProvider } from "../../providers/detail.provider";
import { HTMLPlayerService } from "../../../../controls/html.player/services/html.player.service";
import { Subscription, Subject } from 'rxjs';
import { NotificationService } from "../../../../notification/services/notification.service";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'imfx-audio-tracks-tab',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
        '../../../../styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        ATFirstSlickGridProvider,
        ATSecondSlickGridProvider,
        {provide: SlickGridProvider, useClass: ATFirstSlickGridProvider},
        {provide: SlickGridProvider, useClass: ATSecondSlickGridProvider},
        SlickGridService,
        VideoJSCurrentTimeProvider,
        AudioTracksService,
        ATFirstSlickGridViewsProvider,
        ATSecondSlickGridViewsProvider,
        // DetailProvider,
        HTMLPlayerService
    ]
})
@Injectable()
export class IMFXAudioTracksTabComponent implements OnDestroy {
    @ViewChild('audioTracksGrid', {static: false}) private audioTracksGrid: SlickGridComponent;
    @ViewChild('tracksGrid', {static: false}) private tracksGrid: SlickGridComponent;

    @Input() onRefresh: Subject<any> = new Subject();
    @Output() onDataChanged: EventEmitter<any> = new EventEmitter();
    @Output() isDataValid: EventEmitter<any> = new EventEmitter();
    @Output() onUpdateAudioSrc: EventEmitter<any> = new EventEmitter();
    @Output() setAudioTrackByIndex: EventEmitter<any> = new EventEmitter();
    public onResize: EventEmitter<{ comp: any }> = new EventEmitter<{ comp: any }>();
    config: any = {};
    active: number = 1;
    validationEnabled: boolean = true;
    formatterCheckBoxOnChangeSub: Subscription;

    private audioTracksGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: ATFirstSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 35,
                forceFitColumns: true
            }
        })
    });
    private tracksGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        // providerType: TitlesSlickGridProvider,
        providerType: ATSecondSlickGridProvider,
        serviceType: SlickGridService,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                search: {
                    enabled: false
                }
            },
            plugin: <SlickGridConfigPluginSetups>{
                rowHeight: 35,
                forceFitColumns: true
            }
        })
    });
    private htmlPlayerService: HTMLPlayerService;
    private playBtnSub: Subscription;
    private forceReadOnly = false;
    private columnsConf = [];
    private destroyed$: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private compFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private lookup: LookupService,
                private injector: Injector,
                private audioTracksService: AudioTracksService,
                private route: ActivatedRoute,
                @Inject(TranslateService) public translate: TranslateService,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        this.htmlPlayerService = this.injector.get(HTMLPlayerService);
        this.onRefresh.pipe(
            takeUntil(this.destroyed$)
        ).subscribe(data => {
            this.refreshGrid(data.file, data.readOnly);
        });
    }

    ngAfterViewInit() {
        if (this.config && ((this.config.elem && !this.config.elem._config._isHidden) || this.config.externalMode)) {
            this.setAudioTracks();
        }
        this.tracksGrid.provider.formatterPlayButtonOnClick.subscribe((d: SlickGridButtonFormatterEventData) => {
            let url = '';
            if (d.value === true) {
                if ((<any>d.data.data).UsePresignedUrl) {
                    this.htmlPlayerService.getPresignedUrl((<any>d.data.data).Id).pipe(
                        takeUntil(this.destroyed$)
                    ).subscribe((res: any) => {
                        this.onUpdateAudioSrc.emit({src: res, label: (<any>d.data.data).Filename});
                    });
                } else {
                    url = (<any>d.data.data).PROXY_URL;
                    this.onUpdateAudioSrc.emit({src: url, label: (<any>d.data.data).Filename});
                }
            } else {
                this.onUpdateAudioSrc.emit({src: url, label: (<any>d.data.data).Filename});
            }
        });
        if (this.config && this.config.file) {
            this.callValidation();
        }
    }

    ngOnDestroy() {
        if (this.formatterCheckBoxOnChangeSub) {
            this.formatterCheckBoxOnChangeSub.unsubscribe();
        }
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    public loadComponentData() {
        this.setAudioTracks();
    }

    setAudioTracks() {
        let audioTracks = this.config.file['AudioTracks']||[];
        this.columnsConf = this.config.context.config.moduleContext.taskFile && this.config.context.config.moduleContext.taskFile.TechReport ?
            this.config.context.config.moduleContext.taskFile.TechReport.Settings.Assess.AssessAudioFrame.Columns : [];
        this.forceReadOnly = this.config.context.config.moduleContext.taskFile && this.config.context.config.moduleContext.taskFile.TechReport ?
            this.config.context.config.moduleContext.taskFile.TechReport.Settings.Assess.AssessAudioFrame.ReadOnly : false;
        let globalAudioTracksColsView = this.injector.get(ATFirstSlickGridViewsProvider).getCustomColumns(null, this.config.readOnly, this.forceReadOnly, this.columnsConf);
        let globalTracksColsView = this.injector.get(ATSecondSlickGridViewsProvider).getCustomColumns(null, this.config.readOnly);

        globalTracksColsView.unshift(<any>{
            id: -1,
            name: 'Audio Files',
            field: '*',
            minWidth: 60,
            width: 60,
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            formatter: PlayButtonFormatter,
            isFrozen: true,
            isCustom: true,
            isRelatedAudio: true,
            __deps: {
                injector: this.injector,
                data: []
            }
        });
        debugger
        if (this.config && this.config.readOnly) {
            // if (this.config.readOnly === true) {
            this.selectAudioTracks(globalAudioTracksColsView, globalTracksColsView);
        } else {
            let select2ColLanguages = null;
            let select2ColMS = null;
            let select2ColTypeId = null;
            let select2ColQcId = null;
            globalAudioTracksColsView = globalAudioTracksColsView.map((c: SlickGridColumn, i: number) => {
                if (c.field == 'LanguageId') {
                    select2ColLanguages = i;
                } else if (c.field == 'MsTypeId') {
                    select2ColMS = i;
                } else if (c.field == 'TypeId') {
                    select2ColTypeId = i;
                } else if (c.field == 'QcFlag') {
                    select2ColQcId = i;
                }
                return c;
            });
            let audioMsTypes = this.lookup.getLookups('AudioMsTypes');
            let audioContentTypes = this.lookup.getLookups('AudioContentTypes');
            let languages = this.lookup.getLookups('Languages');

            globalAudioTracksColsView[select2ColQcId].__deps.data = {
                values: [
                    {Id: -1, Name: "Failed"},
                    {Id: 0, Name: "NOT QC'd"},
                    {Id: 1, Name: "Passed"}
                ],
                rule: {
                    key: 'Id',
                    text: 'Name'
                },
                validationEnabled: this.validationEnabled
            };

            let completed = 0;
            audioMsTypes.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((resp) => {
                globalAudioTracksColsView[select2ColMS].__deps.data = {
                    values: resp,
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('AudioMsTypes'),
                    validationEnabled: this.validationEnabled
                };
                completed++;
                if (completed == 3) {
                    this.selectAudioTracks(globalAudioTracksColsView, globalTracksColsView);
                }
            });
            audioContentTypes.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((resp) => {
                globalAudioTracksColsView[select2ColTypeId].__deps.data = {
                    values: resp,
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('AudioContentTypes'),
                    validationEnabled: this.validationEnabled
                };
                completed++;
                if (completed == 3) {
                    this.selectAudioTracks(globalAudioTracksColsView, globalTracksColsView);
                }
            });
            languages.pipe(
                takeUntil(this.destroyed$)
            ).subscribe((resp) => {
                globalAudioTracksColsView[select2ColLanguages].__deps.data = {
                    values: resp,
                    rule: this.lookup.getLookupRuleForConvertToSelect2Item('Languages'),
                    validationEnabled: this.validationEnabled
                };
                completed++;
                if (completed == 3) {
                    this.selectAudioTracks(globalAudioTracksColsView, globalTracksColsView);
                }
            });
            this.audioTracksGrid.provider.onRowDelete.subscribe((res: any) => {
                let resId = res.Id || res.customId;
                let audioTracks = this.config.file['AudioTracks']||[];
                let id = null;
                audioTracks.forEach((el, ind) => {
                    if (el.Id === resId || el.customId === resId)
                        id = ind;
                });
                if (id !== null) {
                    let audioTrack = audioTracks.splice(id, 1);
                    if (audioTrack[0].customId == null) {
                        audioTrack[0].Id *= -1;
                        this.config.file.DeletedAudioTracks.push(audioTrack[0]);
                    }
                    audioTracks.forEach((el, ind) => {
                        el.TrackNo = ind + 1;
                    });
                    let detailProvider = this.injector.get(DetailProvider);
                    let _data = this.audioTracksGrid.provider.prepareData(detailProvider._deepCopy(audioTracks), audioTracks.length);
                    this.audioTracksGrid.provider.getSlick().invalidate();
                    this.audioTracksGrid.provider.setData(_data, true);
                }
                this.onDataChanged.emit();
                this.callValidation();
            });
            this.audioTracksGrid.provider.formatterTextOnChange.subscribe((res: SlickGridSelect2FormatterEventData) => {// TODO: check actual
                let audioTracks = this.config.file['AudioTracks']||[];
                let _id = res.data.data.Id || res.data.data['customId'];
                audioTracks.forEach(el => {
                    if (el.Id === _id || el['customId'] === _id) {
                        el[res.data.columnDef.field] = res.value;
                    }
                });
                res.data.data[res.data.columnDef.field] = res.value;
                this.onDataChanged.emit();
                this.callValidation();
            });
            if (!this.formatterCheckBoxOnChangeSub) {
                this.formatterCheckBoxOnChangeSub = this.audioTracksGrid.provider.formatterCheckBoxOnChange.subscribe((res: SlickGridCheckBoxFormatterEventData) => {
                    let audioTracks = this.config.file['AudioTracks']||[];
                    let _id = res.data.data.Id || res.data.data['customId'];
                    audioTracks.forEach(el => { // only one or 0 row can be true
                        if (el[res.data.columnDef.field]) {
                            let row = this.audioTracksGrid.provider.slick.getData().getItems().filter(el => {
                                return el[res.data.columnDef.field] == true;
                            })[0];
                            row[res.data.columnDef.field] = false;
                            this.audioTracksGrid.provider.slick.invalidateRow(row.id);
                            this.audioTracksGrid.provider.slick.render();
                        }
                        el[res.data.columnDef.field] = false;
                        if (el.Id === _id || el['customId'] === _id) {
                            el[res.data.columnDef.field] = res.value;
                        }
                    });
                    res.data.data[res.data.columnDef.field] = res.value;
                    this.onDataChanged.emit();
                    this.callValidation();
                });
            }
            this.audioTracksGrid.provider.formatterSelect2OnSelect.subscribe((res: SlickGridSelect2FormatterEventData) => {
                let audioTracks = this.config.file['AudioTracks']||[];
                let _id = res.data.data['Id'] || res.data.data['customId'];
                audioTracks.forEach(el => {
                    if (el.Id === _id || el['customId'] === _id) {
                        el[res.data.columnDef.field] = parseInt(<any>res.value.id, 10);
                        switch (res.data.columnDef.field) {
                            case 'LanguageId': {
                                el['Language'] = res.value.text;
                                break;
                            }
                            case 'MsTypeId': {
                                el['MS'] = res.value.text;
                                break;
                            }
                            case 'TypeId': {
                                el['Content'] = res.value.text;
                                break;
                            }
                            case 'QcFlag': {
                                el['QcText'] = res.value.text;
                                break;
                            }
                            default:
                                break;
                        }
                    }
                });
                res.data.data[res.data.columnDef.field] = parseInt(<any>res.value.id, 10);

                this.onDataChanged.emit();
                this.callValidation();
            });
            this.audioTracksGrid.provider.resize();
        }
    }

    selectAudioTracks(globalAudioTracksColsView, globalTracksColsView) {
        if(!this.audioTracksGrid || !this.audioTracksGrid.provider) {
            return;
        }
        this.audioTracksGrid.provider.setGlobalColumns(globalAudioTracksColsView);
        this.audioTracksGrid.provider.setDefaultColumns(globalAudioTracksColsView, [], true);
        let detailProvider = this.injector.get(DetailProvider);

        let audioTracks = this.audioTracksGrid.provider.deleteUnnecessaryDataBeforeSaving(this.config.file['AudioTracks']);
        this.audioTracksGrid.provider.buildPageByData({Data: detailProvider._deepCopy(audioTracks)});

        let tableRows = [];
        this.audioTracksService.getAudioTracks(this.config.file['ID']).pipe(
            takeUntil(this.destroyed$)
        ).subscribe((tableRows: any[]) => {
            this.tracksGrid.provider.setGlobalColumns(globalTracksColsView);
            this.tracksGrid.provider.setDefaultColumns(globalTracksColsView, [], true);
            this.tracksGrid.provider.buildPageByData({Data: tableRows||[]});
            // this.tracksGrid.provider.formatterPlayButtonOnClick.observers = [];

        });
    };

    getStandardObject() {
        return {
            Language: null,
            MS: null,
            LangTag: "",
            TypeId: null,
            QcText: null,
            IntAudioFlag: null,
            DateAdded: "",
            Miid: this.config.file.ID,
            TimecodeFormat: this.config.file.TimecodeFormat,
            customId: new Date().getTime()
        }
    }

    addEvent() {
        // this.config.elem.emit('addEvent');
        let tracks = this.config.file['AudioTracks']||[];
        const newItem: any = this.getStandardObject();
        newItem.TrackNo = tracks.length + 1;
        tracks.push(newItem);
        let detailProvider = this.injector.get(DetailProvider);
        let _data = this.audioTracksGrid.provider.prepareData(detailProvider._deepCopy(tracks), tracks.length);
        this.audioTracksGrid.provider.getSlick().invalidate();
        this.audioTracksGrid.provider.setData(_data, true);
        this.audioTracksGrid.provider.setSelectedRow(_data.length - 1);
        this.audioTracksGrid.provider.slick.scrollRowToTop(_data[_data.length - 1]);
        this.onDataChanged.emit();
        this.callValidation();
    }

    addEventToGrid(data) {
    }

    // volumeDrag = false;
    // currentVolume = 1;
    // volumeWrapperOffset;
    // volumeSliderOffset;
    //
    // private startVolumeDrag(e) {
    //     this.volumeDrag = true;
    //     this.volumeWrapperOffset = $(this.currentVolumeWrapper.nativeElement).offset();
    //     this.volumeSliderOffset = this.volumeDragContainer.nativeElement.clientWidth;
    // }
    //
    // private checkVolumeDrag(e) {
    //     if (this.volumeDrag) {
    //         var width = this.clamp((e.pageX - 7) - this.volumeWrapperOffset.left, 0, 80);
    //         this.currentVolume = width / 80;
    //         this.onUpdateAudioVolume.emit(this.currentVolume);
    //         this.volumeDragContainer.nativeElement.style.left = width + "px";
    //         this.volumeFiller.nativeElement.style.width = width + "px";
    //     }
    // }
    //
    // private checkVolumeClick(e) {
    //     this.volumeWrapperOffset = $(this.currentVolumeWrapper.nativeElement).offset();
    //     this.volumeSliderOffset = this.volumeDragContainer.nativeElement.clientWidth;
    //     var width = this.clamp((e.pageX - 7) - this.volumeWrapperOffset.left, 0, 80);
    //     this.currentVolume = width / 80;
    //     this.onUpdateAudioVolume.emit(this.currentVolume);
    //     this.volumeDragContainer.nativeElement.style.left = width + "px";
    //     this.volumeFiller.nativeElement.style.width = width + "px";
    // }
    //
    // private endVolumeDrag(e) {
    //     if (this.volumeDrag) {
    //         this.onUpdateAudioVolume.emit(this.currentVolume);
    //     }
    //     this.volumeDrag = false;
    // }

    private clamp(current, min, max) {
        return Math.min(Math.max(current, min), max);
    };

    selectTab(active) {
        this.active = active;
    }

    refreshGrid(data?: any, readOnly?: boolean) {
        if (readOnly != null) {
            this.config.readOnly = readOnly;
        }

        if (data) {
            this.config.file = data;
            this.setAudioTracks();
        }

        this.callValidation();
    };

    updateDataIds(ids) {
        let audioTracks = this.config.file['AudioTracks'].filter(el => {
            return el.customId != null;
        });
        audioTracks.forEach((el, idx) => {
            el.Id = ids[idx];
            delete el.customId;
        });
        this.config.file.DeletedAudioTracks = [];
        let detailProvider = this.injector.get(DetailProvider);
        let _data = this.audioTracksGrid.provider.prepareData(detailProvider._deepCopy(this.config.file['AudioTracks']), this.config.file['AudioTracks'].length);
        this.audioTracksGrid.provider.setData(_data, true);
    }

    getValidation() {
        if (this.config && this.config.readOnly) {
            return true;
        } else {
            let isValid = true;
            let audioTracks = this.config.file['AudioTracks']||[];
            audioTracks.forEach(el => {
                if ((el.TypeId == undefined) || (el.LanguageId == undefined) || (el.MsTypeId == undefined)) {
                    isValid = false;
                }
            });
            // this.audioTracksGrid.provider.onGetValidation.emit(function(valid){
            //     isValid = isValid && valid ? true : false;
            // });
            return isValid;
        }
    }

    public standardToString(dirtyObj, comp, stObj) {
        let obj = Object.assign({}, stObj);
        obj.id = dirtyObj[comp.key];
        obj.text = dirtyObj[comp.text];

        return obj;
    }

    public callValidation() {
        this.isDataValid.emit(this.getValidation());
    }

    public showAudioLoading(show) {
        this.tracksGrid.provider.formatterPlayButtonOnLoading.emit(show);
    }

    public showAudioError(error) {
        this.notificationRef.notifyShow(2, error);
        this.tracksGrid.provider.formatterPlayButtonOnLoadingError.emit(true);
    }
}
