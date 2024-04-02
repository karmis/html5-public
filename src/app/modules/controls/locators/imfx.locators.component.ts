import {
    Component, EventEmitter, Injectable, Inject, Output, ViewEncapsulation, ChangeDetectorRef,
    NgZone, IterableDiffers, KeyValueDiffers, Input
} from '@angular/core';
import { LocatorsProvider } from './providers/locators.provider';
import { LocatorsService } from './services/locators.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../../modules/notification/services/notification.service';
import { Subject, Subscription, Observable } from "rxjs";
import { CustomLabels } from "../../../services/system.config/search.types";
import { SessionStorageService } from "ngx-webstorage";
import { UtilitiesService } from "../../../services/common/utilities.service";

@Component({
    selector: 'imfx-logger-locators',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [LocatorsService],
})
@Injectable()
export class IMFXLocatorsComponent {
    @Input() onRefresh: Subject<any> = new Subject();
    @Input() locatorsFrameSettings: {
        ReadOnly: boolean,
        Columns: any[]
    };
    @Output() onSaveMediaTagging: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelectLocatorTab: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSetTaggingNode: EventEmitter<any> = new EventEmitter();
    @Output() onSetTimecodeString: EventEmitter<any> = new EventEmitter();
    @Output() onDeleteItem: EventEmitter<any> = new EventEmitter();
    reloadTaggingData: Subject<any> = new Subject();
    onRowUnselected: Subject<any> = new Subject();
    public taxonomySettings: any[];
    active: string = 'Comments';
    activeTab: number = 1;
    // blackDetectedConfig: any;
    locatorTabConfig = {
        blackdetect: null,
        comments: null,
        legal: null,
        cuts: null,
    }
    config: any;
    loadedSeries: Array<any>;
    public waitForInOutTimecodes: boolean = false;
    public playerExist: boolean = true;
    private getTaggingSubscription: Subscription;
    private reloadTaggingSubscription: Subscription;
    private timecodesInvalid: boolean = false;
    private dataValid: boolean = true;
    customLabels: CustomLabels = {
        cuts: "Cuts",
        legal: "Legal",
        comments: "Comments"
    }

    constructor(private provider: LocatorsProvider, private service: LocatorsService,
                private translate: TranslateService,
                private cd: ChangeDetectorRef,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                private sessionStorage: SessionStorageService,
                private utilities: UtilitiesService) {
        this.getTaggingSubscription = this.provider.onGetMediaTaggingForSave.subscribe((res: any) => {
            this.saveMediaTagging();
        });
        this.reloadTaggingSubscription = this.provider.onReloadMediaTagging.subscribe((res: any) => {
            this.reloadMediaTagging();
        });
        this.onRefresh.subscribe(data => {
            this.setReadOnly(data);
        });
    };

    ngOnInit() {
        !this.config.options.provider ?
            this.config.options.provider = this.provider :
            this.provider = this.config.options.provider;

        !this.config.options.service ?
            this.config.options.service = this.service :
            this.service = this.config.options.service;
        this.loadedSeries = this.config.loadedSeries;
        let idx = 0;
        for (let e in this.locatorTabConfig) {
            this.locatorTabConfig[e] = {
                tagType: e,
                columns: e.toLocaleLowerCase() == 'blackdetect' ? this.config.blackDetectedColumns : this.config.commentsColumns,
                file: this.config.file,
                series: this.config.series.filter(function (el) {
                    return el.TagType.toLocaleLowerCase() == e.toLocaleLowerCase();
                }),
                elem: this.config.elem,
                componentContext: this.config.componentContext,
                locatorsComponent: this,
                hasOuterFilter: false,
                id: e.toLocaleLowerCase() == 'blackdetect' ? -1 : idx++,
                canSetFocus: this.config.canSetFocus,
                readOnly: this.config.readOnly,
                hasTagColumn: e.toLocaleLowerCase() == 'blackdetect' ? false : true,
                playerExist: this.playerExist,
                dataValid: true,
                timecodesInvalid: false
            };
        }
        this.provider.config = this.config;
        this.setCustomLabels();
    };

    ngOnDestroy() {
        this.getTaggingSubscription.unsubscribe();
        this.reloadTaggingSubscription.unsubscribe();
    };

    ngAfterViewInit() {
        this.onRowUnselected.next();
    };

    /**
     * add clip into active tab
     */
    addClip(data) {
        if (this.active.toLocaleLowerCase() == this.locatorTabConfig.blackdetect.tagType.toLocaleLowerCase())
            return;
        !!this.active !== false && this.locatorTabConfig[this.active.toLocaleLowerCase()].moduleContext.addClip(data, data.replace, this.locatorTabConfig[this.active.toLocaleLowerCase()].id);
    };

    /**
     * add tag into active tab and selected row
     */
    addTag(data) {
        if (!!this.active !== false) {
            let conf = this.locatorTabConfig[this.active.toLocaleLowerCase()];
            if (conf) {
                if (conf.moduleContext) {
                    let m = conf.moduleContext;
                    let res = m.addTag(data);
                    if (res === true) {
                        m.refreshGrid();
                    }
                }
            }
        }
    };

    /**
     * prepare data for save
     */
    public saveMediaTagging(series?: Array<any>, guid?: string, fileId?: number, showNotify: boolean = true): Observable<Subscription> {
        return new Observable((observer: any) => {
            let res = [];
            series = series || this.config.series;

            series.forEach((el) => {
                if (el.TagType !== 'Blackdetect') {
                    res.push({
                        Id: el.Id,
                        InTc: el.InTc,
                        OutTc: el.OutTc,
                        Notes: el.Notes,
                        LinkGuid: guid || this.config.file.DFILE_LINK_GUID,
                        Origin: el.indicator ? el.indicator.title : el.Origin,
                        TagType: el.TagType,
                        TaxonomyLinks: el.TaxonomyLinks,
                        MediaId: el.Id ? (el.MediaId ? el.MediaId : fileId || this.config.file.ID) : (fileId || this.config.file.ID)
                    });
                }
            });

            this.provider.saveMediaTagging(res, guid).subscribe(resp => {
                let message = this.translate.instant('media_logger.locators_success_save');
                if (showNotify)
                    this.notificationRef.notifyShow(1, message);
                this.provider.successSave();
                observer.next(resp);
            }, (error) => {
                let message = this.translate.instant('media_logger.locators_error_save');
                this.notificationRef.notifyShow(2, message + guid);
                this.provider.errorSave();
                observer.next(false);
                observer.complete();
            }, () => {
                observer.complete();
            });
        });
    };

    deleteItem(data) {

        this.onDeleteItem.emit(data);
    }

    /**
     * actualizate media tagging data after saving
     */
    updateSavedMediaTagging(newIds, series, fileGuid) {
        // delete items with Id <=0
        series = series.filter((el) => {
            return el.Id >= 0;
        });
        // if returns new items Ids
        if (newIds) {
            series.filter((el) => {
                return el.Id === 0 && el.TagType !== 'Blackdetect';
            }).forEach((el, ind) => {
                el.Id = newIds[ind];
            });
        }
        this.config.series = series;
        this.config.elem.emit('updateLocator', {fileGuid: fileGuid, series: series});
        this.refresh({file: this.config.file, series: this.config.series});
    };

    selectTab(active, activeTitle) {
        this.activeTab = active;
        //we exclude the excess emit of event.
        if (this.active == activeTitle) {
            return;
        }

        this.active = activeTitle;
        this.config.elem.emit('clearMarkers', 1);
        if (this.active.toLocaleLowerCase() == this.locatorTabConfig.blackdetect.tagType.toLocaleLowerCase()) {
            this.config.elem.emit('disableAllMarkersButtons');
        }
    }

    setFocusOnGrid() {
        let mc = this.locatorTabConfig[this.active.toLocaleLowerCase()].moduleContext;
        mc && mc.setFocusOnGrid();
        if (this.active.toLocaleLowerCase() == this.locatorTabConfig.blackdetect.tagType.toLocaleLowerCase()) {
            this.config.elem.emit('disableAllMarkersButtons');
        }
    }

    /**
     * reload media tagging data
     */
    reloadMediaTagging() {
        for (let e in this.locatorTabConfig) {
            this.locatorTabConfig[e].series = JSON.parse(JSON.stringify(this.loadedSeries.filter(function (el) {
                return el.TagType.toLocaleLowerCase() == e.toLocaleLowerCase();
            })));
        }
        this.reloadTaggingData.next();
        this.provider.saveValid = false;
        this.cd.detectChanges();
    }

    onSaveValid() {
        this.provider.saveValid = true;
        this.cd.detectChanges();
    }

    refresh(o) {
        for (let e in this.locatorTabConfig) {
            this.locatorTabConfig[e] = {
                tagType: e,
                columns: e.toLocaleLowerCase() == 'blackdetect' ? this.config.blackDetectedColumns : this.config.commentsColumns,
                file: o.file,
                series: o.series.filter(function (el) {
                    return el.TagType.toLocaleLowerCase() == e.toLocaleLowerCase();
                }),
                elem: this.config.elem,
                componentContext: this.config.componentContext,
                locatorsComponent: this,
                hasOuterFilter: false,
                canSetFocus: this.locatorTabConfig[e].canSetFocus,
                id: this.locatorTabConfig[e].id,
                moduleContext: this.locatorTabConfig[e].moduleContext,
                readOnly: this.config.readOnly,
                playerExist: this.playerExist,
                dataValid: this.locatorTabConfig[e].dataValid,
                timecodesInvalid: this.locatorTabConfig[e].timecodesInvalid
            };
            this.locatorTabConfig[e].moduleContext && this.locatorTabConfig[e].moduleContext.refreshGrid({series: this.locatorTabConfig[e].series});
        }
        this.config.file = o.file;
        this.config.series = o.series;
        if (!this.cd['destroyed']) {
            this.cd.detectChanges();
        }
        this.onSelectLocatorTab.emit({series: o.series});
    }

    setReadOnly(readOnly) {
        this.config.readOnly = readOnly;
        for (let e in this.locatorTabConfig) {
            this.locatorTabConfig[e].readOnly = this.config.readOnly;
        }
        this.reloadTaggingData.next();
    }

    mediaTagging_onSetNode = o => {
        this.onSetTaggingNode.emit(o);
    };
    setTimecodeString = tc => {
        this.onSetTimecodeString.emit(tc);
    };

    isDataValid(valid) {
        this.locatorTabConfig[this.active.toLocaleLowerCase()].dataValid = valid;
        let dataValid = true;
        for (let e in this.locatorTabConfig) {
            dataValid = dataValid && this.locatorTabConfig[e].dataValid;
        };
        this.config.elem.emit('isDataValid', dataValid);
    }

    isTimecodesInvalid(invalid) {
        this.locatorTabConfig[this.active.toLocaleLowerCase()].timecodesInvalid = invalid;
        let timecodesInvalid = false;
        for (let e in this.locatorTabConfig) {
            timecodesInvalid = timecodesInvalid || this.locatorTabConfig[e].timecodesInvalid;
        }
        ;
        this.config.elem.emit('timecodesInvalid', timecodesInvalid);
    }

    setCustomLabels() {
        this.customLabels = this.utilities.getCustomLabels();
        this.cd.detectChanges();
    }
}
