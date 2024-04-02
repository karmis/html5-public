/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {SlickGridPanelInterace} from "../panel.interface";
import {ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, ViewEncapsulation} from "@angular/core";
import {SlickGridPanelProvider} from "../providers/panels.slick.grid.provider";
import {SlickGridProvider} from "../../../providers/slick.grid.provider";

@Component({
    selector: 'slickgrid-top-panel',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridPanelProvider
    ]
})
export class SlickGridPanelTopComp implements SlickGridPanelInterace {
    @ViewChild('element', {static: false}) element:ElementRef;
    isVisible: boolean;
    @Input('provider') private sgp: SlickGridProvider;
    constructor(){
        // console.log('construct');
    }

    onShow() {
        // console.log('show');
    };

    onHide() {
        // console.log('hide');
    };
}
