/**
 * Created by Sergey Trizna on 17.02.2017.
 */
import {Directive, TemplateRef, ViewContainerRef, Input} from '@angular/core';
import {SecurityService} from "../../../services/security/security.service";

@Directive({selector: '[access]'})
export class AccessDirective {
    constructor(private templateRef: TemplateRef<any>,
                private viewContainer: ViewContainerRef,
                private securityService: SecurityService) {
    }

    /**
     * Name of criteria for read access right from service or just boolean for enable or disable view
     * @param cond
     */
    @Input() set access(cond: boolean|string) {
        if (typeof cond == "string") {
            cond = this.securityService.hasPermissionByName(cond.toString());
        }

        this.switchView(!!cond);
    }


    /**
     * Clear or create view in container
     * @param cond
     */
    private switchView(cond: boolean): void {
        if (!cond) {
            this.viewContainer.clear();
        } else {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}

@Directive({selector: '[accessmode]'})
export class AccessModeDirective {
    constructor(private templateRef: TemplateRef<any>,
                private viewContainer: ViewContainerRef,
                private securityService: SecurityService) {
    }

    /**
     * Name of criteria for read access right from service or just boolean for enable or disable view
     * @param cond
     */
    @Input() set accessmode(cond: boolean|string) {
        if (typeof cond == "string") {
            cond = this.securityService.getCurrentMode() == cond;
        }

        this.switchView(!!cond);
    }


    /**
     * Clear or create view in container
     * @param cond
     */
    private switchView(cond: boolean): void {
        if (!cond) {
            this.viewContainer.clear();
        } else {
            this.viewContainer.createEmbeddedView(this.templateRef);
        }
    }
}
