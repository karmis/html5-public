import {ComponentRef, Injectable} from "@angular/core";
import {BsModalRef} from "ngx-bootstrap";
import {Location, LocationStrategy, PopStateEvent} from "@angular/common";


export type MRefType = { id: number, ref: BsModalRef, data?:any, view?:ComponentRef<any> }

@Injectable()
export class IMFXModalGlobalProvider {
    private _mRefs: MRefType[] = [];
    public get mRefs() {
        return this._mRefs;
    }

    addLoader(mRef: MRefType) {
        this._mRefs.push(mRef);
    }

    removeLoader(id: number) {
        this._mRefs = this._mRefs.filter((mRef: MRefType) => {
            return mRef.id !== id;
        })
    }

    clearLoaders() {
        this._mRefs = [];
    }
}
