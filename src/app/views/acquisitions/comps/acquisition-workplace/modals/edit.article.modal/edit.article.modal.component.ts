import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewEncapsulation} from "@angular/core";
import {TranslateService} from '@ngx-translate/core';
import {Router} from "@angular/router";
import {Subscription} from 'rxjs';

@Component({
    selector: 'save-layout-modal',
    templateUrl: 'tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class EditArticleModalComponent {

    public routerEventsSubscr: Subscription;
    private data: any;
    private showOverlay: boolean = false;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private translate: TranslateService,
                private router: Router) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });
        // modal data
        this.data = this.injector.get('modalRef');
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    setData() {
        this.toggleOverlay(false);
    }

    saveLayout() {
        this.toggleOverlay(true);

        this.closeModal();
    }

    closeModal() {
        this.data.hide();
        this.showOverlay = false;
    }

    toggleOverlay(show) {
        this.showOverlay = show;
        this.cdr.detectChanges();
    }
}
