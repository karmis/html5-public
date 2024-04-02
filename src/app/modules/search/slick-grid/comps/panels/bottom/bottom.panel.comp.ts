/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {SlickGridPanelInterace} from "../panel.interface";
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Injector, Input, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {SlickGridPanelData} from "../../../types";
import {SlickGridPanelProvider} from "../providers/panels.slick.grid.provider";
import {SlickGridProvider} from "../../../providers/slick.grid.provider";

@Component({
    selector: 'slickgrid-bottom-panel',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
    ]
})
export class SlickGridPanelBottomComp implements SlickGridPanelInterace {
    @ViewChild('element', {static: false}) element:ElementRef;
    isVisible: boolean;
    @Input('provider') private sgp: SlickGridProvider;
    private data: SlickGridPanelData;

    constructor(private injector: Injector, private cdr: ChangeDetectorRef) {
        // this.data = this.injector.get('data');
    }

    onShow() {
        // console.log('show');
    };

    onHide() {
        // console.log('hide');
    };
}
