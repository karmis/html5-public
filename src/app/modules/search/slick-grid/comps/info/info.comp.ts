/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation} from "@angular/core";
import {SlickGridPanelData, SlickGridResp} from "../../types";
import {SlickGridConfigModuleSetups} from "../../slick-grid.config";
import {SlickGridInfoProvider} from "./providers/info.slick.grid.provider";
import {SlickGridProvider} from "../../providers/slick.grid.provider";

@Component({
    selector: 'slickgrid-info-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridInfoProvider
    ]
})

export class SlickGridInfoComp {
    @Input('provider') public sgp: SlickGridProvider;
    @Input('data') data: SlickGridPanelData;
    public module: SlickGridConfigModuleSetups;
    public isVisible: boolean;
    constructor(private cdr: ChangeDetectorRef,
                private provider: SlickGridInfoProvider) {
        provider.compContext = this;
    }
    ngAfterViewInit() {
        this.sgp.InfoProvider = this.provider;
        this.provider.setInfo({
            Rows: 0,
            Data: [],
            Facets: {
                Facets: [],
                FacetsInfo: ''
            }
        });

        this.module = this.sgp.module;
        this.sgp.onGridRowsUpdated.subscribe((resp: SlickGridResp) => {
            this.provider.setInfo(resp);
            if (!this.cdr['destroyed']) {
                this.isVisible = true;
                this.cdr.detectChanges();
            }
        });
        this.sgp.onGridEndSearch.subscribe((isOk: boolean = true)=>{
            this.isVisible = isOk;
            this.cdr.detectChanges();
        });
    }
}
