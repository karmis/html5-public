import {Router} from "@angular/router";
import {ApplicationRef, ComponentFactoryResolver, Inject, Injector} from "@angular/core";
import { SlickGridProvider } from '../../../search/slick-grid/providers/slick.grid.provider';

export class LocatorsCommentsSlickGridProvider extends SlickGridProvider {
    public router: Router;
    public compFactoryResolver?: ComponentFactoryResolver;
    public appRef?: ApplicationRef;
    public rowCountForValidation: number = 0;
    public validGrid: boolean = true;

    constructor(@Inject(Injector) public injector: Injector) {
        super(injector);
        this.router = injector.get(Router);
        this.compFactoryResolver = injector.get(ComponentFactoryResolver);
        this.appRef = injector.get(ApplicationRef);
    }
    /**
     * On double click by row
     * @param data
     */
    onRowDoubleClicked() {
        return;
    }
    /**
     * On mousedown
     * @param data
     */
    onRowMousedown(data) {
        let row = data.row;
        (<any>this.componentContext).setNode({
            markers: [
                {time: row.InTc},
                {time: row.OutTc}
            ],
            id: row.customId || row.Id
        });
    }

    /**
     * mark item for delete
     */
    public deleteRow(data) {
        let rowId = data.data.data.Id;
        super.deleteRow(data);

        (<any>this.componentContext).config.series.filter(function (el) {
            return el.Id === rowId;
        }).forEach(function (el) {
            el.Id = el.Id * -1;
        });
        (<any>this.componentContext).saveValid.emit();
    }

    onGridWrapperClick(event: MouseEvent): void {
        if (!this.module.canSetFocus) return;
        let el = event.target;
        let dontResetFocus = false;
        while (true) {
            if ((!(<any>el).id && ((<any>el).className.indexOf('nav-link')) < 0) || ((<any>el).id && (<any>el).id.indexOf('imfx-video') < 0)) {
                el = (<any>el).parentElement;
                if (!el) break;
            } else {
                dontResetFocus = true;
                break;
            }
        }
        if (dontResetFocus) return;
        this.module.isFocused = (<any>this).gridWrapperEl.nativeElement.contains(event.target);
    }
    getTimecodeValid(id) {
        let series = (<any>this.componentContext).config.series;
        let valid = false;
        series.forEach(el => {
            if (el.customId == id || el.Id == id) {
                valid = el.timecodesNotValid;
            }
        });
        return valid;
    }
    isValid(error) {
        return false;
    }
}
