/**
 * Created by initr on 17.01.2017
 */
import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class SplashService {
    /**
     * State of loader (enabled or disabled)
     * @type {boolean}
     */
    private state: boolean = true;

    public toggleLoader = new EventEmitter();

    /**
     * Enable loader
     */
    public enableLoader(): void {
        this.state = true;
        this.toggleLoader.emit(this.state);
    }

    /**
     * Disable loader
     */
    public disableLoader(): void {
        this.state = false;
        this.toggleLoader.emit(this.state);
    }
}
