/**
 * Created by Sergey Trizna on 12.03.2017.
 */
import {Injectable} from '@angular/core';
import {SearchInterfaceModel} from './search.interface';

@Injectable()
/**
 * Base search (just now it string at top of table)
 */
export class BaseSearchModel implements SearchInterfaceModel {
    private _value: string;
    // private _skipForRequest: boolean = false;
    private _fakeValue: string;

    constructor(crit?: {
        Value: string
    }) {
        if (crit && crit.Value) {
            this.setValue(crit.Value);
        }
    }

    getValue(): string {
        return this._fakeValue;
    }

    setValue(value: string) {
        this._value = value;
        this._fakeValue = value;
    }

    setFakeValue(value:string) {
        this._fakeValue = value;
    }

    /**
     * @inheritDoc
     * @returns {string}
     */
    _toJSON(): string {
        return this.getValue() || this.getFakeValue();
        // if (!this.getSkipForRequest()) {
        //     return this.getValue();
        // }
    }

    /**
     * @inheritDoc
     */
    isValid(): boolean {
        let val = this.getValue();
        return !!(val && val.length > 0 && typeof val == "string");
    }

    // setSkipForRequest(val: boolean): void {
    //     this._skipForRequest = val;
    // }
    //
    // getSkipForRequest(): boolean {
    //     return this._skipForRequest;
    // }

    getFakeValue(): string {
        return this._fakeValue;
    }

}
