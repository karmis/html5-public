/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild, ViewEncapsulation} from "@angular/core";
import {SlickGridPanelProvider} from "../../../../modules/search/slick-grid/comps/panels/providers/panels.slick.grid.provider";
import {SlickGridPanelInterace} from "../../../../modules/search/slick-grid/comps/panels/panel.interface";
import {SlickGridProvider} from "../../../../modules/search/slick-grid/providers/slick.grid.provider";

@Component({
    selector: 'folders-top-panel',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        SlickGridPanelProvider
    ]
})
export class FoldersTopPanelComp implements SlickGridPanelInterace {
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
