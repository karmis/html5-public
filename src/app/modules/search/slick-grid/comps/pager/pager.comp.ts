/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation} from "@angular/core";
import {SlickGridPagerProvider} from "./providers/pager.slick.grid.provider";
import {SlickGridResp} from "../../types";
import {SlickGridConfigModuleSetups} from "../../slick-grid.config";
import {SlickGridProvider} from "../../providers/slick.grid.provider";

@Component({
    selector: 'slickgrid-pager-comp',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridPagerProvider
    ]
})

export class SlickGridPagerComp {
    public module: SlickGridConfigModuleSetups;
    @Input('provider') public sgp: SlickGridProvider;
    // private _sgp : SlickGridProvider;
    // @Input('provider') set sgp(sgp: SlickGridProvider){
    //     this._sgp = sgp;
    //     this.cdr.detectChanges();
    // }
    // get sgp(): SlickGridProvider {
    //     return this._sgp;
    // }
    isDisabledPrevBtn = false;
    isDisabledNextBtn = false;

    constructor(private cdr: ChangeDetectorRef,
                private provider: SlickGridPagerProvider) {
        provider.compContext = this;
        this.isDisabledNextBtn = provider.isDisabledNextBtn;
        this.isDisabledPrevBtn = provider.isDisabledPrevBtn;
    }

    ngAfterViewInit() {
        if (this.sgp.PagerProvider) {
            this.provider = this.sgp.PagerProvider;
        } else {
            this.sgp.PagerProvider = this.provider;
        }

        this.provider.slickGridProvider = this.sgp;
        // see SlickGridProvider:init()
        this.module = this.sgp.module;
        this.sgp.onGridRowsUpdated.subscribe((resp: SlickGridResp) => {
            this.provider.setPager(resp.Rows);
            if (!this.cdr['destroyed']) {
                this.cdr.detectChanges();
            }
        });
        // this.cdr.detectChanges();
    }
}
