/**
 * Created by Sergey Trizna on 30.03.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef, EventEmitter,
    Injector,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {IMFXModalComponent} from "../../imfx-modal";
import { TranslateService } from '@ngx-translate/core';
import {IMFXModalPromptComponent} from "../../../../imfx-modal/comps/prompt/prompt";
import {ViewsProvider} from "../../providers/views.provider";
import {SecurityService} from "../../../../../services/security/security.service";

@Component({
    selector: 'view-detail-modal',
    templateUrl: './tpl/index.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../../styles/index.scss']
})
export class ViewDetailModalComp extends IMFXModalPromptComponent {
    set isGlobal(state: boolean) {
        this._isGlobal = state;
    }

    get isGlobal(): boolean {
        return this._isGlobal;
    }

    set isDefault(state: boolean) {
        this._isDefault = state;
    }

    get isDefault(): boolean {
        return this._isDefault;
    }
    public _isGlobal: boolean = false;
    public _isDefault: boolean = false;
    constructor(protected injector: Injector,
                protected cdr: ChangeDetectorRef,
                protected securityService: SecurityService,
                protected translate: TranslateService) {
        super(injector, cdr, translate);
    }

    ngAfterViewInit(){
        this.cdr.detectChanges();
    }

    setIsGlobal(state: boolean) {
        this.isGlobal = this.hasPermissionByName('views-save-as-global') ? state : false;
    }

    setIsDefault(state: boolean) {
        this.isDefault = state;
    }

    hasPermissionByName(name) {
        return this.securityService.hasPermissionByName(name)
    }


    changeGlobal(){
        this.isGlobal = !this.isGlobal
    }

    changeDefault(){
        this.isDefault = !this.isDefault
    }
    private flagIsDefault: boolean = false;
    setAsDefaultFlagForTitle(state: boolean){
        this.flagIsDefault = state;
    }

    private showFooter: boolean = true;
    setShowFooter(state: boolean){
        this.showFooter = state;
    }
}
