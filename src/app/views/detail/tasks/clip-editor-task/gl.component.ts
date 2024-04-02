import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation, Input, EventEmitter
} from '@angular/core';
import * as $ from 'jquery';
import { IMFXAccordionComponent } from '../../../../modules/search/detail/components/accordion.component/imfx.accordion.component';
import { IMFXHtmlPlayerComponent } from '../../../../modules/controls/html.player/imfx.html.player';
import { IMFXDefaultTabComponent } from '../../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component';

import { IMFXImageComponent } from '../../../../modules/search/detail/components/image.component/imfx.image.component';
import { IMFXMediaTaggingTabComponent } from '../../../../modules/search/detail/components/media.tagging.tab.component/imfx.media.tagging.tab.component';

import { IMFXLocatorsComponent } from '../../../../modules/controls/locators/imfx.locators.component';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import {
    LayoutManagerDefaults,
    LayoutType
} from '../../../../modules/controls/layout.manager/models/layout.manager.model';
import {SimpleListComponent} from '../../../../modules/controls/simple.items.list/simple.items.list';
import {GoldenTabs} from './constants/constants';
import {GLClipEditorComponent} from '../../../clip-editor/gl.component';
import {CELocatorsComponent} from "../../../clip-editor/comps/locators/ce.locators.component";
import {IMFXClipCommentTabComponent} from "../../../../modules/search/detail/components/clip.comment.tab.component/imfx.clip.comment.tab.component";
import {IMFXNotesTabComponent} from "../../../../modules/search/detail/components/notes.tab.component/imfx.notes.tab.component";
import {JobStatuses} from "../../../workflow/constants/job.statuses";
import {ImfxProTimelineAdditionalButtonsWrapperComponent} from "../../../../modules/controls/imfx.pro.timeline.additional.buttons.wrapper/imfx.pro.timeline.additional.buttons.wrapper.component";

declare var GoldenLayout: any;

@Component({
    selector: 'golden-task-logger-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: '../../../clip-editor/tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
        IMFXAccordionComponent,
        IMFXHtmlPlayerComponent,
        IMFXDefaultTabComponent,
        IMFXImageComponent,
        IMFXMediaTaggingTabComponent,
        IMFXLocatorsComponent,
        SimpleListComponent,
        ImfxProTimelineAdditionalButtonsWrapperComponent,
        CELocatorsComponent,
        IMFXClipCommentTabComponent,
        IMFXNotesTabComponent
    ]
})

export class GLTaskClipEditorComponent extends GLClipEditorComponent {
    public layoutType: LayoutType = LayoutType.TaskClipEditor;
    public allValidTabs = GoldenTabs.tabs;
    public tabsWithTimecodes = GoldenTabs.timecodesTabs;
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

    ngOnInit() {
        if (!this.isPopout) {
            this.layoutTypeReady = true;
            this.clipsStorageProvider.setItems(this.config.options.series);
        } else {
            this.layout = new GoldenLayout(this.layoutConfig, $(this.el.nativeElement).find('#layout'));
            var self = this;
            this.addMediaLayout(self);
            this.layout.init();
            setTimeout(() => {
                this.splashProvider.onHideSpinner.emit();
                this.cd.detectChanges();
            }, 2000);

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
                    this.layoutConfig = JSON.parse(LayoutManagerDefaults.TaskClipEditor);
                }
            }
            else {
                this.layoutModel = model.defaultModel;
                this.layoutConfig = JSON.parse(LayoutManagerDefaults.TaskClipEditor);
            }
        }
        // this.combineAllValidTabs();
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
        super.setLayoutConfig();

        let self = this;
        this.file = this.config.options.file;
        this.itemsMediaList = this.config.moduleContext.itemsMediaList;

        this.addMediaInfo(self);
        this.addMediaLayout(self);
        this.addJobDataTab(self);
        this.addClipCommentsGrid(self);
        this.addTimeline(self);
        this.addMediaList(self);
        this.addTagging(self);
        this.addNotesTab(self);
        this.setEvents();
        super.onStateChanged(this);
        this.layout.init();
        this.createNewTabsAfterInit();
        this.splashProvider.onHideSpinner.emit();
        this.layout.root && this.layout.root.getItemsByFilter(function (el) {
            return el.type == "stack" && el.contentItems.length == 0
        }).forEach(function (elem) {
            elem.remove();
        });
        this.createDragButtons();
    };
    addMediaInfo(self) {
        this.layout.registerComponent('Data', (container, componentState) => {
            let fullKey = this.config.options.typeDetailsLocal + '.data';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.file;
            compRef.instance.columnData = self.config.options.columnData;
            compRef.instance.lookup = self.config.options.lookup;
            container.getElement().append($(compRef.location.nativeElement));
            self.detailsComponent = container;
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    addJobDataTab(self) {
        this.layout.registerComponent('JobData', (container, componentState) => {
            let fullKey = this.config.options.typeDetailsLocal + '.jobdata';
            this.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXAccordionComponent);
            let compRef = this.viewContainer.createComponent(factory);
            compRef.instance.file = self.config.options.jobFile;
            compRef.instance.columnData = self.config.options.jobFileColumnData;
            compRef.instance.lookup = 'FriendlyNames.TM_MJOB';
            container.getElement().append($(compRef.location.nativeElement));
            container["compRef"] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    };
    addNotesTab(self) {
        this.layout.registerComponent('Notes', (container, componentState) => {
            this.translateTitle(container, '.notes');
            let factory = this.componentFactoryResolver.resolveComponentFactory(IMFXNotesTabComponent);
            let compRef = this.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance['config'] = {
                fileNotes: <any>self.config.moduleContext.taskFile.TSK_NOTES,
                readOnly: this.getReadOnlyModeForTab(self.config.options.file)
            };
            compRef.instance.onDataChanged.subscribe((res: any) => {
                self.config.moduleContext.taskFile.TSK_NOTES = res;
            });
            this.layout.on('setReadOnly', function (readOnly) {
                compRef.instance.onRefresh.next({
                    fileNotes: (<any>self).config.moduleContext.taskFile.TSK_NOTES,
                    readOnly: readOnly
                });
            });
            self.notesComponent = container;
            compRef.changeDetectorRef.detectChanges();
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
        this.storageService.clear(this.storagePrefix);
        this.layout.off('itemDestroyed');
        this.layout.off('stateChanged');
        this.layout.destroy();
        // this.addClipSubcription && this.addClipSubcription.unsubscribe();
        this.newTabs = [];
        $('.drag-btns-wraper #tabbed-nav li').remove();
        this.layoutModel = $event;
        this.layoutConfig = JSON.parse(this.layoutModel.Layout);
        this.saveLayoutHandler($event);
        this.setView();
    }
    getReadOnlyModeForTab(file) {
        let data = this.storageService.retrieve('permissions');
        if (this.config.moduleContext.taskFile.LOCKED_BY !== null && this.config.moduleContext.taskFile.LOCKED_BY !== data.FullName) {
            return true;
        }
        if (this.config.moduleContext.taskFile.TSK_STATUS !== JobStatuses.INPROG || this.config.options.firstLoadReadOnly) {
            return true;
        } else {
            return file.IsGanged && !file.IsGangedMain;
        }
    }
}
