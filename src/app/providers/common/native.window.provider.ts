/**
 * Created by initr on 14.11.2016.
 */
import { Injectable } from '@angular/core';

function _window() : any {
    // return the global native browser window object
    return window;
}

@Injectable()
export class NativeWindowProvider {
    get nativeWindow() : any {
        return _window();
    }
}