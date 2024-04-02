/**
 * Created by Sergey Trizna on 24.03.2017.
 */
import { Injectable, EventEmitter } from '@angular/core';

/**
 * Transfer data from controls of adv search to parent comps
 */
@Injectable()
export class ControlToAdvTransfer {
    public updated: EventEmitter<any> = new EventEmitter<any>();
    constructor() {}
}