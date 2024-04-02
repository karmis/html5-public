/**
 * Created by Sergey on 03.08.2017.
 */
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NotificationService } from './services/notification.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'notification',
    templateUrl: './tpl/index.html',
    styleUrls: [
        'styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationComponent {
    private showNotificationSubscription: Subscription;
    private hideNotificationSubscription: Subscription;
    @ViewChild('messageEl', {static: false}) private messageEl: any;
    @ViewChild('notificationWrapperEl', {static: false}) private wrapEl;
    private tickPaused: boolean = false;
    private notificationsList: Notification[] = [];
    private lastNotificationIndex = 0;
    private showWholeMessage = false;

    constructor(private cdr: ChangeDetectorRef,
        @Inject(NotificationService) protected  notificationService: NotificationService) {

    }

    ngOnInit() {
        let self = this;
        this.showNotificationSubscription = this.notificationService.notifyObservableShow
        .subscribe((res: any) => {
            self.ShowNotificationHandler(res.t, res.m, res.a, res.timer, res.multiple);
            self.cdr.detectChanges();
        });
        this.hideNotificationSubscription = this.notificationService.notifyObservableHide
        .subscribe(() => {
            self.HideNotificationHandler();
            self.cdr.detectChanges();
        });
    }

    ngAfterViewInit() {
        // $(this.wrapEl.nativeElement).hover(() => {
        //     this.tickPaused = true;
        // }, () => {
        //     this.tickPaused = false;
        // });
    }

    ngOnDestroy() {
        this.showNotificationSubscription.unsubscribe();
        this.hideNotificationSubscription.unsubscribe();
    }

    ShowNotificationHandler(type, msg: NotificationClipboardText, autoclose = null, timer = 1000, multiple = true) {
        let notification: Notification = <Notification>{
            show: true,
            message: msg,
            notificationType: type,
            index: this.lastNotificationIndex
        };
        let self = this;
        let tick = 0;
        let tickLimit = 3;
        this.showWholeMessage = false;

        if ((type === 1 && autoclose === null) || autoclose) { // auto-close for success status only if autoclose === null
            notification.tickHandler = (setInterval(() => {
                if (!self.tickPaused) {
                    tick++;
                }
                if (tick >= tickLimit) {
                    tick = 0;
                    clearInterval(notification.tickHandler);
                    self.HideNotificationHandler(notification.index);
                }
            }, timer));
        }
        if(multiple) {
            //replacing dublicate message
            for(var i = 0; i < this.notificationsList.length; i++) {
                if(this.notificationsList[i].show && this.notificationsList[i].message.text == notification.message.text) {
                    if(this.notificationsList[i].tickHandler) {
                        clearInterval(this.notificationsList[i].tickHandler);
                    }
                    this.HideNotificationHandler(this.notificationsList[i].index);
                }
            }
            this.notificationsList.push(notification);
        }
        else {
            for(var i = 0; i < this.notificationsList.length; i++) {
                this.notificationsList[i].show = false;
                this.notificationsList[i].copied = false;
                this.notificationsList[i].notificationType = 3;
                clearInterval(this.notificationsList[i].tickHandler);
            }
            this.notificationsList.splice(0,this.notificationsList.length);
            this.notificationsList.push(notification);
        }
        this.cdr.detectChanges();
        this.lastNotificationIndex++;
    }

    HideNotificationHandler(index = null) {
        if(index != null) {
            let notification = this.notificationsList.filter(x => x.index == index)[0];
            if(notification){
                notification.show = false;
                notification.copied = false;
                notification.notificationType = 3;
                setTimeout(()=>{
                    this.notificationsList.splice(this.notificationsList.indexOf(notification),1);
                    this.cdr.detectChanges();
                }, 200);
            }

        }
        else {
            for(var i = 0; i < this.notificationsList.length; i++) {
                this.notificationsList[i].show = false;
                this.notificationsList[i].copied = false;
                this.notificationsList[i].notificationType = 3;
            }
            this.notificationsList = [];
        }
        this.cdr.detectChanges();
    }

    CopyToClipboard(index) {
        let self = this;
        let notification = this.notificationsList.filter(x => x.index == index)[0];
        //if (notification.notificationType === 2)
        {
            let $temp = $('<input>');
            $('body').append($temp);
            let toClipboard = $("#messageEl-" + notification.index).attr('title');
            toClipboard = (toClipboard) ? toClipboard : $("#messageEl-" + notification.index).text();
            $temp.val(toClipboard).select();
            document.execCommand('copy');
            $temp.remove();
            notification.copied = true;
            setTimeout(() => {
                self.HideNotificationHandler(notification.index)
            }, 3000);
            this.cdr.detectChanges();
        }
    }
    CalcMessageHeight() {
        return $(this.wrapEl.nativeElement).find('.notif-message').height() > ($(this.wrapEl.nativeElement).find('.notification-content').height() + 5);
    }
}

export type NotificationClipboardText = {
    text: string;
    toClipboard: string;
};

class Notification {
    public show = false;
    public message: NotificationClipboardText = {
        text: '',
        toClipboard: ''
    };
    public notificationType = 1;
    public index = 0;
    public tickHandler = null;
    public copied = false;
}

enum NotificationType {
    Success = 1,
    Error = 2,
    Ready = 3
}
