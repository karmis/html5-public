import { Injectable } from '@angular/core';

@Injectable()
export class JsonProvider {
    public isValidJSON(text:string) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
    }
}
