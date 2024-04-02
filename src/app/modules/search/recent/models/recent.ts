/**
 * Created by Sergey Trizna on 15.03.2017.
 */
import {Injectable} from '@angular/core';
import {RecentInterfaceModel} from './recent.interface';
import {SearchModel} from '../../../../models/search/common/search';

@Injectable()
export class RecentModel implements RecentInterfaceModel {
    /**
     * Search model
     */
    private searchModel: SearchModel;

    /**
     * total count result of search by search model
     */
    private total: number;

    /**
     * Beauty string of parameters for show it at recent search block
     */
    private beautyString: string;

    /**
     * Return beauty string of search criterias
     * @returns {string}
     */
    toBeautyString(): string {
        //  + ': ' + this.getTotal();
        let bs = this.searchModel.toBeautyString();
        this.setBeautyString(bs);
        return bs
    }

    /**
     * Set search model to recent model
     * @param searchModel
     */
    setSearchModel(searchModel: SearchModel): void {
        this.searchModel = this._deepCopy(searchModel);
    }

    /**
     * Get search model
     * @returns {SearchModel}
     */
    getSearchModel(): SearchModel {
        return this.searchModel;
    }

    /**
     * Get total
     * @returns {number}
     */
    getTotal(): number {
        return this.total;
    }

    /**
     * Set total
     * @param total
     */
    setTotal(total: number) {
        this.total = total < 0 ? 0 : total;
    }

    /**
     * Set beautyString
     * @returns {string}
     */
    getBeautyString(): string {
        return this.beautyString;
    }

    /**
     * Get beautyString
     * @param beautyString
     */
    setBeautyString(beautyString: string) {
        this.beautyString = beautyString;
    }

    /**
     * Fill value of beutyString
     */
    fillBeautyString():void {
        this.setBeautyString(this.toBeautyString()) ;
    }

    _deepCopy(obj: any): any {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) return obj;

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this._deepCopy(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = Object.create(obj);
            for (var attr in obj) {
                // console.log(attr, typeof obj[attr], obj[attr]);
                if (obj.hasOwnProperty(attr) && (attr != '__contexts'))
                    copy[attr] = this._deepCopy(obj[attr]);
            }
            return copy;
        }

        throw new Error('Unable to copy obj! Its type is not supported.');
    }


}
