/**
 * Created by Sergey on 03.08.2017.
 */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationClipboardText } from '../notification.component';

@Injectable()
export class NotificationService {
    private notifyShowSubject = new Subject<any>();
    private notifyHideSubject = new Subject<any>();

    notifyObservableShow = this.notifyShowSubject.asObservable();
    notifyObservableHide = this.notifyHideSubject.asObservable();

    constructor(){}

    public notifyShow(type: number, message: string | NotificationClipboardText, autoclose: boolean = null, timer: number = 1000, multiple:boolean = true) {
        let text;
        let toClipboard;
        if (typeof message === 'string') {
            text = message;
            toClipboard = message;
        } else if (message) {
            text = message.text;
            toClipboard = message.toClipboard;
        } else {
            text = '';
            toClipboard = '';
        }
        var data = {"t":type,"m":{text: text, toClipboard: toClipboard}, "a": autoclose, 'timer': timer, 'multiple': multiple};
        this.notifyShowSubject.next(data);
    }

    public notifyHide() {
        this.notifyHideSubject.next();
    }
}
