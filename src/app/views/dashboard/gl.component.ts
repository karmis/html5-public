import {
    Component, ComponentFactoryResolver, ViewContainerRef,
    HostListener, ElementRef, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation, Injectable,
    Compiler, Inject
} from '@angular/core';
import * as $ from "jquery";
import {LocalStorageService} from "ngx-webstorage";
import { TranslateService } from '@ngx-translate/core';

import 'style-loader!golden-layout/src/css/default-theme.css';
import 'style-loader!golden-layout/src/css/goldenlayout-base.css';
import 'style-loader!golden-layout/src/css/goldenlayout-light-theme.css';
import 'script-loader!golden-layout/lib/jquery.js';
import 'script-loader!golden-layout/dist/goldenlayout.js';

import {WorkflowsDashComponent} from "./comps/workflows/workwlows.dash.component";
import {ChartDashComponent} from "./comps/charts/chart.dash.component";
import {setTimeout} from "timers";
import {GrafanaDashComponent} from "./comps/grafana/grafana.dash.component";
import {GrafanaData} from "../system/config/comps/global.settings/comps/grafana/global.settings.grafana.component";
import {SettingsGroupsService} from "../../services/system.config/settings.groups.service";
import {ServerStorageService} from "../../services/storage/server.storage.service";
import {SearchAdvancedService} from "../../modules/search/advanced/services/search.advanced.service";
import {SearchSavedService} from "../../modules/search/saved/services/search.saved.service";
import {
    LayoutManagerDefaults, LayoutManagerModel,
    LayoutType
} from "../../modules/controls/layout.manager/models/layout.manager.model";

declare var GoldenLayout: any;

@Component({
    selector: 'golden-dashboard-layout',
    changeDetection: ChangeDetectionStrategy.Default,
    templateUrl: './tpl/gl-index.html',
    encapsulation: ViewEncapsulation.None,
    entryComponents: [
      ChartDashComponent,
      WorkflowsDashComponent,
      GrafanaDashComponent,
    ],
    providers: [
      SettingsGroupsService,
      SearchAdvancedService,
      SearchSavedService
    ]
})

export class GLDashboardComponent {

  @Input() tabLocal: string;
  @Input() titleForStorage: string;

  private menuOpened = false;

  private isEmpty: boolean = true;
  private config: any;
  private layout: any;
  private storagePrefix: string;
  private traslateKey: string;
  private grafanaBoardData: any = {"value": "", "real_value": "", "choises": [], "real_choises": []};
  private workflowSavedSearches: any = {"value": "", "real_value": "", "choises": [], "real_choises": []};
    private layoutModel: LayoutManagerModel;
    private layoutType: LayoutType = LayoutType.Dashboard;
    private layoutTypeReady = false;

  constructor(private el: ElementRef, private viewContainer: ViewContainerRef,
              private componentFactoryResolver: ComponentFactoryResolver,
              private serverStorage: ServerStorageService,
              @Inject(LocalStorageService) protected storageService: LocalStorageService,
              private translate: TranslateService,
              private settingsGroupsService: SettingsGroupsService,
              private searchService: SearchSavedService,
              private cpl: Compiler,
              private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    (<any>window).GoldenLayout.__lm.LayoutManager.prototype._$createRootItemAreas = this._$createRootItemAreasOverride;
    this.traslateKey = this.tabLocal + '.tabs';
    this.storagePrefix = this.titleForStorage + '.saved.state';
    let self = this;
    // this.serverStorage.retrieve([self.storagePrefix], true).subscribe((result) => {
    //   if (result[0] && result[0].Value && result[0].Value.length > 2) {
    //     let val = result[0].Value.substring(1, result[0].Value.length - 1).replace(/\\/g,"");
    //     self.config = JSON.parse(val);
    //     if(self.config.content[0]) {
    //       if (self.config.content[0].type != 'row') {
    //         let buf = Object.assign({}, self.config.content[0]);
    //         self.config.content[0].type = 'row';
    //         delete self.config.content[0].width;
    //         delete buf.width;
    //         self.config.content[0].content = [buf];
    //       }
    //       self.updateHeightWidthLayout(self.config.content[0], self);
    //     }
    //   }
    //   else {
    //     self.config = {
    //       settings: {
    //         hasHeaders: true,
    //         showPopoutIcon: false,
    //         showMaximiseIcon: false,
    //         showCloseIcon: false,
    //         selectionEnabled: true
    //       },
    //       content: [],
    //       dimensions: {
    //         headerHeight: 36,
    //         borderWidth: 10
    //       }
    //     };
    //   }
    //   self.settingsGroupsService.getSettingsGroupById(0).subscribe((res: any) => {
    //     if(res) {
    //       let data = {
    //         "ID": res.ID,
    //         "NAME": res.NAME,
    //         "DESCRIPTION": res.DESCRIPTION,
    //         "TM_SETTINGS_KEYS": res.TM_SETTINGS_KEYS
    //       };
    //       let grafanaDataArray: Array<GrafanaData> = [];
    //       let grafanaSettings;
    //       if (data.TM_SETTINGS_KEYS) {
    //         grafanaSettings = data.TM_SETTINGS_KEYS.filter(el=>el.KEY == "grafana")[0];
    //       }
    //       if(grafanaSettings) {
    //         grafanaDataArray = <Array<GrafanaData>>JSON.parse(grafanaSettings.DATA);
    //         if(grafanaDataArray.length > 0) {
    //           self.grafanaBoardData.value = grafanaDataArray[0].FriendlyName;
    //           self.grafanaBoardData.real_value = grafanaDataArray[0].ResultUrl;
    //           self.grafanaBoardData.choises = [];
    //           self.grafanaBoardData.real_choises = [];
    //           for(let k=0; k<grafanaDataArray.length; k++) {
    //             self.grafanaBoardData.choises.push(grafanaDataArray[k].FriendlyName);
    //             self.grafanaBoardData.real_choises.push(grafanaDataArray[k].ResultUrl);
    //           }
    //         }
    //       }
    //     }
    //     self.searchService.getSavedSearches("Job", "all").subscribe((searches) => {
    //       if(searches) {
    //         if(searches.length > 0) {
    //           self.workflowSavedSearches.value = "All";
    //           self.workflowSavedSearches.real_value = "-1";
    //           self.workflowSavedSearches.choises = ["All"];
    //           self.workflowSavedSearches.real_choises = [-1];
    //           for(let k=0; k<searches.length; k++) {
    //             if(searches[k].ID != 0) {
    //               self.workflowSavedSearches.choises.push(searches[k].Name);
    //               self.workflowSavedSearches.real_choises.push(searches[k].ID);
    //             }
    //           }
    //         } else {
    //           self.workflowSavedSearches.value = "All";
    //           self.workflowSavedSearches.real_value = "-1";
    //           self.workflowSavedSearches.choises = ["All"];
    //           self.workflowSavedSearches.real_choises = [-1];
    //         }
    //       } else {
    //         self.workflowSavedSearches.value = "All";
    //         self.workflowSavedSearches.real_value = "-1";
    //         self.workflowSavedSearches.choises = ["All"];
    //         self.workflowSavedSearches.real_choises = [-1];
    //       }
    //       if(self.config.content.length == 0) {
    //         self.toggleMenu();
    //       }
    //       self.setView();
    //       self.addItemMenuDragSource();
    //     });
    //     self.layoutTypeReady = true;
    //   });
    // });
        self.settingsGroupsService.getSettingsGroupById(0).subscribe((res: any) => {
          if(res) {
            let data = {
              "ID": res.ID,
              "NAME": res.NAME,
              "DESCRIPTION": res.DESCRIPTION,
              "TM_SETTINGS_KEYS": res.TM_SETTINGS_KEYS
            };
            let grafanaDataArray: Array<GrafanaData> = [];
            let grafanaSettings;
            if (data.TM_SETTINGS_KEYS) {
              grafanaSettings = data.TM_SETTINGS_KEYS.filter(el=>el.KEY == "grafana")[0];
            }
            if(grafanaSettings) {
              grafanaDataArray = <Array<GrafanaData>>JSON.parse(grafanaSettings.DATA);
              if(grafanaDataArray.length > 0) {
                self.grafanaBoardData.value = grafanaDataArray[0].FriendlyName;
                self.grafanaBoardData.real_value = grafanaDataArray[0].ResultUrl;
                self.grafanaBoardData.choises = [];
                self.grafanaBoardData.real_choises = [];
                for(let k=0; k<grafanaDataArray.length; k++) {
                  self.grafanaBoardData.choises.push(grafanaDataArray[k].FriendlyName);
                  self.grafanaBoardData.real_choises.push(grafanaDataArray[k].ResultUrl);
                }
              }
            }
          }
          self.searchService.getSavedSearches("Job", "all").subscribe((searches) => {
            if(searches) {
              if(searches.length > 0) {
                self.workflowSavedSearches.value = "All";
                self.workflowSavedSearches.real_value = "-1";
                self.workflowSavedSearches.choises = ["All"];
                self.workflowSavedSearches.real_choises = [-1];
                for(let k=0; k<searches.length; k++) {
                  if(searches[k].ID != 0) {
                    self.workflowSavedSearches.choises.push(searches[k].Name);
                    self.workflowSavedSearches.real_choises.push(searches[k].ID);
                  }
                }
              } else {
                self.workflowSavedSearches.value = "All";
                self.workflowSavedSearches.real_value = "-1";
                self.workflowSavedSearches.choises = ["All"];
                self.workflowSavedSearches.real_choises = [-1];
              }
            } else {
              self.workflowSavedSearches.value = "All";
              self.workflowSavedSearches.real_value = "-1";
              self.workflowSavedSearches.choises = ["All"];
              self.workflowSavedSearches.real_choises = [-1];
            }
              self.layoutTypeReady = true;
          });
        });
  }

  /*
  Use this method to add Dashboard buttons to drag menu.
  Use "_hiddenControl" postfix for componentState attribute, to hide them from settings dropdown
  Type-view dictionary:
  Object (with value, choises attributes) - Dropdown field;
  Array - Input fields list;
  String - Input field;
  Boolean - checkbox;
   */
  addItemMenuDragSource() {
    let elementChart = $('#chart-drag');
    let elementWFBoard = $('#wfboard-drag');
    let elementGrafana = $('#grafana-drag');

    let newChartConfig = {
      type: 'component',
      componentName: 'Chart',
      componentState: {
        boardName: "",
        showChartButtons: true,
        chartAxisNames: ["Hours", "Events count"],
        selectedChartType: {
          value: "line",
          choises: ["line","bar","radar"]
        },
        firstDrop_hiddenControl: true
      }
    };
    let newWFBoardConfig = {
      type: 'component',
      componentName: 'WFBoard',
      componentState: {
        boardName: "",
        savedSearch: {
          value: this.workflowSavedSearches.value,
          choises: this.workflowSavedSearches.choises,
          real_value: this.workflowSavedSearches.real_value,
          real_choises: this.workflowSavedSearches.real_choises,
        },
        firstDrop_hiddenControl: true
      }
    };

    let newGrafanaConfig = {
      type: 'component',
      componentName: 'Grafana',
      componentState: {
        boardName: "",
        targetWidget: {
          value: this.grafanaBoardData.value,
          choises: this.grafanaBoardData.choises,
          real_value: this.grafanaBoardData.real_value,
          real_choises: this.grafanaBoardData.real_choises,
        },
        autoRefresh: {
          value: "From dashboard",
          choises: ["From dashboard", "Every 5s","Every 10s","Every 15s","Every 20s","Every 25s","Every 30s"],
          real_value: "-",
          real_choises: ["-","5s","10s","15s","20s","25s","30s"],
        },
        showedInterval: {
          value: "From dashboard",
          choises: ["From dashboard", "Last 5 minutes", "Last 15 minutes","Last 30 minutes", "Last 1 hour","Last 3 hours", "Last 6 hours", "Last 12 hours", "Last 24 hours", "Last 7 days", "Last 30 days", "Last 6 months", "Last 1 year", "Yesterday", "Today", "Previous week", "Previous month", "This week", "This month", "This year"],
          real_value: "-",
          real_choises: ["-", "now-5m|now", "now-15m|now", "now-30m|now", "now-1h|now", "now-3h|now", "now-6h|now", "now-12h|now", "now-24h|now", "now-7d|now", "now-30d|now", "now-6M|now", "now-1y|now", "now-1d%2Fd|now-1d%2Fd", "now%2Fd|now%2Fd", "now-1w%2Fw|now-1w%2Fw", "now-1M%2FM|now-1M%2FM", "now%2Fw|now%2Fw", "now%2FM|now%2FM", "now%2Fy|now%2Fy"],
        },
        firstDrop_hiddenControl: true
      }
    };

    this.layout.createDragSource( elementChart, newChartConfig );
    this.layout.createDragSource( elementWFBoard, newWFBoardConfig );
    this.layout.createDragSource( elementGrafana, newGrafanaConfig );
  };

  toggleMenu() {
      let self = this;
      if(self.layout) {
          self.menuOpened = !self.menuOpened;
          setTimeout(function(){                    if (self.layout){
            self.layout.updateSize();
          }},0);
      }
  }

  setView() {
    this.layout = new GoldenLayout(this.config, $(this.el.nativeElement).find("#layout"));
    let self = this;

    this.layout.registerComponent('Chart', (container, componentState) => {
      let fullKey = 'dashboard.chart';
      if(componentState.boardName == '') {
        self.translate.get(fullKey).subscribe(
          (res: string) => {
            container._config.title = res;
          });
      } else {
        container._config.title = componentState.boardName;
      }
      let factory = this.componentFactoryResolver.resolveComponentFactory(ChartDashComponent);
      let compRef = this.viewContainer.createComponent(factory);

      compRef.instance.chartAxisNames = componentState.chartAxisNames;
      compRef.instance.chartName = componentState.boardName;
      compRef.instance.showButtons = componentState.showChartButtons;
      compRef.instance.selectedType = componentState.selectedChartType.value;
      self.cd.detectChanges();
      container.getElement().append($(compRef.location.nativeElement));
      container["compRef"] = compRef;
      compRef.changeDetectorRef.detectChanges();
    });

    this.layout.registerComponent('WFBoard', (container, componentState) => {
      let fullKey = 'dashboard.workflows';
      if(componentState.boardName == '') {
        self.translate.get(fullKey).subscribe(
          (res: string) => {
            container._config.title = res;
          });
      } else {
        container._config.title = componentState.boardName;
      }
      let factory = this.componentFactoryResolver.resolveComponentFactory(WorkflowsDashComponent);
      let compRef = this.viewContainer.createComponent(factory);

      compRef.instance.headerTitle = componentState.boardName;
      compRef.instance.savedSearch = componentState.savedSearch ? componentState.savedSearch.real_value : -1;

      self.cd.detectChanges();
      container.getElement().append($(compRef.location.nativeElement));
      container["compRef"] = compRef;
      compRef.changeDetectorRef.detectChanges();
    });

    self.layout.registerComponent('Grafana', (container, componentState) => {
      let fullKey = 'dashboard.grafana';
      if(componentState.boardName == '') {
        self.translate.get(fullKey).subscribe(
          (res: string) => {
            container._config.title = res;
          });
      } else {
        container._config.title = componentState.boardName;
      }

      let factory = self.componentFactoryResolver.resolveComponentFactory(GrafanaDashComponent);
      let compRef = self.viewContainer.createComponent(factory);

      compRef.instance.headerTitle = componentState.boardName;
      compRef.instance.targetWidget = componentState.targetWidget.real_value;
      compRef.instance.autoRefresh = componentState.autoRefresh ? componentState.autoRefresh.real_value : "-";
      compRef.instance.showedInterval = componentState.showedInterval ? componentState.showedInterval.real_value : "-";

      self.cd.detectChanges();
      container.getElement().append($(compRef.location.nativeElement));
      container["compRef"] = compRef;
      compRef.changeDetectorRef.detectChanges();
    });

    self.layout.on('componentCreated', function() {
      self.isEmpty = false;
      self.cd.detectChanges();
    });

    self.layout.on('stackCreated', function( stack ){
      //self.initHeaderControls(stack, self);
      stack
        .header
        .controlsContainer
        .find( '.lm_tabdropdown' ).append( "<i class='icons-more icon'></i>");
    });

      //self.layout.off('stateChanged');
    self.layout.on('stateChanged', function () {
      let state = JSON.stringify(self.layout.toConfig());
        if (self.layout.openPopouts.length === 0) {
            let state = JSON.stringify(self.layout.toConfig());
            self.config = state;
            if (self.layoutModel)
                self.layoutModel.Layout = self.config;
        }
      // self.serverStorage.store(self.storagePrefix, state).subscribe((res: any) => {
      //   console.log("saved");
      // });
    });


    self.layout.on( 'tabCreated', function( tab ){
      // let settingsCtrl = $( $( '#template-control' ).html() );
      // let settingsBtn = settingsCtrl.find( '.settingsButton' );
      // setTimeout(function(){
      //   let container = tab.contentItem.parent.getActiveContentItem().container;
      //   let state = container.getState();
      //   if(state.firstDrop_hiddenControl) {
      //     let disableFirstShowing = {firstDrop_hiddenControl: false};
      //     container.extendState(disableFirstShowing);
      //     settingsBtn.trigger("click");
      //   }
      // },0);
      self.initHeaderControls(tab.contentItem.parent, self);
      tab.closeElement.append( '<button class="icon-button"><i class="icons-close-small icon close"></i></button>' );
    });

    self.layout.init();

    self.layout.root.getItemsByFilter(function (el) {
      return el.type == "stack" && el.contentItems.length == 0
    }).forEach(function (elem) {
      elem.remove();
    });

    self.layout.on("itemDestroyed", item => {
      if (item.container != null) {
        let compRef = item.container["compRef"];
        if (compRef != null) {
          compRef.destroy();
        }
      }
      let $item = self.layout.container.find('.lm_goldenlayout');
      let $child = $item.children();
      if ($child.length === 0) {
        self.isEmpty = true;
        self.cd.detectChanges();
      };
    });
  }

    ngOnLayoutInit(model) {
      let self = this;
        if (model.actualModel && model.actualModel.Layout) {
            this.saveLayoutHandler(model.actualModel);
            this.config = JSON.parse(model.actualModel.Layout);
            if (this.config.content) {
                this.updateHeightWidthLayout(this.config.content[0], this);
            }
        }
        else {
            let state = this.storageService.retrieve(this.storagePrefix);
            if (state) {
                this.layoutModel = JSON.parse(state);
                if (this.layoutModel && this.layoutModel.Layout) {
                    this.config = JSON.parse(this.layoutModel.Layout);
                    if (this.config.content) {
                        this.updateHeightWidthLayout(this.config.content[0], this);
                    }
                }
                else {
                    this.layoutModel = model.defaultModel;
                    this.config = JSON.parse(LayoutManagerDefaults.Dashboard);
                }
            }
            else {
                this.layoutModel = model.defaultModel;
                this.config = JSON.parse(LayoutManagerDefaults.Dashboard);
            }
        }
        if(self.config.content.length == 0) {
            self.toggleMenu();
        }

        this.setView();
        this.addItemMenuDragSource();
    }

    changeLayoutHandler($event) {
        this.storageService.clear(this.storagePrefix);
        this.layout.off('itemDestroyed');
        this.layout.off('stateChanged');
        this.layout.destroy();
        this.layoutModel = $event;
        this.config = JSON.parse(this.layoutModel.Layout);
        if (this.layoutModel.IsDefault) {
            this.saveLayoutHandler($event);
        }
        this.setView();
        this.addItemMenuDragSource();
    }

    saveLayoutHandler($event) {
        this.layoutModel = $event;
        this.config = JSON.parse(this.layoutModel.Layout);
        this.storageService.store(this.storagePrefix, JSON.stringify(this.layoutModel));
    }

  initHeaderControls(stack, self) {
    let settingsCtrl = $( $( '#template-control' ).html() );
    let settingsBtn = settingsCtrl.find( '.settingsButton' );

    let setState = function(saveBtn){
      let newState = {}
      let attributesContainer = $(saveBtn);
      let attributes = attributesContainer.parent().parent().parent().find('.control-wrapper');
      for(let i = 0; i < attributes.length; i++) {
        let valueInput = $(attributes[i]).find('input');
        let key = $(attributes[i]).attr("data-key");
        let value;
        if(valueInput.length > 1) {
          value = [];
          for(let j = 0; j < valueInput.length; j++) {
            value.push($(valueInput[j]).val());
          }
        } else if (valueInput.length == 1){
          if($(valueInput[0]).attr('type') == 'text') {
            value = $(valueInput[0]).val();
          } else if($(valueInput[0]).attr('type') == 'checkbox') {
            value = $(valueInput[0]).prop("checked") ? true : false;
          }
        } else {
          let valueSelect = $(attributes[i]).find('option:selected');
          let selected = {};
          if(valueSelect.length > 0) {
            selected["value"] = $(valueSelect).val();
            if($(valueSelect)[0].hasAttribute('data-realvalue')) {
              selected["real_value"] = $(valueSelect).attr("data-realvalue");
            }
            value = selected;
          }
        }
        newState[key] = value;
      }
      let container = stack.getActiveContentItem().container;
      $(saveBtn).parent().parent().parent().remove();
      container.extendState(newState);
      self.config = self.layout.toConfig();
      self.layout.destroy();
      self.setView();
      self.addItemMenuDragSource();
    };

    let prepareSettingsContainer = function() {
      let lang = localStorage.getItem("tmd.base.settings.lang");
      if(lang) {
        lang = lang.replace(/"/g,"");
      }
      let container = stack.getActiveContentItem().container;
      let state = container.getState();
      let settingsContainerHtml = "<div class='settings-wrapper'><div class='controls-wrapper'>";
      let settingsControlsHtml = "";
      $.each(state, function (key, value) {
        if(key.indexOf('_hiddenControl') == -1) {
          let type = Object.prototype.toString.call(value);
          let controlHTML = "";
          if (type == "[object Object]") {
            if (value.choises && value.value && value.choises.length > 0) {
              controlHTML = "<div class='control-wrapper' data-key='" + key + "'><p>" + self.translate.instant("dashboard." + key) + "</p><select>";
              for (let i = 0; i < value.choises.length; i++) {
                let realData = ""
                if (value.real_choises && value.real_value && value.real_choises.length > 0) {
                  realData += "data-realvalue='";
                  realData += value.real_choises[i];
                  realData += "'";
                }
                controlHTML += "<option type='radio' " + realData + " data-key='" + key + "' value='" + value.choises[i] + "' " + (value.choises[i]==value.value ? "selected='selected'": "") + ">" +
                ((value.real_choises && value.real_value && value.real_choises.length > 0) ?
                  value.choises[i] : self.translate.instant("dashboard.dropdown." + value.choises[i])) +
                  "</option>";
              }
              controlHTML += "</select></div>";
            }
          } else if (type == "[object String]") {
            controlHTML = "<div class='control-wrapper' data-key='" + key + "'><p>" + self.translate.instant("dashboard." + key) + "</p><input type='text' data-key='" + key + "' value='" + value + "'/></div>"
          } else if (type == "[object Boolean]") {
            controlHTML = "<div class='control-wrapper' data-key='" + key + "'><p>" + self.translate.instant("dashboard." + key) + "</p><input type='checkbox' data-key='" + key + "'" + (value ? "checked='checked'" : "") + "/></div>";
          } else if (type == "[object Array]") {
            controlHTML += "<div class='control-wrapper' data-key='" + key + "'><p>" + self.translate.instant("dashboard." + key) + "</p>";
            for (let i = 0; i < value.length; i++) {
              controlHTML += "<input type='text' data-key='" + key + "' value='" + value[i] + "'/>"
            }
            controlHTML += "</div>";
          }
          settingsControlsHtml += controlHTML;
        }
      });
      if (settingsControlsHtml.length > 0) {
        settingsControlsHtml += "" +
          "<div class='buttons-row'>" +
            "<div class='save-btn'><i class='icons-check icon' aria-hidden='true'></i></div>" +
            "<div onclick='$(this).parent().parent().parent().remove()'><i  class='icons-closesmall icon' aria-hidden='true'></i></div>" +
          "</div></div></div>";
        settingsContainerHtml += settingsControlsHtml;
      } else {
        settingsControlsHtml += "" +
            "<div class='no-settings'>" + self.translate.instant("dashboard.no-settings") + "</div>" +
            "<div class='buttons-row'>" +
              "<div onclick='$(this).parent().parent().parent().remove()'><i class='icons-closesmall icon' aria-hidden='true'></i></div>" +
            "</div>" +
          "</div></div>";
        settingsContainerHtml += settingsControlsHtml;
      }
      stack.header.controlsContainer.prepend(settingsContainerHtml);
      let saveBtn = $(stack.header.controlsContainer).find('.save-btn');

      $(document).mouseup(function (e)
      {
        let container = $(".settings-wrapper");

        if (!container.is(e.target)
          && container.has(e.target).length === 0)
        {
          container.remove();
        }
      });

      saveBtn.click(function(){
        setState(this);
      });
    }
    if($(stack.header.controlsContainer).find(".settingsButton").length <= 0) {
      stack.header.controlsContainer.prepend( settingsCtrl );
    }

    settingsBtn.click(function(){
      prepareSettingsContainer();
    });
    setTimeout(function(){
      let container = stack.getActiveContentItem().container;
      let state = container.getState();
      if(state.firstDrop_hiddenControl) {
        let disableFirstShowing = {firstDrop_hiddenControl: false};
        container.extendState(disableFirstShowing);
        settingsBtn.trigger("click");
      }
    },0);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.layout)
      this.layout.updateSize();
  }
  /*
   * Delete nullable width and height
   */
  updateHeightWidthLayout(elem, self) {
    if (elem && elem.content) {
      if (elem.activeItemIndex >= 0 && elem.activeItemIndex > elem.content.length - 1) {
        delete elem.activeItemIndex;
      }
      if (!elem.height) {
        delete elem.height;
      }
      if (!elem.width) {
        delete elem.width;
      }
      if (elem.content && elem.content.length > 0) {
        elem.content.forEach(function (el) {
          self.updateHeightWidthLayout(el, self);
        });
      }
    }
  }

  private _$createRootItemAreasOverride = function() {
    /*debugger*/;
    let _this = (<any>this);
    let areaSize = 50;
    let sides = { y2: 'y1', x2: 'x1', y1: 'y2', x1: 'x2' };

    for( let side in sides ) {
      let area = _this.root._$getArea();
      area.side = side;
      if( sides [ side ][1] == '2' )
        area[ side ] = area[ sides [ side ] ] - areaSize;
      else
        area[ side ] = area[ sides [ side ] ] + areaSize;
      area.surface = ( area.x2 - area.x1 ) * ( area.y2 - area.y1 );
      _this._itemAreas.push( area );
    }
  };
}
