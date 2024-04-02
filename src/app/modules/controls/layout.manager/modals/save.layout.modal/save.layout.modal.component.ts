import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  Injector, OnInit,
  ViewEncapsulation
} from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import {Router} from "@angular/router";
import {SaveLayoutModalProvider} from "./save.layout.modal.provider";
import {LayoutManagerModel, LayoutType} from "../../models/layout.manager.model";
import {LayoutManagerService} from "../../services/layout.manager.service";
import {NotificationService} from "../../../../notification/services/notification.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'save-layout-modal',
  templateUrl: 'tpl/index.html',
  styleUrls: [
    './styles/index.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LayoutManagerService,
    SaveLayoutModalProvider
  ]
})

export class SaveLayoutModalComponent implements OnInit, AfterViewInit {

    private data: any;
    private showOverlay: boolean = false;
    private layoutName: string = "";
    private isShared: boolean = false;
    private isDefault: boolean = false;
    private changeEmitter: EventEmitter<LayoutManagerModel>;
    private layoutModel: LayoutManagerModel;
    private saveToServer = false;
    private newLayout = false;
    public routerEventsSubscr: Subscription;

    constructor(private cdr: ChangeDetectorRef,
                private injector: Injector,
                private translate: TranslateService,
                private layoutService: LayoutManagerService,
                protected notificationService: NotificationService,
                private saveLayoutProvider: SaveLayoutModalProvider,
                private router: Router) {
        this.routerEventsSubscr = this.router.events.subscribe(() => {
            this.closeModal();
        });

        this.saveLayoutProvider.moduleContext = this;

        // modal data
        this.data = this.injector.get('modalRef');
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    ngOnDestroy(){
        this.routerEventsSubscr.unsubscribe();
    }

    setData(layoutType: LayoutType, layoutModel: LayoutManagerModel, changeEmitter: EventEmitter<LayoutManagerModel>, saveToServer, newLayout = false) {
        this.changeEmitter = changeEmitter;
        if (newLayout) {
            this.layoutName = '';
        }
        else {
            this.layoutName = layoutModel.Name;
        }
        this.newLayout = newLayout;
        this.isShared = layoutModel.IsShared;
        this.isDefault = layoutModel.IsDefault;
        this.layoutModel = layoutModel;
        this.saveToServer = saveToServer;
        this.toggleOverlay(false);
    }

    saveLayout() {
        if(this.layoutName.trim().length == 0)
            return;
        this.toggleOverlay(true);
        this.layoutModel.Name = this.layoutName;
        this.layoutModel.IsShared = this.isShared;
        this.layoutModel.IsDefault = this.isDefault;
        this.layoutModel.IsMine = true;
        this.layoutModel.Layout = this.layoutModel.Layout;
        if (this.newLayout) {
            this.layoutModel.Id = 0;
            (<any>this.layoutModel).UserId = 0;
        }
        if (this.saveToServer) {
            this.layoutService.saveLayout(this.layoutModel).subscribe((res: any) => {
                if (res) {
                    this.notificationService.notifyShow(1, "Layout " + this.layoutModel.Name + " Saved");
                    this.layoutModel.Id = res['ID'];
                    this.changeEmitter.emit(this.layoutModel);
                }
                this.closeModal();
            });
        }
        else {
            this.changeEmitter.emit(this.layoutModel);
            this.closeModal();
        }
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
