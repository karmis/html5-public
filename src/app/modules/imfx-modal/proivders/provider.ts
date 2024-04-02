/**
 * Created by Sergey Trizna on 17.04.2018.
 */

import {Injectable, Injector, Type} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { IMFXModalComponent } from "../imfx-modal";
import { IMFXModalOptions } from "../types";
import { ThemesProvider } from "../../../providers/design/themes.providers";

@Injectable()
export class IMFXModalProvider {
    constructor(private injector: Injector) {
    }

    public showByPath(path: any,
                      comp: Type<any>,
                      modalOptions: IMFXModalOptions = {}, externalData = {}): IMFXModalComponent {
        return this.show(comp, modalOptions, externalData, path);

    }

    public show(comp: Type<any>,
                modalOptions: IMFXModalOptions = {}, externalData = {}, path: string = null): IMFXModalComponent {
        const _defaultOptions: IMFXModalOptions = {
            backdrop: "static",
            keyboard: true,
            focus: true,
            ignoreBackdropClick: false,
            class: 'imfx-modal',
            animated: true,
            show: true,
            size: 'md',
            position: 'center',
            title: '',
            dialogStyles: {},
            isCloseCross: true,
            type: 'normal',
            usePushState: true
        };
        const themesProvider = this.injector.get(ThemesProvider);
        // let modalRef = this.injector.get(BsModalRef);
        const modalService = this.injector.get(BsModalService);

        modalOptions = $.extend(true, {}, _defaultOptions, modalOptions);

        // classes
        if (!modalOptions.class) {
            modalOptions.class = '';
        }
        // size
        modalOptions.class = modalOptions.class + ' modal-' + modalOptions.size;

        // position
        if (modalOptions.position === 'center') {
            modalOptions.class = modalOptions.class + ' modal-centred';
        }

        // theme
        modalOptions.class = modalOptions.class + ' ' + themesProvider.getCurrentTheme();

        // name
        if (modalOptions.name) {
            modalOptions.class = modalOptions.class + ' ' + modalOptions.name;
        }


        // component func
        modalOptions._compFunc = comp;
        modalOptions._compPath = path;
        // common data object
        const opts = modalOptions;
        opts.initialState = {
            _data: {
                data: externalData,
                modalOptions: modalOptions
            }
        };

        const modalRef = modalService.show(IMFXModalComponent, opts);
        return modalRef.content;
    }
}
