import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewEncapsulation,
    ViewChild,
    ApplicationRef, Inject, Injector, ComponentFactoryResolver, Input
} from '@angular/core';
import { RemoveButtonColumn } from './comps/remove.button/remove.button.component';
import {
    SlickGridConfig, SlickGridConfigModuleSetups,
    SlickGridConfigOptions, SlickGridConfigPluginSetups
} from '../../../../../../../modules/search/slick-grid/slick-grid.config';
import { SlickGridProvider } from '../../../../../../../modules/search/slick-grid/providers/slick.grid.provider';
import { SlickGridService } from '../../../../../../../modules/search/slick-grid/services/slick.grid.service';
import { SlickGridComponent } from '../../../../../../../modules/search/slick-grid/slick-grid';
import { ViewsProvider } from '../../../../../../../modules/search/views/providers/views.provider';
import {ServiceConfigSlickGridProvider} from "./providers/slick.grid.provider";
import {ServiceConfigViewsProvider} from "./providers/views.provider";
import {ServiceConfigService} from "../../../../../../../services/system.config/settings.service-config.service";
@Component({
    selector: 'service-config-grid',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridProvider,
        SlickGridService,
        ServiceConfigService,
        ViewsProvider,
        ServiceConfigViewsProvider,
        {provide: ViewsProvider, useClass: ServiceConfigViewsProvider},
        {provide: SlickGridProvider, useClass: ServiceConfigSlickGridProvider},
    ]
})

export class ServiceConfigGridComponent implements OnInit {
    @Input("typeId") public typeId: any;
    private serviceConfigGridOptions: SlickGridConfig = new SlickGridConfig(<SlickGridConfig>{
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
                externalWrapperEl: "#externalWrapperServiceConfig",
                selectFirstRow: false,
                clientSorting: true
            },
            plugin: <SlickGridConfigPluginSetups>{
                headerRowHeight: 25,
                fullWidthRows: true,
                rowHeight:25,
                forceFitColumns: false,

            }
        })
    });


    private data: any = {};
    @ViewChild('overlayGroup', {static: true}) private overlayGroup: any;
    @ViewChild('serviceConfig', {static: false}) private serviceConfig: any;
    @ViewChild('serviceConfigGrid', {static: true}) private serviceConfigGrid: SlickGridComponent;
    private error: boolean = false;

    @Output() private selectServiceConfig: EventEmitter<any> = new EventEmitter<any>();

    constructor(private cdr: ChangeDetectorRef,
                private settingsServiceConfigService: ServiceConfigService,
                @Inject(ComponentFactoryResolver) public compFactoryResolver: ComponentFactoryResolver,
                @Inject(ApplicationRef) public appRef: ApplicationRef,
                @Inject(Injector) public injector: Injector) {

        this.data = {
            tableRows: [],
            tableColumns: []
        };
    };

    ngOnInit() {
        let self = this;
        setTimeout(()=>{
            this.overlayGroup.show(self.serviceConfig.nativeElement);

            this.data.tableColumns = this.injector.get(ServiceConfigViewsProvider).getCustomColumns();
            this.settingsServiceConfigService.getSettingsServiceConfigById(this.typeId).subscribe((res: any) => {
                self.onGetServiceConfig(res);
            });
        });

        this.serviceConfigGrid.onGridReady.subscribe(()=>{
            self.serviceConfigGrid.provider.onRowMouseDblClick.subscribe((data)=> {
                delete data.row.id; //delete dublicate lowerCase property 'id'
                self.selectServiceConfig.emit(data.row);
            });
        });
    }

    public refresh() {
        let self = this;
        this.overlayGroup.show(self.serviceConfig.nativeElement);
        this.data.tableColumns = this.injector.get(ServiceConfigViewsProvider).getCustomColumns();
        this.settingsServiceConfigService.getSettingsServiceConfigById(this.typeId).subscribe((res: any) => {
            self.onGetServiceConfig(res);
        });
    }

    ngOnDestroy() {
        this.overlayGroup.hide(this.serviceConfig.nativeElement);
        this.serviceConfigGrid.onGridReady.unsubscribe();
    }

    public updateConfigsList() {
        this.clickRepeat();
    }

    isError($event) {
        if ($event) {
            this.error = true;
        }
    }

    clickRepeat() {
        this.error = false;
        let self = this;
        this.overlayGroup.show(this.serviceConfig.nativeElement);
        this.settingsServiceConfigService.getSettingsServiceConfigById(this.typeId).subscribe(
            (res: any) => {
                self.onGetServiceConfig(res);
            },
            (err) => {
                self.error = true;
                self.overlayGroup.hide(this.serviceConfig.nativeElement);
            });
    }

    onGetServiceConfig(res){
        this.data.tableRows = res;
        this.cdr.detectChanges();
        this.bindDataToGrid();
        this.overlayGroup.hide(this.serviceConfig.nativeElement);
    }

    addServiceConfig() {
        this.overlayGroup.show(this.serviceConfig.nativeElement);
        this.settingsServiceConfigService.getNewSchemaByType(this.typeId).subscribe((res: any) => {
            this.overlayGroup.hide(this.serviceConfig.nativeElement);
            this.cdr.detectChanges();
            this.selectServiceConfig.emit(res);
        });
        this.cdr.detectChanges();
    }

    private bindDataToGrid() {
        this.serviceConfigGrid.provider.setGlobalColumns(this.data.tableColumns);
        this.serviceConfigGrid.provider.setDefaultColumns(this.data.tableColumns, [], true);
        this.serviceConfigGrid.provider.buildPageByData({Data: this.data.tableRows});
        this.serviceConfigGrid.provider.resize();
    }
}










