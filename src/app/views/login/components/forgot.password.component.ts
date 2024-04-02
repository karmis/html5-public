import { Component, ViewEncapsulation } from '@angular/core';
import { LoginService } from 'app/services/login/login.service';
import { NotificationService } from 'app/modules/notification/services/notification.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'forgot-password-form',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    providers: [

    ]
})

export class ForgotPasswordComponent {
    fpFormGroup: FormGroup;
    isVisibleFPForm = false;
    disabledSendEmailBtn = false;
    loadingSendEmail = false;

    constructor(
        private formBuilder: FormBuilder,
        private loginService: LoginService,
        private notification: NotificationService
    ) {}

    ngOnInit() {
        this.fpFormGroup = this.formBuilder.group({
            email: ['', Validators.required]
        });
    }

    toggleFPForm(val = null) {
        this.isVisibleFPForm = (val)
            ? val
            : !this.isVisibleFPForm;
    }

    sendEmailFP(inputEl) {
        // this.router.navigateByUrl(appRouter.login_reset.verification + '?user=IVANB&token=nQ0AsmimCZaHIybwx5l3sUwB6haX');
        // return;

        if (!inputEl.value) {
            return;
        }

        const data = {
            "userid": inputEl.value
        };

        this.loadingSendEmail = true;
        this.disabledSendEmailBtn = true;

        // Error: null
        // ErrorCode: null
        // ErrorDetails: null
        // ID: 0
        // Result: true
        this.loginService.forgotPassword(data).subscribe(res => {
            this.loadingSendEmail = false;
            this.disabledSendEmailBtn = false;
            if (res && res.Result) {
                this.notification.notifyShow(1, 'login_reset.success_sent_email');
            }
        }, error => {
            this.loadingSendEmail = false;
            this.disabledSendEmailBtn = false;
            this.notification.notifyShow(2, 'login_reset.error_sent_email');
        });
    }
}
