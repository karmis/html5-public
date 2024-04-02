import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {NotificationService} from "../../../../../../../../../modules/notification/services/notification.service";
import {TranslateService} from '@ngx-translate/core';
import {UserManagerService} from "../../../../services/settings.user-manager.service";
import {ChoosingRowsModalComponent} from '../../../../../../../../../modules/controls/choosing.rows.modal/choosing.rows.modal.component';

@Component({
    selector: 'tab-data-users-modal',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    providers: [
        UserManagerService
    ]
})

export class TabDataUsersModalComponent extends ChoosingRowsModalComponent {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('dataFilter', {static: false}) dataFilter: ElementRef;
    @ViewChild('modalDataOverlayWrapper', {static: false}) protected modalOverlayWrapper: ElementRef;


    constructor(protected injector: Injector,
                protected service: UserManagerService,
                protected cd: ChangeDetectorRef,
                @Inject(TranslateService) protected translate: TranslateService,
                protected notificationService: NotificationService) {
        super(injector, cd, translate)
    }
}
