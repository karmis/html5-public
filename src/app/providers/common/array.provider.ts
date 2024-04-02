/**
 * Created by Sergey Trizna on 17.12.2016.
 */
import { Injectable } from '@angular/core';
import { Select2ConvertObject, Select2ItemType } from '../../modules/controls/select2/types';
import * as $ from "jquery";
import * as _ from "lodash";

@Injectable({
    providedIn: 'root'
})
export class ArrayProvider {
    public customStandardToString: Function = null;
    /**
     * Standard object understandable for plugin
     */
    protected standardObject: Select2ItemType = {
        id: '',
        text: ''
    };

    /**
     * Merge arrays
     * @param arr1
     * @param arr2
     * @param paramOpts
     * @returns {any[]}
     */
    public merge(arr1: Array<any> = [], arr2: Array<any> = [], paramOpts: { unique?: boolean, sort?: boolean }): Array<any> {
        let res = arr1.concat(arr2);
        let defOpts = {unique: false, sort: false};
        let opts = Object.assign({}, defOpts, paramOpts);
        if (opts.sort == true) {
            res = res.sort(function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0;
            });
        }

        if (opts.unique == true) {
            return res.filter(function (item, index) {
                return res.indexOf(item) === index;
            });
        }

        return res;
    }

    /**
     * Sort array of objects
     */
    public sortByField(array: Array<any>, field: string, order: string = 'asc'): Array<any> {
        return array.sort((a, b) => a[field] < b[field] ? order == 'asc' ? -1 : 1 : order == 'asc' ? 1 : -1);
    }

    /**
     * Search in array
     * @param array
     * @param val
     * @returns {boolean}
     */
    public inArray(array: Array<any> = [], val: any): boolean {
        return !!array.filter(x => x == val)[0]
    }

    /**
     * Return index of array by property value
     * @param val
     * @param arr
     * @param prop
     * @returns {null}
     */
    getIndexArrayByProperty(val, arr, prop) {
        let index = null;
        $.each(arr, (k, o) => {
            if (o && o[prop] == val) {
                index = k;
                return false;
            }
        });

        return index;
    }

    /**
     * Move in array
     * @param array
     * @param from
     * @param to
     * @returns {any[]}
     */
    public move(array, from, to) {
        if (to === from) return array;

        const target = array[from];
        const increment = to < from ? -1 : 1;

        for (let k = from; k != to; k += increment) {
            array[k] = array[k + increment];
        }
        array[to] = target;

        return array;
    }

    public turnObjectOfObjectToStandard(obj = {}, comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }): Array<Select2ItemType> {
        let res = [];
        let self = this;
        $.each(obj, function (key, dirtyObj) {
            res.push(self.turnObjectToStandard(dirtyObj, comp));
        });

        return res;
    }

    /**
     * Turning array of objects to array of objects understandable for plugin
     */
    public turnArrayOfObjectToStandard(arr = [], comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }): Array<Select2ItemType> {
        let res = [];
        let self = this;
        arr.forEach(function (dirtyObj) {
            res.push(self.turnObjectToStandard(dirtyObj, comp));
        });

        return res;
    }

    public turnArrayOfObjectToStandardGrouping(arr = [], comp: Select2ConvertObject = {
        key: 'id',
        text: 'text',
        selected: 'selected',
        disabled: 'disabled'
    }): Array<Select2ItemType> {
        let groups = [];
        let self = this;
        arr.forEach(function (dirtyObj) {
            let group = groups.filter(el => {
                return el.id === dirtyObj.TypeId;
            })[0];
            if (!group) {
                group = {id: dirtyObj.TypeId, text: dirtyObj.TypeName, children: []};
                groups.push(group);
            }
            group.children.push(self.turnObjectToStandard(dirtyObj, comp));
        });

        return groups;
    }

    /**
     * Turning simple array to Standard object understandable for plugin
     * @param array
     * @returns {Array}
     */
    public turnArrayToStandard(array: Array<any> = []): Array<Select2ItemType> {
        let data = [];
        array.forEach(function (val, key) {
            data.push({id: key, text: val});
        });

        return data;
    }

    /**
     * Turning simple object to Standard object understandable for plugin
     * @returns {Array}
     * @param dirtyObj
     */
    public turnSimpleObjectToStandard(dirtyObj = {}): Array<Select2ItemType> {
        let data = [];
        for (let e in dirtyObj) {
            if (typeof dirtyObj[e] === 'object') {
                data.push({id: dirtyObj[e].Id, text: dirtyObj[e].Value, isSelected: dirtyObj[e].IsSelected});
            } else {
                data.push({id: e, text: dirtyObj[e]});
            }
        }


        return data.sort(function (a, b) {
            return (a.text > b.text) ? 1 : ((b.text.toLocaleLowerCase() > a.text.toLocaleLowerCase()) ? -1 : 0);
        });
    }

    /**
     * Turning any crazy object to object understandable for plugin
     */
    public turnObjectToStandard(dirtyObj = {}, comp = {
        key: 'id',
        text: 'text'
    }): Select2ItemType {
        if (this.customStandardToString) {
            return this.customStandardToString(dirtyObj, comp, this.standardObject);
        } else {
            return this.standardToString(dirtyObj, comp, this.standardObject);
        }
    }

    public standardToString(dirtyObj, comp, stObj) {
        let obj = Object.assign({}, stObj);
        obj.id = dirtyObj[comp.key];
        obj.text = dirtyObj[comp.text];

        return obj;
    }

    uniqueIndexByKey(arrObj, key) {
        if (!arrObj.length) return 1
        arrObj = _.sortBy(arrObj, key);
        let index = null;

        arrObj.find((el, i) => {
            if (el[key] !== i + 1) {
                return index = i + 1
            }
        })
        return !!index ? index : arrObj[arrObj.length - 1][key] + 1
    }

    uniqueIdByField(arrObj, key, startNum = 1) {
        if (!arrObj || arrObj.length === 0) return startNum;

        arrObj = arrObj.filter(el => el[key]);
        arrObj = _.sortBy(arrObj, key);
        let index = null;

        if (arrObj.length && arrObj[0][key] < 0) {
            console.error('Negative id')
        }

        arrObj.find((el, i) => {
            if (el[key] !== i + 1) {
                index = i + 1;
                return true
            }
        })
        if (index === null) {
            index = arrObj.length + 1
        }
        return index
    }

}
