import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ElementRef,
    Inject,
    Injector,
    Input,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import * as $ from 'jquery';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import {IMFXAccordionComponent} from "../../../../modules/search/detail/components/accordion.component/imfx.accordion.component";
import {IMFXHtmlPlayerComponent} from "../../../../modules/controls/html.player/imfx.html.player";
import {IMFXDefaultTabComponent} from "../../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component";

import {GLComponent} from "../../../../modules/search/detail/gl.component";
import {LocalStorageService} from "ngx-webstorage";
import {TranslateService} from '@ngx-translate/core';
import {SplashProvider} from "../../../../providers/design/splash.provider";
import {IMFXMetadataTabComponent} from "../../../../modules/search/detail/components/metadata.tab.component/imfx.metadata.tab.component";
import {
    LayoutManagerDefaults,
    LayoutManagerModel,
    LayoutType
} from "../../../../modules/controls/layout.manager/models/layout.manager.model";
import {IMFXNotAvailableComponent} from "../../../../modules/controls/not.available.comp/imfx.not.available.comp";
import {HTMLPlayerService} from "../../../../modules/controls/html.player/services/html.player.service";
import {NotificationService} from "../../../../modules/notification/services/notification.service";
import {GoldenTabs} from "./constants/constants";
import {DetailService} from "../../../../modules/search/detail/services/detail.service";
import {JobStatuses} from "../../../workflow/constants/job.statuses";
import {SimpleListComponent} from "../../../../modules/controls/simple.items.list/simple.items.list";
import { TelestreamComponent } from 'app/modules/controls/telestream/telestream.component';

declare var GoldenLayout: any;

@Component({
    selector: 'golden-outgest-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXMetadataTabComponent,
        IMFXNotAvailableComponent,
        SimpleListComponent,
        TelestreamComponent
    ],
    providers: [
        HTMLPlayerService
    ]
})

export class OutgestGLComponent extends GLComponent {
    public layoutModel: LayoutManagerModel;
    @Input() layoutType: LayoutType = LayoutType.Outgest;
    private metadataComponent: any;
    private mediaListComponent: any;
    private telestreamComponent: any;
    public itemsMediaList = [];
    private selectedMediaId = 0;
    private allValidTabs = GoldenTabs.tabs;
    private synchronizationSubsEnabled: boolean = false;

    constructor(@Inject(ElementRef) protected el: ElementRef,
                @Inject(ViewContainerRef) protected viewContainer: ViewContainerRef,
                @Inject(ComponentFactoryResolver) protected componentFactoryResolver: ComponentFactoryResolver,
                @Inject(LocalStorageService) protected storageService: LocalStorageService,
                @Inject(ChangeDetectorRef) protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                @Inject(SplashProvider) protected splashProvider: SplashProvider,
                @Inject(DetailService) protected detailService: DetailService,
                @Inject(NotificationService) protected notificationRef: NotificationService,
                public injector: Injector) {
        super(el, viewContainer, componentFactoryResolver, storageService, cd, translate, splashProvider, detailService, injector, notificationRef);
    }

    ngOnInit() {
    }

    ngOnLayoutInit(model) {
        this.config.componentContext = this;
        this.storagePrefix = this.config.options.titleForStorage + '.saved.state';
        if (model.actualModel && model.actualModel.Layout) {
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
                    if (this.layoutType == LayoutType.Outgest) {
                        this.layoutConfig = JSON.parse(LayoutManagerDefaults.Outgest);
                    }
                }
            }
            else {
                this.layoutModel = model.defaultModel;
                if (this.layoutType == LayoutType.Outgest) {
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.Outgest);
                }
            }
        }
        this.postOnInit();
    }

    postOnInit() {
        this.setView();
        (<any>window).GoldenLayout.__lm.items.Stack.prototype._highlightHeaderDropZone = this._highlightHeaderDropZoneOverride;
        (<any>window).GoldenLayout.__lm.LayoutManager.prototype._$createRootItemAreas = this._$createRootItemAreasOverride;

        this.provider.setCreatePopoutMethod();
    }

    setView() {
        this.layoutConfig = this.checkActualActiveItemIndex(this.layoutConfig);
        this.layoutConfig.settings.showCloseIcon = false;
        this.layoutConfig.settings.reorderEnabled = false;
        this.layoutConfig.settings.isClosable = false;
        this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));

        this.itemsMediaList = this.config.moduleContext.itemsMediaList;

        let self = this;
        this.addJobDataTab(self);
        this.addMediaDataTab(self);
        this.addMediaList(self);
        this.addTelestream(self);
        this.setEvents();
        super.onStateChanged(this);
        this.layout.init();
        this.createNewTabsAfterInit();
        this.splashProvider.onHideSpinner.emit();
        super.setViewLayout();
    };

    addJobDataTab(self) {
        this.layout.registerComponent('JobData', (container, componentState) => {
            this.translateTitle(container, '.jobdata');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.moduleContext.savingModel.Job;
            compRef.instance.columnData = self.config.options.jobColumnData;
            compRef.instance.lookup = self.config.options.jobLookup;
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMediaDataTab(self) {
        this.layout.registerComponent('Data', (container, componentState) => {
            this.translateTitle(container, '.data');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.options.file;
            compRef.instance.columnData = self.config.options.columnData;
            compRef.instance.lookup = self.config.options.lookup;
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next(self.config.options.file);
            });
            self.metadataComponent = container;
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
                    self.config.options.file = data.file;
                    self.detailsComponent && ( self.detailsComponent.compRef.instance.file = data.file );
                    self.detailsComponentFile = data.file;

                    // refresh meta data comp
                    self.metadataComponent && self.metadataComponent.compRef.instance.refresh(data.file);
                    self.telestreamComponent && self.telestreamComponent.compRef.instance.refresh(data.file);
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

    addTelestream(self) {
        self.layout.registerComponent('Telestream', (container, componentState) => {
            let compRef;
            let fullKey = self.config.options.typeDetailsLocal + '.telestream';
            self.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = self.componentFactoryResolver.resolveComponentFactory(TelestreamComponent);
            compRef = self.viewContainer.createComponent(factory);

            //to save components initialisation order (Telestream and MediaList)
            setTimeout(() => {
                self.mediaListComponent && self.mediaListComponent.compRef.instance.onSelect.subscribe(e => {
                    compRef.instance.setItem(e.file);
                });
            });

            self.telestreamComponent = container;

            compRef.instance.setItem(self.config.options.file);
            // compRef.instance['item'] = self.config.options.file;
            compRef.instance['deviceGroupId'] = self.config.moduleContext.playbackDeviceGroupId;

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

    changeLayoutHandler($event) {
        super.changeLayoutHandler($event, this);
        if (this.layoutModel.IsDefault) {
            this.saveLayoutHandler($event);
        }
        this.setView();
    }

    saveLayoutHandler($event) {
        this.layoutModel = $event;
        this.layoutConfig = JSON.parse(this.layoutModel.Layout);
        this.storageService.store(this.storagePrefix, JSON.stringify(this.layoutModel));
    }

    getSelectedMediaItemIndex() {
        if (Array.isArray(this.config.moduleContext.mediaItems)) {
            return this.config.moduleContext.mediaItems.findIndex(el => el.ID == this.selectedMediaId);
        } else {
            return -1;
        }
    }
    translateTitle(container, type) {
        let fullKey = this.config.options.typeDetailsLocal + type;
        this.translate.get(fullKey).subscribe(
            (res: string) => {
                container._config.title = res;
            });
    };
    getReadOnlyModeForTab(file) {
        let data = this.storageService.retrieve('permissions');
        if (this.config.moduleContext.savingModel.Task.LOCKED_BY !== data.FullName) {
            return true;
        }
        if (this.config.moduleContext.savingModel.Task.TSK_STATUS !== JobStatuses.INPROG) {
            return true;
        } else {
            return file.IsGanged && !file.IsGangedMain || false;
        }
    }
    setReadOnlyMode() {
        let readOnly = this.getReadOnlyModeForTab(this.config.options.file);
        this.layout.emit('setReadOnly', readOnly);
    };
    createNewTabsAfterInit() {
        if (!this.layout.root)
            return;
        for (var i = 0; i < this.allValidTabs.length; i++) {
            let tab = this.allValidTabs[i];
            let buf = this.layout.root.getItemsByFilter(function (el) {
                return el.componentName == tab.tTitle;
            });
            if (buf.length === 0) {
                this.newTabs.push(tab);
            }
        }
        this.cd.detectChanges();
    }
}
