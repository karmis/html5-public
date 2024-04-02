import {EventEmitter, Injectable, Output} from "@angular/core";

@Injectable()

export class TcbProvider {
    @Output() setTaskStatus: EventEmitter<any> = new EventEmitter<any>();
}
