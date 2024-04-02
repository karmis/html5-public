import {Injectable} from "@angular/core";
import {IMFXVersionsTabComponent} from "../../../../modules/search/detail/components/versions.tab.component/imfx.versions.tab.component";
import {GoldenProvider} from "../../../../modules/search/detail/providers/gl.provider";
import {IMFXTitlesTabComponent} from "../../../../modules/search/detail/components/titles.tab.component/imfx.titles.tab.component";
import {IMFXMetadataTabComponent} from "../../../../modules/search/detail/components/metadata.tab.component/imfx.metadata.tab.component";
import * as $ from "jquery";
import {IMFXProTimelineComponent} from "../../../../modules/controls/imfx.pro.timeline/imfx.pro.timeline";
import {TimeCodeFormat, TMDTimecode} from "../../../../utils/tmd.timecode";
import {IMFXDefaultTabComponent} from "../../../../modules/search/detail/components/default.tab.component/imfx.default.tab.component";
import {IMFXHistoryTabComponent} from "../../../../modules/search/detail/components/history.tab.component/imfx.history.tab.component";

@Injectable()
export class TitleGoldenProvider extends GoldenProvider {
    public setView(self, outsideUpdate) {
        this.addDataLayout(self);
        if (outsideUpdate) {
            this.addMediaBlockIfNeed(<any>self.layout);
            self.addMediaLayout(self, outsideUpdate);
        } else {
            self.addMediaLayout(self);
        }
        if (outsideUpdate) {
            this.addTabsLayout(self, outsideUpdate);
        } else {
            this.addTabsLayout(self);
        }
        // this.addVersions(self);
        // this.addTitles(self);
        // this.addCustomMetadata(self);
    }
    private addVersions(self) {
        self.layout.registerComponent('Versions', (container, componentState) => {
            let fullKey = self.config.options.typeDetailsLocal + '.tabs.versions';
            self.translate.get(fullKey).subscribe(
                  (res: string) => {
                      container._config.title = res;
                  });
            let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXVersionsTabComponent);
            let compRef = self.viewContainer.createComponent(factory);
            compRef.instance.config = {
                file: self.config.options.file,
                elem: container
            };
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            self.layout.on('afterVersionCreation', function() {
                compRef.instance.slickGridComp.provider.refreshGrid(false);
            });
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    private addTitles(self) {
        self.layout.registerComponent('Titles', (container, componentState) => {
            let fullKey = self.config.options.typeDetailsLocal + '.tabs.titles';
            self.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXTitlesTabComponent);
            let compRef = self.viewContainer.createComponent(factory);
            compRef.instance.config = {
                file: self.config.options.file,
                elem: container,
                titlesId: self.config.options.file.ID
            };
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });

            compRef.instance.afterVersionCreation.subscribe(() => {
                self.layout.emit('afterVersionCreation');
            });

            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    private addCustomMetadata(self) {
        self.layout.registerComponent('Metadata', (container, componentState) => {
            let fullKey = self.config.options.typeDetailsLocal + '.tabs.metadata';
            self.translate.get(fullKey).subscribe(
                (res: string) => {
                    container._config.title = res;
                });
            let factory = self.componentFactoryResolver.resolveComponentFactory(IMFXMetadataTabComponent);
            let compRef = self.viewContainer.createComponent(factory);
            compRef.instance.config = {
                file: self.config.options.file,
                typeDetailsLocal: self.config.options.typeDetailsLocal,
                typeDetails: self.config.options.typeDetails,
                elem: container,
                context: self,
            };
            compRef.instance['config'].readOnly = self.getReadOnlyModeForTab(self.config.options.file);
            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.changeDetectorRef.detectChanges();
        });
    }
    private addTabsLayout(self, outsideData = null) {
        self.layout.registerComponent('Tab', (container, componentState) => {
            let tabComponent = self.provider.selectTabComponent(container._config);
            let factory = self.componentFactoryResolver.resolveComponentFactory(tabComponent);
            let compRef = self.viewContainer.createComponent(factory);
            container.getElement().append($(compRef.location.nativeElement));
            container['compRef'] = compRef;
            compRef.instance.config = {
                file: self.config.options.file,
                typeDetailsLocal: self.config.options.typeDetailsLocal,
                typeDetails: self.config.options.typeDetails,
                elem: container,
                context: self,
            };

            if (container._config.tTitle === self.tabsType.CustomMetadata) {
                compRef.instance['config'].readOnly = self.getReadOnlyModeForTab(self.config.options.file);
            }

            if (container._config.tTitle === self.tabsType.Titles) {
                compRef.instance['config'].titlesId = self.config.options.file.ID;
                compRef.instance.afterVersionCreation.subscribe(() => {
                    self.layout.emit('afterVersionCreation');
                });
            }
            if (container._config.tTitle === self.tabsType.Versions) {
                self.layout.on('afterVersionCreation', function() {
                    compRef.instance.slickGridComp.provider.refreshGrid(false);
                });
            }

            container.on('loadComponentData', function () {
                compRef['_component'].loadComponentData && compRef['_component'].loadComponentData();
            });

            compRef.changeDetectorRef.detectChanges();
        });
    };
    private selectTabComponent(tabConfig) {
        let tabComp: any = IMFXDefaultTabComponent;
        switch (true) {
            case (tabConfig.tTitle === this.componentContext.tabsType.CustomMetadata):
                tabComp = IMFXMetadataTabComponent;
                break;
            case (tabConfig.tTitle === this.componentContext.tabsType.Titles):
                tabComp = IMFXTitlesTabComponent;
                break;
            case (tabConfig.tTitle === this.componentContext.tabsType.Versions):
                tabComp = IMFXVersionsTabComponent;
                break;
            case (tabConfig.tTitle === this.componentContext.tabsType.History):
                tabComp = IMFXHistoryTabComponent;
                break;
            default:
                break;
        }
        return tabComp;
    }
}
