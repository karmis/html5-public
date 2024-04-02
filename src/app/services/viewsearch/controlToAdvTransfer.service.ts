/**
 * Created by Sergey Trizna on 23.12.2016.
 */
import {Injectable, EventEmitter} from '@angular/core';

/**
 * Transfer data from controls of adv search to parent comps
 */
@Injectable()
export class ControlToAdvTransfer {
    public updated: EventEmitter<any> = new EventEmitter<any>();
    constructor() {}
}