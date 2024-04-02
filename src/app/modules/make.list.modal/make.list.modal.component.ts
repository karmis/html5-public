import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Injector,
    TemplateRef,
    ViewChild, ViewEncapsulation
} from '@angular/core';
import { IMFXModalComponent } from '../imfx-modal/imfx-modal';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/services/notification.service';
import { Subject, Subscription } from 'rxjs';
import { MakeListModalProvider } from "./providers/make.list..modal.provider";
import * as moment from "moment";
import { IMFXControlsDateTimePickerComponent } from '../controls/datetimepicker/imfx.datetimepicker';
import { IMFXControlsLookupsSelect2Component } from '../controls/select2/imfx.select2.lookups';

@Component({
    selector: 'make-list-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss',
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MakeListModalProvider
    ]
})
export class MakeListModalComponent implements AfterViewInit {
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;
    @ViewChild('durationComp', {static: false}) durationComp: IMFXControlsDateTimePickerComponent;
    @ViewChild('mediaFileComp', {static: false}) mediaFileComp: IMFXControlsLookupsSelect2Component;

    private modalRef: IMFXModalComponent;
    public routerEventsSubscr: Subscription;
    form = {
        duration: null,
        title: '',
        mediaTypeId: null,
        notes: ''
    }
    public submit: Subject<any> = new Subject();

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                public provider: MakeListModalProvider,
                private router: Router,
                @Inject(NotificationService) protected notificationRef: NotificationService) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // ref to component
        this.provider.moduleContext = this;
        // modal data
        this.modalRef = this.injector.get('modalRef');
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.cdr.detectChanges();
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    ngAfterViewInit() {
        if (this.form.duration !== null) {
            this.durationComp.setValue('2020-01-01T' + this.form.duration);
        }
        this.mediaFileComp.setSelected([this.form.mediaTypeId]);
    }

    setData(data) {
        this.form = data;
    }

    closeModal() {
        this.modalRef.hide();
        this.provider.modalIsOpen = false;
    }

    showModal() {
        this.provider.showModal();
    }

    onSelectMediaFile(data) {
        this.form.mediaTypeId = data.params.data[0].id
    }

    onDate(data) {
        const time = moment(data).format('HH:mm');
        this.form.duration = time;
    }

    addMediaToList() {
        this.submit.next(this.form);
        this.closeModal();
    }
}
