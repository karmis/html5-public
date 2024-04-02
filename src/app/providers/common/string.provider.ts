/**
 * Created by Sergey Trizna on 18.04.2017.
 */
import {Injectable} from '@angular/core';

@Injectable()
export class StringProivder {

    /**
     * Replace string use array of rules
     * @param haystack
     * @param arrayOfNeedles
     * @param replace
     * @returns {string}
     */
    public replaceStringByArray(haystack: string, arrayOfNeedles: Array<string>, replace: Array<string>): string {
        let regex;
        for (let i = 0; i < arrayOfNeedles.length; i++) {
            regex = new RegExp(arrayOfNeedles[i], "g");
            haystack = haystack.replace(regex, replace[i]);
        }
        return haystack;
    };
}
