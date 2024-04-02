import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewContainerRef,
    ComponentFactoryResolver,
    ChangeDetectorRef,
    Injector,
    ComponentRef,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {ProductionService} from '../../../services/production/production.service';
import {ProductionTypeDetail} from '../../production/constants/production.types';
import {GLComponent} from '../../../modules/search/detail/gl.component';
import {LocalStorageService} from 'ngx-webstorage';
import {TranslateService} from '@ngx-translate/core';
import {SplashProvider} from '../../../providers/design/splash.provider';
import {DetailService} from '../../../modules/search/detail/services/detail.service';
import {NotificationService} from '../../../modules/notification/services/notification.service';
import {
    LayoutManagerDefaults,
    LayoutManagerModel,
    LayoutType
} from '../../../modules/controls/layout.manager/models/layout.manager.model';
import $ from "jquery";
import * as _ from 'lodash';
import {SimpleListComponent} from '../../../modules/controls/simple.items.list/simple.items.list';
import {IMFXDefaultTabComponent} from '../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component';
import {IMFXNotesTabComponent} from '../../../modules/search/detail/components/notes.tab.component/imfx.notes.tab.component';
import {ProductionInfoTabComponent} from "../../../modules/search/detail/components/production.info.tab.component/production.info.tab.component";
import {Location} from '@angular/common';
import {IMFXRouteReuseStrategy} from '../../../strategies/route.reuse.strategy';
import {
    MakeListData,
    SourceMediaData,
    SourceProgsData,
    TemplateConfig,
    TemplateFields,
} from '../../../services/production/production.types';
import {ProductionSourceTabComponent} from '../../../modules/search/detail/components/production.source.tab.component/production.source.tab.component';
import {ProductionMakeListComponent} from '../../../modules/search/detail/components/production.make.list.component/production.make.list.component';
import {ProductionDetailProvider} from './providers/production.detail.provider';
import {ProductionTableTabComponent} from '../../../modules/search/detail/components/production.table.tab.component/production.table.tab.component';
import {ProductionAudioTabComponent} from '../../../modules/search/detail/components/production.audio.tab.component/production.audio.tab.component';
import {ProductionSegmentsTabComponent} from "../../../modules/search/detail/components/production.segments.tab.component/production.segments.tab.component";
import { PRODUCTION_DETAIL_TABS, PRODUCTION_TEMPLATE } from "./constants";
import {ProductionEventsTabComponent} from "../../../modules/search/detail/components/production.events.tab.component/production.events.tab.component";
import {IMFXMetadataTabComponent} from "../../../modules/search/detail/components/metadata.tab.component/imfx.metadata.tab.component";
import {IMFXModalComponent} from '../../../modules/imfx-modal/imfx-modal';
import {lazyModules} from '../../../app.routes';
import {IMFXModalEvent} from '../../../modules/imfx-modal/types';
import {IMFXModalProvider} from '../../../modules/imfx-modal/proivders/provider';
import {TemplateModalComponent} from './comps/temlate-modal/template.modal.component';
import {appRouter} from '../../../constants/appRouter';
import {ProductionSubtitlesTabComponent} from '../../../modules/search/detail/components/production.subtitles.tab.component/production.subtitles.tab.component';
import {TimeCodeFormat} from "../../../utils/tmd.timecode";
import {IMFXModalAlertComponent} from "../../../modules/imfx-modal/comps/alert/alert";
import { OverlayComponent } from '../../../modules/overlay/overlay';

@Component({
    moduleId: 'detail-production',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [
        DetailService,
        OverlayComponent
    ],
    entryComponents: [
        SimpleListComponent,
        IMFXDefaultTabComponent,
        IMFXNotesTabComponent,
        ProductionInfoTabComponent,
        ProductionMakeListComponent,
        ProductionSourceTabComponent,
        ProductionTableTabComponent,
        ProductionAudioTabComponent,
        ProductionSubtitlesTabComponent,
        ProductionEventsTabComponent,
        ProductionSegmentsTabComponent,
        IMFXMetadataTabComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ProductionDetailComponent extends GLComponent implements OnInit, OnDestroy {
    productionId = null;
    productionTypeDetail: ProductionTypeDetail = null;
    productionTemplateId: number | null = null;
    productionTitle = '';
    isInitComp = false;
    isDisabledSaveBtn = false;

    makeListComp: ProductionMakeListComponent;
    makeListData: MakeListData[] = [];

    sourceMediaComp: ProductionSourceTabComponent;
    sourceMediaData: SourceMediaData[] = [];

    sourceTitlesComp: ProductionSourceTabComponent;
    sourceTitlesData: SourceProgsData[] = [];

    historyData = [];
    historyComp: ProductionTableTabComponent;

    workflowData = [];
    workflowComp: ProductionTableTabComponent;

    mediaInProdData = [];
    mediaInProdComp: ProductionTableTabComponent;

    attachmentsData = [];
    attachmentsComp: ProductionTableTabComponent;

    productionInfoComponent: ProductionInfoTabComponent;

    audioComp: ProductionAudioTabComponent;
    subtitlesComp: ProductionSubtitlesTabComponent;

    segmentsData = [];
    segmentsComp: ProductionSegmentsTabComponent;

    eventsData = [];
    eventsComp: ProductionEventsTabComponent;

    metadataData = -1;
    metadataComp: IMFXMetadataTabComponent;

    private routeSub: Subscription;
    private payloadChangedSub: Subscription;
    private afterSaveSub: Subscription;
    private makeSelectedSub: Subscription;

    //
    public itemsMediaList = [];
    public layoutType: LayoutType = LayoutType.Production;
    public layoutModel: LayoutManagerModel;
    private allValidTabs = $.extend(true, [], PRODUCTION_DETAIL_TABS);
    defaultModel;

    private userData: any = null;
    private lookups = {};
    private lookupsMap = {};
    private template: TemplateFields = null;
    private templateConfig: TemplateConfig = null;
    private isCreate = false;
    private productionDetailData = null;
    public error: boolean = false;
    errorText: string = '';
    prevTvStdId = null;

    constructor(private route: ActivatedRoute,
                private productionService: ProductionService,
                protected el: ElementRef,
                protected viewContainer: ViewContainerRef,
                protected componentFactoryResolver: ComponentFactoryResolver,
                protected storageService: LocalStorageService,
                protected cd: ChangeDetectorRef,
                protected translate: TranslateService,
                protected splashProvider: SplashProvider,
                protected detailService: DetailService,
                protected notificationRef: NotificationService,
                public injector: Injector,
                public location: Location,
                private router: Router,
                public cdr: ChangeDetectorRef,
                protected modalProvider: IMFXModalProvider,
                private productionDetailProvider: ProductionDetailProvider,
                private overlay: OverlayComponent) {
        super(el, viewContainer, componentFactoryResolver, storageService, cd, translate, splashProvider, detailService, injector, notificationRef);
        this.userData = this.storageService.retrieve('permissions');
    }

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(data => {
            this.loadData(data);
        });
        this.makeSelectedSub = this.productionDetailProvider.makeItemSelected.subscribe(item => {
            item = _.cloneDeep(item);
            if (!item) {
                if (this.segmentsComp) {
                    this.segmentsComp.isBtnDisabled = true;
                    this.segmentsComp.cdr.detectChanges();
                }
                return
            }
            this.segmentsData = item.Segments;
            this.mediaInProdData = item.InProdMedias;
            this.attachmentsData = item.Attachments;
            this.historyData = item.History;
            this.workflowData = item.Workflows;
            this.eventsData = [item.Event];
            this.metadataData = item.ID;
            if (this.segmentsComp && this.segmentsData) {
                this.segmentsComp.isBtnDisabled = false;
                this.segmentsComp.setDataProduction(this.segmentsData, this.productionDetailProvider.payload.TimecodeFormat);
            }

            if (this.mediaInProdComp)
                this.mediaInProdComp.setData('mediaInProd', item.InProdMedias);

            if (this.attachmentsComp)
                this.attachmentsComp.setData('attachments', item.Attachments);

            if (this.historyComp)
                this.historyComp.setData('history', item.History);

            if (this.workflowComp)
                this.workflowComp.setData('workflows', item.Workflows);

            if (this.productionTemplateId === PRODUCTION_TEMPLATE.EVENTS) {
                if (this.eventsComp)
                    this.eventsComp.setData(this.eventsData);
            }

            if (this.metadataComp) {
                this.refreshMetadata();
            }
        });

        // update make list when add master or version
        this.payloadChangedSub = this.productionDetailProvider.payloadChangedSub.subscribe(() => {
            this.makeListData = _.cloneDeep(this.productionDetailProvider.payload.Items);
            if (this.makeListComp) {
                this.makeListComp.setData(this.makeListData);
            }
        });

        this.afterSaveSub = this.productionDetailProvider.onAfterSave.subscribe(() => {
            this.loadData({data: null}, true);
            this.productionDetailProvider.makeItemSelected.next(null);
            this.productionDetailProvider.madeItemSelected.next(null);
        });
    }

    refreshMetadata() {
        let externalList = [];
        if(this.template.Data[0].XmlSchemas && this.template.Data[0].XmlSchemas.length > 0) {
            this.template.Data[0].XmlSchemas.forEach((x)=> {
                let groupID = this.getFromLookup("SCHEMA_GROUP_MAPPING", x.XML_ID);
                let groupName = this.getFromLookup("SCHEMA_GROUPS", groupID);
                let indexToAdd = externalList.findIndex((x) => x.Id == groupID);
                if(indexToAdd == -1) {
                    externalList.push({
                        Id: groupID,
                        Name: groupName,
                        schemaType: {
                            Id: groupID,
                            Value: groupName
                        },
                        Children: []
                    })
                    indexToAdd = externalList.length - 1;
                }
                externalList[indexToAdd].Children.push({"Id":x.XML_ID, "Name": this.getFromLookup("XML_ID", x.XML_ID), "SchemaType": externalList[indexToAdd].schemaType});
            });
        }
        this.metadataComp.refresh({ID: this.metadataData}, false, externalList);
    }

    getFromLookup(field, id) {
        let result = this.lookupsMap[field].filter(x => x.id == id || x.ID == id)[0];
        return result ? result.text : "";
    }

    ngOnDestroy() {
        // console.log('destroy'); !--
        this.productionDetailProvider.resetState();
        this.routeSub.unsubscribe();
        this.payloadChangedSub.unsubscribe();
        this.makeSelectedSub.unsubscribe();
        this.afterSaveSub.unsubscribe();
    }

    onDefaultReadyLayoutInit(model) {
        this.defaultModel = model;
        this.ngOnLayoutInit(this.defaultModel);
    }

    ngOnLayoutInit(model) {
        this.config.componentContext = this;
        this.config.options.typeDetailsLocal = 'production.';
        this.config.options.titleForStorage = 'production.detail';
        this.storagePrefix = this.config.options.titleForStorage + '.saved.state';
        if (model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.layoutConfig = JSON.parse(model.actualModel.Layout);
            this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
        } else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.layoutConfig = JSON.parse(this.layoutModel.Layout);
                    this.updateHeightWidthLayout(this.layoutConfig.content[0], this);
                } else {
                    this.layoutModel = model.defaultModel;
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.Production);
                }
            } else {
                this.layoutModel = model.defaultModel;
                this.layoutConfig = JSON.parse(LayoutManagerDefaults.Production);
            }
        }
        this.config.options.file = {TSK_STATUS: true};
        this.postOnInit();
    }

    saveLayoutHandler($event) {
        this.layoutModel = $event;
        this.layoutConfig = JSON.parse(this.layoutModel.Layout);
        this.storageService.store(this.storagePrefix, JSON.stringify(this.layoutModel));
    }

    changeLayoutHandler($event) {
        const currentEditState = this.editLayoutMode;
        if(currentEditState)
            this.enableEditLayoutMode();
        super.changeLayoutHandler($event, this);
        if (this.layoutModel.IsDefault) {
            this.saveLayoutHandler($event);
        }
        this.setView();
        this.initProductionDetailTab(this.productionDetailData ? this.productionDetailData : null);
        if(currentEditState)
            this.enableEditLayoutMode();
    }

    postOnInit() {
        (<any>window).GoldenLayout.__lm.items.Stack.prototype._highlightHeaderDropZone = this._highlightHeaderDropZoneOverride;
        (<any>window).GoldenLayout.__lm.LayoutManager.prototype._$createRootItemAreas = this._$createRootItemAreasOverride;
    }

    setView() {
        if (this.productionTypeDetail === 'create') {
            const serverTabsData = [{
                serverName: 'Attachments',
                serverId: '43',
                tabName: 'Attachments',
            }, {
                serverName: 'Audio Tracks',
                serverId: '44',
                tabName: 'Audio'
            }, {
                serverName: 'Avid Explorer',
                serverId: '41',
                tabName: '???'
            }, {
                serverName: 'Custom Metadata',
                serverId: '42',
                tabName: 'Metadata'
            }, {
                serverName: 'Parts and Segments',
                serverId: '45',
                tabName: 'Segments'
            }, {
                serverName: 'Subtitles and Captions',
                serverId: '46',
                tabName: 'Subtitles'
            }, {
                serverName: 'Events',
                serverId: '47',
                tabName: 'Events'
            }];

            const showTabs = [
                'ProductionInfo',
                'ProductionList',
                'SourceMedia',
                'SourceTitles',
                'MediaInProd',
                'Workflows',
                'History'
            ];

            this.templateConfig.TabsData.forEach(tabId => {
                const serverTabShow = serverTabsData.find(el => el.serverId === tabId);
                if (serverTabShow) {
                    showTabs.push(serverTabShow.tabName)
                }
            });
            const tabsRemove = this.allValidTabs
                .filter(el => showTabs.find(shT => shT === el.componentName) === undefined)
                .map(el => el.componentName);

            tabsRemove.forEach(tabName => {
                this.layoutConfig = this.checkLayoutCompByName(this.layoutConfig, tabName, true);
                this.allValidTabs = this.allValidTabs.filter(el => el.componentName !== tabName)
            })
        }

        super.setLayoutConfig();

        let self = this;

        this.addProductionInfo(self);
        this.addMakeList(self);
        this.addSourceMedia(self);
        this.addSourceTitles(self);
        this.addMediaInProd(self);
        this.addWorkflows(self);
        this.addHistory(self);
        this.addAttachments(self);
        this.addAudio(self);
        this.addSubtitles(self);
        this.addSegments(self);
        this.addEvents(self);
        this.addMetadata(self);

        this.setEvents();
        this.layout.on('componentCreated', (component) => {
            if(component.componentName == "Metadata") {

                this.metadataComp = component.container.compRef.instance

                component.container.compRef.instance['config'] = {
                    defaultSchemas: null,
                    file: {ID: this.metadataData},
                    typeDetailsLocal: 'events',
                    readOnly: this.metadataData === -1,
                };

                component.container.on('loadComponentData', function () {
                    component.container.compRef['_component'].loadComponentData && component.container.compRef['_component'].loadComponentData();
                });

                component.container.compRef.changeDetectorRef.detectChanges();

                this.refreshMetadata();
            }
            this.cd.detectChanges();
        });
        super.addTabCreated(this);
        this.layout.off('itemDestroyed');
        this.layout.on('itemDestroyed', item => {
            if (item.config && item.config.type == 'component' &&
                (!(item.config.componentName == 'Media') || (item.config.componentName == 'Media' && !(<any>window)._imfxPopoutItem))) {
                let _tab = {
                    type: item.config.type,
                    componentName: item.config.componentName,
                    title: item.config.title,
                    tTitle: item.config.tTitle
                };
                const currentTab = self.allValidTabs.filter(function (el) {
                    return el.tTitle == item.config.componentName
                })[0];
                let notValid = currentTab && !currentTab.isValid;
                if (notValid) {
                    // if ( typeof (item.container.compRef.instance.getValidation) == 'function' && !item.container.compRef.instance.getValidation()) {
                    $('.drag-btns-wraper #tabbed-nav').append($('<li style="position: relative;"><div class="invalid-triangle"></div> <a id="tab-drag-' + _tab.tTitle + '">' + _tab.title + '</a></li>'));
                } else {
                    $('.drag-btns-wraper #tabbed-nav').append($('<li style="position: relative;"><a id="tab-drag-' + _tab.tTitle + '">' + _tab.title + '</a></li>'));
                }
                let elementTab = $('li #tab-drag-' + _tab.tTitle);
                if (elementTab.length > 0) {
                    let el = this.layout.createDragSource(elementTab, _tab);
                }
            }
            if (item.container != null) {
                let compRef = item.container['compRef'];
                if (compRef != null) {
                    compRef.destroy();
                    this.layout.updateSize();
                }
            }
            if (item.componentName && this[item.componentName.toLocaleLowerCase() + 'Component']) { // delete global component - for example this.
                this[item.componentName.toLocaleLowerCase() + 'Component'] = null;
            }
            let $item = this.layout.container.find('.lm_goldenlayout');
            let $child = $item.children();
            if ($child.length === 0) {
                this.isEmpty = true;
                this.cd.detectChanges();
            }
        });
        this.layout.off('stateChanged');
        this.layout.on('stateChanged', function () {
            if (self.layout.openPopouts && self.layout.openPopouts.length === 0) {
                let state = JSON.stringify(self.layout.toConfig());
                self.layoutConfig = JSON.parse(state);
                if (self.layoutModel)
                    self.layoutModel.Layout = state;
            }
        });
        this.layout.init();
        this.createNewTabsAfterInit();
        super.setViewLayout();
    };

    createNewTabsAfterInit() {
        super.createNewTabsAfterInit(this);
    }

    bindValidateTabStandart (container, compRef) {
        compRef.instance.isDataValid.subscribe(isValid => {
            if (isValid) {
                container.tab && container.tab.element.find('i.lm_left').hide();
            } else {
                container.tab && container.tab.element.find('i.lm_left').show();
            }
            this.allValidTabs.filter(el => {
                return el.tTitle == container.title;
            })[0].isValid = isValid;
        });
    }

    addMakeList(self) {
        self.layout.registerComponent('ProductionList', (container, componentState) => {
            this.translateTitle(container, 'make_list');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionMakeListComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.makeListComp = compRef.instance;
            if (this.makeListData && this.makeListComp) {
                this.makeListComp.setData(this.makeListData);
            }

            this.bindValidateTabStandart(container, compRef);

            compRef.changeDetectorRef.detectChanges();
        });
    }

    changeMediaTitleTab(typeGrid, data) {
        if (typeGrid === 'media') {
            this.productionDetailProvider.addMediaTitleItems('media', data.typeItem, data.rows);
            this.sourceMediaData = this.productionDetailProvider.payload.SourceMedias;
            this.sourceMediaComp.setData(this.sourceMediaData, 'media');
            this.productionDetailProvider.makeItemSelected.next(this.productionDetailProvider.getItem());
        } else {
            this.productionDetailProvider.addMediaTitleItems('versions', data.typeItem, data.rows);
            this.sourceTitlesData = this.productionDetailProvider.payload.SourceProgs;
            this.sourceTitlesComp.setData(this.sourceTitlesData, 'versions');
            this.productionDetailProvider.makeItemSelected.next(this.productionDetailProvider.getItem());
        }
    }

    addSourceMedia(self) {
        self.layout.registerComponent('SourceMedia', (container, componentState) => {
            this.translateTitle(container, 'source_media');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionSourceTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.sourceMediaComp = compRef.instance

            this.sourceMediaComp.addedNewItem.subscribe(data => {
                this.changeMediaTitleTab('media', data)
            });
            this.sourceMediaComp.setData(this.sourceMediaData, 'media');
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addSourceTitles(self) {
        self.layout.registerComponent('SourceTitles', (container, componentState) => {
            this.translateTitle(container, 'source_titles');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionSourceTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.sourceTitlesComp = compRef.instance

            this.sourceTitlesComp.addedNewItem.subscribe(data => {
                this.changeMediaTitleTab('versions', data)
            });

            this.sourceTitlesComp.setData(this.sourceTitlesData, 'versions');

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMediaInProd(self) {
        self.layout.registerComponent('MediaInProd', (container, componentState) => {
            this.translateTitle(container, 'media_in_prod');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionTableTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            this.mediaInProdComp = compRef.instance;
            this.mediaInProdComp.setData('mediaInProd', this.mediaInProdData);

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addWorkflows(self) {
        self.layout.registerComponent('Workflows', (container, componentState) => {
            this.translateTitle(container, 'workflows');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionTableTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.workflowComp = compRef.instance;
            this.workflowComp.setData('workflows', this.workflowData);

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addHistory(self) {
        self.layout.registerComponent('History', (container, componentState) => {
            this.translateTitle(container, 'history');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionTableTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.historyComp = compRef.instance;
            this.historyComp.setData('history', this.historyData);

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addAttachments(self) {
        self.layout.registerComponent('Attachments', (container, componentState) => {
            this.translateTitle(container, 'attachments');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionTableTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.attachmentsComp = compRef.instance;
            this.attachmentsComp.setData('attachments', this.attachmentsData);

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addAudio(self) {
        self.layout.registerComponent('Audio', (container, componentState) => {
            this.translateTitle(container, 'audio');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionAudioTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.audioComp = compRef.instance;
            // this.audioComp.isValidSub.subscribe(isValid => {
            //     if (isValid) {
            //         container.tab && container.tab.element.find('i.lm_left').hide();
            //     } else {
            //         container.tab && container.tab.element.find('i.lm_left').show();
            //     }
            // })
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addSubtitles(self) {
        self.layout.registerComponent('Subtitles', (container, componentState) => {
            this.translateTitle(container, 'subtitles');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionSubtitlesTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.subtitlesComp = compRef.instance;

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addProductionInfo(self) {
        self.layout.registerComponent('ProductionInfo', (container, componentState) => {
            this.translateTitle(container, 'production_info');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionInfoTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;

            let firstInit = true;
            this.prevTvStdId = this.productionDetailProvider.payload.TV_STD;

            compRef.instance.onChangeItems.subscribe(data => {
                this.productionDetailProvider.changeDynamicFields(data.fieldValue);
                if (firstInit) {
                    this.prevTvStdId = data.TV_STD;
                }
            });

            //defer listener for reset timecodes. px-5371
            setTimeout(() => {
                firstInit = false;
                compRef.instance.onChangeItems.subscribe(data => {
                    if (data.fieldId === "TV_STD") {
                        this.checkAndApplyNewTimecode(this.prevTvStdId, data.fieldValue.TV_STD);
                        this.prevTvStdId = data.fieldValue.TV_STD;
                    }
                });
            }, 0);



            self.productionInfoComponent = compRef.instance;
            compRef.changeDetectorRef.detectChanges();
        });
    }

    checkAndApplyNewTimecode(prevTvStdId, tvStdId) {
        if (prevTvStdId == tvStdId) {
            return;
        }
        let ready = false;

        const prevTcNum = this.getTimecodeFromTvSTD(prevTvStdId);
        const currTcNum = this.getTimecodeFromTvSTD(tvStdId);
        if (prevTcNum != currTcNum) {
            ready = true;
            this.refreshSegments(currTcNum);
        }
        if (tvStdId === '' && prevTvStdId !== '' && !ready) { // select clear
            this.refreshSegments(0);
        }

    }

    getTimecodeFromTvSTD(id): number {
        if (!id) {
            return TimeCodeFormat.Pal;
        }
        return (this.lookups as any).TCF.find(el => el.ID == id).Name - 0;
    }

    getTimecodeStringNameFromTc(id = 0): string {
        const arr = TimeCodeFormat.getArray();
        return (arr.find(el => el.id == id) || {text: 'Pal'}).text;
    }

    refreshSegments(tcFormat:number) {
        this.productionDetailProvider.refreshSegments({TimecodeFormat: this.getTimecodeStringNameFromTc(tcFormat), TCF: tcFormat});
        if (this.productionDetailProvider.getItem() !== null) {
            this.segmentsData = _.cloneDeep(this.productionDetailProvider.getItem().Segments);
            this.segmentsComp.setDataProduction(this.segmentsData, this.productionDetailProvider.payload.TimecodeFormat);
        }

        //emit make items validation
        this.makeListComp.validate();

        //show alert  about refresh
        let modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.alert_modal, IMFXModalAlertComponent, {
            title: 'common.warning',
            size: 'md',
            position: 'center',
            footer: 'ok'
        });
        modal.load().then((cd: any) => {
            let alertModal: IMFXModalAlertComponent = cd.instance;
            alertModal.setText('production.production_templates.edit_modal.segments_reset', {});
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    modal.hide();
                }
            });
        });
    }

    addSegments(self) { // Depends on the Template. If it is not there, then do not show the tab
        this.layout.registerComponent('Segments', (container, componentState) => {
            this.translateTitle(container, 'segments');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionSegmentsTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            let goldenRef = this;
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.segmentsComp = compRef.instance;
            this.segmentsComp['lookupsMap'] = this.lookupsMap;

            if (this.segmentsComp && this.segmentsData.length > 0) {
                this.segmentsComp.setDataProduction(this.segmentsData, this.productionDetailProvider.payload.TimecodeFormat);
            }

            this.bindValidateTabStandart(container, compRef);

            compRef.instance.isDataValid.subscribe(isValid => {
                this.makeListComp.validate(isValid);
            });

            compRef.changeDetectorRef.detectChanges();
        });
    }

    addEvents(self) {
        self.layout.registerComponent('Events', (container, componentState) => {
            this.translateTitle(container, 'events');
            let factory = this.componentFactoryResolver.resolveComponentFactory(ProductionEventsTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.eventsComp = compRef.instance

            if (this.eventsData) {
                this.eventsComp.setData(this.eventsData);
            }
            compRef.changeDetectorRef.detectChanges();
        });
    }

    addMetadata(self) {
        self.layout.registerComponent('Metadata', (container, componentState) => {
            this.translateTitle(container, 'metadata');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXMetadataTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            this.metadataComp = compRef.instance

            compRef.instance['config'] = {
                defaultSchemas: null,
                file: {ID: this.metadataData},
                typeDetailsLocal: 'events',
                readOnly: this.metadataData === -1,
            };

            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });

            compRef.changeDetectorRef.detectChanges();
        });
    }

    private loadData(data, lazyRefresh = false) {
        this.overlay.showWhole()

        if (Object.keys(data).length === 0) {
            return
        }
        this.isCreate = false;
        this.productionDetailData = null;

        if(!lazyRefresh) {
            this.productionId = data['id'];
            this.productionTypeDetail = data['productionTypeDetail'];
            this.productionDetailProvider.typePage = data['productionTypeDetail'];
            this.productionService.productionId = this.productionId;
        }

        if (lazyRefresh || this.productionTypeDetail !== 'create') {
            this.productionService.getProductionDetail(this.productionId)
                .subscribe(res => {
                    this.productionDetailData = res;
                    if (this.productionTypeDetail === 'clone') {
                        delete res.ID;
                    }
                    this.productionDetailProvider.payload = _.cloneDeep(res);
                    this.productionDetailProvider.payload.Items.map(el => {
                        el.Segments = el.Segments ? el.Segments : [];
                        el.AudioTracks = el.AudioTracks ? el.AudioTracks : [];
                    });
                    this.makeListData = _.cloneDeep(res.Items);
                    this.productionTemplateId = res.TEMPLATE;
                    if (this.makeListComp) {
                        this.makeListComp.setData(this.makeListData);
                    }

                    this.sourceMediaData = _.cloneDeep(res.SourceMedias);
                    if (this.sourceMediaComp) {
                        this.sourceMediaComp.setData(this.sourceMediaData, 'media');
                    }

                    this.sourceTitlesData = _.cloneDeep(res.SourceProgs);
                    if (this.sourceTitlesComp) {
                        this.sourceTitlesComp.setData(this.sourceTitlesData, 'versions');
                    }

                    this.productionService.getTemplates().subscribe(templates => {
                        this.productionService.getTemplate(this.productionTemplateId)
                            .subscribe(template => {
                                this.productionService.getTemplateGroups(template.Data[0].CONFIG_ID).subscribe((templateConfig)=>{

                                    this.lookups = templates.Lookups;
                                    this.initLookupsMap();
                                    this.template = template;
                                    this.templateConfig = templateConfig;
                                    this.productionTitle = templateConfig.ConfigTypeText;
                                    this.productionDetailProvider.templateConfig = templateConfig;
                                    this.productionDetailProvider.templateFields = template;
                                    this.productionDetailProvider.setDefaultDataForMasterAndVersion(template.Data);

                                    if (lazyRefresh !== true) {
                                        if(this.isInitComp) {
                                            this.layout.off('itemDestroyed');
                                            this.layout.off('stateChanged');
                                            this.layout.destroy();
                                        }
                                        this.setView();
                                    }
                                    this.initProductionDetailTab(res);
                                    this.productionDetailProvider.productionLoadedSub.next(null);
                                    this.toggleSpinner(false);
                                    this.isInitComp = true;
                                }, (err) => {
                                    this.toggleSpinner(false);
                                    this.isInitComp = true;
                                })
                            }, (err) => {
                                this.toggleSpinner(false);
                                this.isInitComp = true;
                            });
                    });
                }, (error) => {
                    this.error = true;
                    this.errorText = error.error.Error;
                    this.isInitComp = false;
                    this.isDisabledSaveBtn = true;
                    this.editLayoutMode = false;
                    this.cdr.detectChanges();
                    this.toggleSpinner(false);
                })
        } else {
            this.showTemplateModal();
            this.toggleSpinner(false);
            this.isInitComp = true;
        }
    }

    showTemplateModal() {
        const modal: IMFXModalComponent = this.modalProvider.showByPath(lazyModules.template_modal, TemplateModalComponent, {
            title: 'base.select_temlate',
            size: 'md',
            position: 'center',
            footerRef: 'modalFooterTemplate'
        }, '');
        modal.load().then((cr: ComponentRef<TemplateModalComponent>) => {
            modal.modalEvents.subscribe((e: IMFXModalEvent) => {
                if (e.name === 'ok') {
                    this.productionDetailData = null;
                    this.productionDetailProvider.resetState();
                    this.isCreate = true;
                    this.lookups = e.state.Lookups;
                    this.initLookupsMap();
                    this.template = e.state.Template;
                    this.templateConfig = e.state.TemplateConfig;
                    this.productionTemplateId = e.state.TemplateId;
                    this.productionTitle = this.templateConfig.ConfigTypeText;

                    this.productionDetailProvider.templateConfig = e.state.TemplateConfig;
                    this.productionDetailProvider.templateFields = e.state.Template;
                    this.productionDetailProvider.payload.TEMPLATE = e.state.TemplateId;
                    this.productionDetailProvider.payload.CHANNEL = e.state.Channel;
                    this.productionDetailProvider.setDefaultVersions(e.state.Template.Data)

                    this.setView();
                    this.productionDetailProvider.productionLoadedSub.next(null);
                    modal.hide()

                    this.initProductionDetailTab();
                }
                if (e.name === 'hide') {
                    modal.hide();
                    void this.router.navigate([appRouter.production.search]);
                }
            })
        });
    }

    initLookupsMap() {
        this.lookupsMap = {};
        for (let field in this.lookups) {
            if (this.lookups.hasOwnProperty(field)) {
                if (field.indexOf(',') > -1) {
                    let fields = field.split(',');
                    for (let i = 0; i < fields.length; i++) {
                        this.lookupsMap[fields[i]] = this.lookups[field].map((val) => {
                            return {id: val.ID, text: val.Name};
                        });
                    }
                } else {
                    this.lookupsMap[field] = this.lookups[field].map((val) => {
                        return {id: val.ID, text: val.Name};
                    });
                }
            }
        }
    }

    initProductionDetailTab(res = null) {
        let viewData = this.template.View.Columns.reduce((obj, item) => Object.assign(obj, {[item.Field]: item}), {});
        this.template.Data[0].TemplateUiFields.forEach(item => {
            if (item.Mandatory && viewData[item.Field].DataType == 'CheckBox') {
                if (!viewData[item.Field].Rules)
                    viewData[item.Field].Rules = [];
                viewData[item.Field].Rules.push("Required");
            }
        });
        let fieldsData = this.template.Data[0].TemplateUiFields.reduce((obj, item) => {
            let shouldParse = false;
            this.template.View.Columns.forEach((col, idx) => {
                if (col.Field == item.Field && col.DataType == "ComboMulti") {
                    shouldParse = true;
                }
            })
            item.Value = shouldParse && item.Value && typeof(item.Value) == "string" && item.Value.trim().length > 0 ? JSON.parse(item.Value) : item.Value;
            return Object.assign(obj, {[item.Field]: item})
        }, {});
        let groupsData = this.templateConfig.Groups;

        let productionInfoData = [];

        groupsData.forEach((group) => {
            group.Columns.forEach((item, idx) => {
                if (fieldsData[item.Id]) {
                    // @ts-ignore
                    group.Columns[idx].Value = fieldsData[item.Id].Value;
                    // @ts-ignore
                    group.Columns[idx].Mandatory = viewData[item.Id].DataType != 'CheckBox' && fieldsData[item.Id].Mandatory;
                }
            });

            productionInfoData.push(group.Columns);
        });
        this.productionInfoComponent.Init(productionInfoData, viewData, this.lookups, res);
    }

    private toggleSpinner(show): void {
        if(show)
            $('.loadingoverlay').show();
        else
            $('.loadingoverlay').hide();
    }

    public clickBack() {
        this.location.back();
    }

    isFirstLocation() {
        return (<IMFXRouteReuseStrategy>this.router.routeReuseStrategy).isFirstLocation();
    }

    onSave() {
        this.toggleSpinner(this.isCreate);
        if(this.validation()) {
            this.metadataData = -1;
            this.toggleSpinner(true);
            this.productionDetailProvider.submitEdit();
        }
        else
            this.toggleSpinner(false);
    }

    private getInvalidTabs() {

        if (this.allValidTabs && this.allValidTabs.length) {
            return this.allValidTabs.filter(el => !el.isValid).map(el => el.title);
        } else {
            return [];
        }
    }

    private validation() {
        let validationResult = true;
        let validationResultMessage = "";

        if(this.productionInfoComponent) {
            let data = this.productionInfoComponent.isValid();
            validationResult = validationResult && data.valid;
            validationResultMessage += data.validationMessage + " ";
        }

        const invalidTabs = this.getInvalidTabs();
        if (invalidTabs && invalidTabs.length) {
            validationResult = false;
            validationResultMessage += invalidTabs.join(' tab data is not valid, ');
            validationResultMessage += ' tab data is not valid.';
        }

        if(!validationResult) {
            this.notificationRef.notifyShow(2, "Production not valid! " + validationResultMessage);
        }

        return validationResult;
    }
}
