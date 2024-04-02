/**
 * Created by Sergey Trizna on 26.01.2018.
 */
import {ComponentRef, Injectable} from "@angular/core";
import {SlickGridProvider} from "../../../providers/slick.grid.provider";
import {BaseProvider} from "../../../../../../views/base/providers/base.provider";
import {SlickGridPanelInterace} from "../panel.interface";
import {SlickGridPanelData} from "../../../types";

@Injectable()
export class SlickGridPanelProvider {
    public topPanelCompReference: ComponentRef<any> = null;
    public bottomPanelCompReference: ComponentRef<any> = null;

    private _slickGirdProvider: SlickGridProvider;

    get slickGridProvider(): SlickGridProvider {
        return this._slickGirdProvider
    }

    set slickGridProvider(_context: SlickGridProvider) {
        this._slickGirdProvider = _context;
    }

    constructor() {
    }

    init() {
        // debugger;
        // let bp = this.slickGridProvider.injector.get(BaseProvider);
        // let data: SlickGridPanelData = {
        //     slickGridProvider: this.slickGridProvider
        // };
        // let els = this.slickGridProvider.els;
        // let module = this.slickGridProvider.module;
        // if (bp.buildComponent) {
        //     if (module.topPanel.enabled && els.topPanel && els.topPanel.nativeElement) {
        //         this.topPanelCompReference = bp.buildComponent(module.topPanel.typeComponent, data, els.topPanel.nativeElement);
        //         this.topPanelCompReference.instance.isVisible = this.isShowAdditionalTopPanel();
        //     }
        //     if (module.bottomPanel.enabled && els.bottomPanel && els.bottomPanel.nativeElement) {
        //         this.bottomPanelCompReference = bp.buildComponent(module.bottomPanel.typeComponent, data, els.bottomPanel.nativeElement);
        //         this.bottomPanelCompReference.instance.isVisible = this.isShowAdditionalTopPanel();
        //     }
        //
        //     // this.slickGridProvider.cdr.markForCheck();
        // }
        // new Promise((resolve, reject) => {
        //     resolve();
        // }).then(() => {
        //
        //     }, (err) => {
        //         console.log(err);
        //     }
        // );
    }


    private _showAdditionalTopPanel(): boolean {
        if (!this.topPanelCompReference) {
            return;
        }
        let state: boolean = this.isShowAdditionalTopPanel();
        let inst: SlickGridPanelInterace = this.topPanelCompReference.instance;
        if (inst && state !== inst.isVisible) {
            inst.isVisible = state;
            if (state === true) {
                inst.onShow();
            } else {
                inst.onHide();
            }

            if (!this.slickGridProvider.cdr['destroyed']) {
                this.slickGridProvider.cdr.detectChanges();
            } else {
                setTimeout(() => {
                    this.slickGridProvider.cdr.markForCheck();
                })
            }

            // new Promise((resolve, reject) => {
            //     resolve();
            // }).then(() => {
            //     this.slickGridProvider.resize();
            // });
        }
        return state
    }

    private _showAdditionalBottomPanel(): boolean {
        if (!this.bottomPanelCompReference) {
            return;
        }
        let state: boolean = this.isShowAdditionalBottomPanel();
        let inst: SlickGridPanelInterace = this.bottomPanelCompReference.instance;
        if (inst && state !== inst.isVisible) {
            this._toggleVisiblePanel(inst, state, false);
        }
        return state
    }

    private _toggleVisiblePanel(inst: any, state: boolean, silent: boolean) {
        inst.isVisible = state;
        if (silent == false) {
            if (state === true) {
                inst.onShow();
            } else {
                inst.onHide();
            }
        }

        if (!this.slickGridProvider.cdr['destroyed']) {
            this.slickGridProvider.cdr.detectChanges();
        } else {
            setTimeout(() => {
                this.slickGridProvider.cdr.markForCheck();
            })
        }
        // this.slickGridProvider.cdr.detectChanges();

        // new Promise((resolve, reject) => {
        //     resolve();
        // }).then(() => {
        //     this.slickGridProvider.resize();
        // });
    }

    hideTopPanel(silent: boolean = false) {
        if (this.topPanelCompReference && this.topPanelCompReference.instance) {
            this._toggleVisiblePanel(this.topPanelCompReference.instance, false, silent);
        }
    }

    hideBottomPanel(silent: boolean = false) {
        if (this.bottomPanelCompReference && this.bottomPanelCompReference.instance) {
            this._toggleVisiblePanel(this.bottomPanelCompReference.instance, false, silent);
        }
    }

    showTopPanel(silent: boolean = false) {
        if (this.topPanelCompReference && this.topPanelCompReference.instance) {
            this._toggleVisiblePanel(this.topPanelCompReference.instance, true, silent);
        }
    }


    showBottomPanel(silent: boolean = false) {
        if (this.bottomPanelCompReference && this.bottomPanelCompReference.instance) {
            this._toggleVisiblePanel(this.bottomPanelCompReference.instance, true, silent);
        }
    }

    hideAllPanels(silent: boolean = false) {
        this.hideTopPanel(silent);
        this.hideBottomPanel(silent);
    }

    showAllPanels(silent: boolean = false) {
        this.showTopPanel(silent);
        this.showBottomPanel(silent);
    }

    isShowAdditionalTopPanel(): boolean {
        return false;
    }

    isShowAdditionalBottomPanel(): boolean {
        return this.slickGridProvider.module.pager.enabled;
    }
}
