import { ChangeDetectionStrategy, Component, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import * as $ from 'jquery';
import {
    IMFXAccordionComponent
} from '../../../../modules/search/detail/components/accordion.component/imfx.accordion.component';
import { IMFXHtmlPlayerComponent } from '../../../../modules/controls/html.player/imfx.html.player';
import {
    IMFXDefaultTabComponent
} from '../../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component';

import { IMFXImageComponent } from '../../../../modules/search/detail/components/image.component/imfx.image.component';
import {
    IMFXMediaTaggingTabComponent
} from '../../../../modules/search/detail/components/media.tagging.tab.component/imfx.media.tagging.tab.component';

import { IMFXLocatorsComponent } from '../../../../modules/controls/locators/imfx.locators.component';
import {
    IMFXTaxonomyComponent
} from '../../../../modules/search/detail/components/taxonomy.tab.component/imfx.taxonomy.tab.component';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import {
    IMFXVideoInfoComponent
} from '../../../../modules/search/detail/components/video.info.component/video.info.component';
import {
    LayoutManagerDefaults,
    LayoutType
} from '../../../../modules/controls/layout.manager/models/layout.manager.model';
import { GLLoggerComponent } from '../../../media-logger/gl.component';
import { SimpleListComponent } from '../../../../modules/controls/simple.items.list/simple.items.list';
import { GoldenTabs } from './constants/constants';
import { IMFXProTimelineComponent } from '../../../../modules/controls/imfx.pro.timeline/imfx.pro.timeline';
import { Observable, Subscription } from 'rxjs';
import {
    IMFXMediaInfoComponent
} from "../../../../modules/search/detail/components/mediainfo.tab.component/imfx.mediainfo.tab.component";

declare var GoldenLayout: any;

@Component({
    selector: 'golden-task-logger-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: '../../../media-logger/tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXVideoInfoComponent,
        IMFXImageComponent,
        IMFXMediaTaggingTabComponent,
        IMFXLocatorsComponent,
        IMFXTaxonomyComponent,
        SimpleListComponent,
        IMFXProTimelineComponent,
        IMFXMediaInfoComponent
    ]
})

export class GLTaskLoggerComponent extends GLLoggerComponent {
    public layoutType: LayoutType = LayoutType.TaskLogger;
    public allValidTabs = GoldenTabs.tabs;
    public tabsWithTimecodes = GoldenTabs.timecodesTabs;
    mediaInfoTab: any;
    protected loggerSeriesArray: Array<any> = [];
    protected requestCount: number = 0;
    public changeLayout: EventEmitter<any> = new EventEmitter<any>();
    @Input('config')
    set setConfig(config) {
        this.config = $.extend(true, this.config, config);
        // this.config.componentContext = this;
        if (this.config.providerType) {
            this.provider = this.injector.get(this.config.providerType);
            this.provider.config = this.config;
        }
    }
    ngOnLayoutInit(model) {
        this.config.componentContext = this;
        this.storagePrefix = this.config.options.titleForStorage + '.saved.state';

        if(model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.layoutConfig = JSON.parse(model.actualModel.Layout);
            this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
        }
        else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.layoutConfig = JSON.parse(this.layoutModel.Layout);
                    this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
                }
                else {
                    this.layoutModel = model.defaultModel;
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.Logging);
                }
            }
            else {
                this.layoutModel = model.defaultModel;
                this.layoutConfig = JSON.parse(LayoutManagerDefaults.TaskLogger);
            }
        }
        this.combineAllValidTabs();
        this.postOnInit();
        this.changeLayout.subscribe((res: any) => {
            new Promise((resolve, reject) => {
                resolve();
            }).then(
                () => {
                    this.layout.off('itemDestroyed');
                    this.layout.destroy();
                    this.layoutConfig = JSON.parse(this.layoutConfig);
                    this.config.componentContext = this;
                    this.updateData(res);
                    this.postOnInit();
                },
                (err) => {
                    console.log(err);
                }
            );
        });

    }
    setView() {
        let self = this;
        super.setViewCommon();
        this.addJobDataTab(self);
        this.addTimeline(self);
        this.addMediaList(self);
        this.addTagging(self);
        this.addTaxonomy(self);
        this.addMediaInfoOnlyCustomStatusTab(self);
        this.setEvents();
        super.onStateChanged(this);
        this.layout.on('poppedOut', function (contentItem) {
        })
        this.layout.on('popIn', function (contentItem) {
        })
        this.layout.init();
        this.createNewTabsAfterInit();
        this.splashProvider.onHideSpinner.emit();
        this.layout.root && this.layout.root.getItemsByFilter(function (el) {
            return el.type == 'stack' && el.contentItems.length == 0
        }).forEach(function (elem) {
            elem.remove();
        });
        this.createDragButtons();
    };


    addMediaInfoOnlyCustomStatusTab(self) {
        this.layout.registerComponent('MediaInfo', (container) => {
            let fullKey = this.config.options.typeDetailsLocal + '.media_info';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });

            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXMediaInfoComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            const techRep = self.config.moduleContext.taskFile.TechReport;
            compRef.instance['config'] = self.config.options.file;
            compRef.instance['showCommonInfo'] = true;
            compRef.instance['customMediaStatusLookups'] = self.config.moduleContext.customMediaStatusLookups;
            compRef.instance['customMediaStatusSettings'] = techRep
                && techRep.CustomMediaStatusSettings;
            compRef.instance['columnsSettings'] = techRep
                && techRep.Settings && techRep.Settings.General && techRep.Settings.General.MediaInfoFrame;
            compRef.instance['readOnly'] = self.getReadOnlyModeForTab(self.config.options.file);

            compRef.instance.onDataChanged.subscribe(res => {
                self.config.moduleContext.config.moduleContext.setDataChanged(true);
            });

            compRef.instance.isDataValid.subscribe(isValid => {
                if (isValid) {
                    container.tab && container.tab.element.find('i.lm_left').hide();
                } else {
                    container.tab && container.tab.element.find('i.lm_left').show();
                }
                self.config.moduleContext.config.moduleContext.setSaveButtonEnabled();
                self.allValidTabs.filter( el => {return el.tTitle == container.title} )[0].isValid = isValid;
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({
                    file: self.config.options.file,
                    readOnly: readOnly
                });
            });
            self.mediaInfoTab = container;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    addMediaList(self) {
        self.layout.registerComponent('MediaItems', (container, componentState) => {
            let compRef;
            let fullKey = self.config.options.typeDetailsLocal + '.media_list';
            self.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = self.componentFactoryResolver.resolveComponentFactory(SimpleListComponent);
            compRef = self.viewContainer.createComponent(factory);
            if (self.itemsMediaList.length == 0) {
                self.itemsMediaList.push(self.config.options.file);
                compRef.instance.items = self.itemsMediaList;
            }
            else {
                compRef.instance.items = self.itemsMediaList;
            }

            compRef.instance.onSelect.subscribe(data => {
                if (data.file.ID != self.config.options.file.ID) {
                    super.setConfigMediaItemsTab(self, data);
                    if ( self.mediaInfoTab ) {
                        self.mediaInfoTab.compRef.instance.refresh(self.config.options.file, self.getReadOnlyModeForTab(self.config.options.file));
                    }
                }
            });

            self.mediaListComponent = container;

            compRef.instance['elem'] = container;
            container.on('loadComponentData', () => {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            self.layout.on('refresh', () => {
                compRef._component.refresh();
            });

            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addJobDataTab(self) {
        this.layout.registerComponent('JobData', (container) => {
            let fullKey = this.config.options.typeDetailsLocal + '.jobdata';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.moduleContext.jobFile;
            compRef.instance.columnData = self.config.moduleContext.jobFileColumnData;
            compRef.instance.lookup = 'FriendlyNames.TM_MJOB';
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    };
    saveMediaTagging(): Observable<Subscription>  {
        return new Observable((observer: any) => {
            let nonValidTimecodeTabs = this.allValidTabs.filter( el => {
                return (el.isValid == false && (el.componentName == this.tabsWithTimecodes.Tagging) && el.timecodesInvalid);
            });
            if (nonValidTimecodeTabs.length !== 0) {
                this.notificationRef.notifyShow(2, 'Please check all timecodes!');
                observer.next(false);
                observer.complete();
            } else {
                // save locators
                this.requestCount = 0;
                this.loggerSeriesArray.forEach(el => {
                    this.taggingComponent.compRef.instance.saveMediaTagging(el.series, el.fileGuid, el.fileId, false).subscribe((res: any) => {
                        if (res) {
                            this.taggingComponent.compRef.instance.updateSavedMediaTagging(res, el.series, el.fileGuid);
                        }
                        this.requestCount++;
                        if (this.loggerSeriesArray.length == this.requestCount) {
                            let message = this.translate.instant('media_logger.success_save');
                            this.notificationRef.notifyShow(1, message);
                            observer.next(true);
                            observer.complete();
                        }
                    }, (error) => {
                        observer.next(false);
                        observer.complete();
                    });
                });
            }
        });
    }
    setReadOnlyMode() {
        let readonly = this.getReadOnlyModeForTab(this.config.options.file);
        this.layout.emit('setReadOnly', readonly);
        if (this.playerComponents.compRef.instance.clipBtns !== undefined) {
            this.playerComponents.compRef.instance.clipBtns = !readonly;
        }
        if (this.playerComponents.compRef.instance.pluginsProvider !== undefined) {
            this.playerComponents.compRef.instance.pluginsProvider.refreshClipBtnsPlugin(!readonly);
        }
    }

    changeLayoutHandler($event) {
        const self = this;
        super.changeLayoutHandler($event, self);
        this.saveLayoutHandler($event);
        this.setView();
    }
}
