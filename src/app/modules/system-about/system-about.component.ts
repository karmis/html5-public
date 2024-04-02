import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { SlickGridService } from "../search/slick-grid/services/slick.grid.service";
import { SlickGridProvider } from "../search/slick-grid/providers/slick.grid.provider";
import { SystemAboutSlickGridProvider } from "./providers/system-about.slick.grid.provider";
import { SystemAboutViewsProvider } from "./providers/views.provider";
import { ViewsProvider } from "../search/views/providers/views.provider";
import { SlickGridPagerProvider } from "../search/slick-grid/comps/pager/providers/pager.slick.grid.provider";
import { SystemAboutPagerSlickGridProvider } from "./providers/system-about.pager.slick.grid.provider";
import { IMFXTextMarkerComponent } from "../controls/text.marker/imfx.text.marker";
import { SearchFormProvider } from "../search/form/providers/search.form.provider";
import { IMFXModalComponent } from "../imfx-modal/imfx-modal";
import { SlickGridComponent } from "../search/slick-grid/slick-grid";
import {
    SlickGridConfig,
    SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from "../search/slick-grid/slick-grid.config";
import { SlickGridColumn } from "../search/slick-grid/types";
import { TreeFormatter } from "../search/slick-grid/formatters/tree/tree.formatter";
import { Subject } from "rxjs";
import { AboutSystemRow, PackageInfo } from "./models";
import { HttpClient } from "@angular/common/http";
import {LinkFormatter} from "../search/slick-grid/formatters/link/link.formatter";
import {appRouter} from "../../constants/appRouter";

@Component({
    selector: 'system-about',
    templateUrl: 'tpl/system-about.component.html',
    styleUrls: [
        'styles/index.scss'
    ],
    providers: [
        // SlickGridProvider,
        SlickGridService,
        {provide: SlickGridProvider, useClass: SystemAboutSlickGridProvider},
        {provide: ViewsProvider, useClass: SystemAboutViewsProvider},
        {provide: SlickGridPagerProvider, useClass: SystemAboutPagerSlickGridProvider},
        IMFXTextMarkerComponent,
        SearchFormProvider
    ],
    encapsulation: ViewEncapsulation.None,
})
export class SystemAboutComponent implements OnInit, AfterViewInit {

    private modalRef: IMFXModalComponent;

    config: any;
    compIsLoaded = false;
    @ViewChild('slickGridComp', {static: false}) slickGridComp: SlickGridComponent;
    public onTimecodeEdit: EventEmitter<any> = new EventEmitter<any>();
    public playerExist: boolean = true;
    public validationEnabled: boolean = true;

    protected gridConfig: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
        componentContext: this,
        providerType: SlickGridProvider,
        serviceType: SlickGridService,
        isExpandable: true,
        options: new SlickGridConfigOptions(<SlickGridConfigOptions>{
            module: <SlickGridConfigModuleSetups>{
                viewModeSwitcher: false,
                isThumbnails: false,
                enableSorting: false,
                isTree: {
                    enabled: true,
                    startState: 'collapsed',
                    expandMode: 'allLevels'
                },
                pager: {
                    enabled: true,
                    mode: 'small',
                    perPage: 0
                },
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 20,
                fullWidthRows: true,
                forceFitColumns: false
            }
        })
    });

    private data = {
        tableColumns: <SlickGridColumn[]>[
            {
                id: -3,
                name: '',
                field: '*',
                width: 150,
                isFrozen: false,
                resizable: false,
                __isCustom: true,
                __text_id: 'tree',
                sortable: false,
                multiColumnSort: false,
                formatter: TreeFormatter,
                enableColumnReorder: false,
                headerCssClass: "disable-reorder",
                __deps: {
                    injector: this.injector,
                    data: {
                        signColumn: 'Title_Type',
                        colorFilling: true
                    }
                }
            },
            // { three dots
            //     isFrozen: true,
            //     id: -2,
            //     name: '',
            //     field: '*',
            //     width: 50,
            //     minWidth: 50,
            //     resizable: false,
            //     sortable: false,
            //     multiColumnSort: false,
            //     formatter: SettingsFormatter,
            //     headerCssClass: "disable-reorder",
            //     __isCustom: true,
            //     __text_id: 'settings',
            //     __deps: {
            //         injector: this.injector
            //     }
            // },
            {
                id: 1,
                name: 'Name',
                field: 'Name',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 2,
                name: 'License',
                field: 'License',
                // width: 150,
                resizable: true,
                sortable: false,
                multiColumnSort: false
            },
            {
                id: 3,
                name: 'Version',
                field: 'Version',
                resizable: true,
                sortable: false,
                multiColumnSort: false,
                isFrozen: true,
                isCustom: true,
                __deps: {
                    injector: this.injector
                }
            }
        ]
    };

    private columns: Array<SlickGridColumn>;
    private destroyed$: Subject<any> = new Subject();
    listPackage: AboutSystemRow[];
    packagePage: AboutSystemRow[][] = [];
    count = 150;
    private currentPage = 0;
    private countPage: number;
    private packageInfo: any = [];
    private activePackageLicenseText: any = null;
    private activePackage: any = null;

    private mitTemplate ="The MIT License (MIT)\n" +
        "\n" +
        "{PACKAGE}\n" +
        "\n" +
        "Copyright (c) {NAME}\n" +
        "\n" +
        "Permission is hereby granted, free of charge, to any person obtaining a copy\n" +
        "of this software and associated documentation files (the \"Software\"), to deal\n" +
        "in the Software without restriction, including without limitation the rights\n" +
        "to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n" +
        "copies of the Software, and to permit persons to whom the Software is\n" +
        "furnished to do so, subject to the following conditions:\n" +
        "\n" +
        "The above copyright notice and this permission notice shall be included in all\n" +
        "copies or substantial portions of the Software.\n" +
        "\n" +
        "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n" +
        "IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n" +
        "FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n" +
        "AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n" +
        "LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n" +
        "OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n" +
        "SOFTWARE."

    constructor(private injector: Injector,
                private cdr: ChangeDetectorRef,
                private slickGridPagerProvider: SlickGridPagerProvider,
                private http: HttpClient) {
        this.modalRef = this.injector.get('modalRef');

    }

    ngOnInit(): void {
        this.http
            .get(`./assets/licenses/package-info.json`)
            .subscribe(response => {
                this.packageInfo = response;
                this.bindDataToGrid();
            });
    }

    ngAfterViewInit() {
    }

    onOk() {
        this.modalRef.modalEvents.emit({
            name: 'ok'
        });
    }

    private bindDataToGrid() {
        const Data: AboutSystemRow[] = [];
        const pakInf: PackageInfo = this.packageInfo;
        let lastFolderName = '';

        for (const name in pakInf) {
            const nameAr = name.split('@');
            //
            const fullName = nameAr[nameAr.length - 2];
            const folderName = fullName.split('/'); // folder/package

            if (folderName.length > 0) {
                if (lastFolderName === folderName[0]) {
                    Data[Data.length - 1].Children.push({
                        Name: fullName,
                        License: pakInf[name].licenses,
                        Version: nameAr[nameAr.length - 1],
                        ShowMIT: pakInf[name].licenses == "MIT",
                        Publisher: pakInf[name].publisher
                    });
                    if(Data[Data.length - 1].ShowMIT) {
                        Data[Data.length - 1].ShowMIT = false;
                    }
                } else {
                    Data.push({
                        Name: fullName,
                        License: pakInf[name].licenses,
                        Version: nameAr[nameAr.length - 1],
                        Children: [],
                        ShowMIT: pakInf[name].licenses == "MIT",
                        Publisher: pakInf[name].publisher
                    });
                }

                lastFolderName = folderName[0];
            } else {
                Data.push({
                    Name: fullName,
                    License: pakInf[name].licenses,
                    Version: nameAr[nameAr.length - 1],
                    Children: [],
                    ShowMIT: pakInf[name].licenses == "MIT",
                    Publisher: pakInf[name].publisher
                });
            }
        }

        this.listPackage = Data;
        this.countPage = Math.ceil(Data.length / this.count);
        let last = 0;
        for (let i = 1; i <= this.countPage; i++) {
            const end = i * this.count;
            this.packagePage.push(Data.slice(last, end));
            last = end + 1;
        }

        this.slickGridComp.provider.setGlobalColumns(this.data.tableColumns);
        this.slickGridComp.provider.setDefaultColumns(this.data.tableColumns, [], true);
        this.slickGridComp.provider.buildPageByData({Data: this.packagePage[this.currentPage]});
        this.slickGridComp.provider.resize();
        this.slickGridComp.provider.onRowMouseClick.subscribe((res)=>{
            if(res && res.row && res.row.ShowMIT) {
                this.activePackageLicenseText = this.mitTemplate
                    .replace(/{NAME}/g, res.row.Publisher)
                    .replace(/{PACKAGE}/g, res.row.Name);
            }
            else {
                this.activePackageLicenseText = null;
            }
        });
    }

    private backFromLicense() {
        this.activePackageLicenseText = null;
    }

    nextPage() {
        this.currentPage += 1;
        if (this.currentPage > this.countPage) {
            this.currentPage = this.countPage;
            return;
        }
        this.slickGridComp.provider.buildPageByData({Data: this.packagePage[this.currentPage]});
        this.slickGridComp.provider.resize();
    }

    prevPage() {
        this.currentPage -= 1;
        if (this.currentPage < 0) {
            this.currentPage = 0;
            return;
        }
        this.slickGridComp.provider.buildPageByData({Data: this.packagePage[this.currentPage]});
        this.slickGridComp.provider.resize();
    }

}
