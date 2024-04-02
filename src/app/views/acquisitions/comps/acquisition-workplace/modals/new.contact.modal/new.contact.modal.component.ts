import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewEncapsulation,
  TemplateRef,
  ViewChild
} from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import {Router} from "@angular/router";
import {SaveLayoutModalProvider} from "./save.layout.modal.provider";
import {LayoutManagerModel, LayoutType} from "../../models/layout.manager.model";
import {LayoutManagerService} from "../../services/layout.manager.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'new-contact-modal',
  templateUrl: 'tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NewContactModalComponent {
    private data: any;
    private showOverlay: boolean = false;
    public routerEventsSubscr: Subscription;
    @ViewChild('modalFooterTemplate', {read: TemplateRef, static: true}) modalFooterTemplate: TemplateRef<any>;

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

    ngOnDestroy() {
        this.routerEventsSubscr.unsubscribe();
    }

    ngAfterViewInit() {
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
