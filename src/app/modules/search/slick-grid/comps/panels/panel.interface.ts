import {ElementRef} from "@angular/core";
/**
 * Created by Sergey Trizna on 26.01.2018.
 */
export interface SlickGridPanelInterace {
    element: ElementRef;
    isVisible: boolean;
    onShow();
    onHide();
}