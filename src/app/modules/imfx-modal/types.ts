/**
 * Created by Sergey Trizna on 18.04.2018.
 */
import { ModalOptions } from "ngx-bootstrap/modal";
import {Type} from "@angular/core";

export type IMFXModalInitialStateType = {
    data?: any,
    modalOptions?: IMFXModalOptions
}

export type IMFXModalOptions = ModalOptions & {
    name?: string;
    dialogStyles?: JQueryCssProperties;
    footer?: IMFXModalFooterOptions | false | 'ok' | 'close' | 'close|ok' | 'cancel|ok' | 'close|checkbox|ok' | 'cancel|save' | 'none';
    footerRef?: string;
    title?: string;
    subTitle?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full-size';
    position?: 'center' | 'top';
    _compFunc?: Type<any>;
    _compPath?: string;
    hideModalBody?: boolean;
    isCloseCross?: boolean,
    type?: 'error'|'normal',
    hashAddress?: string,
    usePushState?: boolean,
}

export type IMFXModalFooterOptions = {
    buttons: IMFXModalFooterButtonOptions[] | string | false
}

export type IMFXModalFooterButtonOptions = {
    name: string,
    label: string,
    // callBack: Function,
    classes?: string
}

export type IMFXModalEvent = {
    $event?: any,
    name: string | 'hide' | 'hidden' | 'autohide' | 'show' | 'shown',
    state?: any
}
