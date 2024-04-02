import {
    Component, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input,
    ViewChild, ComponentFactoryResolver, Inject, ApplicationRef, Injector
} from '@angular/core';
import {Router} from "@angular/router";
import {Location} from '@angular/common';
import {TableSearchService} from "../../../../services/viewsearch/table.search.service";
import {SearchAdvancedService} from "../../../../modules/search/advanced/services/search.advanced.service";
import {SearchSavedService} from "../../../../modules/search/saved/services/search.saved.service";
import { appRouter } from '../../../../constants/appRouter';
import {
    SlickGridConfig, SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../../../../modules/search/slick-grid/slick-grid.config";
import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";
import {SlickGridService} from "../../../../modules/search/slick-grid/services/slick.grid.service";
import {SlickGridColumn} from "../../../../modules/search/slick-grid/types";
import {SlickGridComponent} from "../../../../modules/search/slick-grid/slick-grid";
import {StatusFormatter} from "../../../../modules/search/slick-grid/formatters/status/status.formatter";
@Component({
  moduleId: 'workflow-details',
  templateUrl: './tpl/index.html',
  styleUrls: [
    './styles/index.scss',
    '../../../../modules/styles/index.scss'
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  providers: [
      SlickGridProvider,
      SlickGridService,
    TableSearchService,
    SearchAdvancedService
  ],
  entryComponents: [
  ]
})
export class WorkflowsDashComponent {

  @Input() headerTitle;
  @Input() savedSearch;
  @ViewChild('overlay', {static: false}) private overlay: any;
  @ViewChild('workflowtable', {static: false}) private workflowtable: any;
  @ViewChild('wfBoardTable', {static: false}) private grid: SlickGridComponent;

  private gridOptions: SlickGridConfig;
private data = {
    tableRows: [],
    tableColumns: <SlickGridColumn[]>[
        {
            id: 1,
            name: 'Id',// TODO: i18n
            field: 'ID',
            width: 80,
            resizable: true,
            sortable: false,
            multiColumnSort: false
        },
        {
            id: 2,
            name: 'Title',
            field: 'CMB_IN_TTLS_text',
            resizable: true,
            sortable: false,
            multiColumnSort: false
        },
        {
            id: 3,
            name: 'Job Type',
            field: 'PNAME_text',
            resizable: true,
            sortable: false,
            multiColumnSort: false
        },
        {
            id: 4,
            name: 'Status',
            field: 'CMB_STAT_text',
            resizable: true,
            sortable: false,
            multiColumnSort: false,
            formatter: StatusFormatter,
            isCustom: true,
            __deps: {
                injector: this.injector
            }
        },
        {
            id: 5,
            name: 'Complete By',
            field: 'J_COMPL_BY',
            resizable: true,
            sortable: false,
            multiColumnSort: false
        },
    ]
};

  private timerId;

  constructor(private cdr: ChangeDetectorRef,
              private searchService: TableSearchService,
              private searchAdvancedService: SearchSavedService,
              private router: Router,
              public location: Location,
              @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
              @Inject(ApplicationRef) public appRef: ApplicationRef,
              @Inject(Injector) public injector: Injector) {

  }

  ngOnInit() {
      this.gridOptions = new SlickGridConfig(<SlickGridConfig>{
          componentContext: this,
          providerType: SlickGridProvider,
          serviceType: SlickGridService,
          options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
              module: <SlickGridConfigModuleSetups>{
                  viewModeSwitcher: false,
                  isThumbnails: false,
                  search: {
                      enabled: false
                  },
                  externalWrapperEl: '#externalWrapperWFDash',
                  selectFirstRow: false
              },
              plugin: <SlickGridConfigPluginSetups>{
                  headerRowHeight: 20,
                  fullWidthRows: true,
                  forceFitColumns: false,
                  enableColumnReorder: false
              }
          }),
      });
    this.InitGrid();
    let self = this;
    this.timerId = setInterval(function() {
      self.InitGrid();
    }, 15000);
  }

  ngAfterViewInit() {
      let self = this;
      this.grid.provider.onRowMouseDblClick.subscribe((res: any) => {
          self.onRowDoubleClicked(res);
      });
  }

  ngOnDestroy() {
    clearInterval(this.timerId);
  }

  InitGrid() {
    console.log("Init data...");
    //this.overlay.show(this.workflowtable.nativeElement);
    let self = this;
    if(this.savedSearch != -1) {
      this.searchAdvancedService.getSavedSearches("Job", this.savedSearch).subscribe(result=> {
        let advSearchParams = [];
        if(result && result.length > 0) {
          result.forEach(function(el){
            advSearchParams.push(el);
          });
          self.searchService.search("workflow", "", 1, "", "desc", advSearchParams)
            .subscribe(res=> {
              let tableRows = [];
              res.Data.forEach(function(el){
                let exp = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;
                for (var e in el){
                  if (typeof el[e]=="string" && el[e].match(exp))  {
                    el[e] = new Date(el[e]).toLocaleString();
                  }
                }
                  tableRows.push({
                  ID: el.ID,
                  CMB_IN_TTLS_text: el.CMB_IN_TTLS_text,
                  PNAME_text: el.PNAME_text,
                  CMB_STAT_text: el.CMB_STAT_text,
                  J_COMPL_BY: el.J_COMPL_BY
                })
              });
                self.data.tableRows = tableRows;
                self.grid.provider.setGlobalColumns(this.data.tableColumns);
                self.grid.provider.setDefaultColumns(this.data.tableColumns, [], true);
                self.grid.provider.buildPageByData({Data: self.data.tableRows});
                self.grid.provider.resize();

              //self.overlay.hide(self.workflowtable.nativeElement);
              console.log("Updated");
              self.cdr.detectChanges();
            });
        }
      });
    } else {
      this.searchService.search("workflow","",1)
        .subscribe(res=> {
          let tableRows = [];
          res.Data.forEach(function(el){
            tableRows.push({
              ID: el.ID,
              CMB_IN_TTLS_text: el.CMB_IN_TTLS_text,
              PNAME_text: el.PNAME_text,
              CMB_STAT_text: el.CMB_STAT_text,
              J_COMPL_BY: el.J_COMPL_BY
            })
          });

            self.data.tableRows = tableRows;
            self.grid.provider.setGlobalColumns(this.data.tableColumns);
            self.grid.provider.setDefaultColumns(this.data.tableColumns, [], true);
            self.grid.provider.buildPageByData({Data: self.data.tableRows});
            self.grid.provider.resize();
          //self.overlay.hide(self.workflowtable.nativeElement);
          console.log("Updated");
          self.cdr.detectChanges();
        });
    }
  }

  onRowDoubleClicked($event): any {
      debugger;
    this.router.navigate(
      [
        appRouter.workflow.detail.substr(
          0,
          appRouter.workflow.detail.lastIndexOf('/')
        ),
        $event.row.ID
      ]
    );
  }
}
