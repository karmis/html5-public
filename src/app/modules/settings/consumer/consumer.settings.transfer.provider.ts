/**
 * Created by Sergey Trizna on 02.09.2017.
 */
import {EventEmitter, Injectable} from '@angular/core';
import {TransferdSimplifedType} from "./types";

@Injectable()
export class ConsumerSettingsTransferProvider {
    updated: EventEmitter<TransferdSimplifedType> = new EventEmitter<TransferdSimplifedType>();

    constructor() {
        this.updated.subscribe((setups: TransferdSimplifedType) => {
            console.log(setups);
            /*debugger*/
        })
    }
}
