import { Injectable } from '@angular/core';
import {LocalStorageService, SessionStorageService} from "ngx-webstorage";
import { switchMap, distinctUntilChanged, shareReplay } from 'rxjs/operators';

export type StorageLastValueType = {
    key: string,
    value: any
};

@Injectable()
export class StorageAutoCleanerProvider {
    lastValue: StorageLastValueType = null;

    constructor(
        private ls: LocalStorageService,
        private ss: SessionStorageService
    ) {
        const funcLSstore = ls.store.bind(ls);
        const funcSSstore = ss.store.bind(ss);

        ls.store = (key, value) =>{
            // console.log('key: ', key);
            try {
                funcLSstore(key, value);
            } catch(error) {
                if (error.name == 'QuotaExceededError') {
                    // console.log(error);
                    this.clearStorage();
                    funcLSstore(key, value);
                } else {
                    throw error;
                }
            }
        };

        ss.store = (key, value) =>{
            // console.log('key: ', key);
            try {
                funcSSstore(key, value);
            } catch(error) {
                if (error.name == 'QuotaExceededError') {
                    // console.log(error);
                    this.clearStorage();
                    funcSSstore(key, value);
                } else {
                    throw error;
                }
            }
        };


    }

    saveLastKeyAndValue(key, value) {
        this.lastValue = ({key, value});
    }

    getLastKeyAndValue(): StorageLastValueType {
        return this.lastValue;
    }

    clearStorage(){
        //cache keys dictionary for cleaning
        const regDict: RegExp[] = [
            new RegExp(/tmd\.[\S]+\.details.[\S]+\.saved\.state/),  // media.details.Image.saved.state
            new RegExp(/tmd\.detailsview\.[\S]+_[\S]+\.\d/),       // detailsview.MediaDetails_en-GB.9
            new RegExp(/tmd\.grid\.views\.[\S]+\.[\S]+/),           // grid.views.MediaGrid.en-GB - need check!!
        ];

        const testFunc = (keyArr) => {
            return keyArr.filter((key) => regDict.some(exp => exp.test(key)));
        };

        let arr = testFunc(Object.keys(localStorage));
        arr.forEach(el => {
            this.ls.clear(el.substr(4));
        });

        arr = testFunc(Object.keys(sessionStorage));
        arr.forEach(el => {
            this.ss.clear(el.substr(4));
        });

    }

    observeAllKeysStore() {
        const ls = this.ls;
        const ss = this.ss;

        // @ts-ignore
        ls.strategy.keyChanges.pipe(
            // filter((
            //     function (changed) {
            //         return changed === null || changed === key;
            //     })
            // ),
            switchMap((
                function (key) {
                    // @ts-ignore
                    return ls.strategy.get(key)
                })
            ), distinctUntilChanged(),
            shareReplay()
        ).subscribe((el) => {
            console.log(el);
        }, error => {
            console.log(error);
        });

        // @ts-ignore
        ss.strategy.keyChanges.pipe(
            // filter((
            //     function (changed) {
            //         return changed === null || changed === key;
            //     })
            // ),
            switchMap((
                function (key) {
                    // @ts-ignore
                    return ss.strategy.get(key)
                })
            ), distinctUntilChanged(),
            shareReplay()
        ).subscribe((el) => {
            console.log(el);
        }, error => {
            console.log(error);
        });
    }
}
